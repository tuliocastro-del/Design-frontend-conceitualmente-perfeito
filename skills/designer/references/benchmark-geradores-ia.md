# Fluxo pós-geração por ferramenta (Bolt, Lovable, Dyad, v0, …)

Esta skill é **agnóstica de gerador**. Gere a UI com a ferramenta que quiser;
depois rode este passe anti-slop. Abaixo, o fluxo prático por ferramenta e os
padrões de slop que cada uma tende a produzir.

## Receita geral (vale para todas)

1. Gere/exporte o código para o disco (ou clone o projeto da ferramenta).
2. `node skills/designer/scripts/audit.mjs --format json .` → anote o score.
3. Rode o fluxo de 5 fases do `SKILL.md` (reconhecimento → execução mínima).
4. Rode o auditor de novo → o score deve cair. Mostre antes/depois.

## Por ferramenta

### Bolt.new / StackBlitz
Gera full-stack no browser, rápido e genérico. Tende a `rounded-2xl`, `shadow-xl`,
hero centralizado, Tailwind cru.
**Pós-geração:** baixe/clonе o projeto, rode o auditor na pasta `src/`, customize
tokens Tailwind e quebre a simetria se for landing (`DESIGN_VARIANCE` alto).

### Lovable / open-lovable
Recria sites como apps React. Costuma cair em cards arredondados uniformes e
paleta roxo/azul.
**Pós-geração:** rode o auditor; foque em raio (token `--radius`), paleta
semântica e densidade. Ver `shadcn-tailwind-anti-slop.md`.

### Dyad (local/BYOK)
App builder local. Mesmo perfil de slop dos demais, mas você já tem o código na
máquina — ideal para o auditor.
**Pós-geração:** copie a skill para `.claude/skills/` do projeto Dyad e peça
"tira o slop respeitando os tokens".

### v0 / LlamaCoder / screenshot-to-code
Geram componentes/pequenos apps a partir de prompt ou imagem. Alta propensão a
slop por serem "primeiro rascunho".
**Pós-geração:** cole o componente num arquivo, rode o auditor nele, aplique as
correções. Em screenshot-to-code, confira também contraste e estados (a imagem
raramente mostra loading/empty/error).

### Figma MCP (Figma-Context-MCP, talk-to-figma)
Dão ao agente os tokens/layout reais do Figma — ótimo para fidelidade.
**Pós-geração:** o reconhecimento (fase 1) fica mais fácil: use os tokens do
Figma como verdade. O auditor verifica se o código gerado não derivou para hex
solto/raio genérico fora do que o Figma definiu.

### Claude Code / Cursor / Copilot / Codex
Agentes de coding. Aqui a skill é nativa (Claude Code) ou entra como regra/
instrução (ver `docs/uso-por-provedor.md`). Rode o auditor como parte do loop.

## Ideia de benchmark público (roadmap)

Mesmo prompt em várias ferramentas → rodar o auditor em cada output → comparar
`SLOP SCORE`, uso de tokens, contraste, densidade e estados. Resultado: um
ranking objetivo de "qual ferramenta gera menos slop". Contribuições com relatos
multi-modelo são bem-vindas (ver `CONTRIBUTING.md`).
