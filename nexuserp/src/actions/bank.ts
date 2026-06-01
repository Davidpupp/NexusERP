"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isPluggyEnabled } from "@/lib/env";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { createConnectToken, fetchItemTransactions } from "@/lib/pluggy";
import { captureError } from "@/lib/logger";
import type { ActionResult } from "@/types";

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  return { success: false, error: msg };
}

/** Token p/ abrir o widget Pluggy Connect no client. */
export async function getBankConnectToken(): Promise<ActionResult<{ token: string }>> {
  if (!isPluggyEnabled) return { success: false, error: "Integração bancária não configurada." };
  try {
    await requireModuleMutation("financeiro");
    const token = await createConnectToken();
    return { success: true, data: { token } };
  } catch (e) {
    await captureError(e, { scope: "bank-connect-token" });
    return fail(e, "Erro ao iniciar conexão bancária.");
  }
}

/** Salva a conexão após o usuário concluir o widget (recebe o itemId). */
export async function saveBankConnection(itemId: string): Promise<ActionResult<{ id: string }>> {
  if (!isPluggyEnabled) return { success: false, error: "Integração bancária não configurada." };
  if (!itemId) return { success: false, error: "itemId ausente." };
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const { institutionName } = await fetchItemTransactions(itemId);
    const conn = await prisma.bankConnection.upsert({
      where: { itemId },
      create: { companyId, itemId, institutionName, status: "ACTIVE" },
      update: { institutionName, status: "ACTIVE" },
    });
    await logAudit({ companyId, userId, action: "BANK_CONNECT", entity: "BankConnection", entityId: conn.id });
    revalidatePath("/app/financeiro");
    return { success: true, data: { id: conn.id } };
  } catch (e) {
    await captureError(e, { scope: "bank-save" });
    return fail(e, "Erro ao salvar conexão.");
  }
}

/** Sincroniza transações do banco para o Financeiro (dedupe por externalId). */
export async function syncBankConnection(connectionId: string): Promise<ActionResult<{ imported: number }>> {
  if (!isPluggyEnabled) return { success: false, error: "Integração bancária não configurada." };
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const conn = await prisma.bankConnection.findFirst({ where: { id: connectionId, companyId } });
    if (!conn) return { success: false, error: "Conexão não encontrada." };

    const { transactions } = await fetchItemTransactions(conn.itemId);
    let imported = 0;
    for (const t of transactions) {
      const res = await prisma.transaction.upsert({
        where: { companyId_externalId: { companyId, externalId: t.id } },
        create: {
          companyId,
          description: t.description,
          category: t.category || "Banco",
          type: t.type === "CREDIT" ? "INCOME" : "EXPENSE",
          amount: t.amount,
          status: "PAID",
          method: "Open Finance",
          paidAt: t.date ? new Date(t.date) : new Date(),
          externalId: t.id,
          source: "pluggy",
        },
        update: {}, // já importada — não sobrescreve edições manuais
      });
      if (res.source === "pluggy" && res.externalId === t.id) imported += 1;
    }

    await prisma.bankConnection.update({ where: { id: conn.id }, data: { lastSyncAt: new Date() } });
    await logAudit({ companyId, userId, action: "BANK_SYNC", entity: "BankConnection", entityId: conn.id });
    revalidatePath("/app/financeiro");
    return { success: true, data: { imported } };
  } catch (e) {
    await captureError(e, { scope: "bank-sync" });
    return fail(e, "Erro ao sincronizar transações.");
  }
}

export async function deleteBankConnection(connectionId: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const res = await prisma.bankConnection.deleteMany({ where: { id: connectionId, companyId } });
    if (res.count === 0) return { success: false, error: "Conexão não encontrada." };
    await logAudit({ companyId, userId, action: "BANK_DISCONNECT", entity: "BankConnection", entityId: connectionId });
    revalidatePath("/app/financeiro");
    return { success: true, data: null };
  } catch (e) {
    await captureError(e, { scope: "bank-delete" });
    return fail(e, "Erro ao desconectar.");
  }
}
