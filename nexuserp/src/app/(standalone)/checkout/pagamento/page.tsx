"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Copy, Check, CreditCard, QrCode, FileText, Loader2 } from "lucide-react";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PLANS } from "@/data/plans";
import { creditCardSchema, type CreditCardFormData } from "@/lib/validations";
import { processCheckout, getOrderStatus } from "@/actions/checkout";
import { createActivationToken } from "@/actions/account";
import { tokenizeCard } from "@/lib/mp-client";
import { formatCurrency, cn } from "@/lib/utils";

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 focus:bg-graphite-surface transition-all";
const labelClass = "block text-xs font-medium text-d-on-surface-variant mb-1.5";

type PaymentTab = "card" | "pix" | "boleto";

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<PaymentTab>("card");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; ticketUrl: string } | null>(null);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const name = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const company = searchParams.get("company") ?? "";
  const cnpj = searchParams.get("cnpj") ?? "";
  const planSlug = searchParams.get("plan") ?? "growth";
  const selectedPlan = PLANS.find((p) => p.slug === planSlug) ?? PLANS[1];
  const total = selectedPlan.price + selectedPlan.setupFee;

  // Pós-pagamento: gera token de ativação e leva à criação de senha + auto-login.
  const goActivate = async (orderId: string) => {
    const tok = await createActivationToken(orderId);
    if (tok.success) {
      router.push(`/ativar?token=${tok.data.token}&plan=${encodeURIComponent(selectedPlan.name)}`);
    } else {
      router.push(`/checkout/sucesso?order=${orderId}&plan=${encodeURIComponent(selectedPlan.name)}`);
    }
  };

  useEffect(() => {
    if (!pixOrderId) return;
    pollRef.current = setInterval(async () => {
      const res = await getOrderStatus(pixOrderId);
      if (res.success && res.data.status === "PAID") {
        if (pollRef.current) clearInterval(pollRef.current);
        await goActivate(pixOrderId);
      } else if (res.success && res.data.status === "FAILED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setError("Pagamento recusado. Tente novamente.");
        setPixData(null);
        setPixOrderId(null);
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixOrderId]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
  });

  const handleCopy = () => {
    const code =
      pixData?.qrCode ??
      "00020126580014BR.GOV.BCB.PIX0136nexuserp@nexuserp.com.br5204000053039865802BR5925nexusERP Pagamentos SA6009SAO PAULO62070503***63041D3D";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePayment = async (
    method: "CREDIT_CARD" | "PIX" | "BOLETO",
    card?: { token: string; installments: number; paymentMethodId: string; docType: string; docNumber: string }
  ) => {
    setProcessing(true);
    setError(null);
    const result = await processCheckout({ name, email, phone, companyName: company, cnpj, planId: planSlug, paymentMethod: method, card });
    if (result.success) {
      if (result.data.pix) {
        setPixData(result.data.pix);
        setPixOrderId(result.data.orderId);
        setProcessing(false);
        return;
      }
      await goActivate(result.data.orderId);
    } else {
      setError(result.error);
      setProcessing(false);
    }
  };

  const onCardSubmit = async (data: CreditCardFormData) => {
    if (!MP_PUBLIC_KEY) {
      await handlePayment("CREDIT_CARD");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const card = await tokenizeCard(MP_PUBLIC_KEY, data);
      await handlePayment("CREDIT_CARD", card);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar cartão.");
      setProcessing(false);
    }
  };

  const TABS = [
    { id: "card" as PaymentTab, label: "Cartão", icon: CreditCard },
    { id: "pix" as PaymentTab, label: "Pix", icon: QrCode },
    { id: "boleto" as PaymentTab, label: "Boleto", icon: FileText },
  ];

  return (
    <CheckoutShell step={3}>
      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-3"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-ice-white font-sora tracking-tight mb-1">Pagamento</h1>
          <p className="text-d-on-surface-variant mb-7">Acesso liberado automaticamente após a confirmação.</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-d-surface-container/60 border border-d-border">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active ? "bg-nexus-yellow text-absolute-black shadow-glow" : "text-d-on-surface-variant hover:text-ice-white"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-4 mb-5 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger">{error}</div>
          )}

          {/* Card */}
          {activeTab === "card" && (
            <form onSubmit={handleSubmit(onCardSubmit)} className="space-y-4 card-dark p-6">
              <div>
                <label className={labelClass}>Número do cartão</label>
                <input {...register("cardNumber")} placeholder="0000 0000 0000 0000" className={inputClass} />
                {errors.cardNumber && <p className="text-xs text-danger mt-1">{errors.cardNumber.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Nome impresso no cartão</label>
                <input {...register("cardName")} placeholder="JOAO A SILVA" className={inputClass} />
                {errors.cardName && <p className="text-xs text-danger mt-1">{errors.cardName.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Validade</label>
                  <input {...register("expiry")} placeholder="MM/AA" className={inputClass} />
                  {errors.expiry && <p className="text-xs text-danger mt-1">{errors.expiry.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>CVV</label>
                  <input {...register("cvv")} placeholder="000" className={inputClass} />
                  {errors.cvv && <p className="text-xs text-danger mt-1">{errors.cvv.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Parcelas</label>
                  <select {...register("installments")} className={inputClass}>
                    <option value="1">1x sem juros</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                    <option value="6">6x sem juros</option>
                    <option value="12">12x sem juros</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>CPF/CNPJ do titular</label>
                  <input {...register("document")} placeholder="000.000.000-00" className={inputClass} />
                  {errors.document && <p className="text-xs text-danger mt-1">{errors.document.message}</p>}
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all hover:shadow-glow flex items-center justify-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                {processing ? "Processando…" : `Pagar ${formatCurrency(total)}`}
              </button>
            </form>
          )}

          {/* Pix */}
          {activeTab === "pix" && (
            <div className="card-dark p-8 text-center">
              {!pixData ? (
                <>
                  <div className="w-44 h-44 mx-auto bg-d-surface-container rounded-2xl flex items-center justify-center mb-6">
                    <QrCode size={56} className="text-d-on-surface-variant" />
                  </div>
                  <p className="text-base font-semibold text-ice-white mb-1">Pague com Pix em segundos</p>
                  <p className="text-xs text-d-on-surface-variant mb-6">Aprovação na hora — acesso liberado automaticamente.</p>
                  <button
                    onClick={() => handlePayment("PIX")}
                    disabled={processing}
                    className="w-full py-4 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all hover:shadow-glow flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 size={16} className="animate-spin" />}
                    {processing ? "Gerando código…" : "Gerar código Pix"}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center mb-6 p-2">
                    {pixData.qrCodeBase64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" className="w-full h-full" />
                    ) : (
                      <QrCode size={64} className="text-absolute-black" />
                    )}
                  </div>
                  <p className="text-base font-semibold text-ice-white mb-1">Escaneie para pagar</p>
                  <p className="text-xs text-d-on-surface-variant mb-5">Abra o app do seu banco e escaneie, ou copie o código.</p>
                  <div className="bg-d-surface-container rounded-lg p-3 text-xs text-d-on-surface-variant font-mono break-all mb-4">
                    {pixData.qrCode.slice(0, 64)}…
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-nexus-yellow text-absolute-black hover:bg-nexus-yellow-dim transition-all mb-5"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copiado!" : "Copiar código Pix"}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-xs text-d-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                    Aguardando confirmação do pagamento…
                  </p>
                </>
              )}
            </div>
          )}

          {/* Boleto */}
          {activeTab === "boleto" && (
            <div className="card-dark p-8">
              <div className="text-center mb-6">
                <FileText size={44} className="text-d-on-surface-variant mx-auto mb-3" />
                <p className="text-base font-semibold text-ice-white">Boleto bancário</p>
                <p className="text-xs text-d-on-surface-variant mt-1">Compensa em até 1 dia útil.</p>
              </div>
              <div className="bg-d-surface-container rounded-lg p-4 font-mono text-xs text-ice-white mb-6 text-center break-all">
                23793.01102 60000.000003 00000.014001 1 10000000169400
              </div>
              <button
                onClick={() => handlePayment("BOLETO")}
                disabled={processing}
                className="w-full py-4 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all"
              >
                {processing ? "Gerando boleto…" : "Gerar boleto"}
              </button>
              <p className="text-xs text-center text-d-on-surface-variant mt-4">Acesso liberado após a confirmação.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <OrderSummary plan={selectedPlan} showFeatures={false} />
          <div className="mt-3 px-1 space-y-1">
            {[name, email, company].filter(Boolean).map((v, i) => (
              <p key={i} className="text-xs text-d-on-surface-variant truncate">{v}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </CheckoutShell>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense>
      <PaymentForm />
    </Suspense>
  );
}
