# Tela interativa de escolha de plano (checkout) — Design

## Contexto
Hoje a escolha de plano no checkout é um `<select>` dentro do formulário de dados ([src/app/(standalone)/checkout/page.tsx](../../../src/app/(standalone)/checkout/page.tsx)). É funcional mas sem apelo de conversão. Queremos substituir essa parte por uma **tela interativa dedicada**: dois planos pagos (Start e Growth) em cards pretos com luz amarela atrás, reativos ao mouse, chamativos sem ficar feios.

**Regra mestra:** não quebrar o fluxo de checkout existente nem a identidade visual. Só amarelo como acento (já é o token da marca). Sem cor nova.

## Decisões (travadas com o usuário)
1. **Tela dedicada antes do form**, vira **passo 1** do stepper. Form = passo 2, pagamento = passo 3.
2. A tela de escolha **aparece sempre** em `/checkout`, inclusive vindo de CTA com `?plano=` (nesse caso o plano da URL fica pré-destacado). O avanço ao formulário acontece só ao confirmar o plano no card, via marcador `step=dados` (`/checkout?plano=<slug>&step=dados`). _(Atualizado: a versão inicial pulava a escolha quando `?plano=` estava presente.)_
3. Os dois cards = planos com `price > 0`: **Start (R$89)** e **Growth (R$249)**. Enterprise (`price: 0`, "sob consulta") fica fora — já é o comportamento atual.

## Arquitetura / fluxo
`/checkout` (client) decide o que renderizar pelo `searchParams.get("plano")`:
- **sem `plano`** → `<PlanPicker>` dentro de `CheckoutShell step={1}`.
- **com `plano`** → `<CheckoutForm>` (atual) dentro de `CheckoutShell step={2}`.

Selecionar um card → `router.push('/checkout?plano=<slug>')` → re-renderiza como formulário (mesma rota, sem novo arquivo de página). Form → `/checkout/pagamento` (passa a `step={3}`).

```
/checkout            → PlanPicker (step 1)
   ↓ clique no card
/checkout?plano=X    → CheckoutForm (step 2)   ← CTAs da landing entram aqui direto
   ↓ submit
/checkout/pagamento  → pagamento (step 3)
```

## Componentes

### CheckoutShell (modificado) — [src/components/checkout/CheckoutShell.tsx](../../../src/components/checkout/CheckoutShell.tsx)
- `STEPS = ["Escolher plano", "Seus dados", "Pagamento"]`.
- `step: 1 | 2 | 3`.
- O conector (linha) hoje só aparece após o passo 0 (`i === 0`). Ajustar para aparecer entre todos os passos exceto o último (`i < STEPS.length - 1`).
- Nada mais muda (header, glow, selos de segurança preservados).

### PlanPicker (novo, client) — `src/components/checkout/PlanPicker.tsx`
- **O quê:** tela de seleção. Cabeçalho ("Escolha seu plano" + subtítulo curto) e grid responsivo (`grid sm:grid-cols-2 gap-6/8`) com os dois `<PlanCard>`.
- **Como usar:** `<PlanPicker />`. Sem props — lê `PLANS` e filtra `price > 0`. Usa `useRouter` e passa `onSelect(slug)` para cada card.
- **Depende de:** `PLANS` ([src/data/plans.ts](../../../src/data/plans.ts)), `next/navigation` (`useRouter`), `framer-motion`, `PlanCard`.
- Entrada com stagger suave (fade + y) via framer-motion, respeitando `prefers-reduced-motion`.

### PlanCard (novo, client) — `src/components/checkout/PlanCard.tsx`
- **O quê:** card interativo de um plano. Preto, glow amarelo atrás, reativo ao mouse.
- **Como usar:** `<PlanCard plan={plan} popular={boolean} onSelect={() => void} index={number} />`.
- **Depende de:** `framer-motion` (`useMotionValue`, `useSpring`, `useTransform`, `motion`), `lucide-react` (`Check`, `ArrowRight`, `Sparkles`/`Star` p/ badge), `cn`, tipo `Plan` de `@/types`.
- **Visual:**
  - Superfície preta (`bg-absolute-black` sobre grafite), borda `border-d-border`; popular ganha `ring`/borda `nexus-yellow`.
  - **Glow atrás:** elemento `absolute -z-10` com `blur` e radial `nexus-yellow`; popular = opacidade/escala maior. Pulso lento via `animate` (opacity/scale) — desligado em reduced-motion.
  - **Badge "Mais popular"** no card Growth (canto superior), pill amarela.
  - Conteúdo: nome do plano, preço (`R$ {price}` + "/mês"), limite de usuários, lista de `features` com ícone `Check` amarelo, botão "Selecionar plano" com `ArrowRight`.
- **Interação (mouse):**
  - `onMouseMove`: calcula posição relativa (0–1) → atualiza CSS vars `--mx`/`--my` (spotlight radial translúcido amarelo na superfície) **e** alimenta `useMotionValue` p/ tilt.
  - **Tilt 3D:** `rotateX`/`rotateY` ≈ ±6° via `useSpring` (suave), `transformPerspective ~900`. Reset no `onMouseLeave`.
  - **Hover:** `lift` (translateY pequeno via `whileHover`) + glow intensifica.
  - Clique/Enter → `onSelect()`.
- **Acessibilidade:** o card inteiro é um elemento `<button type="button">` clicável (via `motion.button`), com `aria-label` ("Selecionar plano Growth — R$249 por mês"). Enter/Espaço selecionam nativamente (é button). Foco visível (`focus-visible:ring nexus-yellow`). Os elementos de glow/spotlight são decorativos (`aria-hidden`). Em `prefers-reduced-motion`, sem tilt e sem pulso (só hover estático de cor/borda).

### CheckoutForm (modificado) — [src/app/(standalone)/checkout/page.tsx](../../../src/app/(standalone)/checkout/page.tsx)
- `CheckoutShell step={1}` → `step={2}`.
- **Remover** o campo `<select>` de Plano do formulário (a escolha agora é a tela). Manter o `<input type="hidden" {...register("planId")}>` com o `selectedPlan.slug` (vindo do `?plano=`). Layout do grid de CNPJ/Plano: CNPJ passa a ocupar a linha (ou mantém o grid com só CNPJ) — ajuste visual mínimo, sem mudar estética geral.
- Renderização condicional: a página decide entre `PlanPicker` (sem `plano`) e `CheckoutForm` (com `plano`). O `<Suspense>` de `useSearchParams` é mantido.

### Pagamento (modificado) — [src/app/(standalone)/checkout/pagamento/page.tsx](../../../src/app/(standalone)/checkout/pagamento/page.tsx)
- `CheckoutShell step={2}` → `step={3}`. (Sem outras mudanças.)

## Dados / tipos
- Nenhuma mudança de schema, server action ou validação. `planId` continua vindo no form e nos params para `/checkout/pagamento`. `checkoutFormSchema` inalterado (planId continua required; default = slug do `?plano=`).

## Tratamento de erros / edge cases
- `?plano=` com slug inválido (ex.: `enterprise` ou lixo) → `CheckoutForm` já faz fallback `PLANS[1]` (Growth). Mantido. (Opcional: normalizar para o picker se slug não tiver `price>0` — fica como melhoria, não bloqueante.)
- Acesso direto a `/checkout/pagamento` sem params → comportamento atual preservado (fora de escopo).

## Testes
- **e2e existente** `checkout-funnel.spec.ts` entra via `?plano=` → continua válido (vai direto ao form). Verificar que ainda passa após bump de step.
- **Novo e2e** (`checkout-plan-picker.spec.ts`): abrir `/checkout` (sem param) → ver os 2 cards (Start/Growth) → clicar em "Growth" → URL vira `?plano=growth` e o formulário aparece com o resumo do plano Growth.
- Gates: `lint` + `tsc` + `build` + `playwright` verdes.

## Fora de escopo (YAGNI)
- Comparador de features lado a lado, toggle mensal/anual, terceiro card Enterprise no picker, persistência da escolha em cookie. Nada disso foi pedido.
