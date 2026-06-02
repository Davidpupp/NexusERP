"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { leadSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

/**
 * Registra um lead comercial vindo da página pública "Adquirir nossos serviços".
 * Público (sem sessão), por isso protegido por rate-limit + validação. Não cria
 * acesso ao sistema — apenas um interessado que a equipe contata depois.
 */
export async function createLead(input: {
  name: string;
  company?: string;
  email: string;
  phone: string;
  segment?: string;
  usersQuantity?: string;
  mainNeed?: string;
  message?: string;
}): Promise<ActionResult<null>> {
  const ip = await getClientIp();
  if (!(await rateLimit(`lead:${ip}`, 5, 10 * 60_000)).success) {
    return { success: false, error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        name: d.name,
        company: d.company || null,
        email: d.email.toLowerCase().trim(),
        phone: d.phone,
        segment: d.segment || null,
        usersQuantity: d.usersQuantity || null,
        mainNeed: d.mainNeed || null,
        message: d.message || null,
        source: "site",
        status: "new",
      },
    });
    // Registro de auditoria sem tenant (lead é pré-contratação).
    await prisma.auditLog.create({ data: { action: "LEAD_CREATED", entity: "Lead", entityId: lead.id } });
    return { success: true, data: null };
  } catch (e) {
    console.error("createLead:", e);
    return { success: false, error: "Erro ao enviar. Tente novamente em instantes." };
  }
}

/**
 * Atualiza o status de uma solicitação. Restrito ao admin de plataforma
 * (área /admin). Lead não é tenant-scoped, então o guard é o requirePlatformAdmin.
 */
export async function updateLeadStatus(id: string, status: string): Promise<ActionResult<null>> {
  const { email } = await requirePlatformAdmin();
  if (!LEAD_STATUSES.includes(status as LeadStatus)) {
    return { success: false, error: "Status inválido" };
  }
  try {
    await prisma.lead.update({ where: { id }, data: { status } });
    await prisma.auditLog.create({
      data: { action: "LEAD_STATUS_UPDATED", entity: "Lead", entityId: id, metadata: { status, by: email } },
    });
    revalidatePath("/admin");
    return { success: true, data: null };
  } catch (e) {
    console.error("updateLeadStatus:", e);
    return { success: false, error: "Erro ao atualizar status." };
  }
}
