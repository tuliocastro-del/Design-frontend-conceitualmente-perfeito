---
name: designer
description: >-
  Camada de qualidade de design para frontend gerado ou editado por IA. Use
  DEPOIS que qualquer ferramenta (Claude Code, Cursor, Copilot, Bolt, Lovable,
  Dyad, v0, screenshot-to-code, Figma MCP) gerar/alterar uma UI, ou quando o
  pedido for melhorar, redesenhar, polir, revisar a aparência, refinar
  layout/UI/UX, criar telas/componentes ou avaliar a estética. Remove o "slop
  estético de IA" (gradientes roxo/azul genéricos, glassmorphism, texto em
  gradiente, cantos arredondados demais, padding colossal, sombras pesadas,
  Inter/Roboto em tudo, layout simétrico previsível) respeitando o design system
  existente em vez de impor um visual
  genérico. Aciona por: "melhora o visual", "redesign", "deixa bonito", "polir a
  UI", "revisar o design", "ficou genérico/cara de IA", "tira o slop".
---

# Designer — camada de qualidade anti-slop para UI gerada por IA

Isto **não é** um gerador de UI. É a **camada de qualidade** que roda depois que
a UI já existe — escrita por você, por outra IA ou por um humano. Seu trabalho é
dar à interface **identidade, densidade e intenção**, removendo o padrão visual
repetitivo que delata geração por IA — sem reescrever o que já está bom.

> Princípio mestre: **respeitar antes de impor.** Quase todo projeto já tem um
> design system (tokens, temas, fontes, escala de espaçamento). Detecte-o e
> trabalhe *dentro* dele. Só proponha um sistema novo quando não existir nenhum.

## Quando usar / quando não usar

**Use quando:** o pedido é melhorar/revisar/redesenhar UI; uma ferramenta acabou
de gerar tela/componente; o usuário diz que "ficou com cara de IA"; ou você vai
auditar a qualidade visual de um frontend.

**Não use para:** gerar o app do zero (use seu gerador preferido e *depois* esta
skill), lógica de backend, ou mudanças que não tocam a camada visual.

## Fluxo obrigatório (5 fases)

Execute **em ordem**. Não pule o reconhecimento — é o que separa melhoria real
de slop.

### 1. Reconhecimento (entender o que já existe)

Antes de tocar em qualquer pixel, mapeie o design system atual. Detalhe e
heurísticas em `references/design-system-reconhecimento.md`.

- Procure tokens/variáveis: `:root`, `--cor-*`, `[data-theme]`, `tailwind.config`,
  `theme.ts`, `components.json` (shadcn), design tokens em JSON.
- Identifique: fontes (display/corpo/mono), escala de cor, escala de espaçamento
  (4px? 8px?), raios, sombras, temas (claro/escuro/variantes).
- Leia o que a documentação do projeto declara como **fixo/imutável** (tokens
  oficiais, fontes institucionais, temas suportados, guidelines de marca,
  restrições de acessibilidade). Se houver, respeite ao pé da letra.

Se há um sistema, **você herda o vocabulário dele**. Nunca introduza um hex solto
quando existe `var(--accent)`.

### 2. Diagnóstico (medir o slop)

Rode o auditor determinístico para achar os padrões de slop por arquivo+linha:

```bash
node skills/designer/scripts/audit.mjs [arquivos...]
# Instalada no Claude Code: node .claude/skills/designer/scripts/audit.mjs
# JSON p/ parsear: node skills/designer/scripts/audit.mjs --format json .
# Ajuda completa:  node skills/designer/scripts/audit.mjs --help
```

Ele classifica por **severidade** (`error` > `warning` > `info`) e dá um
`SLOP SCORE` (faixas: 0 limpo · 1–9 menor · 10–24 perceptível · 25+ pesado).
Severidade `info` (ex.: `rounded-full` em avatar) é nota, não erro — não infla o
score. Ele também roda duas checagens **separadas** (não entram no SLOP SCORE):
**acessibilidade** e **variáveis CSS indefinidas** (`var(--x)` sem fallback cujo
`--x` nunca é definido — o que quebra stacking/layout silenciosamente, ex.:
`z-index: var(--z-nav)` virando `auto`). Para a checagem de vars não falsear
tokens setados em runtime, **passe também os arquivos/dirs JS** (ex.:
`node skills/designer/scripts/audit.mjs styles.css index.html src`). Some isso à
leitura manual contra `references/anti-slop.md`. **Anote o score inicial**: ele
precisa cair na fase 5.

> `SLOP SCORE: 0` significa que **não sobrou indício detectável por regex** — não
> certifica a composição (layout, ritmo, arquitetura de informação). Isso é
> trabalho da revisão manual com o catálogo e os diais.

### 3. Calibração dos três controles

Defina três diais (0–10) a partir do briefing e do contexto do produto. Eles
**forçam decisões arquiteturais**, não são enfeite (detalhe em
`references/controles-numericos.md`):

| Dial | Limiar | Comportamento forçado quando acima do limiar |
|------|--------|----------------------------------------------|
| `DESIGN_VARIANCE` | **> 4** | Proíbe hero centralizado padrão; impõe assimetria, split-screen ou alinhamento radical à esquerda. |
| `MOTION_INTENSITY` | **> 5** | Exige micro-animações contínuas e transições de carregamento refinadas. |
| `VISUAL_DENSITY` | **> 7** | Remove contêineres decorativos (cada caixa justifica seu peso); divisórias finas, linhas sutis e espaço em branco. |
| `EXPRESSION_RESTRAINT` | **> 6** | Máx. 1 cor de acento com significado + 2 famílias de fonte; hierarquia por peso/tamanho/caixa, nunca por cor extra ou efeito. |

Escolha valores coerentes com o domínio. Ex.: ferramenta operacional/densa →
`VISUAL_DENSITY` e `EXPRESSION_RESTRAINT` altos; landing de marca →
`DESIGN_VARIANCE` alto, `RESTRAINT` baixo. **Anuncie os valores escolhidos** ao
usuário antes de aplicar.

### 4. Execução (mínima, orientada por tokens)

Aplique mudanças **incrementais** e cirúrgicas, sempre via tokens do projeto.
**Não reescreva o que já respeita o sistema** — toque só no que o diagnóstico
apontou (ver "Escopo" abaixo).

- **Tipografia primeiro.** Hierarquia clara, fonte de display com personalidade
  para títulos, corpo legível. Nunca a mesma fonte genérica em todas as camadas.
- **Cor e contraste.** Paleta intencional; texto/fundo com contraste mínimo
  **4.5:1** (3:1 para texto grande). Acento usado com parcimônia.
- **Espaçamento.** Escala consistente (4px/8px). Ritmo, não padding aleatório.
- **Composição.** Arquitetura de informação clara (agrupar por significado);
  quebras de grid intencionais quando a densidade pedir, nunca por acaso.
- **Estados.** Hover/focus/active/disabled/loading/empty/error — desenhe todos.
- **Acessibilidade.** Foco visível, alvos ≥ 44px, `prefers-reduced-motion`,
  semântica. Ver `references/checklist-acessibilidade.md`.

Em projetos **Tailwind/shadcn/CSS-modules/Figma-derived**, há armadilhas
específicas (ex.: `rounded-lg border bg-card p-6 shadow-sm` repetido sem
identidade): ver `references/shadcn-tailwind-anti-slop.md`.

### 5. Verificação

- Rode o auditor de novo: a pontuação de slop deve **cair** em relação à fase 2.
- **Nenhum `error` de acessibilidade pode permanecer** (img sem alt, foco removido
  sem `:focus-visible`, etc.) — isso é portão, independente do SLOP SCORE. Em CI:
  `audit.mjs --fail-on-a11y`.
- **Nenhuma variável CSS indefinida** — todo `var(--x)` sem fallback tem de ter
  `--x` definido (no `:root`/tema ou via JS). Tokenizar sem definir quebra
  stacking/layout silenciosamente; este portão pega isso. Em CI: `audit.mjs
  --fail-on-undef` (passando os dirs JS junto).
- Confirme contraste 4.5:1 nos pares de texto que você tocou.
- Rode o que o projeto define (`npm test`, `npm run build`, smoke) antes de
  considerar concluído. Sem regressão de console nova.

## Escopo — não reescreva tudo

O default é **a menor mudança que remove o slop**, não um redesign total.

- Mude apenas o que o diagnóstico + os diais justificam. Código que já usa tokens
  e passa nas regras: **deixe quieto**.
- Prefira ajustar tokens/classes existentes a criar novos. Só crie um token novo
  quando faltar um canônico.
- Redesign de ponta a ponta só quando o usuário pedir explicitamente, ou quando
  não existir design system algum.

## Regras anti-slop (núcleo)

Resumo do que **nunca** fazer (catálogo completo em `references/anti-slop.md`):

1. **Sem gradiente roxo/azul** em fundo branco como "tema". É a assinatura nº 1 da IA.
2. **Sem `rounded-2xl`/`rounded-3xl` por padrão.** Raio é decisão, não reflexo.
   Em UI densa, prefira cantos quase retos. (`rounded-full` em avatar/pill é ok.)
3. **Sem padding colossal** que destrói densidade de tela. Espaço serve à
   hierarquia, não ao vazio.
4. **Sem empilhar sombras pesadas.** Elevação é sutil; sombra densa degrada
   renderização e parece template.
5. **Sem Inter/Roboto em tudo.** Use uma fonte de display com caráter para
   títulos; corpo pode ser neutro, mas a hierarquia precisa de contraste tipográfico.
6. **Sem hex solto** quando há tokens — sempre `var(--token)` / classe do sistema.
7. **Sem layout simétrico genérico** quando `DESIGN_VARIANCE > 4`.

## Tabela anti-racionalização

Quando você (ou o pedido) tentar pular uma fase, estes contra-argumentos valem:

| Desculpa tentadora | Por que é falsa |
|--------------------|-----------------|
| "É só trocar a cor, não preciso ver os tokens." | Trocar fora do sistema cria inconsistência e quebra temas. Reconheça primeiro. |
| "Arredondar tudo e dar mais padding já melhora." | Esse é exatamente o slop. Melhora aparente = identidade perdida. |
| "Contraste tá ok no meu monitor." | 4.5:1 é mensurável; opinião não substitui o número. Meça. |
| "Micro-animação é firula, deixa pra depois." | Se `MOTION_INTENSITY > 5`, movimento é requisito do briefing, não extra. |
| "O projeto não liga pra acessibilidade." | Foco/contraste/teclado são piso, não enfeite. Sempre entram. |
| "Inter resolve, é fonte limpa." | "Limpa" = sem identidade. Títulos precisam de uma fonte com personalidade. |
| "Já que estou aqui, redesenho a tela toda." | Escopo mínimo. Mexa só no que o diagnóstico apontou. |

## Critérios de "done"

A tarefa só está concluída quando **todos** valem:

- [ ] Reconhecimento feito: você sabe quais tokens/fontes/temas o projeto usa.
- [ ] `SLOP SCORE` final **menor** que o inicial (idealmente sem `error`).
- [ ] **Zero `error` de acessibilidade** no auditor (`--fail-on-a11y` passa).
- [ ] **Zero variável CSS indefinida** no auditor (`--fail-on-undef` passa, com os dirs JS inclusos).
- [ ] Toda cor/raio/espaço novo veio de token do projeto (nada de hex solto).
- [ ] Contraste ≥ 4.5:1 nos textos tocados; foco visível; estados completos.
- [ ] Testes/build do projeto passam, sem regressão nova de console.
- [ ] O diff é mínimo e justificável — nada reescrito sem motivo.

## Recursos

- `references/design-system-reconhecimento.md` — como detectar tokens/fontes/temas (fase 1).
- `references/anti-slop.md` — catálogo detalhado dos padrões a evitar + correções.
- `references/controles-numericos.md` — como calibrar os três diais por tipo de produto.
- `references/shadcn-tailwind-anti-slop.md` — armadilhas em Tailwind/shadcn/CSS-modules.
- `references/checklist-acessibilidade.md` — contraste, foco, teclado, motion, semântica.
- `references/benchmark-geradores-ia.md` — fluxo pós-geração por ferramenta (Bolt, Lovable, etc.).
- `scripts/audit.mjs` — auditor determinístico: slop (score) + acessibilidade + variáveis CSS indefinidas, cada um por arquivo + linha + severidade. Flags: `--format json`, `--fail-on-score`, `--fail-on-a11y`, `--fail-on-undef`.
