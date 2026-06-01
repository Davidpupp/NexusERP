import Link from "next/link";
import { ArrowRight, ShieldCheck, Building2, Layers } from "lucide-react";

const KPI_LABELS = ["Receita Total", "Pedidos", "Clientes Ativos", "Margem Bruta"];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-pub-bg">
      {/* Glow elétrico de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-electric) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-electric) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/15 text-pub-text text-xs font-medium mb-6 border border-electric/30">
            <span className="w-1.5 h-1.5 rounded-full bg-electric"></span>
            Plataforma de gestão empresarial para o mercado brasileiro
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-pub-text leading-tight mb-6 text-balance">
            Gestão empresarial completa para empresas que querem{" "}
            <span className="text-electric">controle, clareza e crescimento.</span>
          </h1>

          <p className="text-lg text-pub-muted leading-relaxed mb-8 max-w-lg">
            A NexusERP centraliza vendas, estoque, financeiro, clientes, relatórios e integrações
            em um único sistema profissional, seguro e preparado para crescer junto com a sua operação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/checkout?plano=growth"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-pub-on-accent bg-electric hover:bg-electric-strong transition-all duration-200 shadow-lg shadow-electric/30 hover:shadow-electric/50 hover:scale-[1.02]"
            >
              Assinar agora
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/adquirir"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-pub-text border border-pub-border hover:bg-pub-elevated transition-all duration-200"
            >
              Falar com a equipe
            </Link>
          </div>

          <p className="mt-4 text-sm text-pub-muted">
            A partir de <span className="font-semibold text-pub-text">R$ 89/mês</span> · sem taxa de implantação · cancele quando quiser
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-pub-muted">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-electric" /> Seguro e conforme a LGPD</span>
            <span className="inline-flex items-center gap-2"><Building2 size={16} className="text-electric" /> Multiempresa</span>
            <span className="inline-flex items-center gap-2"><Layers size={16} className="text-electric" /> Módulos integrados</span>
          </div>
        </div>

        {/* Mockup do dashboard */}
        <div className="relative">
          <div className="bg-pub-surface rounded-2xl shadow-2xl border border-pub-border overflow-hidden">
            <div className="bg-pub-elevated px-4 py-3 flex items-center gap-2 border-b border-pub-border">
              <div className="w-3 h-3 rounded-full bg-danger/60"></div>
              <div className="w-3 h-3 rounded-full bg-warning/60"></div>
              <div className="w-3 h-3 rounded-full bg-success/60"></div>
              <div className="flex-1 mx-4 bg-pub-surface rounded px-3 py-1 text-xs text-pub-muted">
                app.nexuserp.com.br/dashboard
              </div>
            </div>

            <div className="flex">
              <div className="w-14 bg-pub-bg border-r border-pub-border p-2 flex flex-col gap-2">
                {["🏠", "💰", "🛒", "📦", "👥", "⚙️"].map((icon, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-base ${i === 0 ? "bg-electric/20" : ""}`}
                  >
                    {icon}
                  </div>
                ))}
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-pub-muted">Dashboard</p>
                    <p className="text-sm font-semibold text-pub-text">Visão Geral</p>
                  </div>
                  <div className="text-xs text-pub-muted bg-pub-elevated px-2 py-1 rounded">Tempo real</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {KPI_LABELS.map((label) => (
                    <div key={label} className="bg-pub-surface rounded-lg p-3 border border-pub-border">
                      <p className="text-xs text-pub-muted mb-1.5">{label}</p>
                      <div className="h-3.5 w-16 rounded bg-pub-text/10 mb-1.5" />
                      <div className="h-2 w-10 rounded bg-electric/40" />
                    </div>
                  ))}
                </div>

                <div className="bg-pub-surface rounded-lg p-3 border border-pub-border">
                  <p className="text-xs font-semibold text-pub-text mb-2">Receita x Despesa</p>
                  <svg viewBox="0 0 220 60" className="w-full h-10">
                    <polyline points="0,45 44,38 88,40 132,28 176,30 220,18" fill="none" stroke="var(--color-electric)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="0,52 44,48 88,50 132,42 176,44 220,38" fill="none" stroke="var(--color-pub-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Cartões flutuantes (sem dados fabricados) */}
          <div className="absolute -bottom-4 -left-4 bg-pub-surface rounded-xl p-3 shadow-lg border border-pub-border">
            <p className="text-xs text-pub-muted mb-1.5">Pedido aprovado</p>
            <div className="h-3.5 w-20 rounded bg-success/25" />
          </div>
          <div className="absolute -top-4 -right-4 bg-electric rounded-xl p-3 shadow-lg">
            <p className="text-xs text-pub-on-accent/70 font-medium mb-1.5">Estoque sincronizado</p>
            <div className="h-3.5 w-20 rounded bg-pub-on-accent/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
