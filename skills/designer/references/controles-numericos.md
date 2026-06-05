# Os três controles numéricos de design

Três diais de `0` a `10` que traduzem o briefing em decisões arquiteturais
obrigatórias. Defina-os explicitamente no início e **anuncie ao usuário** antes
de aplicar. Acima do limiar, o comportamento deixa de ser opcional.

## DESIGN_VARIANCE — quão fora do padrão a composição vai

- **0–4:** layouts convencionais permitidos (hero centralizado, grid simétrico).
  Bom para dashboards internos, formulários, ferramentas onde previsibilidade
  reduz carga cognitiva.
- **> 4 (gatilho):** proibido hero centralizado genérico. Impõe **assimetria**:
  split-screen, alinhamento radical à esquerda, sobreposição controlada, grid
  quebrado com intenção. Bom para landing pages, marca, portfólio, produto que
  precisa se destacar.

## MOTION_INTENSITY — quanta vida a interface tem

- **0–5:** transições funcionais discretas (hover, foco, abrir/fechar). Respeita
  `prefers-reduced-motion` sempre.
- **> 5 (gatilho):** exige **micro-animações contínuas** (estados que reagem,
  feedback tátil-visual) e **transições de carregamento refinadas** (skeletons,
  entrada escalonada). Nunca animação gratuita que atrapalha leitura.

## VISUAL_DENSITY — quanto conteúdo por tela

O limiar é alto (`> 7`) de propósito: cards são um default aceitável; só
ferramentas realmente densas devem abandoná-los.

- **0–7:** cards e contêineres permitidos; respiro maior; bom para conteúdo de
  marketing, onboarding, telas de foco único.
- **> 7 (gatilho):** **remove contêineres decorativos** — cada caixa precisa
  justificar seu peso. Prefira **divisórias finas, linhas sutis e espaço em branco**
  para separar. (Não é "proibido card": Linear/Notion usam cards densos; o que cai é
  a caixa arredondada *genérica* que só embrulha conteúdo.) Bom para ferramentas
  operacionais, tabelas, painéis (dashboards de operações, salas de controle, ERPs).

## EXPRESSION_RESTRAINT — disciplina tipográfica e cromática

Captura as duas coisas que mais separam "design" de "genérico" — contraste
tipográfico e contenção de cor — que os outros diais não medem.

- **0–4 (expressivo):** acento forte permitido, display ousada, mais de um
  destaque por tela. Bom para marca/portfólio.
- **> 6 (gatilho, restrito):** no máximo **1 cor de acento com significado por
  tela** e **2 famílias de fonte**; hierarquia obrigatoriamente por
  **peso/tamanho/caixa**, nunca por cor extra ou efeito (sem texto em gradiente).
  Bom para ferramentas, dados, leitura.

## Como escolher por tipo de produto

| Produto | VARIANCE | MOTION | DENSITY | RESTRAINT |
|---------|----------|--------|---------|-----------|
| Ferramenta operacional / dashboard denso | 2–4 | 2–4 | **8–10** | **7–9** |
| Landing page / marca | **6–9** | **6–8** | 3–5 | 2–4 |
| App de produtividade | 3–5 | 4–6 | 6–8 | 5–7 |
| Documentação / leitura | 2–4 | 1–3 | 4–6 | **7–9** |
| Portfólio / showcase | **7–10** | **7–9** | 3–6 | 1–4 |

Os valores se combinam: `VARIANCE` alto + `DENSITY` alto = composição ousada
porém enxuta (linhas, não caixas). `MOTION` alto + `DENSITY` alto exige cuidado
extra para o movimento não virar ruído. `RESTRAINT` alto + `VARIANCE` alto é raro
(ousadia na composição, contenção na cor/tipo — pode funcionar, com cuidado).
