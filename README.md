# Design Frontend Conceitualmente Perfeito

**🇧🇷 Português** · [🇺🇸 English](README.en.md)

> **Isto não é mais um gerador de apps com IA. É a camada de qualidade de design
> que você roda _depois_ que a IA gera a interface — para remover o slop
> genérico, respeitar o design system existente e deixar a UI intencional.**

Uma **skill de IA + auditor anti-slop determinístico** que transforma qualquer
modelo de linguagem num **revisor de design frontend sênior**. Gere a UI com a
ferramenta que quiser (Claude Code, Cursor, Copilot, Bolt, Lovable, Dyad, v0,
screenshot-to-code, Figma MCP…); depois rode esta camada para tirar o *"slop
estético de IA"*: gradientes roxo/azul, cantos arredondados demais, padding
colossal, sombras pesadas, Inter/Roboto em tudo e layout simétrico previsível.

## O que é / o que não é

| É | Não é |
|---|-------|
| Uma camada de **qualidade/QA de design** pós-geração | Um gerador/builder de apps |
| Um **auditor determinístico** de slop (Node, zero deps) | Um modelo de IA ou produto hospedado |
| Uma **skill agnóstica** (Claude, GPT, Gemini, Cursor…) | Preso a um provedor |
| Um disciplinador que **respeita o design system** | Um tema genérico aplicado por cima |

## Por que existe

Geradores de IA produzem código funcional, mas convergem para o mesmo visual
genérico — fácil de reconhecer como "feito por IA". Eles dependem do modelo "ter
bom gosto". Este projeto troca gosto por **processo**: reconhecer o sistema
existente, diagnosticar com um auditor, calibrar diais, executar via tokens e
verificar — com acessibilidade como piso.

## Em 60 segundos

```bash
# 1. clone/baixe este repo, depois rode o auditor em qualquer frontend:
node skills/designer/scripts/audit.mjs caminho/do/projeto
#    → lista cada indício (arquivo:linha + severidade) e um SLOP SCORE

# 2. instale a skill no seu agente (ex.: Claude Code):
mkdir -p .claude/skills && cp -r skills/designer .claude/skills/designer

# 3. num projeto de frontend, peça: "isso tá com cara de IA, tira o slop".
#    A skill roda as 5 fases e o auditor sozinha.
```

## O que tem aqui

```
skills/designer/
├── SKILL.md / SKILL.en.md          # A skill — fluxo de 5 fases (PT/EN)
├── references/                     # Documentos de apoio que a skill consulta
│   ├── design-system-reconhecimento / design-system-recognition.en
│   ├── anti-slop / anti-slop.en                 # catálogo de padrões a evitar
│   ├── controles-numericos / numeric-controls.en  # os 3 "diais" de design
│   ├── shadcn-tailwind-anti-slop / .en          # armadilhas Tailwind/shadcn
│   ├── checklist-acessibilidade / accessibility-checklist.en
│   └── benchmark-geradores-ia / ai-builder-benchmark.en  # fluxo pós-geração
└── scripts/audit.mjs               # Auditor determinístico (slop por arquivo+linha)
docs/        # uso-por-provedor.md (+ .en) — como usar em cada ferramenta de IA
examples/    # before/after reais com saída do auditor
tests/       # testes do auditor (node:test) + fixtures
```

## Como a skill funciona (resumo)

Fluxo obrigatório de **5 fases**, em ordem:

1. **Reconhecimento** — mapeia o design system existente antes de tocar em nada.
2. **Diagnóstico** — roda `audit.mjs` e anota o `SLOP SCORE`.
3. **Calibração** — define 3 diais (`0–10`) que forçam decisões de arquitetura:
   `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`.
4. **Execução** — mudança **mínima**, sempre via tokens (tipografia, cor/contraste
   ≥ 4.5:1, espaçamento em escala, estados completos, acessibilidade).
5. **Verificação** — roda o auditor de novo (o score deve cair) + testes do projeto.

## O auditor

Script Node independente (Node 18+), sem dependências:

```bash
node skills/designer/scripts/audit.mjs [arquivos ou pastas...]   # texto
node skills/designer/scripts/audit.mjs --format json .           # JSON
node skills/designer/scripts/audit.mjs --fail-on-score 20 .      # gate de CI
node skills/designer/scripts/audit.mjs --help                    # ajuda
```

**Como interpretar o score** (`error` > `warning` > `info`):

| Score | Faixa | Leitura |
|------:|-------|---------|
| `0` | limpo | nenhum padrão de slop detectado |
| `1–9` | menor | poucos indícios, geralmente `info`/`warning` |
| `10–24` | perceptível | slop visível; vale o passe da skill |
| `25+` | pesado | cara de template; redesenhe a camada visual |

É **diagnóstico, não veredito**: sai com código `0` por padrão. Use `--fail-on-score N`
só quando quiser um portão de CI. Severidade `info` (ex.: `rounded-full` em avatar)
**não** infla o score.

## Usando com cada provedor

A skill é, no fundo, **prompt de sistema + referências + um script Node** — roda
em qualquer ferramenta. Guia completo: **[docs/uso-por-provedor.md](docs/uso-por-provedor.md)**.

- **Claude Code:** copie `skills/designer` para `.claude/skills/` — dispara sozinha.
- **Cursor:** cole o `SKILL.md` em `.cursor/rules/designer.mdc`.
- **GitHub Copilot:** cole em `.github/copilot-instructions.md`.
- **ChatGPT/GPT, Gemini, Codex, qualquer LLM:** `SKILL.md` como instrução de
  sistema + `references/` como contexto; rode o auditor e cole a saída.

## Depois de gerar com Bolt / Lovable / Dyad / screenshot-to-code

Gere com a ferramenta → rode o auditor → aplique o passe anti-slop → rode o
auditor de novo. Receita por ferramenta em
`skills/designer/references/benchmark-geradores-ia.md`.

## Exemplos

[`examples/basic-before-after/`](examples/basic-before-after/) — um card de
dashboard que sai de `SLOP SCORE: 18` para `0`, com a saída real do auditor e as
decisões de design explicadas.

## Rodando os testes

```bash
npm test          # node --test tests/*.test.mjs
npm run audit -- .
```

## Roadmap curto

- **v0.2 (aqui):** auditor com JSON/severidade/`--fail-on-score`, testes, CI,
  exemplos, novas referências.
- **v0.3:** mais exemplos antes/depois (dashboard denso, landing, form) e screenshots.
- **v0.4:** detecção de tokens em `theme.ts`/JSON, supressões inline, benchmark multi-modelo.
- **v1.0:** pacote npm (`npx anti-slop-audit`), GitHub Action e MCP de design review.

## Contribuindo

Contribuições são bem-vindas — especialmente **relatos de uso com diferentes
modelos de IA**, novos padrões anti-slop e traduções. Veja
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE) © 2026 Túlio Castro
