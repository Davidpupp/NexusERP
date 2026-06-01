import { prisma } from "@/lib/prisma";
import { runAutomations } from "@/lib/automation/handlers";

/**
 * Barramento de eventos de domínio. `emitEvent` persiste o evento (auditoria) e
 * dispara o motor de automações. Mantido simples e in-process; eventos que
 * exigirem trabalho externo/pesado serão enfileirados (model Job) nas próximas fases.
 */
export type DomainEventType =
  | "sale.created"
  | "sale.paid"
  | "sale.canceled"
  | "stock.low"
  | "stock.out"
  | "lead.created"
  | "payment.received"
  | "integration.sync.completed"
  | "integration.sync.failed";

export async function emitEvent(
  type: DomainEventType,
  companyId: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.domainEvent.create({ data: { companyId, type, payload: payload as object } });
  } catch (e) {
    console.error("emitEvent persist:", e);
  }
  await runAutomations(type, companyId, payload);
}
