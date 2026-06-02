"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PlanPicker } from "@/components/checkout/PlanPicker";
import { PLANS } from "@/data/plans";
import { checkoutFormSchema, type CheckoutFormData } from "@/lib/validations";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 focus:bg-graphite-surface transition-all";
const labelClass = "block text-xs font-medium text-d-on-surface-variant mb-1.5";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plano");

  // A tela de escolha SEMPRE aparece primeiro (passo 1) — inclusive vindo de CTA
  // com ?plano=. Só avança ao formulário quando o plano foi confirmado no card
  // (marcador step=dados, definido pelo próprio PlanPicker).
  const confirmed = searchParams.get("step") === "dados";
  if (!confirmed) {
    return (
      <CheckoutShell step={1}>
        <PlanPicker selectedSlug={planParam} />
      </CheckoutShell>
    );
  }

  // Plano confirmado → formulário de dados (passo 2).
  const selectedPlan = PLANS.find((p) => p.slug === planParam && p.price > 0) ?? PLANS[1];
  return <CheckoutForm selectedPlan={selectedPlan} />;
}

function CheckoutForm({ selectedPlan }: { readonly selectedPlan: (typeof PLANS)[number] }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { planId: selectedPlan.slug },
  });

  const onSubmit = (data: CheckoutFormData) => {
    const params = new URLSearchParams({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.companyName,
      cnpj: data.cnpj ?? "",
      plan: data.planId,
    });
    router.push(`/checkout/pagamento?${params.toString()}`);
  };

  return (
    <CheckoutShell step={2}>
      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-3"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-ice-white font-sora tracking-tight">
            Falta pouco para começar a crescer com controle.
          </h1>
          <p className="text-d-on-surface-variant mt-2 mb-8">
            Preencha seus dados — você ativa o sistema em minutos, sem fidelidade.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...register("planId")} />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nome completo *</label>
                <input {...register("name")} placeholder="João Silva" className={inputClass} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>E-mail corporativo *</label>
                <input {...register("email")} type="email" placeholder="joao@empresa.com.br" className={inputClass} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Telefone / WhatsApp *</label>
                <input {...register("phone")} placeholder="(11) 99999-9999" className={inputClass} />
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Nome da empresa *</label>
                <input {...register("companyName")} placeholder="Minha Empresa Ltda" className={inputClass} />
                {errors.companyName && <p className="text-xs text-danger mt-1">{errors.companyName.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>CNPJ</label>
              <input {...register("cnpj")} placeholder="00.000.000/0001-00" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full py-4 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:shadow-glow"
            >
              {isSubmitting ? "Aguarde..." : "Ir para o pagamento"}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <OrderSummary plan={selectedPlan} />
        </motion.div>
      </div>
    </CheckoutShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
