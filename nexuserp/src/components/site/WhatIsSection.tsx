import { Boxes, LineChart, Wallet, Users, FileBarChart, Plug } from "lucide-react";

const PILLARS = [
  { icon: Wallet, label: "Financeiro" },
  { icon: LineChart, label: "Vendas" },
  { icon: Boxes, label: "Estoque" },
  { icon: Users, label: "Clientes" },
  { icon: FileBarChart, label: "Relatórios" },
  { icon: Plug, label: "Integrações" },
];

export function WhatIsSection() {
  return (
    <section id="sobre" className="py-24 bg-pub-surface border-t border-pub-border">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">O que é a NexusERP</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-5 text-balance">
            Um ERP moderno que centraliza a gestão da empresa em uma única plataforma.
          </h2>
          <p className="text-lg text-pub-muted leading-relaxed mb-4">
            A NexusERP reúne as áreas que hoje vivem em planilhas, sistemas separados e
            processos manuais. Tudo conectado, em tempo real, com dados que conversam entre si.
          </p>
          <p className="text-pub-muted leading-relaxed">
            O objetivo é direto: organizar vendas, estoque, financeiro, clientes e relatórios
            para que decisões sejam tomadas com informação confiável — não com achismo.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PILLARS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-pub-bg border border-pub-border"
            >
              <div className="w-11 h-11 rounded-xl bg-electric/15 flex items-center justify-center">
                <Icon size={20} className="text-electric" />
              </div>
              <span className="text-sm font-medium text-pub-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
