# Tenant + Autorização por Módulo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver a empresa (tenant) do usuário logado e bloquear acesso a módulos por plano de assinatura e papel (role).

**Architecture:** Guard server-side por módulo (abordagem A). `getCurrentCompany()` resolve tenant via Auth.js + Prisma; `authz.ts` define mapas plano/role e `requireModuleAccess()`. Um `layout.tsx` server por pasta de módulo aplica o guard sem converter as páginas client existentes. O `(app)/app/layout.tsx` (server) passa `planSlug`/`role` à `AppSidebar` para exibir cadeados.

**Tech Stack:** Next.js 16 (App Router, server components), Auth.js v5, Prisma 7, TypeScript, `node:test` via `tsx` para teste unitário puro.

**Nota git:** o repositório não é git. Onde o template pede commit, faça um **checkpoint de verificação** (build/typecheck/lint) em vez de `git commit`.

---

### Task 1: Lógica de autorização pura (`authz` mapas + `canAccessModule`)

**Files:**
- Create: `nexuserp/src/lib/authz.ts`
- Test: `nexuserp/src/lib/authz.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// nexuserp/src/lib/authz.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessModule, planRank } from "./authz";

test("planRank ordena start < growth < enterprise", () => {
  assert.ok(planRank("start") < planRank("growth"));
  assert.ok(planRank("growth") < planRank("enterprise"));
});

test("start nega módulo growth (projetos) por plano", () => {
  const r = canAccessModule("start", "OWNER", "projetos");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "plan");
});

test("growth permite projetos para MANAGER", () => {
  assert.deepEqual(canAccessModule("growth", "MANAGER", "projetos"), { ok: true });
});

test("financeiro negado para SALES por role", () => {
  const r = canAccessModule("growth", "SALES", "financeiro");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "role");
});

test("CLIENT só acessa portal-cliente", () => {
  assert.equal(canAccessModule("enterprise", "CLIENT", "financeiro").ok, false);
  assert.equal(canAccessModule("enterprise", "CLIENT", "portal-cliente").ok, true);
});

test("enterprise permite módulo growth", () => {
  assert.equal(canAccessModule("enterprise", "ADMIN", "automacoes").ok, true);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd nexuserp && npx tsx --test src/lib/authz.test.ts`
Expected: FAIL — `Cannot find module './authz'`.

- [ ] **Step 3: Implementar `authz.ts` (sem o guard ainda)**

```ts
// nexuserp/src/lib/authz.ts
import type { UserRole } from "@/generated/prisma/enums";

export type ModuleKey =
  | "dashboard" | "financeiro" | "vendas" | "clientes" | "estoque"
  | "compras" | "producao" | "projetos" | "relatorios" | "automacoes"
  | "configuracoes" | "suporte" | "portal-cliente";

export type PlanSlug = "start" | "growth" | "enterprise";

const PLAN_ORDER: PlanSlug[] = ["start", "growth", "enterprise"];
export function planRank(slug: PlanSlug): number {
  return PLAN_ORDER.indexOf(slug);
}

/** Plano mínimo que libera cada módulo. */
export const MODULE_MIN_PLAN: Record<ModuleKey, PlanSlug> = {
  dashboard: "start",
  financeiro: "start",
  vendas: "start",
  clientes: "start",
  estoque: "start",
  relatorios: "start",
  configuracoes: "start",
  suporte: "start",
  "portal-cliente": "start",
  compras: "growth",
  producao: "growth",
  projetos: "growth",
  automacoes: "growth",
};

/** Papéis autorizados por módulo. */
export const MODULE_ROLES: Record<ModuleKey, UserRole[]> = {
  dashboard: ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION"],
  financeiro: ["OWNER", "ADMIN", "MANAGER", "FINANCE"],
  vendas: ["OWNER", "ADMIN", "MANAGER", "SALES"],
  clientes: ["OWNER", "ADMIN", "MANAGER", "SALES"],
  estoque: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  compras: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  producao: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  projetos: ["OWNER", "ADMIN", "MANAGER", "OPERATION", "SALES"],
  relatorios: ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION"],
  automacoes: ["OWNER", "ADMIN"],
  configuracoes: ["OWNER", "ADMIN"],
  suporte: ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION"],
  "portal-cliente": ["OWNER", "ADMIN", "CLIENT"],
};

export interface AccessResult {
  ok: boolean;
  reason?: "plan" | "role";
}

export function canAccessModule(
  planSlug: PlanSlug,
  role: UserRole,
  module: ModuleKey
): AccessResult {
  if (planRank(planSlug) < planRank(MODULE_MIN_PLAN[module])) {
    return { ok: false, reason: "plan" };
  }
  if (!MODULE_ROLES[module].includes(role)) {
    return { ok: false, reason: "role" };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd nexuserp && npx tsx --test src/lib/authz.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Checkpoint**

Run: `cd nexuserp && npx tsc --noEmit`
Expected: sem novos erros relacionados a `authz.ts`. (O import de `UserRole` resolve de `@/generated/prisma/enums`.)

---

### Task 2: Resolver tenant (`getCurrentCompany`)

**Files:**
- Create: `nexuserp/src/lib/tenant.ts`

- [ ] **Step 1: Implementar `tenant.ts`**

```ts
// nexuserp/src/lib/tenant.ts
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PlanSlug } from "@/lib/authz";

export interface TenantContext {
  userId: string;
  companyId: string;
  companyName: string;
  role: import("@/generated/prisma/enums").UserRole;
  planSlug: PlanSlug;
  subscriptionStatus: string | null;
}

/**
 * Resolve a empresa do usuário logado. Deduplicado por request via React cache().
 * Sem sessão → /login. Sem empresa → /onboarding.
 * Assinatura ausente/expirada/cancelada → tratada como plano "start" (acesso mínimo).
 */
export const getCurrentCompany = cache(async (): Promise<TenantContext> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.companyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      company: {
        include: {
          // Company.subscriptions é 1-N; pegamos a mais recente.
          subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  const sub = membership.company.subscriptions[0] ?? null;
  const active = sub && (sub.status === "ACTIVE" || sub.status === "TRIAL");
  const planSlug = (active ? (sub!.plan.slug as PlanSlug) : "start");

  return {
    userId: session.user.id,
    companyId: membership.companyId,
    companyName: membership.company.name,
    role: membership.role,
    planSlug,
    subscriptionStatus: sub?.status ?? null,
  };
});
```

- [ ] **Step 2: Verificar tipos**

Run: `cd nexuserp && npx tsc --noEmit`
Expected: sem erros em `tenant.ts`. Se `subscription` for relação 1-1 opcional no schema, `include` resolve; confirmar nome `subscription` no `model Company` (já existe).

- [ ] **Step 3: Checkpoint**

Run: `cd nexuserp && npx eslint src/lib/tenant.ts`
Expected: limpo.

---

### Task 3: Guard `requireModuleAccess`

**Files:**
- Modify: `nexuserp/src/lib/authz.ts` (acrescentar guard server)

- [ ] **Step 1: Acrescentar o guard no fim de `authz.ts`**

```ts
// append em nexuserp/src/lib/authz.ts
import { redirect } from "next/navigation";
import { getCurrentCompany, type TenantContext } from "@/lib/tenant";

/**
 * Server guard: garante acesso ao módulo ou redireciona.
 * Retorna o contexto do tenant p/ a página/layout reaproveitar.
 */
export async function requireModuleAccess(module: ModuleKey): Promise<TenantContext> {
  const ctx = await getCurrentCompany();
  const res = canAccessModule(ctx.planSlug, ctx.role, module);
  if (!res.ok) {
    if (res.reason === "plan") redirect(`/app/upgrade?m=${module}`);
    redirect(`/app/dashboard?denied=${module}`);
  }
  return ctx;
}
```

- [ ] **Step 2: Verificar que o teste unitário ainda passa (sem import circular quebrando node:test)**

Run: `cd nexuserp && npx tsx --test src/lib/authz.test.ts`
Expected: PASS. Nota: o teste importa só `canAccessModule`/`planRank`. O import de `next/navigation`/`tenant` no topo do módulo é carregado; se `tsx --test` falhar por `server-only`/`next` imports, mover o guard para arquivo separado `nexuserp/src/lib/authz-guard.ts` e reexportar. (Decisão em runtime do passo.)

- [ ] **Step 3: Checkpoint**

Run: `cd nexuserp && npx tsc --noEmit`
Expected: limpo.

---

### Task 4: Página `/app/upgrade`

**Files:**
- Create: `nexuserp/src/app/(app)/app/upgrade/page.tsx`

- [ ] **Step 1: Implementar a página (server component, tema dark)**

```tsx
// nexuserp/src/app/(app)/app/upgrade/page.tsx
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

const LABELS: Record<string, string> = {
  compras: "Compras", producao: "Produção", projetos: "Projetos", automacoes: "Automações",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const label = m ? (LABELS[m] ?? m) : "este módulo";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-nexus-yellow/10 flex items-center justify-center mb-6">
        <Lock size={36} className="text-nexus-yellow" />
      </div>
      <h2 className="text-xl font-bold text-ice-white mb-2">Módulo não incluído no seu plano</h2>
      <p className="text-d-on-surface-variant text-sm max-w-sm mb-6">
        O módulo <strong className="text-ice-white">{label}</strong> está disponível a partir do plano Growth.
        Faça upgrade para desbloquear.
      </p>
      <Link
        href="/planos"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim transition-all"
      >
        Ver planos <ArrowRight size={18} />
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Checkpoint**

Run: `cd nexuserp && npx tsc --noEmit && npx eslint "src/app/(app)/app/upgrade/page.tsx"`
Expected: limpo.

---

### Task 5: `(app)/app/layout.tsx` server → passa `planSlug`/`role` à Sidebar

**Files:**
- Modify: `nexuserp/src/app/(app)/app/layout.tsx`

- [ ] **Step 1: Reescrever o layout como server component**

```tsx
// nexuserp/src/app/(app)/app/layout.tsx
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppHeader } from "@/components/app/AppHeader";
import { getCurrentCompany } from "@/lib/tenant";

export default async function AppLayout({ children }: { readonly children: React.ReactNode }) {
  const ctx = await getCurrentCompany();
  return (
    <div className="flex h-screen bg-absolute-black overflow-hidden">
      <AppSidebar planSlug={ctx.planSlug} role={ctx.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Checkpoint**

Run: `cd nexuserp && npx tsc --noEmit`
Expected: ERRO esperado — `AppSidebar` ainda não aceita props `planSlug`/`role`. Corrigido na Task 6.

---

### Task 6: `AppSidebar` com cadeados por plano/role

**Files:**
- Modify: `nexuserp/src/components/app/AppSidebar.tsx`

- [ ] **Step 1: Aceitar props e calcular acesso por item**

Acrescentar `import { Lock } from "lucide-react";` à lista de ícones e `import { canAccessModule, type ModuleKey, type PlanSlug } from "@/lib/authz";` e `import type { UserRole } from "@/generated/prisma/enums";`.

Mudar a assinatura e mapear cada item para sua `ModuleKey` via o slug do href (`/app/<key>`). Para cada item:
- `const key = item.href.replace("/app/", "") as ModuleKey;`
- `const access = canAccessModule(planSlug, role, key);`
- Se `access.ok` → render normal (Link).
- Se `!access.ok && reason === "plan"` → render como Link para `/app/upgrade?m=<key>` com ícone `Lock` à direita e texto esmaecido.
- Se `!access.ok && reason === "role"` → não renderizar (return null).

```tsx
export function AppSidebar({ planSlug, role }: { readonly planSlug: PlanSlug; readonly role: UserRole }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const renderItem = (item: { label: string; href: string; icon: typeof LayoutDashboard }) => {
    const key = item.href.replace("/app/", "") as ModuleKey;
    const access = canAccessModule(planSlug, role, key);
    if (!access.ok && access.reason === "role") return null;

    const Icon = item.icon;
    const active = isActive(item.href);
    const locked = !access.ok && access.reason === "plan";
    const href = locked ? `/app/upgrade?m=${key}` : item.href;

    return (
      <Link
        key={item.href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
          active && !locked
            ? "bg-nexus-yellow/15 text-ice-white"
            : "text-d-on-surface-variant hover:bg-d-surface-container hover:text-ice-white",
          locked && "opacity-60"
        )}
      >
        {active && !locked && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-nexus-yellow rounded-r" />
        )}
        <Icon size={18} className={cn("flex-shrink-0", active && !locked ? "text-nexus-yellow" : "text-d-on-surface-variant group-hover:text-ice-white")} />
        <span className="flex-1">{item.label}</span>
        {locked && <Lock size={13} className="text-d-on-surface-variant" />}
      </Link>
    );
  };

  return (
    /* ...mesma <aside>... NAV_ITEMS.map(renderItem) e BOTTOM_ITEMS.map(renderItem)... */
  );
}
```

(Manter o restante da `<aside>` igual: logo, separador, rodapé do usuário. Trocar os dois `.map(...)` para usar `renderItem`.)

- [ ] **Step 2: Checkpoint**

Run: `cd nexuserp && npx tsc --noEmit && npx eslint src/components/app/AppSidebar.tsx`
Expected: limpo (resolve também o erro da Task 5).

---

### Task 7: `layout.tsx` server por módulo (guard)

**Files (Create — 13 arquivos):**
- `nexuserp/src/app/(app)/app/dashboard/layout.tsx`
- `.../financeiro/layout.tsx`, `.../vendas/layout.tsx`, `.../clientes/layout.tsx`,
  `.../estoque/layout.tsx`, `.../compras/layout.tsx`, `.../producao/layout.tsx`,
  `.../projetos/layout.tsx`, `.../relatorios/layout.tsx`, `.../automacoes/layout.tsx`,
  `.../configuracoes/layout.tsx`, `.../suporte/layout.tsx`, `.../portal-cliente/layout.tsx`

- [ ] **Step 1: Criar cada layout com o guard**

Modelo (trocar `"<module>"` pela key da pasta):

```tsx
import { requireModuleAccess } from "@/lib/authz";

export default async function ModuleLayout({ children }: { readonly children: React.ReactNode }) {
  await requireModuleAccess("financeiro"); // ← key da pasta correspondente
  return <>{children}</>;
}
```

> `/app/upgrade` NÃO recebe layout-guard (qualquer logado pode ver). `onboarding` também não.

- [ ] **Step 2: Checkpoint de tipos**

Run: `cd nexuserp && npx tsc --noEmit`
Expected: limpo.

---

### Task 8: Verificação final (sem runtime/DB)

- [ ] **Step 1: Teste unitário authz**

Run: `cd nexuserp && npx tsx --test src/lib/authz.test.ts`
Expected: PASS.

- [ ] **Step 2: Lint estrito**

Run: `cd nexuserp && npx eslint src --max-warnings=0`
Expected: 0 erros, 0 warnings.

- [ ] **Step 3: Build de produção**

Run: `cd nexuserp && npm run build`
Expected: `✓ Compiled successfully`, rotas geradas incluindo `/app/upgrade`. As páginas de módulo agora têm layout server (podem aparecer como `ƒ` dinâmicas por causa do `auth()` — esperado).

- [ ] **Step 4: Checkpoint**

Confirmar que `getCurrentCompany`/guard só rodam server-side (nenhum import em client component). `AppSidebar` recebe dados via props do layout server — ok.

---

## Self-Review

**Cobertura do spec:**
- §3.1 tenant → Task 2 ✓
- §3.2 authz mapas + canAccessModule + requireModuleAccess → Tasks 1, 3 ✓
- §3.3 auth.js sem mudança → respeitado (nenhuma task altera callbacks) ✓
- §3.4 layout server passa props → Task 5 ✓
- §3.5 sidebar locks → Task 6 ✓
- §3.6 guard nas páginas → Task 7 (via layout por módulo, refinamento idiomático) ✓
- §3.7 /app/upgrade → Task 4 ✓
- §5 assinatura expirada → plano "start" em `getCurrentCompany` (Task 2) ✓
- §6 testes sem runtime → Task 1 (node:test) + Task 8 (build/lint) ✓

**Placeholders:** nenhum "TODO/TBD"; Task 6 e Task 7 mostram o código; o único "..." é instrução explícita de "manter o resto da `<aside>` igual".

**Consistência de tipos:** `ModuleKey`, `PlanSlug`, `canAccessModule`, `requireModuleAccess`, `getCurrentCompany`, `TenantContext` usados de forma consistente entre tasks. `UserRole` importado de `@/generated/prisma/enums` (path confirmado: `src/generated/prisma/enums.ts`).
