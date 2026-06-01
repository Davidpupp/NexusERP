import crypto from "crypto";
import { env } from "@/lib/env";

/**
 * Minimal Mercado Pago REST client (no SDK dependency).
 * Docs: https://www.mercadopago.com.br/developers/en/reference
 */
const MP_API = "https://api.mercadopago.com";

function authHeaders(idempotencyKey?: string): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) h["X-Idempotency-Key"] = idempotencyKey;
  return h;
}

export interface PixPaymentResult {
  id: number;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
}

/** Create a Pix payment. The buyer scans the QR / copies the code, then pays. */
export async function createPixPayment(params: {
  amount: number;
  description: string;
  payerEmail: string;
  externalReference: string;
  idempotencyKey: string;
}): Promise<PixPaymentResult> {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: authHeaders(params.idempotencyKey),
    body: JSON.stringify({
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      notification_url: env.NEXT_PUBLIC_APP_URL
        ? `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
        : undefined,
      payer: { email: params.payerEmail },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Mercado Pago error ${res.status}: ${data?.message ?? "unknown"}`);
  }

  const tx = data.point_of_interaction?.transaction_data ?? {};
  return {
    id: data.id,
    status: data.status,
    qrCode: tx.qr_code ?? "",
    qrCodeBase64: tx.qr_code_base64 ?? "",
    ticketUrl: tx.ticket_url ?? "",
  };
}

export interface CardPaymentResult {
  id: number;
  status: string; // approved | rejected | in_process | ...
  statusDetail: string;
}

/** Cria pagamento com cartão a partir de um token gerado no client (MP.js). */
export async function createCardPayment(params: {
  amount: number;
  description: string;
  token: string;
  installments: number;
  paymentMethodId: string;
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
  externalReference: string;
  idempotencyKey: string;
}): Promise<CardPaymentResult> {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: authHeaders(params.idempotencyKey),
    body: JSON.stringify({
      transaction_amount: Number(params.amount.toFixed(2)),
      token: params.token,
      description: params.description,
      installments: params.installments,
      payment_method_id: params.paymentMethodId,
      external_reference: params.externalReference,
      notification_url: env.NEXT_PUBLIC_APP_URL
        ? `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
        : undefined,
      payer: {
        email: params.payerEmail,
        identification: { type: params.payerDocType, number: params.payerDocNumber },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Mercado Pago error ${res.status}: ${data?.message ?? "unknown"}`);
  }
  return { id: data.id, status: data.status, statusDetail: data.status_detail ?? "" };
}

export interface MpPayment {
  id: number;
  status: string;
  externalReference: string | null;
}

/** Fetch a payment to reconcile status (used by webhook + polling). */
export async function getPayment(paymentId: string | number): Promise<MpPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Mercado Pago error ${res.status}: ${data?.message ?? "unknown"}`);
  }
  return { id: data.id, status: data.status, externalReference: data.external_reference ?? null };
}

/**
 * Validate the `x-signature` header per Mercado Pago's webhook spec.
 * Template: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` HMAC-SHA256 with MP_WEBHOOK_SECRET.
 * Returns true when no secret is configured (best-effort) but logs a warning.
 */
export function validateWebhookSignature(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("MP_WEBHOOK_SECRET not set — webhook signature not verified.");
    return true;
  }
  if (!opts.xSignature || !opts.dataId) return false;

  // x-signature: "ts=<ts>,v1=<hash>"
  const parts = Object.fromEntries(
    opts.xSignature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k.trim(), (v ?? "").trim()];
    })
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${opts.dataId};request-id:${opts.xRequestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

/** Map MP payment status → our PaymentStatus. */
export function mapMpStatus(status: string): "PAID" | "PENDING" | "FAILED" {
  if (status === "approved") return "PAID";
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status)) return "FAILED";
  return "PENDING";
}
