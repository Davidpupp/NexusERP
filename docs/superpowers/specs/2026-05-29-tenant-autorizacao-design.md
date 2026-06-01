# Sub-projeto 1 — Fundação Tenant + Autorização por Módulo

**Data:** 2026-05-29
**Status:** Aprovado (abordagem A — guard server-side por página)
**Projeto:** NexusERP (`nexuserp/`, Next.js 16, Auth.js, Prisma, Tailwind v4)

## 1. Objetivo

Hoje o proxy (`src/proxy.ts`) só verifica se o usuário está logado — qualquer usuário autenticado acessa qualquer módulo, independente de plano ou papel. Este sub-projeto adiciona:

1. Resolução do **tenant** (empresa) do usuário logado.
2. **Autorização por módulo** baseada em (a) plano da assinatura e (b) papel (role) do membro.

É pré-requisito do Sub-projeto 2 (CRUD real), que também precisa do contexto de empresa para escopar dados por tenant.

## 2. Abordagem escolhida (A)

Enforcement **server-side por página**, sem enriquecer o JWT:

- O proxy permanece como está (gate "logado" nas rotas `/app/*` e `/onboarding/*`).
- Cada página de módulo é um **server component** que chama `requireModuleAccess(<module>)` no topo. A checagem lê plano/role frescos do banco a cada navegação.
- O `(app)/app/layout.tsx` vira **server component**: resolve a empresa uma vez e passa `planSlug` + `role` para a `AppSidebar` (client) renderizar cadeados.

Descartado: enriquecer JWT com plano/role (fica stale quando o plano muda) e checagem no proxy (não consulta DB no edge de forma confiável).

## 3. Componentes

### 3.1 `src/lib/tenant.ts`
```
getCurrentCompany(): Promise<{
  company: Company;
  membership: CompanyMember;   // inclui role
  subscription: Subscription | null;  // inclui plan
}>
```
- Usa `auth()` (Auth.js) para obter `session.user.id`.
- Busca a primeira `CompanyMember` do usuário (MVP: 1 empresa por usuário) com `include: { company: { include: { subscription: { include: { plan } } } } }`.
- Sem sessão → `redirect("/login")`. Sem empresa → `redirect("/onboarding")`.
- `cache()` (React `cache`) para deduplicar a query no mesmo request.

### 3.2 `src/lib/authz.ts`
Tipos:
```
type ModuleKey = "dashboard" | "financeiro" | "vendas" | "clientes" | "estoque"
  | "compras" | "producao" | "projetos" | "relatorios" | "automacoes"
  | "configuracoes" | "suporte" | "portal-cliente";
type PlanSlug = "start" | "growth" | "enterprise";
```
Mapas:
- `MODULE_MIN_PLAN: Record<ModuleKey, PlanSlug>`
  - `start`: dashboard, financeiro, vendas, clientes, estoque, relatorios, configuracoes, suporte, portal-cliente
  - `growth`: compras, producao, projetos, automacoes
  - (enterprise herda tudo)
- `MODULE_ROLES: Record<ModuleKey, UserRole[]>`
  - financeiro: OWNER, ADMIN, MANAGER, FINANCE
  - vendas, clientes: OWNER, ADMIN, MANAGER, SALES
  - estoque, compras, producao: OWNER, ADMIN, MANAGER, OPERATION
  - projetos: OWNER, ADMIN, MANAGER, OPERATION, SALES
  - relatorios, dashboard: OWNER, ADMIN, MANAGER, FINANCE, SALES, OPERATION
  - automacoes, configuracoes: OWNER, ADMIN
  - suporte: todos exceto CLIENT
  - portal-cliente: CLIENT (e OWNER/ADMIN p/ visualizar)

Funções:
- `planRank(slug): number` (start=0, growth=1, enterprise=2)
- `canAccessModule(planSlug, role, module): { ok: boolean; reason?: "plan" | "role" }`
- `requireModuleAccess(module): Promise<TenantContext>` — server; chama `getCurrentCompany`, valida; nega via `redirect("/app/upgrade?m=<module>")` (plano) ou `redirect("/app/dashboard?denied=<module>")` (role). Retorna o contexto p/ a página reusar.

### 3.3 Auth.js (`src/lib/auth.ts`)
Sem mudança de enforcement. Manter callbacks atuais (`token.id`, `session.user.id`). (Enriquecimento de plano/role no JWT fica fora — abordagem A.)

### 3.4 `(app)/app/layout.tsx` (server component)
- Chama `getCurrentCompany()`.
- Passa `planSlug` e `role` como props para `AppSidebar`.
- Mantém o shell dark já existente.

### 3.5 `AppSidebar` (client)
- Recebe `planSlug`, `role`.
- Para cada item, calcula `canAccessModule`. Se negado por plano → renderiza com ícone de cadeado (Lock) e link para `/app/upgrade?m=<module>`. Se negado por role → oculta o item.
- Itens permitidos: comportamento atual.

### 3.6 Guard nas páginas
Cada `src/app/(app)/app/<module>/page.tsx` (server component) inicia com:
```
const ctx = await requireModuleAccess("<module>");
```
14 páginas, 1 linha cada. As páginas que hoje são client components com dados mock serão convertidas para server components (alinhado ao Sub-projeto 2). Onde houver interatividade, extrair a parte client para um componente filho.

### 3.7 `/app/upgrade`
Página dark: "Seu plano (X) não inclui o módulo Y. Faça upgrade para Growth/Enterprise." + CTA para `/planos` ou contato. Lê `?m=` para personalizar.

## 4. Fluxo de dados

```
request → proxy (logado?) → (app)/app/layout (getCurrentCompany → planSlug/role → Sidebar)
        → page server component → requireModuleAccess(module)
            → getCurrentCompany (cache hit) → canAccessModule
                → ok: renderiza
                → nega plano: redirect /app/upgrade
                → nega role: redirect /app/dashboard?denied=
```

## 5. Erros e bordas

- Usuário sem `CompanyMember` → `/onboarding`.
- Assinatura `null` ou status `EXPIRED`/`CANCELED` → tratado como plano mínimo `start` somente leitura? **MVP:** assinatura ausente/expirada → acesso só a `dashboard` + `configuracoes` + `/app/upgrade`. (Refinável no Sub-projeto 4/billing.)
- `redirect()` do Next lança — não capturar em try/catch genérico.

## 6. Testes (verificação sem runtime)

- `npm run build` + `tsc` + `eslint` verdes.
- Testes unitários puros de `authz.ts` (`canAccessModule`) com Playwright test runner ou um util de teste — sem DB. (Testes e2e ficam no Sub-projeto 7.)

## 7. Fora de escopo

- Permissões a nível de ação/campo (CRUD fino) — Sub-projeto 2.
- Billing/expiração real — futuro.
- Convite de múltiplos membros / troca de empresa ativa — futuro (MVP: 1 empresa/usuário).
