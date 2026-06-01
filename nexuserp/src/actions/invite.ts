"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { createToken } from "@/lib/tokens";
import { sendEmail, emailLayout } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { inviteSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function appUrl(path: string): string {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

/**
 * Convida um novo membro para a empresa atual. Substitui o cadastro público:
 * cria o usuário como PENDING/sem acesso e envia um link de ativação. O acesso
 * só é liberado quando o convidado define a senha em /ativar.
 * Apenas OWNER/ADMIN podem convidar.
 */
export async function inviteUser(input: {
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "FINANCE" | "SALES" | "OPERATION" | "CLIENT";
}): Promise<ActionResult<{ userId: string }>> {
  try {
    const { companyId, userId, role: myRole } = await requireModuleMutation("configuracoes");
    if (myRole !== "OWNER" && myRole !== "ADMIN") {
      return { success: false, error: "Apenas proprietário ou administrador podem convidar." };
    }

    const ip = await getClientIp();
    if (!(await rateLimit(`invite:${ip}`, 20, 60 * 60_000)).success) {
      return { success: false, error: "Muitos convites. Aguarde alguns minutos." };
    }

    const parsed = inviteSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }
    const data = parsed.data;
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "E-mail já cadastrado." };

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          role: data.role,
          status: "PENDING",
          accessEnabled: false,
        },
      });
      await tx.companyMember.create({
        data: { userId: user.id, companyId, role: data.role },
      });
      return { userId: user.id };
    });

    const token = await createToken("activate", email);
    const url = appUrl(`/ativar?token=${token}&invite=1`);
    try {
      await sendEmail({
        to: email,
        subject: "Você foi convidado para a NexusERP",
        html: emailLayout(
          "Convite para a NexusERP",
          "Você foi adicionado à equipe da sua empresa na NexusERP. Clique abaixo para criar sua senha e acessar o sistema.",
          url,
          "Ativar meu acesso"
        ),
      });
    } catch (err) {
      console.error("sendInviteEmail:", err);
    }

    await logAudit({ companyId, userId, action: "INVITE", entity: "User", entityId: result.userId });
    revalidatePath("/app/configuracoes");
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("inviteUser:", e);
    return { success: false, error: "Erro ao convidar membro." };
  }
}
