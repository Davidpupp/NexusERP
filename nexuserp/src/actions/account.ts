"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { createToken, consumeToken } from "@/lib/tokens";
import { sendEmail, emailLayout } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import type { ActionResult } from "@/types";

function appUrl(path: string): string {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

/** Envia (ou reenvia) e-mail de verificação. Sempre retorna sucesso (evita enumeração). */
export async function sendVerificationEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || user.emailVerified) return;
  const token = await createToken("verify", email);
  const url = appUrl(`/verificar-email?token=${token}`);
  await sendEmail({
    to: email,
    subject: "Confirme seu e-mail — NexusERP",
    html: emailLayout("Confirme seu e-mail", "Clique no botão abaixo para ativar sua conta.", url, "Confirmar e-mail"),
  });
}

export async function verifyEmail(token: string): Promise<ActionResult<null>> {
  const email = await consumeToken("verify", token);
  if (!email) return { success: false, error: "Link inválido ou expirado." };
  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
  return { success: true, data: null };
}

export async function requestPasswordReset(email: string): Promise<ActionResult<null>> {
  const ip = await getClientIp();
  if (!(await rateLimit(`reset:${ip}`, 5, 15 * 60_000)).success) {
    return { success: false, error: "Muitas tentativas. Aguarde alguns minutos." };
  }
  const clean = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: clean } });
  // Sempre responde sucesso (não revela se o e-mail existe).
  if (user) {
    const token = await createToken("reset", clean);
    const url = appUrl(`/redefinir-senha?token=${token}`);
    await sendEmail({
      to: clean,
      subject: "Redefinir senha — NexusERP",
      html: emailLayout("Redefinir senha", "Recebemos um pedido para redefinir sua senha. O link expira em 1 hora.", url, "Criar nova senha"),
    });
  }
  return { success: true, data: null };
}

/**
 * Gera um token de ativação para um pedido JÁ PAGO. Usado para liberar o acesso
 * automaticamente após o pagamento (criar senha + login). Retorna o token.
 */
export async function createActivationToken(orderId: string): Promise<ActionResult<{ token: string; email: string }>> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { company: { include: { members: { where: { role: "OWNER" }, include: { user: true } } } } },
  });
  if (!order || order.status !== "PAID") return { success: false, error: "Pedido não confirmado." };
  const owner = order.company.members[0]?.user;
  if (!owner) return { success: false, error: "Usuário não encontrado." };
  const token = await createToken("activate", owner.email);
  return { success: true, data: { token, email: owner.email } };
}

/**
 * Consome o token de ativação, define a senha e marca o e-mail como verificado
 * (o pagamento já comprova a titularidade). Retorna o e-mail para auto-login.
 */
export async function activateAccount(
  token: string,
  password: string
): Promise<ActionResult<{ email: string }>> {
  if (password.length < 8) return { success: false, error: "Senha deve ter ao menos 8 caracteres." };
  const email = await consumeToken("activate", token);
  if (!email) return { success: false, error: "Link inválido ou expirado." };
  const passwordHash = await bcrypt.hash(password, 12);
  // Ativação (pós-pagamento ou convite) libera o acesso: define senha, verifica
  // o e-mail e marca a conta como ativa/liberada.
  await prisma.user.update({
    where: { email },
    data: { passwordHash, emailVerified: new Date(), status: "ACTIVE", accessEnabled: true },
  });
  return { success: true, data: { email } };
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult<null>> {
  if (newPassword.length < 8) return { success: false, error: "Senha deve ter ao menos 8 caracteres." };
  const email = await consumeToken("reset", token);
  if (!email) return { success: false, error: "Link inválido ou expirado." };
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  return { success: true, data: null };
}
