# Post-generation flow per tool (Bolt, Lovable, Dyad, v0, …)

This skill is **generator-agnostic**. Generate the UI with whatever tool you
like; then run this anti-slop pass. Below is the practical flow per tool and the
slop patterns each tends to produce.

## General recipe (applies to all)

1. Generate/export the code to disk (or clone the tool's project).
2. `node skills/designer/scripts/audit.mjs --format json .` → record the score.
3. Run the 5-phase flow from `SKILL.en.md` (reconnaissance → minimal execution).
4. Run the auditor again → the score should drop. Show before/after.

## Per tool

### Bolt.new / StackBlitz
Generates full-stack in the browser, fast and generic. Tends toward
`rounded-2xl`, `shadow-xl`, centered hero, raw Tailwind.
**Post-generation:** download/clone the project, run the auditor on `src/`,
customize Tailwind tokens and break symmetry for landings (high `DESIGN_VARIANCE`).

### Lovable / open-lovable
Recreates sites as React apps. Often falls into uniform rounded cards and a
purple/blue palette.
**Post-generation:** run the auditor; focus on radius (`--radius` token), semantic
palette and density. See `shadcn-tailwind-anti-slop.en.md`.

### Dyad (local/BYOK)
Local app builder. Same slop profile as the others, but the code is already on
your machine — ideal for the auditor.
**Post-generation:** copy the skill into the Dyad project's `.claude/skills/` and
ask "remove the slop while respecting the tokens".

### v0 / LlamaCoder / screenshot-to-code
Generate components/small apps from a prompt or image. High slop propensity since
they're a "first draft".
**Post-generation:** paste the component into a file, run the auditor on it, apply
the fixes. For screenshot-to-code, also check contrast and states (the image
rarely shows loading/empty/error).

### Figma MCP (Figma-Context-MCP, talk-to-figma)
Give the agent the real Figma tokens/layout — great for fidelity.
**Post-generation:** reconnaissance (phase 1) gets easier: use the Figma tokens as
truth. The auditor verifies the generated code didn't drift into a loose hex /
generic radius outside what Figma defined.

### Claude Code / Cursor / Copilot / Codex
Coding agents. Here the skill is native (Claude Code) or enters as a rule/
instruction (see `docs/usage-by-provider.en.md`). Run the auditor as part of the loop.

## Public benchmark idea (roadmap)

Same prompt across several tools → run the auditor on each output → compare
`SLOP SCORE`, token usage, contrast, density and states. Result: an objective
ranking of "which tool generates the least slop". Multi-model reports are welcome
(see `CONTRIBUTING.md`).
