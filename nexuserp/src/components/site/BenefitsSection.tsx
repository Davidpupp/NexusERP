import { Gauge, Wallet, Boxes, BarChart3, Plug, Rocket } from "lucide-react";

const BENEFITS = [
  { icon: Gauge, title: "Controle completo", description: "Visão centralizada da operação em uma única plataforma — sem dados espalhados em planilhas e sistemas soltos." },
  { icon: Wallet, title: "Mais clareza financeira", description: "Acompanhe entradas, saídas, contas a pagar e a receber e fluxo de caixa com mais precisão e em tempo real." },
  { icon: Boxes, title: "Estoque organizado", description: "Reduza perdas, evite rupturas e acompanhe movimentações por origem — manual, venda, importação ou integração." },
  { icon: BarChart3, title: "Decisões com dados", description: "Relatórios e dashboards alimentados pela operação real, para entender o desempenho do negócio sem retrabalho." },
  { icon: Plug, title: "Integrações preparadas", description: "Arquitetura pronta para conectar bancos, e-commerce, sites e sistemas externos conforme a sua necessidade." },
  { icon: Rocket, title: "Escalabilidade", description: "Plataforma pensada para crescer: novos módulos e, futuramente, aplicativos mobile e desktop." },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-24 bg-pub-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Benefícios</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">Por que vale a pena contratar</h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            Menos trabalho manual, mais visão do negócio e uma base preparada para crescer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl bg-pub-surface border border-pub-border hover:border-electric/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-electric/15 flex items-center justify-center mb-4">
                <Icon size={22} className="text-electric" />
              </div>
              <h3 className="text-base font-semibold text-pub-text mb-2">{title}</h3>
              <p className="text-sm text-pub-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
