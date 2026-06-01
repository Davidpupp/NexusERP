"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { logAudit } from "@/lib/action-context";
import type { ActionResult } from "@/types";

/**
 * LGPD — exporta todos os dados da empresa do usuário logado em JSON.
 * Direito de portabilidade/acesso (LGPD art. 18).
 */
export async function exportCompanyData(): Promise<ActionResult<string>> {
  try {
    const { companyId, userId } = await getCurrentCompany();
    const where = { companyId };

    const [company, customers, opportunities, suppliers, products, purchaseOrders, transactions, projects, tasks, tickets, automations, orders, subscriptions, members] =
      await Promise.all([
        prisma.company.findUnique({ where: { id: companyId } }),
        prisma.customer.findMany({ where }),
        prisma.opportunity.findMany({ where }),
        prisma.supplier.findMany({ where }),
        prisma.product.findMany({ where, include: { movements: true } }),
        prisma.purchaseOrder.findMany({ where }),
        prisma.transaction.findMany({ where }),
        prisma.project.findMany({ where }),
        prisma.task.findMany({ where }),
        prisma.supportTicket.findMany({ where, include: { messages: true } }),
        prisma.automation.findMany({ where }),
        prisma.order.findMany({ where, include: { payments: true } }),
        prisma.subscription.findMany({ where }),
        prisma.companyMember.findMany({ where, include: { user: { select: { name: true, email: true, role: true } } } }),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      company,
      members,
      customers,
      opportunities,
      suppliers,
      products,
      purchaseOrders,
      transactions,
      projects,
      tasks,
      tickets,
      automations,
      orders,
      subscriptions,
    };

    await logAudit({ companyId, userId, action: "DATA_EXPORT", entity: "Company", entityId: companyId });
    return { success: true, data: JSON.stringify(payload, null, 2) };
  } catch (e) {
    console.error("exportCompanyData:", e);
    return { success: false, error: "Erro ao exportar dados." };
  }
}

/**
 * LGPD — exclui permanentemente a empresa, todos os dados relacionados e a conta
 * do usuário (direito de eliminação, art. 18). Apenas OWNER. Irreversível.
 */
export async function deleteAccount(): Promise<ActionResult<null>> {
  try {
    const { companyId, userId, role } = await getCurrentCompany();
    if (role !== "OWNER") return { success: false, error: "Apenas o proprietário pode excluir a conta." };

    await prisma.$transaction([
      prisma.supportMessage.deleteMany({ where: { ticket: { companyId } } }),
      prisma.supportTicket.deleteMany({ where: { companyId } }),
      prisma.inventoryMovement.deleteMany({ where: { product: { companyId } } }),
      prisma.product.deleteMany({ where: { companyId } }),
      prisma.payment.deleteMany({ where: { order: { companyId } } }),
      prisma.order.deleteMany({ where: { companyId } }),
      prisma.task.deleteMany({ where: { companyId } }),
      prisma.project.deleteMany({ where: { companyId } }),
      prisma.opportunity.deleteMany({ where: { companyId } }),
      prisma.customer.deleteMany({ where: { companyId } }),
      prisma.purchaseOrder.deleteMany({ where: { companyId } }),
      prisma.supplier.deleteMany({ where: { companyId } }),
      prisma.transaction.deleteMany({ where: { companyId } }),
      prisma.costCenter.deleteMany({ where: { companyId } }),
      prisma.automation.deleteMany({ where: { companyId } }),
      prisma.subscription.deleteMany({ where: { companyId } }),
      prisma.auditLog.deleteMany({ where: { companyId } }),
      prisma.companyMember.deleteMany({ where: { companyId } }),
      prisma.company.deleteMany({ where: { id: companyId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.deleteMany({ where: { id: userId } }),
    ]);

    return { success: true, data: null };
  } catch (e) {
    console.error("deleteAccount:", e);
    return { success: false, error: "Erro ao excluir conta." };
  }
}
