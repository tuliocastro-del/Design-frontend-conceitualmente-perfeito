# Anti-slop in Tailwind / shadcn/ui / CSS-modules

shadcn/ui and Tailwind are great foundations — and that's exactly why they became
the modern "AI look". The problem is **not** shadcn; it's using it **without
identity**, in every generator's default. This guide shows how to remove the slop
without abandoning the stack.

## The generic shadcn default

**Symptom:** every screen is a stack of `Card`/`CardHeader`/`CardContent` with
the same repeated class:

```html
<div class="rounded-lg border bg-card p-6 shadow-sm">…</div>
<!-- × 12, all identical -->
```

**Why it's slop:** zero visual hierarchy; the repetition gives everything the
same weight. It's the template output verbatim.

**Fix:**
- Give **different weight** to containers of different importance (a hero card ≠
  a list row). Not everything is a `Card`.
- At `VISUAL_DENSITY > 7`, swap cards for **rows with dividers** (`divide-y`,
  `border-b`) — information density, not boxes.
- Customize the shadcn tokens in `:root` (`--radius`, `--primary`, `--card`)
  instead of accepting the default. Changing `--radius` from `0.5rem` to
  `0.25rem` already changes the whole app's face.

## Radius: `rounded-lg` on everything

shadcn derives radius from `--radius`. Adjust **the token**, not each component.
`rounded-full` on an avatar/badge/toggle is still right (the auditor marks it
`info`). The target is the `rounded-2xl/3xl` applied to cards by reflex.

## Color: stop hardcoding raw Tailwind

**Symptom:** `bg-purple-600`, `text-slate-500`, `from-indigo-500` scattered.
**Fix:** use shadcn's semantic tokens (`bg-primary`, `text-muted-foreground`,
`border-input`). They follow light/dark automatically; raw colors don't.

## Spacing: automatic `p-6`/`p-8`/`gap-8`

**Symptom:** uniformly generous padding that empties the screen.
**Fix:** a scale tied to hierarchy. In dense UI, `p-3`/`p-4` and `gap-2`/`gap-3`
usually suffice. Reserve large breathing room to separate **blocks of meaning**.

## Shadow: stacked `shadow-lg`/`shadow-xl`/`shadow-2xl`

**Fix:** a 1–3 level system. Often `border` + `bg-card` separates better than a
shadow, especially in dark theme.

## Typography: only `font-sans` (Inter) everywhere

shadcn ships neutral on purpose — **you** set the personality.
**Fix:** register a display font in `tailwind.config` (`fontFamily.display`) and
use it on titles; keep `font-sans` for body.

## Generic lucide icons and microcopy

**Symptom:** 3× "feature" grids with a random lucide icon + "Get Started" /
"Learn More" / "Powerful Features".
**Fix:** domain copy; one icon family with a coherent weight; less decorative
emoji. In a real product, labels are specific ("Open mission log", not "Get
Started").

## Note on the auditor in this stack

- It **does catch arbitrary values**: `rounded-[2rem]`, `shadow-[0_35px_60px_…]`
  and off-palette gradients (`from-fuchsia-500 to-rose-500`) are detected.
- It does **not** scan hardcoded hex inside `.tsx`/`.jsx` (e.g.
  `style={{ color: '#6366f1' }}`) or raw Tailwind color literals (`text-slate-500`,
  `bg-[#6366f1]`). That's manual review — prefer shadcn's semantic tokens.

## Quick checklist for a shadcn/Tailwind project

- [ ] Are `--radius` and the palette **customized** (not the default)?
- [ ] Do containers have different weights, or is it all the same `Card`?
- [ ] Do colors come from semantic tokens, not raw `*-500`?
- [ ] Is there a display font on titles?
- [ ] Does density match the product type (dashboard ≠ landing)?
- [ ] Do states (loading/empty/error/`focus-visible`/disabled) exist?
