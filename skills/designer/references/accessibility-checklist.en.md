# Accessibility checklist (the floor, not decoration)

Every frontend improvement passes through here. Items are requirements, not optional.

## Contrast

- Normal text: **≥ 4.5:1** against the background.
- Large text (≥ 24px, or ≥ 18.7px / 14pt bold): **≥ 3:1**.
- UI components and focus borders: **≥ 3:1**.
- Don't communicate state by **color alone** (error/success need an icon/text).
- Actually measure it (devtools, WCAG formula). "Looks ok" doesn't count.

## Focus and keyboard

- Focus **always visible** (`:focus-visible` with an outline/ring of ≥ 3:1).
- Logical tab order; nothing reachable only by mouse/hover.
- Touch/click targets **≥ 24×24 CSS px** (WCAG 2.2 AA floor); aim for
  **≥ 44×44px** on primary / touch-first targets.
- `Esc` closes overlays; focus is trapped inside open modals.

## Motion

- Respect `@media (prefers-reduced-motion: reduce)` — reduce/remove animation.
- Nothing that flashes > 3×/s.
- When `MOTION_INTENSITY > 5`, still offer the reduced path.

## Semantics

- Semantic HTML (`<button>`, `<nav>`, `<main>`, headings in order h1→h2→h3);
  **one `<h1>`** per page and a descriptive `<title>`; `lang` on `<html>`.
- Any custom interactive widget needs **role + accessible name + state** — a
  `<div onClick>` must be a `<button>` (or have `role="button"` + `tabIndex` + a
  key handler).
- `alt` on informative images; **`alt=""` on decorative ones**; `aria-label` on
  interactive icons without text.
- Labels associated with inputs; `autocomplete` on identity fields
  (name/email/tel); error messages linked to the field.
- States reflected to assistive tech: `aria-expanded`, `aria-current`, `aria-invalid`.

> The auditor (`audit.mjs`) already checks automatically, as a separate category:
> `img` without `alt`, `outline:none` without `:focus-visible`, motion without
> `prefers-reduced-motion`, and `onClick` on a non-interactive element. The rest is
> manual review.

## Complete screen states

Design and implement: **empty**, **loading**, **error**, **success**,
**partial/paginated**. A "happy" screen without the others is an incomplete delivery.
