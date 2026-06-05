# Contribuindo / Contributing

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

---

## 🇧🇷 Português

Obrigado pelo interesse! Este projeto é colaborativo e multi-provedor — o maior
valor vem de testar a skill com **modelos de IA diferentes** e relatar o que
aconteceu.

### Formas de contribuir

- **Relatos de uso multi-modelo:** rodou a skill no GPT, Gemini, Llama, etc.?
  Abra uma *issue* contando o modelo, o pedido, e se o resultado ficou melhor ou
  caiu em "slop". Isso guia as melhorias.
- **Novos padrões anti-slop:** identificou um clichê visual de IA não catalogado?
  Adicione em `skills/designer/references/anti-slop.md` (PT) **e**
  `anti-slop.en.md` (EN), com sintoma + por que é slop + correção.
- **Regras do auditor:** uma nova regra em `scripts/audit.mjs` deve ter `id`,
  `weight`, regex e mensagem, e **não** gerar falso positivo em código comum.
- **Traduções e correções de texto.**

### Regras do repositório

1. **Bilíngue:** toda mudança de conteúdo em PT deve ter a contraparte em EN
   (arquivos `*.en.md`), e vice-versa.
2. **Sem dados sensíveis:** este repo é público — nunca inclua nomes, e-mails
   reais, segredos ou conteúdo de projetos privados nos exemplos.
3. **Teste o auditor:** se mexer no `audit.mjs`, rode-o em pelo menos um projeto
   real e confirme que não gera falso positivo (`node skills/designer/scripts/audit.mjs`).
4. **Pull requests** com descrição clara do quê e do porquê. Mudança só de
   documentação pode ser direta; mudança de comportamento da skill, explique o
   raciocínio.

---

## 🇺🇸 English

Thanks for your interest! This project is collaborative and multi-provider — the
greatest value comes from testing the skill with **different AI models** and
reporting what happened.

### Ways to contribute

- **Multi-model usage reports:** ran the skill on GPT, Gemini, Llama, etc.? Open
  an *issue* describing the model, the request, and whether the result improved
  or fell into "slop". This guides improvements.
- **New anti-slop patterns:** spotted an uncatalogued AI visual cliché? Add it to
  `skills/designer/references/anti-slop.md` (PT) **and** `anti-slop.en.md` (EN),
  with symptom + why it's slop + fix.
- **Auditor rules:** a new rule in `scripts/audit.mjs` must have an `id`,
  `weight`, regex and message, and **not** produce false positives on normal code.
- **Translations and copy fixes.**

### Repository rules

1. **Bilingual:** every content change in PT must have its EN counterpart
   (`*.en.md` files), and vice versa.
2. **No sensitive data:** this repo is public — never include real names, emails,
   secrets, or private project content in examples.
3. **Test the auditor:** if you touch `audit.mjs`, run it on at least one real
   project and confirm it produces no false positives.
4. **Pull requests** with a clear description of what and why. Docs-only changes
   can be direct; behavior changes to the skill, explain the reasoning.
