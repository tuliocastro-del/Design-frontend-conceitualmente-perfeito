# Design Frontend Conceptually Perfect

[🇧🇷 Português](README.md) · **🇺🇸 English**

An **AI skill** that turns any language model into a **senior product designer**
— one that actually improves interfaces by fighting *"AI aesthetic slop"*: the
generic look that gives away an AI-generated screen (purple/blue gradients,
over-rounded corners, colossal padding, heavy shadows, and Inter/Roboto everywhere).

> **Master principle:** *respect before imposing.* The skill detects the design
> system that already exists in the project (tokens, themes, fonts, spacing
> scale) and works **within** it, instead of slapping a generic look on top.

This repository is **public and collaborative**: the goal is to keep improving
the skill by testing it with **multiple AI models and providers** (Claude, GPT,
Gemini, etc.), not just one.

---

## What's here

```
skills/designer/
├── SKILL.md            # The skill (PT-BR) — main "designer" instruction
├── SKILL.en.md         # The skill (English)
├── references/         # Supporting docs the skill consults
│   ├── anti-slop.md            / anti-slop.en.md            # catalog of patterns to avoid
│   ├── controles-numericos.md  / numeric-controls.en.md     # the 3 design "dials"
│   └── checklist-acessibilidade.md / accessibility-checklist.en.md
└── scripts/
    └── audit.mjs       # Deterministic auditor: measures "slop" by file+line
docs/
├── uso-por-provedor.md         # How to use in each AI tool (PT-BR)
└── usage-by-provider.en.md     # English version
```

## How the skill works (summary)

The skill enforces a **5-phase flow**, in order:

1. **Reconnaissance** — maps the existing design system before touching anything.
2. **Diagnosis** — runs the auditor (`audit.mjs`) that scores the "slop".
3. **Calibration** — sets 3 dials (`0–10`) that force architectural decisions:
   - `DESIGN_VARIANCE` (how far off-pattern the composition goes)
   - `MOTION_INTENSITY` (how much life/animation)
   - `VISUAL_DENSITY` (how much content per screen)
4. **Execution** — applies changes always via the project's tokens (typography,
   color/contrast ≥ 4.5:1, scaled spacing, complete states, accessibility).
5. **Verification** — runs the auditor again (the score should drop) + project tests.

## Quick start

### With Claude Code

Copy the skill folder into your project:

```bash
mkdir -p .claude/skills
cp -r skills/designer .claude/skills/designer
```

Then, in a frontend project, ask something like *"improve the look of this
screen"* or *"this looks AI-made, redesign it"* and the skill triggers on its own.

### With other providers (GPT, Gemini, Cursor, Copilot…)

The skill is essentially a **system prompt + reference docs + a Node script**.
It works in any tool. See the full guide:
**[docs/usage-by-provider.en.md](docs/usage-by-provider.en.md)**.

### Running just the auditor (no AI)

The auditor is a standalone Node script — useful in any project:

```bash
node skills/designer/scripts/audit.mjs [files or folders...]
# no args: scans the whole project (css, html, js/jsx, ts/tsx, vue, svelte)
```

It prints each "slop" finding (file + line + rule) and a final `SLOP SCORE`.
The higher it is, the more "AI-made". Requires Node.js 18+.

## Contributing

Contributions are welcome — especially **reports of using the skill with
different AI models**, new anti-slop patterns, and translations. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Túlio Castro
