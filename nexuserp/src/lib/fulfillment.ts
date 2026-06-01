import { prisma } from "@/lib/prisma";

/**
 * Mark an order as paid and provision its subscription. Idempotent: safe to call
 * from both the mock checkout path and the Mercado Pago webhook (which may retry).
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { company: { include: { members: true } } },
    });
    if (!order || order.status === "PAID") return; // already fulfilled or missing

    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    await tx.payment.updateMany({
      where: { orderId },
      data: { status: "PAID", paidAt: new Date() },
    });

    // Avoid duplicate subscriptions if one already exists for the company.
    const existing = await tx.subscription.findFirst({ where: { companyId: order.companyId } });
    if (!existing) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await tx.subscription.create({
        data: {
          companyId: order.companyId,
          planId: order.planId,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
        },
      });
    }

    const ownerId = order.company.members.find((m) => m.role === "OWNER")?.userId;
    await tx.auditLog.create({
      data: {
        companyId: order.companyId,
        userId: ownerId,
        action: "CHECKOUT_COMPLETED",
        entity: "Order",
        entityId: order.id,
      },
    });
  });
}
