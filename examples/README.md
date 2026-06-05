# Examples

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

## 🇺🇸 English

Small, didactic before/after cases that show what the skill + auditor do. They
are deliberately tiny so you can read the diff and the audit output in seconds.

- **`basic-before-after/`** — a "mission operations" dashboard card. Generated
  with typical AI slop (`SLOP SCORE: 18`), then made intentional (`0`). See
  [`audit-comparison.md`](basic-before-after/audit-comparison.md).

Reproduce any example:

```bash
cd examples/basic-before-after
node ../../skills/designer/scripts/audit.mjs before.css   # score 18
node ../../skills/designer/scripts/audit.mjs after.css    # score 0
```

> These are CSS/HTML on purpose — no build step, no framework, nothing to
> install. The skill itself works the same way on Tailwind/shadcn/CSS-modules
> code; see `skills/designer/references/shadcn-tailwind-anti-slop.en.md`.

---

## 🇧🇷 Português

Casos antes/depois pequenos e didáticos que mostram o que a skill + auditor
fazem. São propositalmente minúsculos para você ler o diff e a saída do auditor
em segundos.

- **`basic-before-after/`** — um card de dashboard de "operações de missão".
  Gerado com slop típico de IA (`SLOP SCORE: 18`), depois tornado intencional
  (`0`). Veja [`audit-comparison.md`](basic-before-after/audit-comparison.md).

Reproduza qualquer exemplo:

```bash
cd examples/basic-before-after
node ../../skills/designer/scripts/audit.mjs before.css   # score 18
node ../../skills/designer/scripts/audit.mjs after.css    # score 0
```

> São CSS/HTML de propósito — sem build, sem framework, nada para instalar. A
> skill funciona igual em código Tailwind/shadcn/CSS-modules; veja
> `skills/designer/references/shadcn-tailwind-anti-slop.md`.
