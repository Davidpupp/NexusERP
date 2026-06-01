"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "O que é a NexusERP?",
    a: "A NexusERP é uma plataforma de gestão empresarial que integra financeiro, vendas, estoque, clientes, relatórios e integrações em um único sistema. Foi desenvolvida para o mercado brasileiro.",
  },
  {
    q: "A NexusERP é um sistema pago?",
    a: "Sim. A NexusERP é um produto profissional pago. Não há teste gratuito nem cadastro público — o acesso é liberado após a contratação dos serviços.",
  },
  {
    q: "Como adquiro o acesso?",
    a: "Clique em “Adquirir nossos serviços”, preencha o formulário comercial e nossa equipe entra em contato para entender sua operação e liberar a melhor configuração. Você também pode contratar um plano diretamente.",
  },
  {
    q: "A NexusERP substitui planilhas?",
    a: "Sim. A plataforma centraliza informações que hoje vivem em planilhas, e-mails e sistemas separados, com dados em tempo real e menos risco de inconsistências.",
  },
  {
    q: "Posso integrar com meu sistema atual?",
    a: "A NexusERP é preparada para integrações via API e webhooks, com estrutura para conectar bancos, e-commerce, sites e ferramentas externas. Integrações que dependem de credenciais ficam com estado de configuração transparente.",
  },
  {
    q: "Existe suporte na implantação?",
    a: "Sim. A contratação inclui onboarding guiado. Os planos superiores contam com suporte dedicado de um especialista da NexusERP na implantação.",
  },
  {
    q: "A plataforma emite notas fiscais?",
    a: "A arquitetura é preparada para integrar com emissores de NF-e e NFS-e homologados pela SEFAZ. A emissão ocorre via integração quando configurada.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Senhas com hash, dados sensíveis de integração criptografados, rotas privadas protegidas, logs de auditoria e conformidade com a LGPD.",
  },
  {
    q: "Posso adicionar usuários?",
    a: "Sim. Cada plano tem um limite de usuários incluídos. O administrador convida novos membros por e-mail, e o acesso de cada um é liberado de forma controlada.",
  },
  {
    q: "Existe plano personalizado?",
    a: "Sim. O plano Enterprise permite personalização de módulos, limites de usuários, SLA e integrações. Fale com nossa equipe para um orçamento.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-pub-bg border-t border-pub-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">Perguntas frequentes</h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="bg-pub-surface rounded-xl border border-pub-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-sm font-semibold text-pub-text pr-4">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-pub-muted flex-shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-pub-muted leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
