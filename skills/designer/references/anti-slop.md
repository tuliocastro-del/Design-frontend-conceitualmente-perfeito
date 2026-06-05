# Catálogo anti-slop — padrões de IA e suas correções

O "slop estético de IA" é a convergência de interfaces geradas por modelos para
um mesmo visual genérico. Reconhecer e reverter cada padrão:

## 1. Gradiente roxo→azul em fundo branco

**Sintoma:** `linear-gradient(135deg, #6366f1, #8b5cf6)`, `from-purple-500
to-blue-500`, herói com blob roxo desfocado.
**Por quê é slop:** virou clichê; não comunica nada sobre o produto.
**Correção:** paleta derivada do domínio/marca. Se precisar de profundidade,
use um gradiente sutil dentro da própria família de cor (ex.: dois tons do
acento), ou textura/ruído leve, ou simplesmente cor sólida bem escolhida.

## 2. Cantos arredondados demais

**Sintoma:** `rounded-2xl`/`rounded-3xl`/`border-radius: 24px` em tudo —
cards, botões, inputs, imagens.
**Por quê é slop:** raio uniforme alto apaga a hierarquia e dá cara de template.
**Correção:** raio é decisão por elemento. Escala curta (ex.: 4/6/10px).
UI densa/operacional → cantos quase retos. Pills só onde fazem sentido
(tags, toggles).

## 3. Padding colossal

**Sintoma:** `p-12`, `py-24`, seções com 200px+ de respiro vertical sem motivo.
**Por quê é slop:** destrói densidade de tela e esconde conteúdo abaixo da dobra.
**Correção:** espaçamento a serviço da hierarquia, em escala consistente
(4/8px). Respiro generoso só onde separa blocos de significado distintos.

## 4. Sombras pesadas / empilhadas

**Sintoma:** `shadow-2xl`, `shadow-[0_35px_60px_...]`, múltiplas `box-shadow`
somadas, sombras escuras em fundo claro.
**Por quê é slop:** elevação exagerada e uniforme parece template — tudo
"flutua" igual e a hierarquia some.
**Correção:** sistema de elevação sutil (1–3 níveis). Em UI escura/densa,
muitas vezes uma borda fina (`1px`) comunica separação melhor que sombra.

## 5. Fonte genérica em todas as camadas

**Sintoma:** Inter (ou Roboto) para título, corpo, label, número — tudo.
**Por quê é slop:** zero personalidade; impossível distinguir a marca.
**Correção:** **acoplamento planejado** de fontes. Uma display com caráter
para títulos, uma neutra legível para corpo, mono para dados/código.
"Com caráter" é concreto: formas de letra distintivas, uma faixa real de pesos,
e **fora do conjunto-padrão** que os geradores repetem (Inter, Roboto, Open Sans,
Lato, Poppins, Montserrat). A hierarquia vem de **peso/tamanho/caixa**, não de cor
ou efeito. Exemplo de paleta tipográfica (Anthropic brand-guidelines): display em
títulos (mín. 24pt) + serifada legível no corpo.

## 6. Hex hardcoded ignorando o design system

**Sintoma:** `color: #1f2937` espalhado quando existe `var(--text)`.
**Por quê é slop:** quebra temas, cria deriva de cor, impede dark/light.
**Correção:** sempre o token/variável/classe do sistema. Se falta um token,
crie-o no lugar canônico em vez de cravar o valor.

## 7. Layout simétrico previsível

**Sintoma:** todo hero centralizado, grid 3-colunas idêntico, "feature cards"
em fileira sempre igual.
**Por quê é slop:** composição default do gerador.
**Correção:** quando `DESIGN_VARIANCE > 4`, imponha assimetria intencional —
split-screen, alinhamento radical à esquerda, sobreposição controlada,
quebra de grid com propósito. Sempre legível, nunca caótico.

## 8. Microcópia e ícones genéricos

**Sintoma:** "Get Started" + ícone de foguete + emoji ✨ em tudo.
**Correção:** copy específica do domínio; iconografia coerente (uma família, um
peso). Menos emoji decorativo.

> Os padrões 1–8 são os clássicos. Os de 9–13 são a geração 2025/2026 de "cara de
> IA" (v0/Lovable/Claude house style) — hoje os tells dominantes.

## 9. Glassmorphism / `backdrop-blur` por toda parte

**Sintoma:** `backdrop-filter: blur()`, `backdrop-blur-xl`, cards e navbar
translúcidos empilhados sobre um fundo borrado/gradiente.
**Por quê é slop:** virou a assinatura nº 1 de 2025; costuma falhar em contraste e
some a hierarquia (tudo "flutua" igual).
**Correção:** superfície opaca com token de elevação. Vidro só onde há de fato algo
significativo atrás (ex.: barra sobre conteúdo que rola), uma vez, com contraste
medido. Nunca como textura padrão de toda superfície. *(O auditor detecta.)*

## 10. Texto em gradiente (`bg-clip-text` / `text-transparent`)

**Sintoma:** `bg-gradient-to-r … bg-clip-text text-transparent` no título; manchete
arco-íris roxo→rosa.
**Por quê é slop:** efeito de uma linha que grita "gerado por IA"; quase sempre
falha contraste e não escala pra hierarquia.
**Correção:** hierarquia por tipografia (peso/tamanho/família), não por truque de
preenchimento. Cor de acento sólida em *uma* palavra-chave, se for o caso.
*(O auditor detecta.)*

## 11. Emoji como ícone de feature / bullet de heading

**Sintoma:** "🚀 Rápido", "🔒 Seguro", "✨ Mágico" em headings e cards.
**Por quê é slop:** placeholder de gerador; inconsistente entre plataformas, sem
peso/grade comum, vira ruído.
**Correção:** uma família de ícones coerente (um peso, uma grade) OU sem ícone.
Reserve emoji para conteúdo do usuário, nunca como cromo de UI.

## 12. Bento grid genérico (falso amigo da variância)

**Sintoma:** grade de tiles arredondados de tamanhos alternados, cada um com ícone
+ título + frase.
**Por quê é slop:** parece "ousado" e até passa no teste de assimetria, mas é o
default de v0/21st.dev — variância decorativa, não informacional.
**Correção:** o layout deve seguir a *importância relativa* do conteúdo, não um
mosaico fixo. Se os tiles têm o mesmo peso semântico, não use bento.

## 13. Uniformidade perfeita (ausência de irregularidade intencional)

**Sintoma:** gaps idênticos, cards de altura idêntica, três cards sempre iguais,
container sempre `max-w-7xl mx-auto` centralizado, todo bloco no mesmo ritmo.
**Por quê é slop:** design humano tem hierarquia → tem irregularidade proposital. A
regularidade total é a impressão digital da média estatística do modelo.
**Correção:** dê pesos diferentes a coisas de importância diferente; varie a largura
de container por seção; quebre a fileira de 3 quando um item for o principal.

## Cores institucionais de referência (exemplo Anthropic)

Apenas como ilustração de uma paleta restrita e intencional:
escuro `#141413`, claro `#faf9f5`, cinza médio `#b0aea5`, cinza claro `#e8e6dc`,
acento laranja `#d97757`, secundário azul `#6a9bcc`, terciário verde `#788c5d`.
A lição não são *essas* cores — é ter uma paleta pequena e deliberada.
