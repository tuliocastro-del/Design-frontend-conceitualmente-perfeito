# Anti-slop catalog — AI patterns and their fixes

"AI aesthetic slop" is the convergence of model-generated interfaces toward the
same generic look. Recognize and reverse each pattern:

## 1. Purple→blue gradient on a white background

**Symptom:** `linear-gradient(135deg, #6366f1, #8b5cf6)`, `from-purple-500
to-blue-500`, hero with a blurred purple blob.
**Why it's slop:** it became a cliché; it communicates nothing about the product.
**Fix:** a palette derived from the domain/brand. If you need depth, use a subtle
gradient within the accent's own color family (e.g. two tones of the accent), or
light texture/noise, or simply a well-chosen solid color.

## 2. Over-rounded corners

**Symptom:** `rounded-2xl`/`rounded-3xl`/`border-radius: 24px` on everything —
cards, buttons, inputs, images.
**Why it's slop:** a uniform high radius erases hierarchy and looks like a template.
**Fix:** radius is a per-element decision. A short scale (e.g. 4/6/10px). Dense/
operational UI → near-straight corners. Pills only where they make sense
(tags, toggles).

## 3. Colossal padding

**Symptom:** `p-12`, `py-24`, sections with 200px+ of vertical breathing room for
no reason.
**Why it's slop:** it destroys screen density and hides content below the fold.
**Fix:** spacing in service of hierarchy, on a consistent scale (4/8px). Generous
breathing room only where it separates distinct blocks of meaning.

## 4. Heavy / stacked shadows

**Symptom:** `shadow-2xl`, multiple `box-shadow` summed, dark shadows on a light
background.
**Why it's slop:** exaggerated elevation looks like a template and degrades rendering.
**Fix:** a subtle elevation system (1–3 levels). In dark/dense UI, a thin
`1px` border often communicates separation better than a shadow.

## 5. One generic font across all layers

**Symptom:** Inter (or Roboto) for title, body, label, number — everything.
**Why it's slop:** zero personality; impossible to tell the brand apart.
**Fix:** a **planned pairing** of fonts. A display font with character for titles
(at a weight/size that creates contrast), a neutral readable one for body, mono
for data/code. Reference example (Anthropic brand guidelines): Poppins for titles
(min. 24pt), Lora for body.

## 6. Hardcoded hex ignoring the design system

**Symptom:** `color: #1f2937` scattered around when `var(--text)` exists.
**Why it's slop:** breaks themes, creates color drift, prevents dark/light.
**Fix:** always the system token/variable/class. If a token is missing, create it
in the canonical place instead of nailing the value down.

## 7. Predictable symmetric layout

**Symptom:** every hero centered, identical 3-column grid, "feature cards" in a
row always the same.
**Why it's slop:** the generator's default composition.
**Fix:** when `DESIGN_VARIANCE > 4`, impose intentional asymmetry — split-screen,
radical left alignment, controlled overlap, purposeful grid breaks. Always
readable, never chaotic.

## 8. Generic microcopy and icons

**Symptom:** "Get Started" + rocket icon + ✨ emoji on everything.
**Fix:** domain-specific copy; coherent iconography (one family, one weight).
Less decorative emoji.

## Reference institutional colors (Anthropic example)

Only as an illustration of a restrained, intentional palette:
dark `#141413`, light `#faf9f5`, mid gray `#b0aea5`, light gray `#e8e6dc`,
orange accent `#d97757`, secondary blue `#6a9bcc`, tertiary green `#788c5d`.
The lesson is not *these* colors — it's having a small, deliberate palette.
