import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AcquireForm } from "@/components/site/AcquireForm";

export const metadata: Metadata = {
  title: "Adquirir nossos serviços | NexusERP",
  description:
    "Fale com a equipe NexusERP para contratar a plataforma de gestão empresarial. Sistema pago, com acesso liberado após a contratação.",
};

const HIGHLIGHTS = [
  "Implantação assistida e onboarding guiado",
  "Vendas, estoque, financeiro, clientes e relatórios integrados",
  "Arquitetura preparada para bancos, e-commerce e APIs",
  "Multiempresa, multiusuário e seguro (LGPD)",
];

export default function AdquirirPage() {
  return (
    <section className="pt-28 pb-24 bg-pub-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
        {/* Copy comercial */}
        <div className="lg:pt-6">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Adquirir nossos serviços</p>
          <h1 className="text-3xl md:text-4xl font-bold text-pub-text mb-5 text-balance">
            Vamos preparar a NexusERP para a sua empresa.
          </h1>
          <p className="text-lg text-pub-muted leading-relaxed mb-8">
            A NexusERP é uma plataforma paga e profissional. Preencha o formulário e nossa equipe
            entra em contato para entender sua operação e liberar a configuração ideal — sem teste
            gratuito, sem cadastro automático.
          </p>

          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-electric/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-electric" />
                </div>
                <span className="text-sm text-pub-muted">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulário */}
        <AcquireForm />
      </div>
    </section>
  );
}
