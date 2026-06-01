"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import type { ActionResult } from "@/types";

export async function markNotificationRead(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId } = await getCurrentCompany();
    await prisma.notification.updateMany({ where: { id, companyId, readAt: null }, data: { readAt: new Date() } });
    return { success: true, data: null };
  } catch (e) {
    console.error("markNotificationRead:", e);
    return { success: false, error: "Erro ao marcar notificação." };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult<null>> {
  try {
    const { companyId } = await getCurrentCompany();
    await prisma.notification.updateMany({ where: { companyId, readAt: null }, data: { readAt: new Date() } });
    return { success: true, data: null };
  } catch (e) {
    console.error("markAllNotificationsRead:", e);
    return { success: false, error: "Erro ao marcar notificações." };
  }
}
