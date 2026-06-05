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

test("hardcoded hex IS penalized when the project has tokens", () => {
  const { json } = runJson(fixture("hex-hardcoded.css"));
  assert.equal(json.projectHasTokens, true);
  const hex = json.findings.filter((f) => f.rule === "hex-hardcoded");
  assert.equal(hex.length, 1);
  assert.equal(hex[0].severity, "info");
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
