"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, ShoppingCart, Globe, Webhook, FileSpreadsheet, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/ui/form";
import { saveIntegration, revealIntegrationSecret, importProductsCsv, type IntegrationType } from "@/actions/integration";

interface TypeState { status: string; config: Record<string, unknown>; lastSyncAt: string | null }

const STATUS: Record<string, { label: string; cls: string }> = {
  not_connected: { label: "Não conectado", cls: "bg-d-surface-high text-d-on-surface-variant" },
  pending_configuration: { label: "Configuração pendente", cls: "bg-warning/15 text-warning" },
  connected: { label: "Conectado", cls: "bg-success/15 text-success" },
  syncing: { label: "Sincronizando", cls: "bg-info/15 text-info" },
  sync_error: { label: "Erro na sincronização", cls: "bg-danger/15 text-danger" },
  disabled: { label: "Desativado", cls: "bg-d-surface-high text-d-on-surface-variant" },
};

function Pill({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.not_connected;
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

const CARDS: { type: IntegrationType; title: string; desc: string; icon: typeof Landmark }[] = [
  { type: "bank", title: "Bancos", desc: "Open Finance / extratos para conciliação e fluxo de caixa.", icon: Landmark },
  { type: "ecommerce", title: "E-commerce", desc: "Receba pedidos por webhook, baixe estoque e gere financeiro automaticamente.", icon: ShoppingCart },
  { type: "website", title: "Site próprio", desc: "Conecte um site/loja própria via API para análise de vendas.", icon: Globe },
  { type: "api", title: "APIs externas", desc: "Integre sistemas externos por API com token seguro.", icon: Webhook },
  { type: "webhook", title: "Webhooks", desc: "Endpoint seguro e idempotente para eventos externos.", icon: Webhook },
  { type: "import", title: "Importação de dados", desc: "Importe produtos em massa via CSV.", icon: FileSpreadsheet },
];

export function IntegrationsManager({
  companyId,
  appUrl,
  byType,
  bankConnected,
}: {
  readonly companyId: string;
  readonly appUrl: string;
  readonly byType: Record<string, TypeState>;
  readonly bankConnected: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<IntegrationType | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState<string | null>(null);
  const [csv, setCsv] = useState("");

  const statusOf = (type: IntegrationType): string => {
    if (type === "bank") return bankConnected ? "connected" : byType.bank?.status ?? "not_connected";
    return byType[type]?.status ?? "not_connected";
  };

  const ecommerceWebhookUrl = `${appUrl}/api/webhooks/ecommerce?c=${companyId}`;

  const openModal = (type: IntegrationType) => {
    const cfg = byType[type]?.config ?? {};
    setFields({
      storeUrl: (cfg.storeUrl as string) ?? "",
      platform: (cfg.platform as string) ?? "",
      siteUrl: (cfg.siteUrl as string) ?? "",
      baseUrl: (cfg.baseUrl as string) ?? "",
      token: "",
    });
    setSecret(null);
    setCsv("");
    setModal(type);
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado"); };

  const reveal = async (type: IntegrationType) => {
    const res = await revealIntegrationSecret(type);
    if (res.success) setSecret(res.data.secret);
    else toast.error(res.error);
  };

  const save = async (type: IntegrationType) => {
    setBusy(true);
    let config: Record<string, unknown> = {};
    let typedSecret: string | undefined;
    if (type === "ecommerce") config = { storeUrl: fields.storeUrl, platform: fields.platform };
    else if (type === "website") { config = { siteUrl: fields.siteUrl }; typedSecret = fields.token || undefined; }
    else if (type === "api") { config = { baseUrl: fields.baseUrl }; typedSecret = fields.token || undefined; }
    const res = await saveIntegration({ type, config, secret: typedSecret });
    setBusy(false);
    if (res.success) {
      if (res.data.secret) setSecret(res.data.secret);
      toast.success("Integração salva");
      router.refresh();
    } else toast.error(res.error);
  };

  const runImport = async () => {
    setBusy(true);
    const res = await importProductsCsv(csv);
    setBusy(false);
    if (res.success) { toast.success(`Importado: ${res.data.created} novos, ${res.data.updated} atualizados`); setModal(null); router.refresh(); }
    else toast.error(res.error);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-ice-white">Integrações</h2>
        <p className="text-sm text-d-on-surface-variant">Conecte bancos, e-commerce, sites e APIs. Estados refletem a configuração real — nada é fingido.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map(({ type, title, desc, icon: Icon }) => {
          const st = statusOf(type);
          const last = byType[type]?.lastSyncAt;
          return (
            <div key={type} className="bg-graphite-surface rounded-xl border border-d-border p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-nexus-yellow/10 flex items-center justify-center">
                  <Icon size={20} className="text-nexus-yellow" />
                </div>
                <Pill status={st} />
              </div>
              <h3 className="text-sm font-semibold text-ice-white mb-1">{title}</h3>
              <p className="text-xs text-d-on-surface-variant leading-relaxed flex-1">{desc}</p>
              {last && <p className="text-[11px] text-d-on-surface-variant mt-2">Última sincronização: {last}</p>}
              <div className="mt-4">
                {type === "bank" ? (
                  <Link href="/app/financeiro" className="inline-flex items-center gap-1.5 text-xs font-semibold text-nexus-yellow hover:text-nexus-yellow-dim">
                    Configurar no Financeiro <ExternalLink size={13} />
                  </Link>
                ) : (
                  <button onClick={() => openModal(type)} className="text-xs font-semibold text-nexus-yellow hover:text-nexus-yellow-dim">
                    Configurar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modal !== null} onOpenChange={(o) => !o && setModal(null)} title={`Configurar — ${CARDS.find((c) => c.type === modal)?.title ?? ""}`}>
        <div className="space-y-4">
          {modal === "ecommerce" && (
            <>
              <Field label="URL da loja"><TextInput value={fields.storeUrl} onChange={(e) => setFields((f) => ({ ...f, storeUrl: e.target.value }))} placeholder="https://minhaloja.com.br" /></Field>
              <Field label="Plataforma"><TextInput value={fields.platform} onChange={(e) => setFields((f) => ({ ...f, platform: e.target.value }))} placeholder="Shopify, WooCommerce, própria…" /></Field>
              <div>
                <p className="text-xs font-medium text-d-on-surface-variant mb-1.5">URL do webhook (configure na sua loja)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-ice-white bg-d-surface-container border border-d-border rounded-lg px-3 py-2 break-all">{ecommerceWebhookUrl}</code>
                  <button onClick={() => copy(ecommerceWebhookUrl)} className="p-2 text-d-on-surface-variant hover:text-ice-white" title="Copiar"><Copy size={14} /></button>
                </div>
              </div>
              {secret ? (
                <div>
                  <p className="text-xs font-medium text-d-on-surface-variant mb-1.5">Segredo (header <code>x-webhook-secret</code>) — guarde agora</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-success bg-d-surface-container border border-d-border rounded-lg px-3 py-2 break-all">{secret}</code>
                    <button onClick={() => copy(secret)} className="p-2 text-d-on-surface-variant hover:text-ice-white" title="Copiar"><Copy size={14} /></button>
                  </div>
                </div>
              ) : (
                byType.ecommerce && <button onClick={() => reveal("ecommerce")} className="text-xs font-medium text-nexus-yellow hover:underline">Revelar segredo atual</button>
              )}
              <p className="text-xs text-d-on-surface-variant">Ao salvar, geramos o segredo na primeira vez. Pedidos recebidos viram vendas com baixa de estoque e financeiro automáticos.</p>
            </>
          )}

          {(modal === "website" || modal === "api") && (
            <>
              <Field label={modal === "website" ? "URL do site" : "URL base da API"}>
                <TextInput
                  value={modal === "website" ? fields.siteUrl : fields.baseUrl}
                  onChange={(e) => setFields((f) => ({ ...f, [modal === "website" ? "siteUrl" : "baseUrl"]: e.target.value }))}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Token / chave de API (opcional)"><TextInput type="password" value={fields.token} onChange={(e) => setFields((f) => ({ ...f, token: e.target.value }))} placeholder="Armazenado criptografado" /></Field>
              <p className="text-xs text-d-on-surface-variant">Credenciais ficam criptografadas. A sincronização ativa depende de conector específico (ainda em configuração).</p>
            </>
          )}

          {modal === "webhook" && (
            <>
              <div>
                <p className="text-xs font-medium text-d-on-surface-variant mb-1.5">Endpoint de e-commerce (idempotente)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-ice-white bg-d-surface-container border border-d-border rounded-lg px-3 py-2 break-all">{ecommerceWebhookUrl}</code>
                  <button onClick={() => copy(ecommerceWebhookUrl)} className="p-2 text-d-on-surface-variant hover:text-ice-white" title="Copiar"><Copy size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-d-on-surface-variant">Configure o e-commerce para gerar o segredo. Eventos são validados, deduplicados e registrados em log.</p>
            </>
          )}

          {modal === "import" && (
            <>
              <Field label="CSV de produtos">
                <TextArea value={csv} onChange={(e) => setCsv(e.target.value)} rows={6} placeholder={"nome,sku,quantidade,preço,categoria\nCamiseta,CAM-001,50,79.90,Vestuário"} />
              </Field>
              <p className="text-xs text-d-on-surface-variant">Uma linha por produto. Atualiza por SKU (idempotente) ou cria novos. Gera movimentação de estoque.</p>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setModal(null)}>Fechar</GhostButton>
            {modal === "import" ? (
              <PrimaryButton type="button" onClick={runImport} disabled={busy}>{busy ? "Importando..." : "Importar"}</PrimaryButton>
            ) : modal === "webhook" ? null : (
              <PrimaryButton type="button" onClick={() => modal && save(modal)} disabled={busy}>{busy ? "Salvando..." : "Salvar"}</PrimaryButton>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
