# Before / after — a "mission operations" card

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

The same dashboard card, generated with typical AI slop and then made
intentional. The auditor output below is **real** — reproduce it with:

```bash
node ../../skills/designer/scripts/audit.mjs before.css
node ../../skills/designer/scripts/audit.mjs after.css
```

---

## 🇺🇸 English

### Score: `18` (noticeable) → `0` (clean)

### Auditor — before (`before.css`)

```text
● gradiente-roxo-azul  [error]   (1×, weight 5)
● fonte-generica-unica [warning] (2×, weight 3)
● cantos-arredondados-demais [warning] (1×, weight 2)
● padding-colossal     [warning] (1×, weight 2)
● sombra-empilhada     [warning] (1×, weight 2)
● hex-hardcoded        [info]    (1×, weight 1)
SLOP SCORE: 18  (noticeable)
```

### Auditor — after (`after.css`)

```text
✓ No slop patterns detected in the scanned files.
SLOP SCORE: 0  (clean)
```

### What changed and why

| Decision | Before | After |
|----------|--------|-------|
| Background | Purple→blue gradient (AI signature) | Project `--bg`; a 3px left accent carries status |
| Fonts | `Inter` for everything | `Oswald` display for the title, `IBM Plex Sans` body |
| Radius | `32px` on the card | `--radius-sm` (4px) — dense, operational |
| Padding | `96px` | `16px/12px` tied to hierarchy |
| Elevation | 3 stacked shadows | One `1px` border (subtle, faster to render) |
| Color | `#ffffff` hardcoded | `var(--fg)` token |
| Copy | "Mission Control ✨ / Get Started" | "Patrol M-204 — en route / Open mission log" |

The point is not "less rounded = better". It is: **a dense operational tool
(high `VISUAL_DENSITY`) should not look like a marketing hero.** Every value now
comes from the design system, and the hierarchy is carried by typography and a
restrained accent — not by gradients and shadows.

---

## 🇧🇷 Português

### Score: `18` (noticeable) → `0` (clean)

O mesmo card de dashboard, gerado com slop típico de IA e depois tornado
intencional. A saída do auditor acima é **real** — reproduza com os comandos no
topo deste arquivo.

### O que mudou e por quê

| Decisão | Antes | Depois |
|---------|-------|--------|
| Fundo | Gradiente roxo→azul (assinatura de IA) | `--bg` do projeto; faixa de acento 3px à esquerda indica status |
| Fontes | `Inter` em tudo | Display `Oswald` no título, `IBM Plex Sans` no corpo |
| Raio | `32px` no card | `--radius-sm` (4px) — denso, operacional |
| Padding | `96px` | `16px/12px` ligados à hierarquia |
| Elevação | 3 sombras empilhadas | Uma borda `1px` (sutil, renderiza mais rápido) |
| Cor | `#ffffff` hardcoded | token `var(--fg)` |
| Microcópia | "Mission Control ✨ / Get Started" | "Patrol M-204 — en route / Open mission log" |

A lição não é "menos arredondado = melhor". É: **uma ferramenta operacional densa
(`VISUAL_DENSITY` alto) não deve ter cara de hero de marketing.** Agora todo valor
vem do design system, e a hierarquia é carregada pela tipografia e por um acento
contido — não por gradientes e sombras.
