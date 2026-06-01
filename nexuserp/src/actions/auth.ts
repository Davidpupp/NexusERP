"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { sendVerificationEmail } from "@/actions/account";
import type { ActionResult } from "@/types";

/**
 * Provisiona uma nova empresa + usuário OWNER. NÃO concede acesso: o usuário é
 * criado como PENDING/accessEnabled=false e SEM assinatura — produto pago, sem
 * trial. O acesso só é liberado após ativação (pós-pagamento) ou liberação
 * manual. Não é mais um caminho público; uso interno/administrativo apenas.
 */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  companyName: string;
}): Promise<ActionResult<{ userId: string }>> {
  // 1. Rate limit (5 signups / 10 min per IP)
  const ip = await getClientIp();
  const limit = await rateLimit(`register:${ip}`, 5, 10 * 60_000);
  if (!limit.success) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  // 2. Validate input server-side
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "E-mail já cadastrado" };

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Sem assinatura e sem acesso: produto pago, sem trial automático.
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          passwordHash,
          role: "OWNER",
          status: "PENDING",
          accessEnabled: false,
        },
      });

      await tx.company.create({
        data: {
          name: data.companyName,
          status: "ACTIVE",
          members: { create: { userId: user.id, role: "OWNER" } },
        },
      });

      return { userId: user.id };
    });

    // Envia verificação (não bloqueia o cadastro se o e-mail falhar).
    try {
      await sendVerificationEmail(email);
    } catch (err) {
      console.error("sendVerificationEmail:", err);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Erro ao criar conta. Tente novamente." };
  }
}
