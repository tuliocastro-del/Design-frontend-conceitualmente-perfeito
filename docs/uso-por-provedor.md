# Como usar a skill em cada provedor de IA

[🇧🇷 Português](uso-por-provedor.md) · [🇺🇸 English](usage-by-provider.en.md)

A skill `designer` tem três partes, e elas se encaixam em quase qualquer
ferramenta de IA:

| Parte | O que é | Como entra na ferramenta |
|-------|---------|--------------------------|
| `SKILL.md` (ou `SKILL.en.md`) | A instrução principal — o "papel" do designer e o fluxo de 5 fases | Prompt de sistema / instruções do projeto / regras do agente |
| `references/*.md` | Catálogos de apoio (anti-slop, diais, acessibilidade) | Anexar como contexto, ou colar o trecho relevante quando a fase pedir |
| `scripts/audit.mjs` | Auditor determinístico de "slop" | Rodar no terminal (`node …`) e colar a saída pra IA |

> **Dica geral:** o conteúdo da skill é texto puro. Se a sua ferramenta não tiver
> um mecanismo formal de "skill", basta **colar o `SKILL.md` como instrução de
> sistema** e anexar os `references/` que ela precisar. Funciona em qualquer LLM.

---

## Claude Code (Anthropic)

Formato nativo de skill. Copie a pasta para o projeto:

```bash
mkdir -p .claude/skills
cp -r skills/designer .claude/skills/designer
```

A skill dispara sozinha quando você pede algo de design ("melhora o visual",
"redesenha", "tá com cara de IA"). O Claude também roda o `audit.mjs` sozinho.

## Cursor

1. **Project Rules:** crie `.cursor/rules/designer.mdc` e cole o conteúdo do
   `SKILL.md` (pode tirar o cabeçalho `---name/description---` ou mantê-lo como
   comentário). Marque como regra sempre ativa ou acionável por contexto.
2. Os `references/` podem ficar no repo; peça ao Cursor pra ler o arquivo
   específico na fase em que ele for necessário (ex.: "consulte
   `references/anti-slop.md`").
3. O auditor roda no terminal integrado do Cursor.

## Windsurf / Codeium

Use as **Rules** do workspace (`.windsurfrules` ou o painel de regras): cole o
`SKILL.md`. Anexe os `references/` ao contexto quando precisar.

## GitHub Copilot

Crie `.github/copilot-instructions.md` no repositório e cole o `SKILL.md`
(versão resumida funciona melhor pelo limite de contexto). O Copilot Chat passa
a seguir o fluxo de design. O auditor roda no terminal normalmente.

## ChatGPT / GPT (OpenAI)

- **Custom GPT:** cole o `SKILL.md` em *Instructions* e suba os `references/*.md`
  como *Knowledge*. O auditor você roda localmente e cola a saída no chat.
- **Projetos / instruções personalizadas:** cole o `SKILL.md` nas instruções do
  projeto; anexe os `references/` por upload quando a fase pedir.
- **Via API:** envie o `SKILL.md` como mensagem `system` e os `references/`
  como contexto adicional conforme a fase.

## Gemini (Google) / Gemini Code Assist

- **Gemini app / AI Studio:** cole o `SKILL.md` como *system instruction*; anexe
  os `references/*.md` como arquivos de contexto.
- **Gemini Code Assist (IDE):** use o arquivo de regras/contexto do projeto e
  cole o `SKILL.md`.

## Codex / Codex CLI (OpenAI)

- Adicione o `SKILL.md` como instrução do agente (ex.: `AGENTS.md` na raiz do
  repo, ou o arquivo de instruções que o seu Codex usa). Peça para ele consultar
  os `references/` na fase em que forem necessários.
- O auditor roda no terminal do agente como qualquer comando Node.

## Qualquer outro LLM (Llama, Mistral, DeepSeek, etc.)

O padrão é sempre o mesmo:

1. `SKILL.md` → mensagem/instrução **system**.
2. `references/*.md` → contexto adicional (anexe ou cole o trecho da fase atual).
3. `scripts/audit.mjs` → rode no terminal e cole a saída no chat para a fase de
   diagnóstico e de verificação.

---

## Pós-geração: Bolt / open-lovable / Dyad / v0 / screenshot-to-code

Estas ferramentas **geram** a UI; esta skill entra **depois**. Fluxo:

1. Gere/exporte o código para o disco (ou clone o projeto da ferramenta).
2. `node skills/designer/scripts/audit.mjs --format json .` → anote o score.
3. Rode o fluxo de 5 fases do `SKILL.md` (reconhecimento → execução mínima).
4. Rode o auditor de novo → o score deve cair.

Receita detalhada por ferramenta:
`skills/designer/references/benchmark-geradores-ia.md`.

## Sobre o auditor (`audit.mjs`)

Independe de IA — é só Node.js 18+:

```bash
node skills/designer/scripts/audit.mjs                 # varre o projeto inteiro
node skills/designer/scripts/audit.mjs src/ui.css      # arquivos/pastas específicos
node skills/designer/scripts/audit.mjs --format json . # saída JSON (parseável)
node skills/designer/scripts/audit.mjs --fail-on-score 20 .  # gate de CI (exit 1 se score > 20)
node skills/designer/scripts/audit.mjs --fail-on-a11y .      # gate de CI (exit 1 se houver erro de a11y)
node skills/designer/scripts/audit.mjs --help          # ajuda completa
```

Saída: lista de indícios agrupados por regra, com **severidade**
(`error`/`warning`/`info`), e um `SLOP SCORE` final (faixas: 0 limpo · 1–9 menor ·
10–24 perceptível · 25+ pesado). Há também uma seção de **acessibilidade**
(categoria separada, fora do SLOP SCORE). Use **antes** (diagnóstico) e **depois**
(verificação) — a pontuação deve cair. Por padrão sai com código `0` (é
diagnóstico, não um portão de CI); use `--fail-on-score N`/`--fail-on-a11y` quando
quiser falhar um pipeline. Severidade `info` (ex.: `rounded-full` em avatar) não
infla o score.
