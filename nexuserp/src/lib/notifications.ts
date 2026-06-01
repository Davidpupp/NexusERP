import { prisma } from "@/lib/prisma";

export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

/**
 * Cria uma notificação interna (central de alertas). Best-effort: nunca derruba
 * o fluxo que a originou. Sempre escopada por empresa.
 */
export async function createNotification(opts: {
  companyId: string;
  userId?: string | null;
  type: string;
  title: string;
  message?: string | null;
  severity?: NotificationSeverity;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        companyId: opts.companyId,
        userId: opts.userId ?? null,
        type: opts.type,
        title: opts.title,
        message: opts.message ?? null,
        severity: opts.severity ?? "info",
      },
    });
  } catch (e) {
    console.error("createNotification:", e);
  }
}
