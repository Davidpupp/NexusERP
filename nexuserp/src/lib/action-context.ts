import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { canAccessModule, type ModuleKey, type UserRole } from "@/lib/authz";

export class ForbiddenError extends Error {
  constructor(message = "Sem permissão para esta ação") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface MutationContext {
  companyId: string;
  userId: string;
  role: UserRole;
}

/**
 * Guard de mutação: resolve o tenant e valida o papel para o módulo.
 * Diferente de `requireModuleAccess` (que redireciona), aqui lançamos
 * `ForbiddenError` — as server actions capturam e retornam ActionResult.
 */
export async function requireModuleMutation(module: ModuleKey): Promise<MutationContext> {
  const ctx = await getCurrentCompany();
  const res = canAccessModule(ctx.planSlug, ctx.role, module);
  if (!res.ok) throw new ForbiddenError();
  return { companyId: ctx.companyId, userId: ctx.userId, role: ctx.role };
}

/** Registra uma entrada de auditoria. Use dentro de uma transação quando possível. */
export async function logAudit(opts: {
  companyId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      companyId: opts.companyId,
      userId: opts.userId ?? null,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId ?? null,
      metadata: opts.metadata as object | undefined,
    },
  });
}
