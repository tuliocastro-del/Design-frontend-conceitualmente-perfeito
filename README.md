# Design Frontend Conceitualmente Perfeito

**🇧🇷 Português** · [🇺🇸 English](README.en.md)

Uma **skill de IA** que transforma qualquer modelo de linguagem em um
**designer de produto sênior** — capaz de melhorar interfaces de verdade,
combatendo o *"slop estético de IA"*: aquele visual genérico que denuncia que
uma tela foi gerada por IA (gradientes roxo/azul, cantos arredondados demais,
padding colossal, sombras pesadas e Inter/Roboto em tudo).

> **Princípio mestre:** *respeitar antes de impor.* A skill detecta o design
> system que já existe no projeto (tokens, temas, fontes, escala de espaçamento)
> e trabalha **dentro** dele, em vez de jogar um visual genérico por cima.

Este repositório é **público e colaborativo**: o objetivo é continuar melhorando
a skill testando-a com **vários modelos e provedores de IA** (Claude, GPT,
Gemini, etc.), não só um.

---

## O que tem aqui

```
skills/designer/
├── SKILL.md            # A skill (PT-BR) — instrução principal do "designer"
├── SKILL.en.md         # A skill (English)
├── references/         # Documentos de apoio que a skill consulta
│   ├── anti-slop.md            / anti-slop.en.md            # catálogo de padrões a evitar
│   ├── controles-numericos.md  / numeric-controls.en.md     # os 3 "diais" de design
│   └── checklist-acessibilidade.md / accessibility-checklist.en.md
└── scripts/
    └── audit.mjs       # Auditor determinístico: mede o "slop" por arquivo+linha
docs/
├── uso-por-provedor.md         # Como usar em cada ferramenta de IA (PT-BR)
└── usage-by-provider.en.md     # English version
```

## Como a skill funciona (resumo)

A skill obriga um **fluxo de 5 fases**, em ordem:

1. **Reconhecimento** — mapeia o design system existente antes de tocar em nada.
2. **Diagnóstico** — roda o auditor (`audit.mjs`) que pontua o "slop".
3. **Calibração** — define 3 diais (`0–10`) que forçam decisões de arquitetura:
   - `DESIGN_VARIANCE` (quão fora do padrão a composição vai)
   - `MOTION_INTENSITY` (quanta vida/animação)
   - `VISUAL_DENSITY` (quanto conteúdo por tela)
4. **Execução** — aplica mudanças sempre via tokens do projeto (tipografia,
   cor/contraste ≥ 4.5:1, espaçamento em escala, estados completos, acessibilidade).
5. **Verificação** — roda o auditor de novo (a pontuação deve cair) + testes do projeto.

## Início rápido

### Com o Claude Code

Copie a pasta da skill para o seu projeto:

```bash
mkdir -p .claude/skills
cp -r skills/designer .claude/skills/designer
```

Depois, num projeto de frontend, peça algo como *"melhora o visual dessa tela"*
ou *"isso tá com cara de IA, redesenha"* e a skill dispara sozinha.

### Com outros provedores (GPT, Gemini, Cursor, Copilot…)

A skill é, no fundo, um **prompt de sistema + documentos de referência + um
script Node**. Funciona em qualquer ferramenta. Veja o guia completo:
**[docs/uso-por-provedor.md](docs/uso-por-provedor.md)**.

### Rodando só o auditor (sem IA)

O auditor é um script Node independente — útil em qualquer projeto:

```bash
node skills/designer/scripts/audit.mjs [arquivos ou pastas...]
# sem argumentos: varre o projeto inteiro (css, html, js/jsx, ts/tsx, vue, svelte)
```

Ele imprime cada indício de "slop" (arquivo + linha + regra) e um `SLOP SCORE`
final. Quanto maior, mais "cara de IA". Requer Node.js 18+.

## Contribuindo

Contribuições são bem-vindas — especialmente **relatos de uso com diferentes
modelos de IA**, novos padrões anti-slop e traduções. Veja
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE) © 2026 Túlio Castro
