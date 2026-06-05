# Checklist de acessibilidade (piso, não enfeite)

Toda melhoria de frontend passa por aqui. Itens são requisito, não opcional.

## Contraste

- Texto normal: **≥ 4.5:1** contra o fundo.
- Texto grande (≥ 24px, ou ≥ 19px bold): **≥ 3:1**.
- Componentes de UI e bordas de foco: **≥ 3:1**.
- Não comunique estado **só** por cor (erro/sucesso precisam de ícone/texto).
- Meça de fato (devtools, fórmula WCAG). "Parece ok" não conta.

## Foco e teclado

- Foco **sempre visível** (`:focus-visible` com outline/anel de ≥ 3:1).
- Ordem de tabulação lógica; nada acessível só por mouse/hover.
- Alvos de toque **≥ 44×44px**.
- `Esc` fecha overlays; foco fica preso (trap) dentro de modais abertos.

## Movimento

- Respeite `@media (prefers-reduced-motion: reduce)` — reduza/remova animação.
- Nada que pisque > 3×/s.
- Quando `MOTION_INTENSITY > 5`, ainda assim ofereça o caminho reduzido.

## Semântica

- HTML semântico (`<button>`, `<nav>`, `<main>`, headings em ordem h1→h2→h3).
- `alt` em imagens informativas; `aria-label` em ícones interativos sem texto.
- Labels associados a inputs; mensagens de erro ligadas ao campo.
- Estados refletidos para AT: `aria-expanded`, `aria-current`, `aria-invalid`.

## Estados de tela completos

Desenhe e implemente: **vazio**, **carregando**, **erro**, **sucesso**,
**parcial/paginado**. Tela "feliz" sem os outros estados é entrega incompleta.
