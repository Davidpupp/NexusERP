import { prisma } from "@/lib/prisma";
import { decryptSecret, safeEqual } from "@/lib/crypto";
import { emitEvent } from "@/lib/events";

/**
 * Webhook de entrada para pedidos de e-commerce.
 * URL: /api/webhooks/ecommerce?c=<companyId>  (header: x-webhook-secret)
 *
 * Seguro (valida segredo da Integration), idempotente (Sale.externalId único por
 * empresa) e assíncrono no efeito: cria a venda e dispara o motor de automação
 * (baixa estoque + financeiro + notificações). NUNCA confia em payload sem segredo.
 */
interface IncomingItem { sku?: string; description?: string; quantity?: number; unitPrice?: number }
interface IncomingOrder {
  externalId?: string;
  customerName?: string;
  total?: number;
  items?: IncomingItem[];
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function logEvent(companyId: string | null, status: string, message: string) {
  try {
    await prisma.automationLog.create({ data: { companyId, eventType: "ecommerce.order.received", action: "webhook", status, message } });
  } catch { /* best-effort */ }
}

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("c");
  const secret = req.headers.get("x-webhook-secret") ?? "";
  if (!companyId) return json(400, { error: "missing company" });

  const integ = await prisma.integration.findUnique({
    where: { companyId_type_provider: { companyId, type: "ecommerce", provider: "ecommerce" } },
  });
  if (!integ || integ.status === "disabled" || !integ.credentialsEncrypted) {
    return json(404, { error: "integration not configured" });
  }
  const expected = decryptSecret(integ.credentialsEncrypted);
  if (!expected || !safeEqual(secret, expected)) {
    await logEvent(companyId, "error", "segredo inválido");
    return json(401, { error: "invalid secret" });
  }

  let order: IncomingOrder;
  try {
    order = (await req.json()) as IncomingOrder;
  } catch {
    return json(400, { error: "invalid json" });
  }

  const externalId = order.externalId?.toString().trim();
  if (!externalId || !Array.isArray(order.items) || order.items.length === 0) {
    await logEvent(companyId, "warning", "payload incompleto");
    return json(422, { error: "missing externalId or items" });
  }

  // Idempotência: mesmo pedido não vira duas vendas.
  const dup = await prisma.sale.findFirst({ where: { companyId, externalId } });
  if (dup) {
    await logEvent(companyId, "skipped", `pedido ${externalId} já processado`);
    return json(200, { ok: true, deduped: true, saleId: dup.id });
  }

  // Mapeia itens (SKU → produto) e calcula total.
  const items = [];
  for (const it of order.items) {
    const qty = Math.max(1, Number(it.quantity) || 1);
    const unitPrice = Number(it.unitPrice) || 0;
    let productId: string | null = null;
    if (it.sku) {
      const prod = await prisma.product.findFirst({ where: { companyId, sku: it.sku }, select: { id: true } });
      productId = prod?.id ?? null;
    }
    items.push({ productId, description: it.description || it.sku || "Item", quantity: qty, unitPrice, total: qty * unitPrice });
  }
  const total = order.total ?? items.reduce((s, i) => s + i.total, 0);

  let customerId: string | null = null;
  if (order.customerName) {
    const existing = await prisma.customer.findFirst({ where: { companyId, name: order.customerName }, select: { id: true } });
    customerId = existing?.id ?? (await prisma.customer.create({ data: { companyId, name: order.customerName, status: "ACTIVE" } })).id;
  }

  const sale = await prisma.sale.create({
    data: {
      companyId,
      customerId,
      source: "ECOMMERCE",
      status: "CONFIRMED",
      total,
      externalId,
      items: { create: items.map((i) => ({ productId: i.productId, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })) },
    },
  });

  await prisma.integration.update({ where: { id: integ.id }, data: { lastSyncAt: new Date(), status: "connected" } });
  await logEvent(companyId, "success", `pedido ${externalId} → venda ${sale.id}`);

  // Motor de automação: baixa estoque + financeiro previsto + alertas.
  await emitEvent("sale.created", companyId, {
    saleId: sale.id,
    total,
    items: items.map((i) => ({ productId: i.productId, description: i.description, quantity: i.quantity, total: i.total })),
  });

  return json(200, { ok: true, saleId: sale.id });
}
