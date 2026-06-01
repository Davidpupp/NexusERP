import { Landmark, ShoppingCart, Globe, Webhook, FileSpreadsheet } from "lucide-react";

const INTEGRATIONS = [
  {
    icon: Landmark,
    title: "Bancos",
    description: "Conexão por API, Open Finance, intermediadores ou importação de extratos. Estrutura para conciliação financeira e fluxo de caixa mais preciso.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description: "Preparado para receber pedidos online, acompanhar faturamento, sincronizar produtos e controlar o estoque vendido no site.",
  },
  {
    icon: Globe,
    title: "Site próprio",
    description: "Análise de vendas, cadastro de produtos e dados comerciais, com integrações personalizadas por token ou chave de API.",
  },
  {
    icon: Webhook,
    title: "APIs e Webhooks",
    description: "Arquitetura pensada para conexões externas, sincronização de dados e automações — com endpoints seguros e idempotentes.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importação de dados",
    description: "Importação de CSV, planilhas, extratos e históricos comerciais para migrar e alimentar o sistema sem retrabalho.",
  },
];

export function IntegrationsSection() {
  return (
    <section id="integracoes" className="py-24 bg-pub-bg border-t border-pub-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Integrações</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">
            Conecte sua operação aos canais que realmente importam.
          </h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            A NexusERP é preparada para integrar dados financeiros, vendas online, estoque, clientes e
            relatórios em uma única visão. Cada conexão tem status e configuração transparentes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTEGRATIONS.map(({ icon: Icon, title, description }) => (
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
