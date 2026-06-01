"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, RefreshCw, Plug, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getBankConnectToken, saveBankConnection, syncBankConnection, deleteBankConnection } from "@/actions/bank";

interface PluggyConnectCtor {
  new (opts: { connectToken: string; onSuccess: (data: { item: { id: string } }) => void; onError?: () => void }): {
    init: () => void;
  };
}
declare global {
  interface Window {
    PluggyConnect?: PluggyConnectCtor;
  }
}

interface BankConn {
  id: string;
  institutionName: string | null;
  status: string;
  lastSyncAt: string | null;
}

function loadPluggyScript(): Promise<void> {
  if (window.PluggyConnect) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar Pluggy Connect"));
    document.head.appendChild(s);
  });
}

export function BankPanel({ enabled, connections }: { readonly enabled: boolean; readonly connections: BankConn[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const connect = async () => {
    setBusy("connect");
    const res = await getBankConnectToken();
    if (!res.success) { setBusy(null); toast.error(res.error); return; }
    try {
      await loadPluggyScript();
      if (!window.PluggyConnect) throw new Error("Pluggy indisponível");
      const widget = new window.PluggyConnect({
        connectToken: res.data.token,
        onSuccess: async (data) => {
          const save = await saveBankConnection(data.item.id);
          setBusy(null);
          if (save.success) { toast.success("Banco conectado"); router.refresh(); }
          else toast.error(save.error);
        },
        onError: () => { setBusy(null); toast.error("Conexão cancelada"); },
      });
      widget.init();
    } catch (e) {
      setBusy(null);
      toast.error(e instanceof Error ? e.message : "Erro ao conectar banco");
    }
  };

  const sync = async (id: string) => {
    setBusy(id);
    const res = await syncBankConnection(id);
    setBusy(null);
    if (res.success) { toast.success(`${res.data.imported} transações sincronizadas`); router.refresh(); }
    else toast.error(res.error);
  };

  const disconnect = async (id: string) => {
    setBusy(id);
    const res = await deleteBankConnection(id);
    setBusy(null);
    if (res.success) { toast.success("Desconectado"); router.refresh(); }
    else toast.error(res.error);
  };

  return (
    <div className="card-dark p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-nexus-yellow" />
          <h3 className="text-sm font-semibold text-ice-white">Bancos conectados (Open Finance)</h3>
        </div>
        {enabled && (
          <button
            onClick={connect}
            disabled={busy === "connect"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all"
          >
            {busy === "connect" ? <Loader2 size={14} className="animate-spin" /> : <Plug size={14} />}
            Conectar banco
          </button>
        )}
      </div>

      {!enabled ? (
        <p className="text-xs text-d-on-surface-variant">
          Configure <span className="font-mono">PLUGGY_CLIENT_ID</span> e <span className="font-mono">PLUGGY_CLIENT_SECRET</span> para puxar transações automaticamente.
        </p>
      ) : connections.length === 0 ? (
        <p className="text-xs text-d-on-surface-variant">Nenhum banco conectado. Clique em “Conectar banco” para sincronizar suas transações.</p>
      ) : (
        <ul className="divide-y divide-d-border">
          {connections.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-ice-white">{c.institutionName ?? "Banco"}</p>
                <p className="text-xs text-d-on-surface-variant">
                  {c.lastSyncAt ? `Última sync: ${new Date(c.lastSyncAt).toLocaleString("pt-BR")}` : "Nunca sincronizado"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => sync(c.id)} disabled={busy === c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ice-white border border-d-border hover:bg-d-surface-container disabled:opacity-60 transition-all">
                  {busy === c.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Sincronizar
                </button>
                <button onClick={() => disconnect(c.id)} disabled={busy === c.id} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container transition-colors" title="Desconectar">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
