# Anti-slop em Tailwind / shadcn/ui / CSS-modules

shadcn/ui e Tailwind são ótimas bases — e justamente por isso viraram a "cara de
IA" moderna. O problema **não é** shadcn; é usá-lo **sem identidade**, no default
de todo gerador. Este guia mostra como tirar o slop sem abandonar o stack.

## O default genérico de shadcn

**Sintoma:** toda tela é uma pilha de `Card`/`CardHeader`/`CardContent` com a
mesma classe repetida:

```html
<div class="rounded-lg border bg-card p-6 shadow-sm">…</div>
<!-- × 12, todas iguais -->
```

**Por quê é slop:** zero hierarquia visual; a repetição faz tudo ter o mesmo
peso. É o output literal do template.

**Correção:**
- Dê **peso diferente** a contêineres de importância diferente (um card de
  destaque ≠ uma linha de lista). Nem tudo é `Card`.
- Em `VISUAL_DENSITY > 7`, troque cards por **linhas com divisória** (`divide-y`,
  `border-b`) — densidade informacional, não caixas.
- Personalize os tokens shadcn em `:root` (`--radius`, `--primary`, `--card`) em
  vez de aceitar o padrão. Mudar `--radius` de `0.5rem` para `0.25rem` já muda a
  cara de todo o app.

## Raio: `rounded-lg` em tudo

shadcn deriva o raio de `--radius`. Ajuste **o token**, não cada componente.
`rounded-full` em avatar/badge/toggle continua certo (o auditor marca como `info`).
O alvo é o `rounded-2xl/3xl` aplicado por reflexo em cards.

## Cor: pare de hardcodar Tailwind cru

**Sintoma:** `bg-purple-600`, `text-slate-500`, `from-indigo-500` espalhados.
**Correção:** use os tokens semânticos do shadcn (`bg-primary`,
`text-muted-foreground`, `border-input`). Eles respeitam tema claro/escuro
automaticamente; cores cruas não.

## Espaçamento: `p-6`/`p-8`/`gap-8` automáticos

**Sintoma:** padding generoso uniforme que esvazia a tela.
**Correção:** escala ligada à hierarquia. Em UI densa, `p-3`/`p-4` e `gap-2`/`gap-3`
costumam bastar. Reserve respiro grande para separar **blocos de significado**.

## Sombra: `shadow-lg`/`shadow-xl`/`shadow-2xl` empilhadas

**Correção:** um sistema de 1–3 níveis. Muitas vezes `border` + `bg-card` separa
melhor que sombra, principalmente em tema escuro.

## Tipografia: só `font-sans` (Inter) em tudo

shadcn vem neutro de propósito — **você** define a personalidade.
**Correção:** registre uma fonte de display no `tailwind.config`
(`fontFamily.display`) e use-a nos títulos; deixe `font-sans` no corpo.

## Microcópia e ícones lucide genéricos

**Sintoma:** grids 3× de "features" com ícone lucide aleatório + "Get Started" /
"Learn More" / "Powerful Features".
**Correção:** copy do domínio; uma família de ícone com peso coerente; menos
emoji decorativo. Em produto real, rótulos são específicos ("Abrir log da missão",
não "Get Started").

## Checklist rápido para um projeto shadcn/Tailwind

- [ ] `--radius` e a paleta foram **customizados** (não estão no default)?
- [ ] Contêineres têm pesos diferentes, ou é tudo o mesmo `Card`?
- [ ] Cores vêm de tokens semânticos, não de `*-500` cru?
- [ ] Há uma fonte de display nos títulos?
- [ ] Densidade condiz com o tipo de produto (dashboard ≠ landing)?
- [ ] Estados (loading/empty/error/`focus-visible`/disabled) existem?
