"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { encryptSecret, decryptSecret, randomSecret } from "@/lib/crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionResult } from "@/types";

export type IntegrationType = "bank" | "ecommerce" | "website" | "api" | "webhook" | "import";

function computeStatus(type: string, config: Record<string, unknown>, hasSecret: boolean): string {
  if (type === "ecommerce") return config.storeUrl && hasSecret ? "connected" : "pending_configuration";
  if (type === "webhook") return hasSecret ? "connected" : "pending_configuration";
  if (type === "website") return config.siteUrl ? "pending_configuration" : "not_connected";
  if (type === "api") return config.baseUrl ? "pending_configuration" : "not_connected";
  return "pending_configuration";
}

/**
 * Cria/atualiza uma integração da empresa. Gera segredo de webhook para
 * ecommerce/webhook (retornado em texto puro UMA vez, para exibir ao usuário).
 * Credenciais ficam SEMPRE criptografadas no banco. Apenas OWNER/ADMIN.
 */
export async function saveIntegration(input: {
  type: IntegrationType;
  provider?: string;
  config?: Record<string, unknown>;
  secret?: string;
}): Promise<ActionResult<{ secret?: string }>> {
  try {
    const { companyId, userId, role } = await requireModuleMutation("integracoes");
    if (role !== "OWNER" && role !== "ADMIN") return { success: false, error: "Apenas proprietário/administrador." };

    const provider = input.provider || input.type;
    const existing = await prisma.integration.findUnique({
      where: { companyId_type_provider: { companyId, type: input.type, provider } },
    });

    let secretPlain: string | undefined;
    let credentialsEncrypted = existing?.credentialsEncrypted ?? null;
    if ((input.type === "ecommerce" || input.type === "webhook") && !credentialsEncrypted) {
      secretPlain = randomSecret();
      credentialsEncrypted = encryptSecret(secretPlain);
    }
    if (input.secret) credentialsEncrypted = encryptSecret(input.secret);

    const config = { ...((existing?.config as Record<string, unknown>) ?? {}), ...(input.config ?? {}) };
    const status = computeStatus(input.type, config, !!credentialsEncrypted);
    const configJson = config as Prisma.InputJsonValue;

    await prisma.integration.upsert({
      where: { companyId_type_provider: { companyId, type: input.type, provider } },
      create: { companyId, type: input.type, provider, config: configJson, credentialsEncrypted, status },
      update: { config: configJson, credentialsEncrypted, status },
    });
    await logAudit({ companyId, userId, action: "SAVE", entity: "Integration", entityId: `${input.type}:${provider}`, metadata: { status } });
    revalidatePath("/app/integracoes");
    return { success: true, data: { secret: secretPlain } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("saveIntegration:", e);
    return { success: false, error: "Erro ao salvar integração." };
  }
}

export async function deleteIntegration(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId, role } = await requireModuleMutation("integracoes");
    if (role !== "OWNER" && role !== "ADMIN") return { success: false, error: "Apenas proprietário/administrador." };
    const res = await prisma.integration.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Integração não encontrada." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Integration", entityId: id });
    revalidatePath("/app/integracoes");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteIntegration:", e);
    return { success: false, error: "Erro ao remover integração." };
  }
}

/** Revela o segredo de webhook (descriptografa) para o usuário copiar. OWNER/ADMIN. */
export async function revealIntegrationSecret(type: IntegrationType, provider?: string): Promise<ActionResult<{ secret: string }>> {
  try {
    const { companyId, role } = await requireModuleMutation("integracoes");
    if (role !== "OWNER" && role !== "ADMIN") return { success: false, error: "Apenas proprietário/administrador." };
    const integ = await prisma.integration.findUnique({
      where: { companyId_type_provider: { companyId, type, provider: provider || type } },
    });
    if (!integ?.credentialsEncrypted) return { success: false, error: "Sem segredo configurado." };
    const secret = decryptSecret(integ.credentialsEncrypted);
    if (!secret) return { success: false, error: "Falha ao ler o segredo." };
    return { success: true, data: { secret } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("revealIntegrationSecret:", e);
    return { success: false, error: "Erro ao ler segredo." };
  }
}

/**
 * Importa produtos via CSV (texto colado). Formato por linha:
 * nome,sku,quantidade,preço[,categoria]. Importação real e idempotente por SKU.
 */
export async function importProductsCsv(csv: string): Promise<ActionResult<{ created: number; updated: number }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("estoque");
    const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { success: false, error: "CSV vazio." };

    let created = 0;
    let updated = 0;
    for (const line of lines) {
      const [name, sku, qty, price, category] = line.split(",").map((c) => c.trim());
      if (!name) continue;
      const quantity = Number(qty) || 0;
      const salePrice = Number(price) || 0;
      const existing = sku ? await prisma.product.findFirst({ where: { companyId, sku } }) : null;
      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data: { name, quantity, salePrice, category: category || existing.category } });
        await prisma.inventoryMovement.create({ data: { productId: existing.id, companyId, type: "ADJUST", quantity, source: "import" } });
        updated++;
      } else {
        await prisma.product.create({ data: { companyId, name, sku: sku || null, quantity, salePrice, category: category || null } });
        created++;
      }
    }
    await logAudit({ companyId, userId, action: "IMPORT_CSV", entity: "Product", metadata: { created, updated } });
    revalidatePath("/app/estoque");
    revalidatePath("/app/integracoes");
    return { success: true, data: { created, updated } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("importProductsCsv:", e);
    return { success: false, error: "Erro ao importar CSV." };
  }
}
