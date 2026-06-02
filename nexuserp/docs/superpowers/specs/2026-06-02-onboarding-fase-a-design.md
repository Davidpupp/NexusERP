# Fase A — Onboarding expandido (13 nichos + persistência + redirect) — Design

## Contexto
A NexusERP já tem um onboarding adaptativo (6 segmentos: varejo/ecommerce/serviços/indústria/restaurante/outro), que persiste `CompanyProfile` e reordena a sidebar. O usuário quer expandir para um **fluxo pós-compra guiado por nicho** (13 nichos, com perguntas específicas, seleção de módulos e dados iniciais), salvar tudo no banco, e **forçar a configuração no primeiro acesso**. Esta é a **Fase A** de um roadmap maior (B módulos selecionáveis, C dashboard por nicho, D financeiro pessoal, E trial+admin de contas).

**Regra mestra:** não quebrar o que funciona (login, checkout→ativação→onboarding, módulos atuais), não mudar a identidade visual, nada fictício — tudo persiste e funciona de verdade.

## Escopo da Fase A (o que entra)
1. **`nicheConfigs` central** (expande `lib/onboarding-config.ts`): 13 nichos, cada um com `id, label, icon, description, recommendedModules (ModuleKey[]), dashboardCards (string[]), questions, financeCategories, costCenters`.
2. **Fluxo de onboarding reescrito** em etapas: nicho → perguntas do nicho → seleção de módulos → dados iniciais → sucesso. Barra de progresso, premium, responsivo.
3. **Persistência**: estende `CompanyProfile` (`niche`, `selectedModules`, `onboardingAnswers Json`, `dashboardConfig Json`). Migration Prisma 7 manual.
4. **Redirect inteligente**: assinatura ativa + não-onboardado → `/onboarding` (forçado no layout de `/app/*`).
5. **Alterar nicho depois**: link/ação em `/app/configuracoes` que reabre o onboarding (`/onboarding?reconfig=1`).

## Fora da Fase A (vai p/ B–E, citado p/ evitar gambiarra)
- Seleção de módulos **que ainda não existem** (propostas, contratos, agenda, cartões, metas) + páginas "em preparação" → **Fase B**.
- Dashboard renderizado por nicho (`DashboardRenderer`) → **Fase C**.
- Experiência completa de **finanças pessoais** (receitas/despesas/contas/cartões/metas) → **Fase D**. _(Na Fase A o nicho `financas_pessoais` é selecionável e suas respostas são salvas; o painel dedicado vem na D.)_
- Trial controlado + `/admin/contas` → **Fase E**.

Na Fase A, a **seleção de módulos** só lista/ativa **módulos que já existem** (`ModuleKey`), garantindo zero botão quebrado.

## Nichos (13) — ids e back-compat
Mantém ids existentes; adiciona novos. Alias `varejo → loja_fisica` para perfis antigos.

| id | label | recommendedModules (existentes) |
|---|---|---|
| comercio | Empresa ou comércio | vendas, estoque, financeiro, clientes, relatorios |
| servicos | Prestação de serviços | projetos, financeiro, clientes, vendas, relatorios |
| engenharia | Engenharia / Projetos | projetos, clientes, financeiro, vendas, relatorios |
| loja_fisica | Loja física | vendas, estoque, financeiro, clientes, compras |
| ecommerce | Loja online / E-commerce | pedidos, estoque, financeiro, integracoes, relatorios |
| saude | Clínica / estética / saúde | clientes, financeiro, projetos, relatorios |
| restaurante | Restaurante / alimentação | estoque, compras, financeiro, vendas |
| eventos | Eventos | projetos, clientes, financeiro, vendas |
| academia | Academia / studio | clientes, financeiro, relatorios |
| consultoria | Escritório / consultoria | projetos, clientes, financeiro, relatorios |
| industria | Indústria / produção | producao, estoque, compras, financeiro |
| financas_pessoais | Gestão financeira pessoal | financeiro, relatorios |
| outro | Outro segmento | financeiro, vendas, clientes, estoque |

`questions`: array `{ id, label, type: "bool" | "text" | "select", options? }`. Ex. engenharia: nome do escritório (text), "Controla propostas?" (bool), "Controla etapas dos projetos?" (bool), etc. Cada nicho ganha 4–9 perguntas curtas conforme o prompt. `financas_pessoais` usa `PersonalFinanceQuestionsForm` (renda, categorias, contas fixas, meta).

## Schema / migração
`prisma/schema.prisma` — `CompanyProfile` ganha:
```
niche             String?
selectedModules   String[]  @default([])
onboardingAnswers Json?
dashboardConfig   Json?
```
`segment` permanece (back-compat). Migration manual `prisma/migrations/<ts>_onboarding_niche/migration.sql` (gerada via `migrate diff`, aplicada com `db execute`; `migrate deploy` cobre prod). `db:generate` após.

## Fluxo (rotas e componentes)
A rota `/onboarding` (já existe, client) é reescrita como wizard. Mantém uma única rota com passos internos (evita criar /onboarding/nicho etc. — mais simples e sem regressão de auth). Componentes novos reutilizáveis:
- `OnboardingLayout`, `ProgressSteps`, `OnboardingStepHeader`
- `NicheSelectionCard` (ícone + label + descrição, premium)
- `BusinessQuestionsForm` / `PersonalFinanceQuestionsForm` (renderizam `questions` do nicho)
- `ModuleSelectionCard` / `RecommendedModules` (toggle de módulos recomendados; só módulos existentes)
- `OnboardingSummary` (tela de sucesso "Sua NexusERP está pronta")

Passos: **1 Nicho → 2 Perguntas → 3 Módulos → 4 Dados iniciais (opcional) → 5 Sucesso**. Textos do prompt ("Vamos adaptar a NexusERP para sua realidade", etc.).

## Server action
`saveOnboarding` (estende o atual) recebe `{ niche, answers, selectedModules, companySize?, initialData? }` e:
- upsert `CompanyProfile` com `niche`, `segment` (= label p/ compat), `selectedModules`, `onboardingAnswers`, `dashboardConfig` (derivado de `nicheConfigs[niche].dashboardCards`), `primaryModules` (= selectedModules ∩ recomendados), `onboardedAt`.
- semeia `costCenters`/categorias do nicho (como hoje).
- `initialData` opcional (nome empresa, telefone, cidade, CNPJ) → atualiza `Company`.
- valida com zod; tenant-scoped via `getCurrentCompany`; audit.

## Redirect inteligente
[(app)/app/layout.tsx](../../../src/app/(app)/app/layout.tsx): após `getCurrentCompany()`, se `!ctx.onboarded` → `redirect("/onboarding")`. `/onboarding` está em `(app)/onboarding` (fora do layout de `/app/*`) → sem loop. `getCurrentCompany` já expõe `onboarded`.

**Seed:** `prisma/seed.ts` e `seed-admin.ts` passam a criar `CompanyProfile` com `onboardedAt` (+ niche "outro") para o admin, senão o admin seria forçado ao onboarding e os e2e (login→dashboard) quebrariam.

## Configurações — reconfigurar
`/app/configuracoes`: aba/ação "Personalizar meu sistema" → `/onboarding?reconfig=1`. O wizard, em modo reconfig, pré-carrega o nicho atual e, ao concluir, volta às configurações. Não zera dados; só atualiza perfil/módulos.

## Segurança
- `/onboarding` já exige sessão+tenant (via getCurrentCompany). Sem assinatura ativa → /sem-acesso (mantido).
- Respostas validadas (zod). Tudo tenant-scoped; sem vazamento entre empresas. Nada sensível novo no client.

## Testes
- **Atualizar** `e2e/checkout-funnel.spec.ts` para o novo wizard (seletores: card do nicho, Continuar, módulos, finalizar). Continua cobrindo checkout→ativação→onboarding→dashboard.
- **Novo** `e2e/onboarding.spec.ts`: usuário novo logado sem perfil → `/app/*` redireciona p/ `/onboarding`; completa wizard (nicho + perguntas + módulos) → cai no dashboard; perfil persistido (`onboardedAt`, `niche`, `selectedModules`).
- Gates: lint + tsc + build + e2e verdes. Migration aplicada no DB dev (`db:push`/migrate + `db:seed`).

## Riscos / mitigação
- **Forçar onboarding pode prender o admin/seed** → seed cria perfil onboardado (mitigado).
- **Funnel e2e usa UI antiga** → atualizado junto (mitigado).
- **Migration Prisma 7 é manual** (gotcha conhecido) → gerar SQL via `migrate diff`, aplicar com `db execute`; `migrate deploy` no build prod.
