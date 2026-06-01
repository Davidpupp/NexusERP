import { redirect } from "next/navigation";
import { getCurrentCompany, type TenantContext } from "@/lib/tenant";
import { canAccessModule, type ModuleKey } from "@/lib/authz";

/**
 * Server guard: garante acesso ao módulo ou redireciona.
 * Mantido fora de `authz.ts` para não acoplar a lógica pura a next/Prisma.
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
