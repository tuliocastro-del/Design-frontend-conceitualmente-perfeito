/**
 * Tests for the anti-slop auditor. Run with: node --test tests/*.test.mjs
 * Spawns the real CLI so we exercise argument parsing, JSON output and exit
 * codes exactly as a user/CI would. Zero external dependencies.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const AUDIT = join(here, "..", "skills", "designer", "scripts", "audit.mjs");
const fixture = (name) => join(here, "fixtures", name);

/** Run the auditor and return { status, stdout, stderr }. */
function run(...args) {
  const r = spawnSync(process.execPath, [AUDIT, ...args], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** Run with --format json and parse the result. */
function runJson(...args) {
  const r = run("--format", "json", ...args);
  return { ...r, json: JSON.parse(r.stdout) };
}

test("clean, token-driven CSS scores 0", () => {
  const { json } = runJson(fixture("clean.css"));
  assert.equal(json.score, 0);
  assert.equal(json.band, "clean");
  assert.equal(json.findings.length, 0);
});

test("obvious slop is detected with a high score and an error severity", () => {
  const { json } = runJson(fixture("obvious-slop.css"));
  assert.ok(json.score >= 10, `expected score >= 10, got ${json.score}`);
  assert.equal(json.summary.error >= 1, true);
  const rules = json.findings.map((f) => f.rule);
  assert.ok(rules.includes("gradiente-roxo-azul"));
  assert.ok(rules.includes("fonte-generica-unica"));
});

test("token declarations with hex are NOT penalized", () => {
  const { json } = runJson(fixture("tokens.css"));
  assert.equal(json.projectHasTokens, true);
  assert.equal(json.score, 0);
  assert.equal(json.findings.length, 0);
});

test("hardcoded hex IS penalized (as a warning) when the project has tokens", () => {
  const { json } = runJson(fixture("hex-hardcoded.css"));
  assert.equal(json.projectHasTokens, true);
  const hex = json.findings.filter((f) => f.rule === "hex-hardcoded");
  assert.equal(hex.length, 1);
  // Coherence fix: anything that moves the score is warning/error, never info.
  assert.equal(hex[0].severity, "warning");
});

test("rounded-full / pills are noted but do NOT destroy the score", () => {
  const { json } = runJson(fixture("acceptable-rounded.css"));
  assert.equal(json.score, 0);
  // They are still reported, just at info severity with weight 0.
  assert.ok(json.findings.every((f) => f.severity === "info"));
  assert.ok(json.findings.some((f) => f.rule === "cantos-arredondados-full"));
});

test("a shadcn-flavored card flags big radius + heavy shadow, not the avatar", () => {
  const { json } = runJson(fixture("shadcn-ish.tsx"));
  const rules = json.findings.map((f) => f.rule);
  assert.ok(rules.includes("cantos-arredondados-demais"));
  assert.ok(rules.includes("sombra-pesada"));
  // rounded-full avatar is info-only and must not push the score up.
  const full = json.findings.find((f) => f.rule === "cantos-arredondados-full");
  assert.equal(full.weight, 0);
});

test("JSON output is valid and has the documented shape", () => {
  const { stdout } = run("--format", "json", fixture("obvious-slop.css"));
  const json = JSON.parse(stdout); // throws if invalid
  for (const key of ["score", "band", "projectHasTokens", "summary", "findings"]) {
    assert.ok(key in json, `missing key: ${key}`);
  }
  for (const f of json.findings) {
    for (const key of ["file", "line", "rule", "severity", "weight", "message"]) {
      assert.ok(key in f, `finding missing key: ${key}`);
    }
  }
});

test("--help prints usage instructions and exits 0", () => {
  const { status, stdout } = run("--help");
  assert.equal(status, 0);
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /--format/);
  assert.match(stdout, /--fail-on-score/);
});

test("default run exits 0 even when slop is found (diagnostic)", () => {
  const { status } = run(fixture("obvious-slop.css"));
  assert.equal(status, 0);
});

test("--fail-on-score exits 1 above the threshold, 0 at/below it", () => {
  assert.equal(run("--fail-on-score", "5", fixture("obvious-slop.css")).status, 1);
  assert.equal(run("--fail-on-score", "999", fixture("obvious-slop.css")).status, 0);
  // A clean file never trips the gate.
  assert.equal(run("--fail-on-score", "0", fixture("clean.css")).status, 0);
});

test("text output reports the score and severity breakdown", () => {
  const { stdout } = run(fixture("obvious-slop.css"));
  assert.match(stdout, /SLOP SCORE: \d+/);
  assert.match(stdout, /severity: \d+ error/);
});

// --- info severity / scoring coherence -------------------------------------

test("every scoring finding is warning/error; info never moves the score", () => {
  // A file of pure info findings stays at score 0.
  const { json } = runJson(fixture("acceptable-rounded.css"));
  assert.equal(json.score, 0);
  for (const f of [...json.findings, ...json.a11yFindings]) {
    if (f.severity === "info") assert.equal(f.weight, 0, `${f.rule} is info but weight ${f.weight}`);
    if (f.weight > 0) assert.notEqual(f.severity, "info", `${f.rule} scores but is info`);
  }
});

// --- arbitrary Tailwind values (false negatives the regex used to miss) -----

test("arbitrary radius/shadow and off-palette gradients are caught", () => {
  const { json } = runJson(fixture("arbitrary-slop.tsx"));
  const rules = new Set(json.findings.map((f) => f.rule));
  assert.ok(rules.has("cantos-arredondados-demais"), "rounded-[2rem] missed");
  assert.ok(rules.has("sombra-pesada"), "shadow-[…40px…] missed");
  assert.ok(rules.has("gradiente-roxo-azul"), "from-fuchsia/rose gradient missed");
  assert.ok(rules.has("texto-gradiente"), "bg-clip-text gradient text missed");
  assert.ok(rules.has("glassmorphism"), "backdrop-blur missed");
});

// --- false positives the auditor must NOT make -----------------------------

test("class names inside comments do not inflate the score", () => {
  const { json } = runJson(fixture("class-names-in-comments.tsx"));
  assert.equal(json.score, 0);
});

test("scroll-padding is not flagged; real colossal padding still is", () => {
  const { json } = runJson(fixture("scroll-padding.css"));
  const pad = json.findings.filter((f) => f.rule === "padding-colossal");
  assert.equal(pad.length, 1); // only `.hero { padding: 64px }`
  assert.ok(!json.findings.some((f) => f.snippet.includes("scroll-padding")));
});

// --- occurrence counting (minified input used to under-count 8x) -----------

test("multiple occurrences on one line are counted (minified input)", () => {
  const { json } = runJson(fixture("minified.css"));
  // 2 gradients (×5) + 1 Inter (×3) on a single line.
  assert.equal(json.score, 13);
  const grad = json.findings.find((f) => f.rule === "gradiente-roxo-azul");
  assert.equal(grad.count, 2);
});

// --- token recognition: SCSS $vars + inline/minified + var() fallback -------

test("SCSS $variables count as a design system; only the loose hex is flagged", () => {
  const { json } = runJson(fixture("tokens-scss.scss"));
  assert.equal(json.projectHasTokens, true);
  const hex = json.findings.filter((f) => f.rule === "hex-hardcoded");
  assert.equal(hex.length, 1); // #ff0000 in .card, not the $brand definition
});

test("inline/minified token defs and var() hex fallbacks are NOT flagged", () => {
  const { json } = runJson(fixture("tokens-minified.css"));
  assert.equal(json.projectHasTokens, true);
  assert.equal(json.score, 0);
});

// --- accessibility pass (separate category, not in the slop score) ---------

test("a11y issues are detected and kept separate from the slop score", () => {
  const { json } = runJson(fixture("a11y-bad.html"));
  assert.equal(json.score, 0); // a11y must not inflate the aesthetic score
  const rules = new Set(json.a11yFindings.map((f) => f.rule));
  assert.ok(rules.has("a11y-img-sem-alt"));
  assert.ok(rules.has("a11y-foco-sem-visivel"));
  assert.ok(rules.has("a11y-movimento-sem-guard"));
  assert.ok(rules.has("a11y-onclick-nao-interativo"));
  assert.ok(json.a11y.error >= 1);
});

test("--fail-on-a11y gates on accessibility errors", () => {
  assert.equal(run("--fail-on-a11y", fixture("a11y-bad.html")).status, 1);
  assert.equal(run("--fail-on-a11y", fixture("clean.css")).status, 0);
});

// --- CLI robustness --------------------------------------------------------

test("--fail-on-score with a non-number errors out (exit 2)", () => {
  const { status, stderr } = run("--fail-on-score", "abc", fixture("obvious-slop.css"));
  assert.equal(status, 2);
  assert.match(stderr, /expects a number/);
});

test("a nonexistent path warns on stderr instead of reporting a clean pass", () => {
  const { stderr } = run("/tmp/this-path-does-not-exist-xyz");
  assert.match(stderr, /not found|0 scannable/);
});

test("--format=json equals-form is accepted and emits valid JSON", () => {
  const { stdout } = run("--format=json", fixture("clean.css"));
  const json = JSON.parse(stdout);
  assert.deepEqual(json.findings, []);
});

// --- score band boundaries -------------------------------------------------

test("band thresholds match the documented 0/10/25 boundaries", () => {
  assert.equal(runJson(fixture("clean.css")).json.band, "clean");
  // obvious-slop scores 19 → noticeable; arbitrary-slop scores 25+ → heavy.
  assert.equal(runJson(fixture("obvious-slop.css")).json.band, "noticeable");
  assert.equal(runJson(fixture("arbitrary-slop.tsx")).json.band, "heavy");
});
