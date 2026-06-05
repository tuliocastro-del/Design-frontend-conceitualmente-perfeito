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

## Qualquer outro LLM (Llama, Mistral, DeepSeek, etc.)

O padrão é sempre o mesmo:

1. `SKILL.md` → mensagem/instrução **system**.
2. `references/*.md` → contexto adicional (anexe ou cole o trecho da fase atual).
3. `scripts/audit.mjs` → rode no terminal e cole a saída no chat para a fase de
   diagnóstico e de verificação.

---

## Sobre o auditor (`audit.mjs`)

Independe de IA — é só Node.js 18+:

```bash
node skills/designer/scripts/audit.mjs            # varre o projeto inteiro
node skills/designer/scripts/audit.mjs src/ui.css # arquivos/pastas específicos
```

Saída: lista de indícios (arquivo:linha + regra + trecho) e um `SLOP SCORE`
final. Use **antes** (diagnóstico) e **depois** (verificação) — a pontuação deve
cair. Ele sempre sai com código `0` (é diagnóstico, não um portão de CI), então
a IA decide o que fazer com o resultado.
