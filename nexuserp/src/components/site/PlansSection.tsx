import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { PLANS } from "@/data/plans";
import { formatCurrency } from "@/lib/utils";

export function PlansSection() {
  return (
    <section id="planos" className="py-24 bg-pub-bg border-t border-pub-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Planos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">
            Escolha o plano ideal para o seu negócio
          </h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            Sem taxas ocultas. Migre de plano conforme crescer. Sistema pago, acesso liberado após a contratação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.isPopular
                  ? "bg-pub-text text-pub-bg shadow-2xl md:scale-105"
                  : "bg-pub-surface border border-pub-border shadow-sm"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric text-pub-on-accent text-xs font-bold">
                  <Zap size={12} />
                  Mais escolhido
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.isPopular ? "text-pub-bg" : "text-pub-text"}`}>
                  {plan.name}
                </h3>
                {plan.price > 0 ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.isPopular ? "text-electric" : "text-pub-text"}`}>
                        {formatCurrency(plan.price)}
                      </span>
                      <span className={plan.isPopular ? "text-sm text-pub-bg/60" : "text-sm text-pub-muted"}>/mês</span>
                    </div>
                    {plan.setupFee > 0 && (
                      <p className={`text-sm mt-1 ${plan.isPopular ? "text-pub-bg/60" : "text-pub-muted"}`}>
                        + {formatCurrency(plan.setupFee)} de implantação
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-pub-text">Sob consulta</p>
                    <p className="text-sm text-pub-muted mt-1">Personalizamos para você</p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-electric/20">
                      <Check size={11} className="text-electric" />
                    </div>
                    <span className={`text-sm ${plan.isPopular ? "text-pub-bg/80" : "text-pub-muted"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.slug === "enterprise" ? "/adquirir" : `/checkout?plano=${plan.slug}`}
                className={`w-full py-3 rounded-full text-center text-sm font-semibold transition-all duration-200 ${
                  plan.isPopular
                    ? "bg-electric text-pub-on-accent hover:bg-electric-strong"
                    : "border border-pub-border text-pub-text hover:bg-pub-elevated"
                }`}
              >
                {plan.slug === "enterprise" ? "Falar com especialista" : "Assinar agora"}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-pub-muted mt-8">
          Valor mensal, sem taxa de implantação. Sistema pago, sem teste gratuito — o acesso é liberado após a contratação.
        </p>
      </div>
    </section>
  );
}
