# Design Frontend Conceptually Perfect

[🇧🇷 Português](README.md) · **🇺🇸 English**

> **This is not another AI app builder. It is the design-quality layer you run
> _after_ AI generates the UI — to remove generic AI slop, respect the existing
> design system, and make the interface feel intentional.**

An **AI skill + deterministic anti-slop auditor** that turns any language model
into a **senior frontend design reviewer**. Generate the UI with whatever tool
you like (Claude Code, Cursor, Copilot, Bolt, Lovable, Dyad, v0,
screenshot-to-code, Figma MCP…); then run this layer to strip *"AI aesthetic
slop"*: purple/blue gradients, over-rounded corners, colossal padding, heavy
shadows, Inter/Roboto everywhere, and predictable symmetric layout.

## What it is / what it is not

| It is | It is not |
|-------|-----------|
| A post-generation **design quality/QA layer** | An app generator/builder |
| A **deterministic** slop auditor (Node, zero deps) | An AI model or hosted product |
| A **provider-agnostic** skill (Claude, GPT, Gemini, Cursor…) | Locked to one provider |
| A discipline that **respects the design system** | A generic theme slapped on top |

## Why it exists

AI generators produce working code but converge on the same generic look — easy
to recognize as "AI-made". They rely on the model "having good taste". This
project swaps taste for **process**: recognize the existing system, diagnose with
an auditor, calibrate dials, execute via tokens, and verify — with accessibility
as the floor.

## In 60 seconds

```bash
# 1. clone/download this repo, then run the auditor on any frontend:
node skills/designer/scripts/audit.mjs path/to/project
#    → lists each finding (file:line + severity) and a SLOP SCORE

# 2. install the skill into your agent (e.g. Claude Code):
mkdir -p .claude/skills && cp -r skills/designer .claude/skills/designer

# 3. in a frontend project, ask: "this looks AI-made, remove the slop".
#    The skill runs the 5 phases and the auditor on its own.
```

## What's here

```
skills/designer/
├── SKILL.md / SKILL.en.md          # The skill — 5-phase flow (PT/EN)
├── references/                     # Supporting docs the skill consults
│   ├── design-system-reconhecimento / design-system-recognition.en
│   ├── anti-slop / anti-slop.en                 # catalog of patterns to avoid
│   ├── controles-numericos / numeric-controls.en  # the 3 design "dials"
│   ├── shadcn-tailwind-anti-slop / .en          # Tailwind/shadcn pitfalls
│   ├── checklist-acessibilidade / accessibility-checklist.en
│   └── benchmark-geradores-ia / ai-builder-benchmark.en  # post-generation flow
└── scripts/audit.mjs               # Deterministic auditor (slop by file+line)
docs/        # usage-by-provider.en.md (+ PT) — how to use in each AI tool
examples/    # real before/after with auditor output
tests/       # auditor tests (node:test) + fixtures
```

## How the skill works (summary)

A mandatory **5-phase flow**, in order:

1. **Reconnaissance** — maps the existing design system before touching anything.
2. **Diagnosis** — runs `audit.mjs` and records the `SLOP SCORE`.
3. **Calibration** — sets 3 dials (`0–10`) that force architectural decisions:
   `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`.
4. **Execution** — **minimal** change, always via tokens (typography,
   color/contrast ≥ 4.5:1, scaled spacing, complete states, accessibility).
5. **Verification** — runs the auditor again (the score should drop) + project tests.

## The auditor

A standalone Node script (Node 18+), no dependencies:

```bash
node skills/designer/scripts/audit.mjs [files or folders...]   # text
node skills/designer/scripts/audit.mjs --format json .         # JSON
node skills/designer/scripts/audit.mjs --fail-on-score 20 .    # CI gate (slop)
node skills/designer/scripts/audit.mjs --fail-on-a11y .        # CI gate (a11y)
node skills/designer/scripts/audit.mjs --fail-on-undef .       # CI gate (undefined vars)
node skills/designer/scripts/audit.mjs --help                  # help
```

Beyond aesthetic slop, it runs two deterministic checks in **separate**
categories (not part of the SLOP SCORE):
- **Accessibility:** `img` without `alt`, `outline:none` without `:focus-visible`,
  motion without `prefers-reduced-motion`, `onClick` on a non-interactive element.
- **Undefined CSS variables:** a `var(--x)` with no fallback whose `--x` is never
  defined (in CSS or set via JS) — catches orphan tokens that silently break
  layout (e.g. `z-index: var(--z-nav)` collapsing to `auto`). Pass the JS dirs too
  so runtime-set vars aren't false positives.

**How to read the score** (`error` > `warning` > `info`):

| Score | Band | Reading |
|------:|------|---------|
| `0` | clean | no slop patterns detected |
| `1–9` | minor | few signals, usually `info`/`warning` |
| `10–24` | noticeable | visible slop; worth the skill pass |
| `25+` | heavy | template-like; redesign the visual layer |

It's a **diagnostic, not a verdict**: exits with code `0` by default. Use
`--fail-on-score N` only when you want a CI gate. `info` severity (e.g.
`rounded-full` on an avatar) does **not** inflate the score. And **`score 0` does
not certify the composition** — it only means no regex-detectable tells remain;
layout/rhythm/IA are manual review.

## Using it with each provider

The skill is essentially a **system prompt + reference docs + a Node script** —
it runs in any tool. Full guide: **[docs/usage-by-provider.en.md](docs/usage-by-provider.en.md)**.

- **Claude Code:** copy `skills/designer` into `.claude/skills/` — triggers on its own.
- **Cursor:** paste `SKILL.en.md` into `.cursor/rules/designer.mdc`.
- **GitHub Copilot:** paste into `.github/copilot-instructions.md`.
- **ChatGPT/GPT, Gemini, Codex, any LLM:** `SKILL.en.md` as the system
  instruction + `references/` as context; run the auditor and paste the output.

## After generating with Bolt / Lovable / Dyad / screenshot-to-code

Generate with the tool → run the auditor → apply the anti-slop pass → run the
auditor again. Per-tool recipe in
`skills/designer/references/ai-builder-benchmark.en.md`.

## Examples

[`examples/basic-before-after/`](examples/basic-before-after/) — a dashboard card
that goes from `SLOP SCORE: 18` to `0`, with the real auditor output and the
design decisions explained.

## Running the tests

```bash
npm test          # node --test tests/*.test.mjs
npm run audit -- .
```

## Short roadmap

- **v0.2:** auditor with JSON/severity/`--fail-on-score`, tests, CI,
  examples, new references.
- **v0.3 (here):** **undefined CSS variable** check (`--fail-on-undef`) as a
  separate category + tests; more before/after examples and screenshots.
- **v0.4:** token detection in `theme.ts`/JSON, inline suppressions, multi-model benchmark.
- **v1.0:** npm package (`npx anti-slop-audit`), GitHub Action and a design-review MCP.

## Contributing

Contributions are welcome — especially **reports of using the skill with
different AI models**, new anti-slop patterns, and translations. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Túlio Castro
