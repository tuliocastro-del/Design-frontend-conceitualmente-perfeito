#!/usr/bin/env node
/**
 * Auditor determinístico de "slop estético de IA".
 *
 * Varre arquivos de frontend procurando os padrões catalogados em
 * references/anti-slop.md, reportando arquivo + linha + regra e uma pontuação
 * total. Quanto MAIOR a pontuação, mais "cara de IA" a interface tem.
 *
 * Uso:
 *   node .claude/skills/designer/scripts/audit.mjs [arquivos ou pastas...]
 *   (sem args: varre o cwd por *.css, *.html, *.js, *.jsx, *.ts, *.tsx)
 *
 * Saída: relatório legível + linha final "SLOP SCORE: N". Sai com código 0
 * sempre (é diagnóstico, não gate); o agente decide o que fazer com o score.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const EXTS = new Set([".css", ".scss", ".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);
const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", ".claude"]);

// Cada regra: id, peso, regex, e mensagem. weight = pontos por ocorrência.
const RULES = [
  {
    id: "gradiente-roxo-azul",
    weight: 5,
    re: /linear-gradient\([^)]*(#?(6366f1|8b5cf6|a855f7|7c3aed|818cf8|c084fc)|(purple|violet|indigo)-\d{3})[^)]*\)|(from|to|via)-(purple|violet|indigo|blue)-\d{3}/gi,
    msg: "Gradiente roxo/azul genérico — assinatura nº1 de IA. Use paleta do domínio.",
  },
  {
    id: "cantos-arredondados-demais",
    weight: 3,
    re: /\brounded-(2xl|3xl|full)\b|border-radius:\s*(2[4-9]|[3-9]\d|\d{3,})px|border-radius:\s*1\.[5-9]rem|border-radius:\s*[2-9]rem/gi,
    msg: "Raio grande por padrão (rounded-2xl/3xl/24px+). Raio é decisão por elemento.",
  },
  {
    id: "padding-colossal",
    weight: 2,
    re: /\b(p|px|py|pt|pb)-(1[6-9]|[2-9]\d)\b|padding(-(top|bottom|left|right|inline|block))?:\s*([6-9]\d|\d{3,})px|padding(-(top|bottom|left|right))?:\s*([4-9](\.\d+)?|\d{2,})rem/gi,
    msg: "Padding colossal — destrói densidade de tela. Use escala 4/8px ligada à hierarquia.",
  },
  {
    id: "sombra-pesada",
    weight: 3,
    re: /\bshadow-(2xl|inner-2xl)\b|drop-shadow-2xl/gi,
    msg: "Sombra pesada (shadow-2xl). Elevação deve ser sutil; em UI densa, borda 1px.",
  },
  // sombra-empilhada é checada à parte (precisa contar vírgulas FORA de parênteses,
  // senão rgba(r, g, b, a) gera falso positivo). Ver loop abaixo.
  {
    id: "fonte-generica-unica",
    weight: 4,
    re: /font-family:\s*['"]?(Inter|Roboto)['"]?\s*[,;]/gi,
    msg: "Inter/Roboto como família. Use uma display com caráter nos títulos (contraste tipográfico).",
  },
];

// Regra contextual: hex hardcoded num projeto que tem tokens CSS. Só dispara se
// o projeto definir custom properties (heurística leve).
const HEX_RE = /(?<![\w#-])#[0-9a-fA-F]{3,8}\b/g;

// Conta separadores de múltiplas sombras: vírgulas no nível superior, ignorando
// as que estão dentro de rgba()/hsl()/etc. Retorna nº de sombras na declaração.
function topLevelShadowCount(decl) {
  let depth = 0, commas = 0;
  for (const ch of decl) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) commas++;
  }
  return commas + 1;
}

const targets = process.argv.slice(2);
const roots = targets.length ? targets : ["."];

function walk(p, out) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    const base = p.split("/").pop();
    if (IGNORE.has(base)) return;
    for (const e of readdirSync(p)) walk(join(p, e), out);
  } else if (EXTS.has(extname(p))) {
    out.push(p);
  }
}

const files = [];
for (const r of roots) walk(r, files);

let score = 0;
const findings = [];
let projectHasTokens = false;

// Primeira passada: o projeto usa design tokens? (--var: ...)
for (const f of files) {
  if (extname(f) === ".css" || extname(f) === ".scss") {
    try {
      if (/--[a-z][\w-]*\s*:/i.test(readFileSync(f, "utf8"))) { projectHasTokens = true; break; }
    } catch { /* ignore */ }
  }
}

for (const f of files) {
  let text;
  try { text = readFileSync(f, "utf8"); } catch { continue; }
  const lines = text.split("\n");

  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    lines.forEach((line, i) => {
      const local = new RegExp(rule.re.source, rule.re.flags);
      if (local.test(line)) {
        score += rule.weight;
        findings.push({ file: f, line: i + 1, id: rule.id, weight: rule.weight, msg: rule.msg, snippet: line.trim().slice(0, 100) });
      }
    });
  }

  // Sombras empilhadas (3+ no nível superior) — elevação exagerada tipo template.
  const shadowRe = /box-shadow:\s*([^;}]+)/gi;
  lines.forEach((line, i) => {
    let m;
    shadowRe.lastIndex = 0;
    while ((m = shadowRe.exec(line))) {
      if (topLevelShadowCount(m[1]) >= 3) {
        score += 2;
        findings.push({ file: f, line: i + 1, id: "sombra-empilhada", weight: 2, msg: "Sombras empilhadas (3+). Reduza para um sistema de elevação de 1–3 níveis.", snippet: line.trim().slice(0, 100) });
      }
    }
  });

  // Hex hardcoded — só conta como slop se o projeto tem tokens e o arquivo é CSS
  // (em CSS, hex fora de uma declaração --var é deriva de cor). Peso baixo.
  if (projectHasTokens && (extname(f) === ".css" || extname(f) === ".scss")) {
    lines.forEach((line, i) => {
      if (/^\s*--[\w-]+\s*:/.test(line)) return; // definição de token: ok
      HEX_RE.lastIndex = 0;
      if (HEX_RE.test(line)) {
        score += 1;
        findings.push({ file: f, line: i + 1, id: "hex-hardcoded", weight: 1, msg: "Hex solto onde há tokens. Use var(--token).", snippet: line.trim().slice(0, 100) });
      }
    });
  }
}

// Relatório
const cwd = process.cwd();
findings.sort((a, b) => b.weight - a.weight || a.file.localeCompare(b.file) || a.line - b.line);

if (!findings.length) {
  console.log("✓ Nenhum padrão de slop detectado nos arquivos varridos.");
} else {
  console.log(`Encontrados ${findings.length} indícios de slop em ${files.length} arquivo(s):\n`);
  const byRule = {};
  for (const fnd of findings) (byRule[fnd.id] ||= []).push(fnd);
  for (const [id, list] of Object.entries(byRule)) {
    console.log(`● ${id}  (${list.length}×, peso ${list[0].weight})`);
    console.log(`  ${list[0].msg}`);
    for (const fnd of list.slice(0, 12)) {
      console.log(`    ${relative(cwd, fnd.file)}:${fnd.line}  ${fnd.snippet}`);
    }
    if (list.length > 12) console.log(`    … +${list.length - 12} mais`);
    console.log("");
  }
}

console.log(`projectHasTokens: ${projectHasTokens}`);
console.log(`SLOP SCORE: ${score}`);
