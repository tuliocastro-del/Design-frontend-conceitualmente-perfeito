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

**Sintoma:** `shadow-2xl`, múltiplas `box-shadow` somadas, sombras escuras em
fundo claro.
**Por quê é slop:** elevação exagerada parece template e degrada renderização.
**Correção:** sistema de elevação sutil (1–3 níveis). Em UI escura/densa,
muitas vezes uma borda fina (`1px`) comunica separação melhor que sombra.

## 5. Fonte genérica em todas as camadas

**Sintoma:** Inter (ou Roboto) para título, corpo, label, número — tudo.
**Por quê é slop:** zero personalidade; impossível distinguir a marca.
**Correção:** **acoplamento planejado** de fontes. Uma display com caráter
para títulos (≥ peso/tamanho que crie contraste), uma neutra legível para corpo,
mono para dados/código. Exemplo de referência (Anthropic brand-guidelines):
Poppins em títulos (mín. 24pt), Lora no corpo.

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

## Cores institucionais de referência (exemplo Anthropic)

Apenas como ilustração de uma paleta restrita e intencional:
escuro `#141413`, claro `#faf9f5`, cinza médio `#b0aea5`, cinza claro `#e8e6dc`,
acento laranja `#d97757`, secundário azul `#6a9bcc`, terciário verde `#788c5d`.
A lição não são *essas* cores — é ter uma paleta pequena e deliberada.
