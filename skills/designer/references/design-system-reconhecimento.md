# Reconhecimento do design system (fase 1)

Antes de mudar qualquer coisa, descubra o vocabulário visual que o projeto já
usa. Mudar fora dele é a causa nº 1 de slop e de quebra de tema. Esta é uma lista
de **onde olhar** e **o que extrair**.

## Onde os tokens costumam viver

| Fonte | Como reconhecer | O que extrair |
|-------|-----------------|---------------|
| CSS custom properties | `:root { --cor-*: ... }`, `[data-theme="dark"]` | Cores, raios, espaçamento, sombras, fontes |
| Tailwind | `tailwind.config.{js,ts,cjs,mjs}` → `theme.extend` | Paleta, `borderRadius`, `spacing`, `fontFamily` |
| shadcn/ui | `components.json` + `--background/--foreground/--primary` em HSL | Tokens semânticos; classes `bg-card`, `text-muted-foreground` |
| Design tokens | `*tokens*.json`, `design-tokens.*`, Style Dictionary | Esc+alas nomeadas (cor/espaço/raio/tipografia) |
| Tema em código | `theme.ts`, `theme.js`, `styled` ThemeProvider | Objeto de tema (chaves = tokens) |
| Figma-derived | comentários com nomes de camada, vars exportadas | Nomes de token a preservar |

> O auditor já marca `projectHasTokens: true` quando encontra qualquer um desses
> sinais. Se for `true`, **assuma que existe um sistema** e procure-o a fundo.

## O que mapear (checklist)

- **Fontes:** display (títulos), corpo, mono. Existe pareamento ou é uma só?
- **Cor:** paleta base + acento(s). Há tokens semânticos (`--primary`, `--danger`)
  ou só escala bruta (`--gray-500`)? Há tema claro/escuro?
- **Espaçamento:** a escala é 4px? 8px? Múltiplos? Anote os degraus existentes.
- **Raio:** quais valores existem (`--radius-sm/md/lg`)? Qual é o "default"?
- **Elevação:** quantos níveis de sombra? Ou separação por borda `1px`?
- **Imutáveis:** o que a doc/marca fixa (fontes institucionais, cores oficiais,
  temas suportados, contraste mínimo)? Isso **não se negocia**.

## Como herdar o vocabulário

1. Toda cor nova → token existente. Faltou token? Crie no lugar canônico
   (`:root`, `theme.extend`, tokens JSON) e use a variável — nunca crave o hex.
2. Todo raio/espaço novo → degrau da escala existente. Não invente `13px`.
3. Respeite os nomes. Se o sistema usa `--accent`, não crie `--brand-color` paralelo.
4. Se **não há sistema nenhum** (auditor `projectHasTokens: false` e nada nas
   fontes acima): aí sim você pode **propor** um pequeno conjunto de tokens —
   paleta restrita, 2 fontes, escala 4/8px, 1–3 raios, 1–3 sombras — e ancorar
   tudo neles. Anuncie isso ao usuário antes.

## Sinais de que você ainda NÃO reconheceu o sistema

- Você está prestes a escrever um hex e não checou se há `var(--…)` equivalente.
- Você não sabe dizer qual é a fonte de título do projeto.
- Você não sabe se o projeto tem tema escuro.

Se qualquer um for verdade, volte e mapeie antes de executar.
