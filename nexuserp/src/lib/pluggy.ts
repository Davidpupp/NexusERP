import "server-only";
import { env } from "@/lib/env";

/**
 * Cliente mínimo da Pluggy (Open Finance Brasil) — sem SDK, via fetch.
 * Docs: https://docs.pluggy.ai
 */
const PLUGGY_API = "https://api.pluggy.ai";

async function getApiKey(): Promise<string> {
  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: env.PLUGGY_CLIENT_ID, clientSecret: env.PLUGGY_CLIENT_SECRET }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Pluggy auth ${res.status}: ${data?.message ?? "erro"}`);
  return data.apiKey as string;
}

/** Token de conexão para o widget Pluggy Connect no client. */
export async function createConnectToken(): Promise<string> {
  const apiKey = await getApiKey();
  const res = await fetch(`${PLUGGY_API}/connect_token`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Pluggy connect_token ${res.status}`);
  return data.accessToken as string;
}

export interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "CREDIT" | "DEBIT";
  category: string | null;
}

/** Lista as transações de todas as contas de um item bancário. */
export async function fetchItemTransactions(itemId: string): Promise<{
  institutionName: string | null;
  transactions: PluggyTransaction[];
}> {
  const apiKey = await getApiKey();
  const headers = { "X-API-KEY": apiKey };

  const item = await (await fetch(`${PLUGGY_API}/items/${itemId}`, { headers, cache: "no-store" })).json();
  const institutionName: string | null = item?.connector?.name ?? null;

  const accountsRes = await fetch(`${PLUGGY_API}/accounts?itemId=${itemId}`, { headers, cache: "no-store" });
  const accounts = (await accountsRes.json())?.results ?? [];

  const transactions: PluggyTransaction[] = [];
  for (const acc of accounts) {
    const txRes = await fetch(`${PLUGGY_API}/transactions?accountId=${acc.id}&pageSize=200`, { headers, cache: "no-store" });
    const txs = (await txRes.json())?.results ?? [];
    for (const t of txs) {
      transactions.push({
        id: t.id,
        description: t.description ?? "Transação bancária",
        amount: Math.abs(t.amount ?? 0),
        date: t.date,
        type: (t.amount ?? 0) >= 0 ? "CREDIT" : "DEBIT",
        category: t.category ?? null,
      });
    }
  }
  return { institutionName, transactions };
}
