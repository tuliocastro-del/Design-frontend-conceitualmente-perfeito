# The three numeric design controls

Three dials from `0` to `10` that translate the brief into mandatory
architectural decisions. Set them explicitly at the start and **announce them to
the user** before applying. Above the threshold, the behavior stops being optional.

## DESIGN_VARIANCE — how far off-pattern the composition goes

- **0–4:** conventional layouts allowed (centered hero, symmetric grid). Good for
  internal dashboards, forms, tools where predictability reduces cognitive load.
- **> 4 (trigger):** generic centered hero forbidden. Imposes **asymmetry**:
  split-screen, radical left alignment, controlled overlap, intentionally broken
  grid. Good for landing pages, brand, portfolio, products that need to stand out.

## MOTION_INTENSITY — how much life the interface has

- **0–5:** discrete functional transitions (hover, focus, open/close). Always
  respects `prefers-reduced-motion`.
- **> 5 (trigger):** requires **continuous micro-animations** (states that react,
  tactile-visual feedback) and **refined loading transitions** (skeletons,
  staggered entrance). Never gratuitous animation that disrupts reading.

## VISUAL_DENSITY — how much content per screen

The threshold is high (`> 7`) on purpose: cards are an acceptable default; only
genuinely dense tools should abandon them.

- **0–7:** cards and containers allowed; more breathing room; good for marketing
  content, onboarding, single-focus screens.
- **> 7 (trigger):** **removes decorative containers** — each box must earn its
  weight. Prefer **thin dividers, subtle lines and whitespace** to separate. (Not a
  card ban: Linear/Notion use dense cards; what goes is the *generic* rounded box
  that only wraps content.) Good for operational tools, tables, panels.

## EXPRESSION_RESTRAINT — typographic and chromatic discipline

Captures the two things that most separate "designed" from "generic" —
typographic contrast and color restraint — which the other dials don't measure.

- **0–4 (expressive):** strong accent allowed, bold display, more than one
  highlight per screen. Good for brand/portfolio.
- **> 6 (trigger, restrained):** at most **1 meaningful accent color per screen**
  and **2 font families**; hierarchy must come from **weight/size/case**, never an
  extra color or an effect (no gradient text). Good for tools, data, reading.

## How to choose by product type

| Product | VARIANCE | MOTION | DENSITY | RESTRAINT |
|---------|----------|--------|---------|-----------|
| Operational tool / dense dashboard | 2–4 | 2–4 | **8–10** | **7–9** |
| Landing page / brand | **6–9** | **6–8** | 3–5 | 2–4 |
| Productivity app | 3–5 | 4–6 | 6–8 | 5–7 |
| Documentation / reading | 2–4 | 1–3 | 4–6 | **7–9** |
| Portfolio / showcase | **7–10** | **7–9** | 3–6 | 1–4 |

The values combine: high `VARIANCE` + high `DENSITY` = bold yet lean composition
(lines, not boxes). High `MOTION` + high `DENSITY` requires extra care so the
motion doesn't become noise. High `RESTRAINT` + high `VARIANCE` is rare (bold
composition, restrained color/type — can work, with care).
