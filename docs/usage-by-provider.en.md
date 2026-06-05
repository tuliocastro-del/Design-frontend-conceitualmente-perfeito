# How to use the skill in each AI provider

[🇧🇷 Português](uso-por-provedor.md) · [🇺🇸 English](usage-by-provider.en.md)

The `designer` skill has three parts, and they fit into almost any AI tool:

| Part | What it is | How it goes into the tool |
|------|------------|---------------------------|
| `SKILL.en.md` (or `SKILL.md`) | The main instruction — the designer "role" and the 5-phase flow | System prompt / project instructions / agent rules |
| `references/*.md` | Supporting catalogs (anti-slop, dials, accessibility) | Attach as context, or paste the relevant excerpt when a phase needs it |
| `scripts/audit.mjs` | Deterministic "slop" auditor | Run in the terminal (`node …`) and paste the output to the AI |

> **General tip:** the skill's content is plain text. If your tool has no formal
> "skill" mechanism, just **paste `SKILL.en.md` as the system instruction** and
> attach the `references/` it needs. It works in any LLM.

---

## Claude Code (Anthropic)

Native skill format. Copy the folder into the project:

```bash
mkdir -p .claude/skills
cp -r skills/designer .claude/skills/designer
```

The skill triggers on its own when you ask for design work ("improve the look",
"redesign", "it looks AI-made"). Claude also runs `audit.mjs` by itself.

## Cursor

1. **Project Rules:** create `.cursor/rules/designer.mdc` and paste the contents
   of `SKILL.en.md` (you can drop the `---name/description---` header or keep it
   as a comment). Mark it as always-on or context-triggered.
2. The `references/` can live in the repo; ask Cursor to read the specific file
   in the phase where it's needed (e.g. "consult `references/anti-slop.en.md`").
3. The auditor runs in Cursor's integrated terminal.

## Windsurf / Codeium

Use the workspace **Rules** (`.windsurfrules` or the rules panel): paste
`SKILL.en.md`. Attach the `references/` to context when needed.

## GitHub Copilot

Create `.github/copilot-instructions.md` in the repo and paste `SKILL.en.md`
(a trimmed version works better given the context limit). Copilot Chat then
follows the design flow. The auditor runs in the terminal as usual.

## ChatGPT / GPT (OpenAI)

- **Custom GPT:** paste `SKILL.en.md` into *Instructions* and upload the
  `references/*.md` as *Knowledge*. Run the auditor locally and paste its output.
- **Projects / custom instructions:** paste `SKILL.en.md` into the project
  instructions; attach the `references/` by upload when the phase calls for it.
- **Via API:** send `SKILL.en.md` as the `system` message and the `references/`
  as extra context per phase.

## Gemini (Google) / Gemini Code Assist

- **Gemini app / AI Studio:** paste `SKILL.en.md` as the *system instruction*;
  attach the `references/*.md` as context files.
- **Gemini Code Assist (IDE):** use the project rules/context file and paste
  `SKILL.en.md`.

## Codex / Codex CLI (OpenAI)

- Add `SKILL.en.md` as the agent's instruction (e.g. `AGENTS.md` at the repo
  root, or whatever instructions file your Codex uses). Ask it to consult the
  `references/` in the phase where they're needed.
- The auditor runs in the agent's terminal like any Node command.

## Any other LLM (Llama, Mistral, DeepSeek, etc.)

The pattern is always the same:

1. `SKILL.en.md` → **system** message/instruction.
2. `references/*.md` → extra context (attach or paste the current phase's excerpt).
3. `scripts/audit.mjs` → run in the terminal and paste the output into the chat
   for the diagnosis and verification phases.

---

## Post-generation: Bolt / open-lovable / Dyad / v0 / screenshot-to-code

These tools **generate** the UI; this skill comes **after**. Flow:

1. Generate/export the code to disk (or clone the tool's project).
2. `node skills/designer/scripts/audit.mjs --format json .` → record the score.
3. Run the 5-phase flow from `SKILL.en.md` (reconnaissance → minimal execution).
4. Run the auditor again → the score should drop.

Detailed per-tool recipe:
`skills/designer/references/ai-builder-benchmark.en.md`.

## About the auditor (`audit.mjs`)

AI-independent — just Node.js 18+:

```bash
node skills/designer/scripts/audit.mjs                 # scans the whole project
node skills/designer/scripts/audit.mjs src/ui.css      # specific files/folders
node skills/designer/scripts/audit.mjs --format json . # JSON output (parseable)
node skills/designer/scripts/audit.mjs --fail-on-score 20 .  # CI gate (exit 1 if score > 20)
node skills/designer/scripts/audit.mjs --help          # full help
```

Output: findings grouped by rule with **severity** (`error`/`warning`/`info`)
and a final `SLOP SCORE` (bands: 0 clean · 1–9 minor · 10–24 noticeable · 25+
heavy). Use it **before** (diagnosis) and **after** (verification) — the score
should drop. By default it exits with code `0` (it's a diagnostic, not a CI
gate); use `--fail-on-score N` when you want to fail a pipeline. `info` severity
(e.g. `rounded-full` on an avatar) does not inflate the score.
