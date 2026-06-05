# Checklist de acessibilidade (piso, não enfeite)

Toda melhoria de frontend passa por aqui. Itens são requisito, não opcional.

## Contraste

- Texto normal: **≥ 4.5:1** contra o fundo.
- Texto grande (≥ 24px, ou ≥ 18.7px / 14pt bold): **≥ 3:1**.
- Componentes de UI e bordas de foco: **≥ 3:1**.
- Não comunique estado **só** por cor (erro/sucesso precisam de ícone/texto).
- Meça de fato (devtools, fórmula WCAG). "Parece ok" não conta.

## Foco e teclado

- Foco **sempre visível** (`:focus-visible` com outline/anel de ≥ 3:1).
- Ordem de tabulação lógica; nada acessível só por mouse/hover.
- Alvos de toque **≥ 24×24px CSS** (piso AA do WCAG 2.2); mire **≥ 44×44px** nos
  alvos primários / touch-first.
- `Esc` fecha overlays; foco fica preso (trap) dentro de modais abertos.

## Movimento

- Respeite `@media (prefers-reduced-motion: reduce)` — reduza/remova animação.
- Nada que pisque > 3×/s.
- Quando `MOTION_INTENSITY > 5`, ainda assim ofereça o caminho reduzido.

## Semântica

- HTML semântico (`<button>`, `<nav>`, `<main>`, headings em ordem h1→h2→h3);
  **um `<h1>`** por página e `<title>` descritivo; `lang` no `<html>`.
- Qualquer widget interativo custom precisa de **role + nome acessível + estado**
  — um `<div onClick>` deve ser `<button>` (ou ter `role="button"` + `tabIndex` +
  handler de teclado).
- `alt` em imagens informativas; **`alt=""` em decorativas**; `aria-label` em
  ícones interativos sem texto.
- Labels associados a inputs; `autocomplete` em campos de identidade
  (nome/email/tel); mensagens de erro ligadas ao campo.
- Estados refletidos para AT: `aria-expanded`, `aria-current`, `aria-invalid`.

> O auditor (`audit.mjs`) já checa automaticamente, como categoria separada:
> `img` sem `alt`, `outline:none` sem `:focus-visible`, movimento sem
> `prefers-reduced-motion` e `onClick` em elemento não-interativo. O resto é
> revisão manual.

## Estados de tela completos

Desenhe e implemente: **vazio**, **carregando**, **erro**, **sucesso**,
**parcial/paginado**. Tela "feliz" sem os outros estados é entrega incompleta.
