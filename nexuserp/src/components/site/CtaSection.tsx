import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-pub-bg border-t border-pub-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-pub-text px-6 py-16 text-center">
          {/* Glow elétrico */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40"
            style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--color-electric), transparent 70%)" }}
          />
          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-electric/20 mb-6">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <path d="M8 8 L22 24 L8 40" stroke="var(--color-electric)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M40 8 L26 24 L40 40" stroke="var(--color-electric)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M40 8 L24 24" stroke="#C7CCD1" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M8 40 L24 24" stroke="#C7CCD1" strokeWidth="5" strokeLinecap="round" fill="none" />
                <circle cx="24" cy="24" r="5" fill="#C7CCD1" />
              </svg>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-pub-bg mb-4 text-balance">
              Pronto para organizar sua empresa com uma gestão mais clara e conectada?
            </h2>
            <p className="text-lg text-pub-bg/70 mb-10">
              A NexusERP é uma solução paga, desenvolvida para empresas que querem controle real
              sobre vendas, estoque, financeiro e crescimento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/checkout?plano=growth"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-pub-on-accent bg-electric hover:bg-electric-strong transition-all duration-200 shadow-lg shadow-electric/30 hover:scale-[1.02]"
              >
                Assinar agora
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/adquirir"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-pub-bg border border-pub-bg/20 hover:bg-pub-bg/10 transition-all duration-200"
              >
                Falar com a equipe
              </Link>
            </div>

            <p className="text-pub-bg/40 text-sm mt-6">
              A partir de R$ 89/mês • sem taxa de implantação • cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
