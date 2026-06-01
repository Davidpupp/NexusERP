import { Database, TrendingDown, AlertTriangle, Clock, ShoppingCart, ArrowRight } from "lucide-react";

const PROBLEMS = [
  {
    icon: Database,
    problem: "Dados espalhados em planilhas e sistemas que não conversam.",
    solution: "A NexusERP centraliza vendas, estoque, financeiro e clientes em uma base única, com dados consistentes em tempo real.",
  },
  {
    icon: TrendingDown,
    problem: "Dificuldade para saber o lucro real e a situação do caixa.",
    solution: "Fluxo de caixa, contas a pagar e a receber e relatórios financeiros conectados às vendas, sem esperar o fechamento do mês.",
  },
  {
    icon: AlertTriangle,
    problem: "Estoque desorganizado, com rupturas e dinheiro parado.",
    solution: "Controle de estoque com movimentações por origem, alertas de mínimo e estrutura para sincronizar com o e-commerce.",
  },
  {
    icon: ShoppingCart,
    problem: "Vendas espalhadas entre loja física, site e canais externos.",
    solution: "Arquitetura preparada para consolidar vendas físicas e digitais em relatórios claros para a tomada de decisão.",
  },
  {
    icon: Clock,
    problem: "Relatórios manuais e retrabalho que tomam horas da equipe.",
    solution: "Dashboards e relatórios alimentados pela operação, reduzindo o trabalho manual e o cruzamento de planilhas.",
  },
];

export function ProblemsSection() {
  return (
    <section id="solucoes" className="py-24 bg-pub-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-electric mb-3 tracking-widest uppercase">Problemas que resolvemos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-pub-text mb-4">
            Empresas crescem, mas os processos continuam espalhados.
          </h2>
          <p className="text-lg text-pub-muted max-w-2xl mx-auto">
            Para cada dor comum de gestão, a NexusERP organiza uma solução clara.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map(({ icon: Icon, problem, solution }) => (
            <div key={problem} className="p-6 rounded-2xl bg-pub-surface border border-pub-border flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-danger" />
                </div>
                <p className="text-sm font-semibold text-pub-text pt-1.5">{problem}</p>
              </div>
              <div className="flex items-start gap-3 pl-1 mt-auto">
                <ArrowRight size={16} className="text-electric flex-shrink-0 mt-0.5" />
                <p className="text-sm text-pub-muted leading-relaxed">{solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
