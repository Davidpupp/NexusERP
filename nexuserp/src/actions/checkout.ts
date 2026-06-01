"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isMercadoPagoEnabled } from "@/lib/env";
import { checkoutActionSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { createPixPayment, createCardPayment, mapMpStatus } from "@/lib/mercadopago";
import { fulfillOrder } from "@/lib/fulfillment";
import { Prisma } from "@/generated/prisma/client";
import type { ActionResult } from "@/types";

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  cnpj?: string;
  planId: string;
  paymentMethod: "CREDIT_CARD" | "PIX" | "BOLETO";
  // Cartão: token gerado no client via MP.js (PAN nunca chega ao server).
  card?: {
    token: string;
    installments: number;
    paymentMethodId: string;
    docType: string;
    docNumber: string;
  };
}

export interface CheckoutResult {
  orderId: string;
  userId: string;
  status: "PAID" | "PENDING";
  pix?: { qrCode: string; qrCodeBase64: string; ticketUrl: string };
}

export async function processCheckout(input: CheckoutData): Promise<ActionResult<CheckoutResult>> {
  // 1. Rate limit (30 attempts / 10 min per IP)
  const ip = await getClientIp();
  if (!(await rateLimit(`checkout:${ip}`, 30, 10 * 60_000)).success) {
    return { success: false, error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  // 2. Validate
  const parsed = checkoutActionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  try {
    const plan = await prisma.plan.findUnique({ where: { slug: data.planId } });
    if (!plan) return { success: false, error: "Plano não encontrado" };

    // Create user if not exists (random password — they set it via onboarding/reset)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);
      user = await prisma.user.create({
        data: { name: data.name, email, passwordHash, role: "OWNER" },
      });
    }

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        // CNPJ é unique: normaliza vazio para null (Postgres permite múltiplos nulls).
        cnpj: data.cnpj && data.cnpj.trim() ? data.cnpj.trim() : null,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });

    const total = plan.price + plan.setupFee;
    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        planId: plan.id,
        amount: plan.price,
        setupFee: plan.setupFee,
        discount: 0,
        total,
        status: "PENDING",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: data.paymentMethod,
        status: "PENDING",
        amount: total,
        provider: isMercadoPagoEnabled ? "mercadopago" : "mock",
      },
    });

    // ── Real Pix via Mercado Pago ───────────────────────────────────────────
    if (isMercadoPagoEnabled && data.paymentMethod === "PIX") {
      const pix = await createPixPayment({
        amount: total,
        description: `NexusERP — Plano ${plan.name}`,
        payerEmail: email,
        externalReference: order.id,
        idempotencyKey: order.id,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId: String(pix.id) },
      });
      // Order stays PENDING until the webhook confirms approval.
      return {
        success: true,
        data: {
          orderId: order.id,
          userId: user.id,
          status: "PENDING",
          pix: { qrCode: pix.qrCode, qrCodeBase64: pix.qrCodeBase64, ticketUrl: pix.ticketUrl },
        },
      };
    }

    // ── Fallback (dev/mock, or card/boleto until tokenization is wired) ──────
    // TODO: real card payments require client-side tokenization with MP.js
    // (public key) — the raw PAN must never reach the server (PCI). Until then
    // these methods are auto-approved in the mock flow.
    if (!isMercadoPagoEnabled) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { provider: "mock", providerPaymentId: `mock_${Date.now()}` },
      });
      await fulfillOrder(order.id);
      return { success: true, data: { orderId: order.id, userId: user.id, status: "PAID" } };
    }

    // ── Cartão via Mercado Pago (token tokenizado no client com MP.js) ──────
    if (data.paymentMethod === "CREDIT_CARD" && input.card?.token) {
      const card = await createCardPayment({
        amount: total,
        description: `NexusERP — Plano ${plan.name}`,
        token: input.card.token,
        installments: input.card.installments,
        paymentMethodId: input.card.paymentMethodId,
        payerEmail: email,
        payerDocType: input.card.docType,
        payerDocNumber: input.card.docNumber,
        externalReference: order.id,
        idempotencyKey: order.id,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId: String(card.id) },
      });
      const mapped = mapMpStatus(card.status);
      if (mapped === "PAID") {
        await fulfillOrder(order.id);
        return { success: true, data: { orderId: order.id, userId: user.id, status: "PAID" } };
      }
      if (mapped === "FAILED") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        return { success: false, error: "Pagamento recusado. Verifique os dados do cartão." };
      }
      // in_process / pending → confirmado depois via webhook.
      return { success: true, data: { orderId: order.id, userId: user.id, status: "PENDING" } };
    }

    // MP habilitado mas método não suportado (ex: boleto) ou cartão sem token.
    return {
      success: false,
      error: "Método de pagamento indisponível. Use Pix ou cartão.",
    };
  } catch (error) {
    console.error("Checkout error:", error);
    // CNPJ duplicado (Company.cnpj é único) → mensagem clara em vez de genérica.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "Já existe uma empresa cadastrada com este CNPJ. Faça login ou use outro CNPJ.",
      };
    }
    const msg = error instanceof Error ? error.message : "";
    // Surfacing do motivo real do gateway (ajuda diagnóstico em produção).
    if (msg.startsWith("Mercado Pago error")) {
      return { success: false, error: msg };
    }
    return { success: false, error: "Erro ao processar pagamento. Tente novamente." };
  }
}

/** Poll order status (used by the Pix flow on the payment page). */
export async function getOrderStatus(
  orderId: string
): Promise<ActionResult<{ status: "PAID" | "PENDING" | "FAILED" }>> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Pedido não encontrado" };
  const status =
    order.status === "PAID" ? "PAID" : order.status === "FAILED" ? "FAILED" : "PENDING";
  return { success: true, data: { status } };
}
