#!/usr/bin/env node
/**
 * Deterministic auditor for "AI aesthetic slop".
 *
 * Scans frontend files for the patterns catalogued in references/anti-slop.md
 * and reports file + line + rule + severity, plus a total score. The HIGHER the
 * score, the more generic / "AI-made" the interface looks.
 *
 * It is a DIAGNOSTIC, not a style police: by default it always exits 0 and the
 * agent (or a human) decides what to do with the score. Use --fail-on-score to
 * turn it into a CI gate.
 *
 * Usage:
 *   node audit.mjs [paths...]              scan files/folders (default: cwd)
 *   node audit.mjs --format json [paths]   machine-readable JSON output
 *   node audit.mjs --fail-on-score 20 .    exit 1 if score > 20 (CI gate)
 *   node audit.mjs --help                  show help
 *
 * Zero external dependencies. Node.js 18+.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";

const EXTS = new Set([".css", ".scss", ".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);
const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", ".claude", ".cache"]);

// Files whose mere presence proves the project has a design-token layer.
const TOKEN_FILE_RE = /^(tailwind\.config\.(js|cjs|mjs|ts)|theme\.(js|ts)|components\.json|.*tokens.*\.json|design-tokens.*\.(json|js|ts))$/i;

const SEVERITY = { error: "error", warning: "warning", info: "info" };

// Regex rules applied per line. weight = points per occurrence (info = 0 ⇒ does
// not move the score, only nudges). Keep regexes simple and explainable.
const RULES = [
  {
    id: "gradiente-roxo-azul",
    severity: SEVERITY.error,
    weight: 5,
    re: /linear-gradient\([^)]*(#(6366f1|8b5cf6|a855f7|7c3aed|818cf8|c084fc)|(purple|violet|indigo)-\d{3})[^)]*\)|(from|to|via)-(purple|violet|indigo|blue)-\d{3}/i,
    msg: "Generic purple/blue gradient — AI's #1 signature. Use a palette from the domain/brand.",
  },
  {
    id: "fonte-generica-unica",
    severity: SEVERITY.warning,
    weight: 3,
    re: /font-family:\s*['"]?(Inter|Roboto)['"]?\s*[,;]/i,
    msg: "Inter/Roboto as a family. Pair a display font with character for titles (typographic contrast).",
  },
  {
    id: "padding-colossal",
    severity: SEVERITY.warning,
    weight: 2,
    re: /\b(p|px|py|pt|pb)-(1[6-9]|[2-9]\d)\b|padding(-(top|bottom|left|right|inline|block))?:\s*([6-9]\d|\d{3,})px|padding(-(top|bottom|left|right))?:\s*([4-9](\.\d+)?|\d{2,})rem/i,
    msg: "Colossal padding — destroys screen density. Use a 4/8px scale tied to hierarchy.",
  },
  {
    id: "sombra-pesada",
    severity: SEVERITY.warning,
    weight: 2,
    re: /\bshadow-(2xl|inner-2xl)\b|\bdrop-shadow-2xl\b/i,
    msg: "Heavy shadow (shadow-2xl). Elevation should be subtle; in dense UI, a 1px border.",
  },
];

// Standalone hex (not in a var() definition). Contextual: only slop when the
// project already has tokens.
const HEX_RE = /(?<![\w#-])#[0-9a-fA-F]{3,8}\b/;

/**
 * Classify a border-radius value (CSS px/rem/% or Tailwind class).
 * Returns "pill" (intentional, info), "big" (likely slop, warning) or null.
 */
function classifyRadiusValue(raw) {
  const v = raw.trim().toLowerCase();
  // Pills / circles are intentional (avatars, badges, toggles).
  if (v.includes("%") || /\b9999px\b/.test(v) || /\b[1-9]\d{3,}px\b/.test(v)) return "pill";
  const px = v.match(/(\d+(?:\.\d+)?)px/);
  if (px) {
    const n = parseFloat(px[1]);
    if (n >= 100) return "pill";
    if (n >= 16) return "big";
    return null;
  }
  const rem = v.match(/(\d+(?:\.\d+)?)rem/);
  if (rem) {
    const n = parseFloat(rem[1]);
    if (n >= 6) return "pill"; // 96px+ ⇒ effectively a pill
    if (n >= 1.5) return "big"; // 24px+
    return null;
  }
  return null;
}

// Count top-level shadows in a box-shadow declaration (commas outside parens),
// so rgba(r, g, b, a) does not inflate the count.
function topLevelShadowCount(decl) {
  let depth = 0, commas = 0;
  for (const ch of decl) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) commas++;
  }
  return commas + 1;
}

// ---- CLI parsing -----------------------------------------------------------

const HELP = `anti-slop audit — deterministic auditor for AI aesthetic slop

Usage:
  node audit.mjs [paths...]              Scan files/folders (default: current dir)
  node audit.mjs --format json [paths]   Machine-readable JSON output
  node audit.mjs --fail-on-score <N>     Exit 1 if SLOP SCORE > N (CI gate)
  node audit.mjs --help                  Show this help

Options:
  --format <text|json>   Output format. Default: text.
  --fail-on-score <N>    Exit code 1 when score > N. Default: never fail (exit 0).
  -h, --help             Show this help and exit.

Severity & score:
  error   (weight 5)  strong slop signal (e.g. purple/blue gradient)
  warning (weight 2-3) likely slop (big radius, colossal padding, heavy shadow,
                       Inter/Roboto-only, stacked shadows, hardcoded hex w/ tokens)
  info    (weight 0)  intentional-but-worth-noting (pills/rounded-full)

  SLOP SCORE bands:  0 clean · 1-9 minor · 10-24 noticeable · 25+ heavy.
  It is a diagnostic, not a verdict: run it before and after a redesign and the
  score should drop. Exits 0 by default even with findings.

Rules: gradiente-roxo-azul, fonte-generica-unica, padding-colossal,
       sombra-pesada, sombra-empilhada, cantos-arredondados-demais,
       cantos-arredondados-full, hex-hardcoded.
`;

function parseArgs(argv) {
  const opts = { format: "text", failOnScore: null, paths: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "--format") opts.format = (argv[++i] || "text").toLowerCase();
    else if (a.startsWith("--format=")) opts.format = a.slice(9).toLowerCase();
    else if (a === "--fail-on-score") opts.failOnScore = Number(argv[++i]);
    else if (a.startsWith("--fail-on-score=")) opts.failOnScore = Number(a.slice(16));
    else if (a.startsWith("-")) { /* ignore unknown flags */ }
    else opts.paths.push(a);
  }
  if (opts.format !== "json" && opts.format !== "text") opts.format = "text";
  return opts;
}

// ---- Scan ------------------------------------------------------------------

function walk(p, out, tokenHint) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    if (IGNORE.has(basename(p))) return;
    for (const e of readdirSync(p)) walk(join(p, e), out, tokenHint);
  } else {
    if (TOKEN_FILE_RE.test(basename(p))) tokenHint.found = true;
    if (EXTS.has(extname(p))) out.push(p);
  }
}

function detectTokens(files, tokenHint) {
  if (tokenHint.found) return true;
  for (const f of files) {
    const ext = extname(f);
    if (ext !== ".css" && ext !== ".scss") continue;
    try {
      const text = readFileSync(f, "utf8");
      if (/--[a-z][\w-]*\s*:/i.test(text)) return true;
    } catch { /* ignore */ }
  }
  return false;
}

function auditFile(f, projectHasTokens, findings) {
  let text;
  try { text = readFileSync(f, "utf8"); } catch { return; }
  const ext = extname(f);
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const ln = i + 1;
    const snippet = line.trim().slice(0, 100);
    const push = (id, severity, weight, msg) =>
      findings.push({ file: f, line: ln, rule: id, severity, weight, message: msg, snippet });

    for (const rule of RULES) {
      if (rule.re.test(line)) push(rule.id, rule.severity, rule.weight, rule.msg);
    }

    // Radius — classify rather than blanket-flag (pills are intentional).
    if (/\brounded-full\b/.test(line)) {
      push("cantos-arredondados-full", SEVERITY.info, 0,
        "rounded-full — fine for avatars/badges/toggles. Noted, not penalized.");
    }
    if (/\brounded-(2xl|3xl)\b/.test(line)) {
      push("cantos-arredondados-demais", SEVERITY.warning, 2,
        "Big default radius (rounded-2xl/3xl). Radius is a per-element decision.");
    }
    const brMatch = line.match(/border-radius:\s*([^;}{]+)/i);
    if (brMatch) {
      const kind = classifyRadiusValue(brMatch[1]);
      if (kind === "big") {
        push("cantos-arredondados-demais", SEVERITY.warning, 2,
          "Big radius (24px+). In dense UI prefer a short scale (4/6/10px).");
      } else if (kind === "pill") {
        push("cantos-arredondados-full", SEVERITY.info, 0,
          "Pill/circle radius — intentional for avatars/badges. Noted, not penalized.");
      }
    }

    // Stacked shadows (3+ at top level) — template-like over-elevation.
    const shadowDecl = line.match(/box-shadow:\s*([^;}]+)/i);
    if (shadowDecl && topLevelShadowCount(shadowDecl[1]) >= 3) {
      push("sombra-empilhada", SEVERITY.warning, 2,
        "Stacked shadows (3+). Reduce to a 1-3 level elevation system.");
    }

    // Hardcoded hex — only when the project has tokens, in CSS/SCSS, outside a
    // token definition, and not on a gradient line (already counted).
    if (projectHasTokens && (ext === ".css" || ext === ".scss")) {
      const isTokenDef = /^\s*\$?--?[\w-]+\s*:/.test(line) || /^\s*\$[\w-]+\s*:/.test(line);
      if (!isTokenDef && !/gradient/i.test(line) && HEX_RE.test(line)) {
        push("hex-hardcoded", SEVERITY.info /* see note */, 1,
          "Loose hex where tokens exist. Use var(--token).");
      }
    }
  });
}

// ---- Run -------------------------------------------------------------------

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const roots = opts.paths.length ? opts.paths : ["."];
const files = [];
const tokenHint = { found: false };
for (const r of roots) walk(r, files, tokenHint);

const projectHasTokens = detectTokens(files, tokenHint);
const findings = [];
for (const f of files) auditFile(f, projectHasTokens, findings);

const score = findings.reduce((s, f) => s + f.weight, 0);
const summary = {
  files: files.length,
  findings: findings.length,
  error: findings.filter((f) => f.severity === "error").length,
  warning: findings.filter((f) => f.severity === "warning").length,
  info: findings.filter((f) => f.severity === "info").length,
};

const SEV_RANK = { error: 0, warning: 1, info: 2 };
findings.sort((a, b) =>
  SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
  b.weight - a.weight ||
  a.file.localeCompare(b.file) ||
  a.line - b.line);

function band(s) {
  if (s === 0) return "clean";
  if (s < 10) return "minor";
  if (s < 25) return "noticeable";
  return "heavy";
}

if (opts.format === "json") {
  process.stdout.write(JSON.stringify({
    score,
    band: band(score),
    projectHasTokens,
    summary,
    findings: findings.map((f) => ({
      file: relative(process.cwd(), f.file),
      line: f.line,
      rule: f.rule,
      severity: f.severity,
      weight: f.weight,
      message: f.message,
      snippet: f.snippet,
    })),
  }, null, 2) + "\n");
} else {
  const cwd = process.cwd();
  if (!findings.length) {
    console.log("✓ No slop patterns detected in the scanned files.");
  } else {
    console.log(`Found ${findings.length} slop signal(s) in ${files.length} file(s):\n`);
    const byRule = {};
    for (const fnd of findings) (byRule[fnd.rule] ||= []).push(fnd);
    for (const [id, list] of Object.entries(byRule)) {
      const f0 = list[0];
      console.log(`● ${id}  [${f0.severity}] (${list.length}×, weight ${f0.weight})`);
      console.log(`  ${f0.message}`);
      for (const fnd of list.slice(0, 12)) {
        console.log(`    ${relative(cwd, fnd.file)}:${fnd.line}  ${fnd.snippet}`);
      }
      if (list.length > 12) console.log(`    … +${list.length - 12} more`);
      console.log("");
    }
  }
  console.log(`projectHasTokens: ${projectHasTokens}`);
  console.log(`severity: ${summary.error} error · ${summary.warning} warning · ${summary.info} info`);
  console.log(`SLOP SCORE: ${score}  (${band(score)})`);
}

if (opts.failOnScore != null && Number.isFinite(opts.failOnScore) && score > opts.failOnScore) {
  process.exit(1);
}
process.exit(0);
