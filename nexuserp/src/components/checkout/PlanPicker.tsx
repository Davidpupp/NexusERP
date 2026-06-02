"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PLANS } from "@/data/plans";
import { PlanCard } from "@/components/checkout/PlanCard";

/**
 * Tela interativa de escolha de plano (passo 1 do checkout). Mostra os planos
 * pagos como cards reativos ao mouse. Selecionar leva ao formulário de dados
 * com o plano definido na URL (?plano=<slug>).
 */
export function PlanPicker({ selectedSlug }: { readonly selectedSlug?: string | null }) {
  const router = useRouter();
  const plans = PLANS.filter((p) => p.price > 0);

  return (
    <div className="pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="font-sora text-2xl font-bold tracking-tight text-ice-white sm:text-3xl">
          Escolha o plano ideal para o seu negócio
        </h1>
        <p className="mt-2 text-d-on-surface-variant">
          Comece em minutos, sem fidelidade. Você pode mudar de plano quando quiser.
        </p>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2 sm:gap-7">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            popular={plan.isPopular}
            preselected={plan.slug === selectedSlug}
            index={i}
            onSelect={() => router.push(`/checkout?plano=${plan.slug}&step=dados`)}
          />
        ))}
      </div>
    </div>
  );
}
