import {
  ShoppingBag,
  Package,
  BarChart3,
  Users2,
  FileText,
  Plug,
  Cog,
  FolderKanban,
  CreditCard,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Vendas",
    description: "Cadastro de pedidos, controle de status, histórico de vendas e análise de faturamento. Preparado para integrar com e-commerce.",
  },
  {
    icon: Package,
    title: "Estoque",
    description: "Controle de produtos, entradas e saídas, alertas de baixo estoque e organização por categorias — pronto para sincronizar com o site.",
  },
  {
    icon: BarChart3,
    title: "Financeiro",
    description: "Contas a pagar e a receber, fluxo de caixa e relatórios financeiros, com estrutura para conexão bancária via API segura.",
  },
  {
    icon: Users2,
    title: "Clientes",
    description: "Cadastro de clientes, histórico de compras, dados de contato, segmentação e relacionamento comercial em um só lugar.",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description: "Dashboards inteligentes, gráficos de vendas, análise de estoque e indicadores financeiros — com exportação planejada.",
  },
  {
    icon: Plug,
    title: "Integrações",
    description: "Bancos, e-commerce, sites próprios e APIs externas. Arquitetura preparada para webhooks e importação/exportação de dados.",
  },
  {
    icon: Cog,
    title: "Produção e Operações",
    description: "Ordens de produção, controle de insumos e etapas, com custo real versus estimado por produto.",
  },
  {
    icon: FolderKanban,
    title: "Projetos e Tarefas",
    description: "Kanban intuitivo, gestão de equipes, prazos e prioridades para acompanhar entregas internas.",
  },
  {
    icon: CreditCard,
    title: "Checkout Integrado",
    description: "Recebimentos via Pix e outros meios diretamente na plataforma, com reconhecimento de receita e conciliação.",
  },
];

export function FeaturesSection() {
  return (
    <section id="modulos" className="py-24 bg-pub-surface border-t border-pub-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Módulos do sistema</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">
            Tudo que você precisa para gerir o negócio
          </h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            Módulos integrados que conversam entre si, eliminando retrabalho e centralizando suas informações.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-pub-bg border border-pub-border hover:border-electric/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-electric/15 flex items-center justify-center mb-4 group-hover:bg-electric/25 transition-colors">
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
