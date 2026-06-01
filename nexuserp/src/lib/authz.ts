/**
 * Pure authorization logic — no framework/Prisma imports so it stays unit-testable
 * under `tsx --test` (no env/alias bootstrapping). The server guard that touches the
 * DB/session lives in `authz-guard.ts`.
 */

export type ModuleKey =
  | "dashboard" | "financeiro" | "vendas" | "pedidos" | "clientes" | "estoque"
  | "compras" | "producao" | "projetos" | "relatorios" | "automacoes"
  | "integracoes" | "configuracoes" | "suporte" | "portal-cliente";

export type PlanSlug = "start" | "growth" | "enterprise";

/** Matches the Prisma `UserRole` enum string values (kept local to avoid imports). */
export type UserRole =
  | "OWNER" | "ADMIN" | "MANAGER" | "FINANCE" | "SALES" | "OPERATION" | "CLIENT";

const PLAN_ORDER: PlanSlug[] = ["start", "growth", "enterprise"];
export function planRank(slug: PlanSlug): number {
  return PLAN_ORDER.indexOf(slug);
}

/** Plano mínimo que libera cada módulo. */
export const MODULE_MIN_PLAN: Record<ModuleKey, PlanSlug> = {
  dashboard: "start",
  financeiro: "start",
  vendas: "start",
  pedidos: "start",
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
  integracoes: "growth",
};

/** Papéis autorizados por módulo. */
export const MODULE_ROLES: Record<ModuleKey, UserRole[]> = {
  dashboard: ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION"],
  financeiro: ["OWNER", "ADMIN", "MANAGER", "FINANCE"],
  vendas: ["OWNER", "ADMIN", "MANAGER", "SALES"],
  pedidos: ["OWNER", "ADMIN", "MANAGER", "SALES"],
  clientes: ["OWNER", "ADMIN", "MANAGER", "SALES"],
  estoque: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  compras: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  producao: ["OWNER", "ADMIN", "MANAGER", "OPERATION"],
  projetos: ["OWNER", "ADMIN", "MANAGER", "OPERATION", "SALES"],
  relatorios: ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION"],
  automacoes: ["OWNER", "ADMIN"],
  integracoes: ["OWNER", "ADMIN"],
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
