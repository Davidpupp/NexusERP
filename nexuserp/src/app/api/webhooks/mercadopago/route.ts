import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, mapMpStatus, validateWebhookSignature } from "@/lib/mercadopago";
import { fulfillOrder } from "@/lib/fulfillment";
import { isMercadoPagoEnabled } from "@/lib/env";
import { captureError } from "@/lib/logger";

// Mercado Pago payment notifications. Configure this URL in the MP dashboard:
//   {NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago
export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled) {
    return NextResponse.json({ error: "MP disabled" }, { status: 503 });
  }

  const url = new URL(request.url);
  let body: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await request.json();
  } catch {
    // MP sometimes sends data via query string only.
  }

  const dataId = body?.data?.id ?? url.searchParams.get("data.id");
  const type = body?.type ?? url.searchParams.get("type");

  // 1. Verify authenticity
  const valid = validateWebhookSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  });
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // 2. Only handle payment events
  if (type && type !== "payment") {
    return NextResponse.json({ received: true });
  }
  if (!dataId) {
    return NextResponse.json({ error: "missing data.id" }, { status: 400 });
  }

  try {
    const payment = await getPayment(dataId);
    const orderId = payment.externalReference;
    if (!orderId) return NextResponse.json({ received: true });

    const status = mapMpStatus(payment.status);
    if (status === "PAID") {
      await fulfillOrder(orderId);
    } else if (status === "FAILED") {
      await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
      await prisma.payment.updateMany({ where: { orderId }, data: { status: "FAILED" } });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    await captureError(error, { scope: "mercadopago-webhook", dataId });
    // Return 200 to avoid infinite retries on our own bugs; MP retries on 5xx.
    return NextResponse.json({ received: true });
  }
}
