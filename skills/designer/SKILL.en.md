---
name: designer
description: >-
  Design-quality layer for AI-generated or AI-edited frontend. Use AFTER any tool
  (Claude Code, Cursor, Copilot, Bolt, Lovable, Dyad, v0, screenshot-to-code,
  Figma MCP) generates/changes a UI, or when the request is to improve, redesign,
  polish, review the look, refine layout/UI/UX, build screens/components, or
  evaluate the aesthetics. Removes "AI aesthetic slop" (generic purple/blue
  gradients, glassmorphism, gradient text, over-rounded corners, colossal padding,
  heavy shadows, Inter/Roboto everywhere, predictable symmetric layout) while
  respecting the existing design system instead of imposing a generic look. Triggers on: "improve the visuals",
  "redesign", "make it pretty", "polish the UI", "review the design", "it looks
  generic / AI-made", "remove the slop".
---

# Designer — anti-slop quality layer for AI-generated UI

This is **not** a UI generator. It is the **quality layer** you run after the UI
already exists — written by you, by another AI, or by a human. Your job is to
give the interface **identity, density and intent**, removing the repetitive
visual pattern that betrays AI generation — without rewriting what is already good.

> Master principle: **respect before imposing.** Almost every project already has
> a design system (tokens, themes, fonts, spacing scale). Detect it and work
> *within* it. Only propose a new system when none exists.

## When to use / when not to use

**Use when:** the request is to improve/review/redesign a UI; a tool just
generated a screen/component; the user says "it looks AI-made"; or you're
auditing the visual quality of a frontend.

**Don't use for:** generating the app from scratch (use your generator of choice,
*then* this skill), backend logic, or changes that don't touch the visual layer.

## Mandatory flow (5 phases)

Run **in order**. Don't skip reconnaissance — it's what separates real
improvement from slop.

### 1. Reconnaissance (understand what already exists)

Before touching a single pixel, map the current design system. Details and
heuristics in `references/design-system-recognition.en.md`.

- Look for tokens/variables: `:root`, `--color-*`, `[data-theme]`,
  `tailwind.config`, `theme.ts`, `components.json` (shadcn), design tokens in JSON.
- Identify: fonts (display/body/mono), color scale, spacing scale (4px? 8px?),
  radii, shadows, themes (light/dark/variants).
- Read what the project documentation declares as **fixed/immutable** (official
  tokens, institutional fonts, supported themes, brand guidelines, accessibility
  constraints). If present, respect it to the letter.

If there is a system, **you inherit its vocabulary**. Never introduce a loose hex
when `var(--accent)` exists.

### 2. Diagnosis (measure the slop)

Run the deterministic auditor to find slop patterns by file+line:

```bash
node skills/designer/scripts/audit.mjs [files...]
# Installed in Claude Code: node .claude/skills/designer/scripts/audit.mjs
# JSON to parse:  node skills/designer/scripts/audit.mjs --format json .
# Full help:      node skills/designer/scripts/audit.mjs --help
```

It groups by **severity** (`error` > `warning` > `info`) and gives a `SLOP
SCORE` (bands: 0 clean · 1–9 minor · 10–24 noticeable · 25+ heavy). `info`
severity (e.g. `rounded-full` on an avatar) is a note, not an error — it doesn't
inflate the score. It also runs two **separate** checks (not part of the SLOP
SCORE): **accessibility** and **undefined CSS variables** (a `var(--x)` with no
fallback whose `--x` is never defined — which silently breaks stacking/layout,
e.g. `z-index: var(--z-nav)` collapsing to `auto`). So the var check doesn't
false-positive runtime-set tokens, **also pass the JS files/dirs** (e.g.
`node skills/designer/scripts/audit.mjs styles.css index.html src`). Add this to a
manual read against `references/anti-slop.en.md`. **Record the initial score**: it
must drop in phase 5.

> `SLOP SCORE: 0` means **no regex-detectable tells remain** — it does not certify
> the composition (layout, rhythm, information architecture). That is the job of
> the manual review with the catalog and the dials.

### 3. Calibrate the three controls

Set three dials (0–10) from the brief and the product context. They **force
architectural decisions**, they are not decoration (details in
`references/numeric-controls.en.md`):

| Dial | Threshold | Forced behavior above threshold |
|------|-----------|----------------------------------|
| `DESIGN_VARIANCE` | **> 4** | Bans the default centered hero; imposes asymmetry, split-screen or radical left alignment. |
| `MOTION_INTENSITY` | **> 5** | Requires continuous micro-animations and refined loading transitions. |
| `VISUAL_DENSITY` | **> 7** | Removes decorative containers (each box earns its weight); thin dividers, subtle lines and whitespace. |
| `EXPRESSION_RESTRAINT` | **> 6** | Max 1 meaningful accent color + 2 font families; hierarchy via weight/size/case, never an extra color or effect. |

Pick values coherent with the domain. E.g.: dense operational tool → high
`VISUAL_DENSITY` and `EXPRESSION_RESTRAINT`; brand landing → high
`DESIGN_VARIANCE`, low `RESTRAINT`. **Announce the chosen values** to the user
before applying.

### 4. Execution (minimal, token-driven)

Apply **incremental**, surgical changes, always via the project's tokens. **Don't
rewrite what already respects the system** — touch only what the diagnosis
flagged (see "Scope" below).

- **Typography first.** Clear hierarchy, a display font with personality for
  titles, readable body. Never the same generic font across every layer.
- **Color and contrast.** Intentional palette; text/background with minimum
  contrast **4.5:1** (3:1 for large text). Accent used sparingly.
- **Spacing.** Consistent scale (4px/8px). Rhythm, not random padding.
- **Composition.** Clear information architecture (group by meaning); intentional
  grid breaks when density calls for it, never by accident.
- **States.** Hover/focus/active/disabled/loading/empty/error — design them all.
- **Accessibility.** Visible focus, targets ≥ 44px, `prefers-reduced-motion`,
  semantics. See `references/accessibility-checklist.en.md`.

In **Tailwind/shadcn/CSS-modules/Figma-derived** projects there are specific
pitfalls (e.g. a repeated `rounded-lg border bg-card p-6 shadow-sm` with no
identity): see `references/shadcn-tailwind-anti-slop.en.md`.

### 5. Verification

- Run the auditor again: the slop score should **drop** versus phase 2.
- **No accessibility `error` may remain** (img without alt, focus removed without
  `:focus-visible`, etc.) — this is a gate, independent of the SLOP SCORE. In CI:
  `audit.mjs --fail-on-a11y`.
- **No undefined CSS variable** — every `var(--x)` without a fallback must have
  `--x` defined (in `:root`/theme or via JS). Tokenizing without defining silently
  breaks stacking/layout; this gate catches it. In CI: `audit.mjs --fail-on-undef`
  (passing the JS dirs too).
- Confirm 4.5:1 contrast on the text pairs you touched.
- Run whatever the project defines (`npm test`, `npm run build`, smoke) before
  considering it done. No new console regression.

## Scope — don't rewrite everything

The default is **the smallest change that removes the slop**, not a full redesign.

- Change only what the diagnosis + the dials justify. Code that already uses
  tokens and passes the rules: **leave it alone**.
- Prefer adjusting existing tokens/classes over creating new ones. Only create a
  new token when a canonical one is missing.
- A ground-up redesign happens only when the user explicitly asks, or when no
  design system exists at all.

## Anti-slop rules (core)

Summary of what to **never** do (full catalog in `references/anti-slop.en.md`):

1. **No purple/blue gradient** on a white background as a "theme". It's AI's #1 signature.
2. **No `rounded-2xl`/`rounded-3xl` by default.** Radius is a decision, not a reflex.
   In dense UI, prefer near-straight corners. (`rounded-full` on an avatar/pill is fine.)
3. **No colossal padding** that destroys screen density. Space serves hierarchy,
   not emptiness.
4. **No stacking heavy shadows.** Elevation is subtle; dense shadow degrades
   rendering and looks like a template.
5. **No Inter/Roboto everywhere.** Use a display font with character for titles;
   body can be neutral, but the hierarchy needs typographic contrast.
6. **No loose hex** when tokens exist — always `var(--token)` / system class.
7. **No generic symmetric layout** when `DESIGN_VARIANCE > 4`.

## Anti-rationalization table

When you (or the request) try to skip a phase, these counterarguments hold:

| Tempting excuse | Why it's false |
|-----------------|----------------|
| "I'll just swap the color, no need to read the tokens." | Changing outside the system creates inconsistency and breaks themes. Recon first. |
| "Rounding everything and adding more padding already improves it." | That's exactly the slop. Apparent improvement = lost identity. |
| "Contrast looks fine on my monitor." | 4.5:1 is measurable; opinion doesn't replace the number. Measure. |
| "Micro-animation is fluff, leave it for later." | If `MOTION_INTENSITY > 5`, motion is a brief requirement, not an extra. |
| "This project doesn't care about accessibility." | Focus/contrast/keyboard are the floor, not decoration. They always apply. |
| "Inter works, it's a clean font." | "Clean" = no identity. Titles need a font with personality. |
| "While I'm here, I'll redesign the whole screen." | Minimal scope. Touch only what the diagnosis flagged. |

## "Done" criteria

The task is complete only when **all** hold:

- [ ] Reconnaissance done: you know which tokens/fonts/themes the project uses.
- [ ] Final `SLOP SCORE` **lower** than the initial one (ideally no `error`).
- [ ] **Zero accessibility `error`** in the auditor (`--fail-on-a11y` passes).
- [ ] **Zero undefined CSS variable** in the auditor (`--fail-on-undef` passes, with the JS dirs included).
- [ ] Every new color/radius/space came from a project token (no loose hex).
- [ ] Contrast ≥ 4.5:1 on touched text; visible focus; complete states.
- [ ] Project tests/build pass, with no new console regression.
- [ ] The diff is minimal and justifiable — nothing rewritten without reason.

## Resources

- `references/design-system-recognition.en.md` — how to detect tokens/fonts/themes (phase 1).
- `references/anti-slop.en.md` — detailed catalog of patterns to avoid + fixes.
- `references/numeric-controls.en.md` — how to calibrate the three dials per product type.
- `references/shadcn-tailwind-anti-slop.en.md` — pitfalls in Tailwind/shadcn/CSS-modules.
- `references/accessibility-checklist.en.md` — contrast, focus, keyboard, motion, semantics.
- `references/ai-builder-benchmark.en.md` — post-generation flow per tool (Bolt, Lovable, etc.).
- `scripts/audit.mjs` — deterministic auditor: slop (score) + accessibility + undefined CSS variables, each by file + line + severity. Flags: `--format json`, `--fail-on-score`, `--fail-on-a11y`, `--fail-on-undef`.
