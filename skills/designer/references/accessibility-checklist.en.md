# Accessibility checklist (the floor, not decoration)

Every frontend improvement passes through here. Items are requirements, not optional.

## Contrast

- Normal text: **≥ 4.5:1** against the background.
- Large text (≥ 24px, or ≥ 19px bold): **≥ 3:1**.
- UI components and focus borders: **≥ 3:1**.
- Don't communicate state by **color alone** (error/success need an icon/text).
- Actually measure it (devtools, WCAG formula). "Looks ok" doesn't count.

## Focus and keyboard

- Focus **always visible** (`:focus-visible` with an outline/ring of ≥ 3:1).
- Logical tab order; nothing reachable only by mouse/hover.
- Touch targets **≥ 44×44px**.
- `Esc` closes overlays; focus is trapped inside open modals.

## Motion

- Respect `@media (prefers-reduced-motion: reduce)` — reduce/remove animation.
- Nothing that flashes > 3×/s.
- When `MOTION_INTENSITY > 5`, still offer the reduced path.

## Semantics

- Semantic HTML (`<button>`, `<nav>`, `<main>`, headings in order h1→h2→h3).
- `alt` on informative images; `aria-label` on interactive icons without text.
- Labels associated with inputs; error messages linked to the field.
- States reflected to assistive tech: `aria-expanded`, `aria-current`, `aria-invalid`.

## Complete screen states

Design and implement: **empty**, **loading**, **error**, **success**,
**partial/paginated**. A "happy" screen without the others is an incomplete delivery.
