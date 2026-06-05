# Design system recognition (phase 1)

Before changing anything, discover the visual vocabulary the project already
uses. Changing outside it is the #1 cause of slop and broken themes. This is a
list of **where to look** and **what to extract**.

## Where tokens usually live

| Source | How to recognize it | What to extract |
|--------|---------------------|-----------------|
| CSS custom properties | `:root { --color-*: ... }`, `[data-theme="dark"]` | Colors, radii, spacing, shadows, fonts |
| Tailwind | `tailwind.config.{js,ts,cjs,mjs}` → `theme.extend` | Palette, `borderRadius`, `spacing`, `fontFamily` |
| shadcn/ui | `components.json` + `--background/--foreground/--primary` in HSL | Semantic tokens; classes `bg-card`, `text-muted-foreground` |
| Design tokens | `*tokens*.json`, `design-tokens.*`, Style Dictionary | Named scales (color/space/radius/typography) |
| Theme in code | `theme.ts`, `theme.js`, `styled` ThemeProvider | Theme object (keys = tokens) |
| Figma-derived | comments with layer names, exported vars | Token names to preserve |

> The auditor already reports `projectHasTokens: true` when it finds any of these
> signals. If it's `true`, **assume a system exists** and look for it thoroughly.

## What to map (checklist)

- **Fonts:** display (titles), body, mono. Is there a pairing or just one?
- **Color:** base palette + accent(s). Are there semantic tokens (`--primary`,
  `--danger`) or just a raw scale (`--gray-500`)? Is there light/dark?
- **Spacing:** is the scale 4px? 8px? Multiples? Note the existing steps.
- **Radius:** which values exist (`--radius-sm/md/lg`)? What is the "default"?
- **Elevation:** how many shadow levels? Or separation by a `1px` border?
- **Immutables:** what does the docs/brand pin (institutional fonts, official
  colors, supported themes, minimum contrast)? That is **non-negotiable**.

## How to inherit the vocabulary

1. Every new color → an existing token. No token? Create it in the canonical
   place (`:root`, `theme.extend`, JSON tokens) and use the variable — never nail
   the hex down.
2. Every new radius/space → a step of the existing scale. Don't invent `13px`.
3. Respect the names. If the system uses `--accent`, don't add a parallel
   `--brand-color`.
4. If there is **no system at all** (auditor `projectHasTokens: false` and
   nothing in the sources above): only then may you **propose** a small set of
   tokens — restrained palette, 2 fonts, 4/8px scale, 1–3 radii, 1–3 shadows —
   and anchor everything to them. Announce this to the user first.

## Signs you have NOT recognized the system yet

- You're about to write a hex and haven't checked for an equivalent `var(--…)`.
- You can't name the project's title font.
- You don't know whether the project has a dark theme.

If any is true, go back and map before executing.
