#!/usr/bin/env node
/**
 * Deterministic auditor for "AI aesthetic slop" (+ a separate accessibility pass).
 *
 * Scans frontend files for the patterns catalogued in references/anti-slop.md
 * and reports file + line + rule + severity, plus a total SLOP SCORE. The HIGHER
 * the score, the more generic / "AI-made" the interface looks. It also runs a
 * small set of deterministic accessibility checks, reported as a SEPARATE
 * category (a11y) that does NOT inflate the aesthetic slop score.
 *
 * It is a DIAGNOSTIC, not a style police: by default it always exits 0 and the
 * agent (or a human) decides what to do. Use --fail-on-score / --fail-on-a11y to
 * turn it into a CI gate.
 *
 * Usage:
 *   node audit.mjs [paths...]              scan files/folders (default: cwd)
 *   node audit.mjs --format json [paths]   machine-readable JSON output
 *   node audit.mjs --fail-on-score 20 .    exit 1 if SLOP SCORE > 20 (CI gate)
 *   node audit.mjs --fail-on-a11y .        exit 1 if any a11y error (CI gate)
 *   node audit.mjs --help                  show help
 *
 * Zero external dependencies. Node.js 18+.
 *
 * Note on scope: the hardcoded-hex rule runs only on .css/.scss (where a stray
 * hex is genuine color drift). Inline hex in .tsx/.jsx and raw Tailwind color
 * literals are left to manual review — see references/shadcn-tailwind-anti-slop.md.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";

const EXTS = new Set([".css", ".scss", ".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);
const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", ".claude", ".cache"]);
const STYLE_EXTS = new Set([".css", ".scss", ".html", ".vue", ".svelte"]);

// Files whose mere presence proves the project has a design-token layer.
const TOKEN_FILE_RE = /^(tailwind\.config\.(js|cjs|mjs|ts)|theme\.(js|ts|jsx|tsx)|(_?tokens|_?variables|theme)\.scss|components\.json|.*tokens.*\.json|design-tokens.*\.(json|js|ts))$/i;

const SEVERITY = { error: "error", warning: "warning", info: "info" };
const CAT = { slop: "slop", a11y: "a11y", vars: "vars" };

// Counted regex rules (category "slop"), run against comment-stripped code.
// weight = points per occurrence; score adds weight × (matches on the line).
// info weight is always 0 (noted, never scored).
const RULES = [
  {
    id: "gradiente-roxo-azul",
    severity: SEVERITY.error,
    weight: 5,
    re: /linear-gradient\([^)]*(#(6366f1|8b5cf6|a855f7|7c3aed|818cf8|c084fc)|(purple|violet|indigo)-\d{3})[^)]*\)|(from|to|via)-(purple|violet|indigo|blue|fuchsia|pink|rose)-\d{3}/gi,
    msg: "Generic purple/blue (or pink/fuchsia/rose) gradient — AI's #1 signature. Use a palette from the domain/brand.",
  },
  {
    id: "fonte-generica-unica",
    severity: SEVERITY.warning,
    weight: 3,
    re: /font-family:\s*['"]?(Inter|Roboto)['"]?\s*[,;]/gi,
    msg: "Inter/Roboto as a family. Pair a display font with character for titles (typographic contrast).",
  },
  {
    id: "padding-colossal",
    severity: SEVERITY.warning,
    weight: 2,
    // Tailwind p/px/py/pt/pb/pl/pr/ps/pe-16..99 (lookbehind avoids -p-16, gap-16,
    // top-16); CSS padding 60px+/4rem+ (lookbehind avoids scroll-padding).
    re: /(?<![\w-])(p|px|py|pt|pb|pl|pr|ps|pe)-(1[6-9]|[2-9]\d)(?![\w])|(?<![\w-])padding(-(top|bottom|left|right|inline|block))?:\s*([6-9]\d|\d{3,})px|(?<![\w-])padding(-(top|bottom|left|right))?:\s*([4-9](\.\d+)?|\d{2,})rem/gi,
    msg: "Colossal padding — destroys screen density. Use a 4/8px scale tied to hierarchy.",
  },
  {
    id: "sombra-pesada",
    severity: SEVERITY.warning,
    weight: 2,
    // Tailwind shadow-2xl/inner-2xl/drop-shadow-2xl, plus arbitrary shadow-[… 40px+ …].
    re: /\bshadow-(2xl|inner-2xl)\b|\bdrop-shadow-2xl\b|\bshadow-\[[^\]]*(?:[4-9]\d|\d{3,})px[^\]]*\]/gi,
    msg: "Heavy shadow (shadow-2xl / big arbitrary shadow). Elevation should be subtle; in dense UI, a 1px border.",
  },
  {
    id: "glassmorphism",
    severity: SEVERITY.warning,
    weight: 2,
    re: /\bbackdrop-blur(-\w+)?\b|backdrop-filter:\s*[^;{]*blur/gi,
    msg: "Glassmorphism (backdrop-blur) — a 2025 AI tell. Use an opaque surface + elevation token; glass only where something meaningful sits behind it.",
  },
];

// Standalone hex (not inside a var() definition). Contextual: slop only when the
// project already has tokens, and only in CSS/SCSS.
const HEX_RE = /(?<![\w#-])#[0-9a-fA-F]{3,8}\b/g;

/**
 * Strip comments so class-name rules don't fire on documented examples.
 * - block comments /* ... *​/ in all langs
 * - {/* ... *​/} in JSX/TSX
 * - // line comments only in JS-family + SCSS, never breaking a URL "://"
 */
function stripComments(line, ext) {
  let out = line.replace(/\/\*.*?\*\//g, "").replace(/\{\/\*.*?\*\/\}/g, "");
  if (ext !== ".css" && ext !== ".html") {
    out = out.replace(/([^:]|^)\/\/.*$/, "$1");
  }
  return out;
}

/**
 * Classify a border-radius value (CSS px/rem/% or arbitrary Tailwind value).
 * Returns "pill" (intentional, info), "big" (likely slop, warning) or null.
 */
function classifyRadiusValue(raw) {
  const v = raw.trim().toLowerCase();
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
    if (n >= 6) return "pill";
    if (n >= 1.5) return "big";
    return null;
  }
  return null;
}

// Count top-level shadows in a box-shadow declaration (commas outside parens).
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

const HELP = `anti-slop audit — deterministic auditor for AI aesthetic slop (+ a11y pass)

Usage:
  node audit.mjs [paths...]              Scan files/folders (default: current dir)
  node audit.mjs --format json [paths]   Machine-readable JSON output
  node audit.mjs --fail-on-score <N>     Exit 1 if SLOP SCORE > N (CI gate)
  node audit.mjs --fail-on-a11y          Exit 1 if any accessibility error
  node audit.mjs --fail-on-undef         Exit 1 if any undefined CSS variable
  node audit.mjs --help                  Show this help

Options:
  --format <text|json>   Output format. Default: text.
  --fail-on-score <N>    Exit code 1 when SLOP SCORE > N. Default: never fail.
  --fail-on-a11y         Exit code 1 when any a11y error is found.
  --fail-on-undef        Exit code 1 when any var() references an undefined token.
  -h, --help             Show this help and exit.

Severity & score (slop):
  error   (weight 5)   strong slop signal (purple/blue gradient)
  warning (weight 1-3) likely slop (big radius, colossal padding, heavy shadow,
                       glassmorphism, Inter/Roboto-only, stacked shadows,
                       hardcoded hex w/ tokens)
  info    (weight 0)   intentional-but-noted (pills/rounded-full, default container)

  SLOP SCORE bands:  0 clean · 1-9 minor · 10-24 noticeable · 25+ heavy.
  It is a diagnostic, not a verdict: run it before and after a redesign and the
  score should drop. Exits 0 by default even with findings. NOTE: score 0 means
  no line-level tells remain — it does NOT certify the composition (layout,
  rhythm, IA); that is the manual review's job.

Accessibility (separate category, NOT added to the slop score):
  a11y-img-sem-alt, a11y-onclick-nao-interativo, a11y-foco-sem-visivel,
  a11y-movimento-sem-guard. Surfaced separately; gate them with --fail-on-a11y.

CSS variables (separate category, NOT added to the slop score):
  var-indefinida — a var(--x) with NO fallback whose --x is never defined (in any
  scanned CSS :root/theme, or set at runtime via JS setProperty/style key). This
  catches dangling tokens that silently break layout (e.g. z-index: var(--z-nav)
  → auto). Fallback forms var(--x, …) are safe and never flagged. PASS your JS
  files/dirs too so runtime-set vars aren't false positives. Gate with --fail-on-undef.

Slop rules: gradiente-roxo-azul, fonte-generica-unica, padding-colossal,
  sombra-pesada, glassmorphism, texto-gradiente, sombra-empilhada,
  cantos-arredondados-demais, cantos-arredondados-full, container-padrao,
  hex-hardcoded.
`;

function parseArgs(argv) {
  const opts = { format: "text", failOnScore: null, failOnA11y: false, failOnUndef: false, paths: [], help: false, error: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "--format") opts.format = (argv[++i] || "text").toLowerCase();
    else if (a.startsWith("--format=")) opts.format = a.slice(9).toLowerCase();
    else if (a === "--fail-on-a11y") opts.failOnA11y = true;
    else if (a === "--fail-on-undef") opts.failOnUndef = true;
    else if (a === "--fail-on-score" || a.startsWith("--fail-on-score=")) {
      const raw = a.includes("=") ? a.slice(16) : argv[++i];
      const n = Number(raw);
      if (raw == null || raw === "" || !Number.isFinite(n)) {
        opts.error = `--fail-on-score expects a number, got: ${raw === undefined ? "(nothing)" : raw}`;
      } else opts.failOnScore = n;
    } else if (a.startsWith("-")) {
      process.stderr.write(`warning: ignoring unknown flag "${a}"\n`);
    } else opts.paths.push(a);
  }
  if (opts.format !== "json" && opts.format !== "text") opts.format = "text";
  return opts;
}

// ---- Scan ------------------------------------------------------------------

function walk(p, out, tokenHint) {
  let st;
  try { st = statSync(p); } catch { return false; }
  if (st.isDirectory()) {
    if (IGNORE.has(basename(p))) return true;
    for (const e of readdirSync(p)) walk(join(p, e), out, tokenHint);
  } else {
    if (TOKEN_FILE_RE.test(basename(p))) tokenHint.found = true;
    if (EXTS.has(extname(p))) out.push(p);
  }
  return true;
}

function detectTokens(files, tokenHint) {
  if (tokenHint.found) return true;
  for (const f of files) {
    const ext = extname(f);
    if (ext !== ".css" && ext !== ".scss") continue;
    try {
      const text = readFileSync(f, "utf8");
      if (/--[a-z][\w-]*\s*:/i.test(text)) return true;        // CSS custom properties
      if (ext === ".scss" && /^\s*\$[\w-]+\s*:/m.test(text)) return true; // SCSS $vars
    } catch { /* ignore */ }
  }
  return false;
}

/**
 * Undefined-custom-property pass (category "vars", separate from the slop score).
 *
 * Catches the failure that bit this project: a `var(--x)` with NO fallback whose
 * --x is never defined → resolves to the invalid/initial value and silently
 * breaks (e.g. z-index: var(--z-nav) → auto, layering collapses).
 *
 * Fallback-aware: `var(--x, …)` is safe (degrades) and never flagged.
 * JS-aware: tokens set at runtime via setProperty('--x', …) or a style-object
 * key '--x': … (scanned in .js/.jsx/.ts/.tsx) count as defined, so calendar-style
 * runtime vars don't show up as false positives — PASS the JS files/dirs too.
 */
function auditUndefinedVars(files, findings) {
  const definedCss = new Set();
  const definedJs = new Set();
  const styleFiles = [];
  const JS_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".html"]);
  for (const f of files) {
    const ext = extname(f);
    let text;
    try { text = readFileSync(f, "utf8"); } catch { continue; }
    if (STYLE_EXTS.has(ext)) {
      for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) definedCss.add(m[1]);
      styleFiles.push({ f, text, ext });
    }
    if (JS_EXTS.has(ext)) {
      for (const m of text.matchAll(/['"`](--[a-zA-Z0-9-]+)['"`]\s*[:\]]/g)) definedJs.add(m[1]); // '--x': / ["--x"]:
      for (const m of text.matchAll(/setProperty\(\s*['"`](--[a-zA-Z0-9-]+)/g)) definedJs.add(m[1]);
    }
  }
  const defined = new Set([...definedCss, ...definedJs]);
  for (const { f, text, ext } of styleFiles) {
    text.split("\n").forEach((line, i) => {
      const code = stripComments(line, ext);
      // group 2 is "," (has fallback → safe) or ")" (bare → must be defined).
      for (const m of code.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
        const name = m[1], hasFallback = m[2] === ",";
        if (!hasFallback && !defined.has(name)) {
          findings.push({ file: f, line: i + 1, rule: "var-indefinida", category: CAT.vars,
            severity: SEVERITY.error, weight: 0, count: 1,
            message: `var(${name}) has no fallback and ${name} is never defined (CSS or JS). Define the token in :root/theme, or add a fallback: var(${name}, …).`,
            snippet: line.trim().slice(0, 100) });
        }
      }
    });
  }
}

function auditFile(f, projectHasTokens, findings) {
  let text;
  try { text = readFileSync(f, "utf8"); } catch { return; }
  const ext = extname(f);
  const lines = text.split("\n");

  // File-level a11y (presence/absence) — computed once per file.
  if (STYLE_EXTS.has(ext)) {
    const killsOutline = /outline:\s*(none|0)\b/i.test(text);
    const hasFocusVisible = /:focus-visible/.test(text);
    if (killsOutline && !hasFocusVisible) {
      const ln = (lines.findIndex((l) => /outline:\s*(none|0)\b/i.test(l)) + 1) || 1;
      findings.push({ file: f, line: ln, rule: "a11y-foco-sem-visivel", category: CAT.a11y,
        severity: SEVERITY.error, weight: 5, count: 1,
        message: "outline removed with no :focus-visible replacement — keyboard focus invisible.",
        snippet: (lines[ln - 1] || "").trim().slice(0, 100) });
    }
    const hasMotion = /transition:|animation:|@keyframes/i.test(text);
    const hasReducedMotion = /@media[^{]*prefers-reduced-motion:\s*reduce/i.test(text);
    if (hasMotion && !hasReducedMotion) {
      const ln = (lines.findIndex((l) => /transition:|animation:|@keyframes/i.test(l)) + 1) || 1;
      findings.push({ file: f, line: ln, rule: "a11y-movimento-sem-guard", category: CAT.a11y,
        severity: SEVERITY.warning, weight: 3, count: 1,
        message: "motion present with no @media (prefers-reduced-motion: reduce) guard.",
        snippet: (lines[ln - 1] || "").trim().slice(0, 100) });
    }
  }

  lines.forEach((line, i) => {
    const ln = i + 1;
    const code = stripComments(line, ext);
    const snippet = line.trim().slice(0, 100);
    const push = (rule, severity, weight, msg, count = 1, category = CAT.slop) =>
      findings.push({ file: f, line: ln, rule, category, severity, weight, count, message: msg, snippet });

    // Counted regex rules (run on comment-stripped code).
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = code.match(rule.re);
      if (m) push(rule.id, rule.severity, rule.weight, rule.msg, m.length);
    }

    // Gradient text (needs both classes on the line).
    if (/\bbg-clip-text\b/.test(code) && /\btext-transparent\b/.test(code)) {
      push("texto-gradiente", SEVERITY.warning, 2,
        "Gradient text (bg-clip-text + text-transparent). Carry hierarchy with type, not a fill trick.");
    }

    // Default centered container — a layout nudge, not scored.
    if (/\bmax-w-7xl\b/.test(code) && /\bmx-auto\b/.test(code)) {
      push("container-padrao", SEVERITY.info, 0,
        "Default max-w-7xl mx-auto container — vary width per section; a proxy for unconsidered layout.");
    }

    // Radius — classify rather than blanket-flag (pills are intentional).
    const fullCount = (code.match(/\brounded-full\b/g) || []).length;
    if (fullCount) push("cantos-arredondados-full", SEVERITY.info, 0,
      "rounded-full — fine for avatars/badges/toggles. Noted, not penalized.", fullCount);
    const bigClass = (code.match(/\brounded-(2xl|3xl)\b/g) || []).length;
    if (bigClass) push("cantos-arredondados-demais", SEVERITY.warning, 2,
      "Big default radius (rounded-2xl/3xl). Radius is a per-element decision.", bigClass);
    // Arbitrary Tailwind radius rounded-[…].
    const arbR = code.match(/\brounded(?:-[a-z]+)?-\[([^\]]+)\]/);
    if (arbR) {
      const kind = classifyRadiusValue(arbR[1]);
      if (kind === "big") push("cantos-arredondados-demais", SEVERITY.warning, 2,
        "Big arbitrary radius (rounded-[…]). Radius is a per-element decision.");
      else if (kind === "pill") push("cantos-arredondados-full", SEVERITY.info, 0,
        "Pill arbitrary radius — intentional. Noted, not penalized.");
    }
    // CSS border-radius value.
    const brMatch = code.match(/border-radius:\s*([^;}{]+)/i);
    if (brMatch) {
      const kind = classifyRadiusValue(brMatch[1]);
      if (kind === "big") push("cantos-arredondados-demais", SEVERITY.warning, 2,
        "Big radius (24px+). In dense UI prefer a short scale (4/6/10px).");
      else if (kind === "pill") push("cantos-arredondados-full", SEVERITY.info, 0,
        "Pill/circle radius — intentional. Noted, not penalized.");
    }

    // Stacked shadows (3+ at top level).
    const shadowDecl = code.match(/box-shadow:\s*([^;}]+)/i);
    if (shadowDecl && topLevelShadowCount(shadowDecl[1]) >= 3) {
      push("sombra-empilhada", SEVERITY.warning, 2,
        "Stacked shadows (3+). Reduce to a 1-3 level elevation system.");
    }

    // Hardcoded hex — only when the project has tokens, in CSS/SCSS, outside a
    // token definition (CSS var or SCSS $var), and not on a gradient line.
    if (projectHasTokens && (ext === ".css" || ext === ".scss")) {
      // Remove token-definition assignments and var() fallbacks, then look for a
      // remaining loose hex.
      const stripped = code
        .replace(/(--|\$)[\w-]+\s*:\s*[^;]+;?/g, "")   // --x: …; / $x: …;
        .replace(/var\(\s*--[\w-]+\s*,[^)]*\)/g, "");  // var(--x, #fff) fallback
      if (!/gradient/i.test(code)) {
        const hexes = stripped.match(HEX_RE);
        if (hexes) push("hex-hardcoded", SEVERITY.warning, 1,
          "Loose hex where tokens exist. Use var(--token).", hexes.length);
      }
    }

    // A11y line-level: <img> without alt; onClick on a non-interactive element.
    // Skip when props are spread ({...}) — alt may arrive at runtime; avoids FPs.
    if (/<img\b/i.test(code) && !/\balt\s*=/i.test(code) &&
        !/aria-hidden=["']?true/i.test(code) && !/\{\.\.\./.test(code)) {
      push("a11y-img-sem-alt", SEVERITY.error, 5,
        "<img> without alt. Use alt=\"...\" (or alt=\"\" if purely decorative).", 1, CAT.a11y);
    }
    if (/<(div|span|li|p)\b[^>]*\son[Cc]lick/.test(code) && !/\brole\s*=/.test(code)) {
      push("a11y-onclick-nao-interativo", SEVERITY.warning, 3,
        "onClick on a non-interactive element. Use <button>, or add role + tabIndex + key handler.", 1, CAT.a11y);
    }
  });
}

// ---- Run -------------------------------------------------------------------

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  process.stdout.write(HELP);
  process.exit(0);
}
if (opts.error) {
  process.stderr.write(`error: ${opts.error}\n`);
  process.exit(2);
}

const roots = opts.paths.length ? opts.paths : ["."];
const files = [];
const tokenHint = { found: false };
const badRoots = [];
for (const r of roots) { if (!walk(r, files, tokenHint)) badRoots.push(r); }

if (badRoots.length) {
  process.stderr.write(`warning: path(s) not found: ${badRoots.join(", ")}\n`);
}
if (!files.length) {
  process.stderr.write("warning: 0 scannable files found — nothing was audited.\n");
}

const projectHasTokens = detectTokens(files, tokenHint);
const findings = [];
for (const f of files) auditFile(f, projectHasTokens, findings);
auditUndefinedVars(files, findings);

const slop = findings.filter((f) => f.category === CAT.slop);
const a11y = findings.filter((f) => f.category === CAT.a11y);
const vars = findings.filter((f) => f.category === CAT.vars);
const score = slop.reduce((s, f) => s + f.weight * f.count, 0);

const sevCounts = (list) => ({
  error: list.filter((f) => f.severity === "error").length,
  warning: list.filter((f) => f.severity === "warning").length,
  info: list.filter((f) => f.severity === "info").length,
});
const summary = { files: files.length, findings: slop.length, ...sevCounts(slop) };
const a11ySummary = { findings: a11y.length, error: sevCounts(a11y).error, warning: sevCounts(a11y).warning };
const varsSummary = { findings: vars.length, error: sevCounts(vars).error };

const SEV_RANK = { error: 0, warning: 1, info: 2 };
const sortFindings = (a, b) =>
  SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
  b.weight - a.weight ||
  a.file.localeCompare(b.file) ||
  a.line - b.line;
slop.sort(sortFindings);
a11y.sort(sortFindings);
vars.sort(sortFindings);

function band(s) {
  if (s === 0) return "clean";
  if (s < 10) return "minor";
  if (s < 25) return "noticeable";
  return "heavy";
}

function printGroup(list, cwd) {
  const byRule = {};
  for (const fnd of list) (byRule[fnd.rule] ||= []).push(fnd);
  for (const [id, items] of Object.entries(byRule)) {
    const f0 = items[0];
    const occ = items.reduce((n, x) => n + x.count, 0);
    console.log(`● ${id}  [${f0.severity}] (${occ}×, weight ${f0.weight})`);
    console.log(`  ${f0.message}`);
    for (const fnd of items.slice(0, 12)) {
      console.log(`    ${relative(cwd, fnd.file)}:${fnd.line}  ${fnd.snippet}`);
    }
    if (items.length > 12) console.log(`    … +${items.length - 12} more`);
    console.log("");
  }
}

if (opts.format === "json") {
  const shape = (f) => ({
    file: relative(process.cwd(), f.file), line: f.line, rule: f.rule,
    category: f.category, severity: f.severity, weight: f.weight, count: f.count,
    message: f.message, snippet: f.snippet,
  });
  process.stdout.write(JSON.stringify({
    score, band: band(score), projectHasTokens,
    summary, a11y: a11ySummary, vars: varsSummary,
    findings: slop.map(shape), a11yFindings: a11y.map(shape), varsFindings: vars.map(shape),
  }, null, 2) + "\n");
} else {
  const cwd = process.cwd();
  if (!slop.length) console.log("✓ No slop patterns detected in the scanned files.");
  else {
    console.log(`Found ${slop.length} slop signal(s) in ${files.length} file(s):\n`);
    printGroup(slop, cwd);
  }
  if (a11y.length) {
    console.log(`Accessibility — ${a11y.length} finding(s) (separate from the slop score):\n`);
    printGroup(a11y, cwd);
  }
  if (vars.length) {
    console.log(`CSS variables — ${vars.length} undefined reference(s) without fallback (separate from the slop score):\n`);
    printGroup(vars, cwd);
  }
  console.log(`projectHasTokens: ${projectHasTokens}`);
  console.log(`severity: ${summary.error} error · ${summary.warning} warning · ${summary.info} info`);
  console.log(`a11y: ${a11ySummary.error} error · ${a11ySummary.warning} warning`);
  console.log(`vars: ${varsSummary.error} undefined (no fallback)`);
  console.log(`SLOP SCORE: ${score}  (${band(score)})`);
}

let exit = 0;
if (opts.failOnScore != null && score > opts.failOnScore) exit = 1;
if (opts.failOnA11y && a11ySummary.error > 0) exit = 1;
if (opts.failOnUndef && varsSummary.error > 0) exit = 1;
process.exit(exit);
