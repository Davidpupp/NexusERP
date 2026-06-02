import type { ModuleKey } from "@/lib/authz";

/**
 * Configuração central de nichos (onboarding adaptativo). Cada nicho define os
 * módulos recomendados (apenas módulos que JÁ existem — sem botão quebrado), os
 * cards do dashboard (usados na Fase C), as perguntas específicas e os padrões
 * financeiros semeados. Módulo puro (sem React/Prisma) — importável por server e client.
 */

export type QuestionType = "bool" | "text" | "select";

export interface NicheQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
}

export interface NicheConfig {
  id: string;
  label: string;
  /** Nome do ícone lucide-react (mapeado no client). */
  icon: string;
  description: string;
  /** Indica nicho de pessoa física (finanças pessoais). */
  isPersonal?: boolean;
  recommendedModules: ModuleKey[];
  dashboardCards: string[];
  questions: NicheQuestion[];
  financeCategories: string[];
  costCenters: string[];
}

const NAME_Q = (label: string, placeholder: string): NicheQuestion => ({ id: "name", label, type: "text", placeholder });

export const NICHES: NicheConfig[] = [
  {
    id: "comercio",
    label: "Empresa ou comércio",
    icon: "Store",
    description: "Gestão completa de vendas, estoque, clientes e financeiro.",
    recommendedModules: ["vendas", "estoque", "financeiro", "clientes", "relatorios"],
    dashboardCards: ["monthlySales", "lowStock", "recentOrders", "monthlyRevenue", "clients"],
    questions: [
      NAME_Q("Qual o nome da empresa?", "Minha Empresa Ltda"),
      { id: "sells", label: "A empresa vende o quê?", type: "select", options: ["Produtos", "Serviços", "Ambos"] },
      { id: "stock", label: "Possui estoque?", type: "bool" },
      { id: "team", label: "Possui equipe?", type: "bool" },
      { id: "proposals", label: "Precisa emitir propostas/orçamentos?", type: "bool" },
      { id: "finance", label: "Quer controlar o financeiro?", type: "bool" },
      { id: "clients", label: "Quer acompanhar clientes?", type: "bool" },
      { id: "reports", label: "Quer relatórios de desempenho?", type: "bool" },
    ],
    financeCategories: ["Vendas", "Fornecedores", "Aluguel", "Salários", "Impostos"],
    costCenters: ["Comercial", "Administrativo"],
  },
  {
    id: "servicos",
    label: "Prestação de serviços",
    icon: "Briefcase",
    description: "Projetos, contratos e faturamento por serviço.",
    recommendedModules: ["projetos", "financeiro", "clientes", "vendas", "relatorios"],
    dashboardCards: ["activeServices", "recurringClients", "openProposals", "monthlyRevenue", "pendingTasks"],
    questions: [
      NAME_Q("Qual o nome da empresa?", "Minha Empresa"),
      { id: "model", label: "Trabalha com projetos ou atendimentos avulsos?", type: "select", options: ["Projetos", "Avulsos", "Ambos"] },
      { id: "proposals", label: "Precisa emitir propostas?", type: "bool" },
      { id: "clients", label: "Precisa controlar clientes?", type: "bool" },
      { id: "tasks", label: "Precisa controlar tarefas e prazos?", type: "bool" },
      { id: "finance", label: "Quer controlar o financeiro?", type: "bool" },
      { id: "reports", label: "Quer relatórios por cliente?", type: "bool" },
    ],
    financeCategories: ["Serviços Prestados", "Salários", "Ferramentas", "Impostos"],
    costCenters: ["Operação", "Comercial", "Administrativo"],
  },
  {
    id: "engenharia",
    label: "Engenharia / Projetos",
    icon: "Ruler",
    description: "Clientes, propostas, projetos, prazos, documentos e financeiro.",
    recommendedModules: ["projetos", "clientes", "financeiro", "vendas", "relatorios"],
    dashboardCards: ["activeProjects", "openProposals", "upcomingDeadlines", "monthlyRevenue", "pendingTasks"],
    questions: [
      NAME_Q("Nome da empresa/escritório", "Engenharia XYZ"),
      { id: "scope", label: "Trabalha com o quê?", type: "select", options: ["Projetos", "Obras", "Laudos", "Consultoria", "Manutenção"] },
      { id: "proposals", label: "Precisa controlar propostas?", type: "bool" },
      { id: "clients", label: "Precisa controlar clientes?", type: "bool" },
      { id: "stages", label: "Precisa controlar etapas dos projetos?", type: "bool" },
      { id: "docs", label: "Precisa anexar documentos técnicos?", type: "bool" },
      { id: "deadlines", label: "Precisa controlar prazos?", type: "bool" },
      { id: "team", label: "Precisa controlar equipe/responsáveis?", type: "bool" },
      { id: "financePerProject", label: "Precisa de financeiro por projeto?", type: "bool" },
    ],
    financeCategories: ["Projetos", "Subcontratados", "Materiais", "Salários", "Impostos"],
    costCenters: ["Projetos", "Comercial", "Administrativo"],
  },
  {
    id: "loja_fisica",
    label: "Loja física",
    icon: "ShoppingBag",
    description: "Vendas no balcão, estoque, caixa e clientes.",
    recommendedModules: ["vendas", "estoque", "financeiro", "clientes", "compras"],
    dashboardCards: ["monthlySales", "lowStock", "cashier", "monthlyRevenue", "clients"],
    questions: [
      NAME_Q("Nome da loja", "Minha Loja"),
      { id: "products", label: "Vende produtos?", type: "bool" },
      { id: "stock", label: "Possui estoque?", type: "bool" },
      { id: "cashier", label: "Precisa controlar caixa?", type: "bool" },
      { id: "clients", label: "Precisa cadastrar clientes?", type: "bool" },
      { id: "reports", label: "Precisa de relatórios de vendas?", type: "bool" },
      { id: "suppliers", label: "Precisa controlar fornecedores?", type: "bool" },
    ],
    financeCategories: ["Vendas", "Fornecedores", "Aluguel", "Salários", "Impostos"],
    costCenters: ["Loja", "Administrativo"],
  },
  {
    id: "ecommerce",
    label: "Loja online / E-commerce",
    icon: "ShoppingCart",
    description: "Vendas online, múltiplos canais, pedidos e logística.",
    recommendedModules: ["pedidos", "estoque", "financeiro", "integracoes", "relatorios"],
    dashboardCards: ["monthlySales", "openOrders", "lowStock", "monthlyRevenue", "channels"],
    questions: [
      NAME_Q("Nome da loja", "Minha Loja Online"),
      { id: "platform", label: "Plataforma usada", type: "select", options: ["Shopify", "WooCommerce", "Nuvemshop", "Mercado Livre", "Site próprio", "Outro"] },
      { id: "integrate", label: "Precisa integrar vendas?", type: "bool" },
      { id: "stock", label: "Precisa controlar estoque?", type: "bool" },
      { id: "orders", label: "Precisa acompanhar pedidos?", type: "bool" },
      { id: "revenue", label: "Precisa analisar faturamento?", type: "bool" },
      { id: "importClients", label: "Precisa importar clientes?", type: "bool" },
    ],
    financeCategories: ["Vendas Online", "Frete", "Marketing", "Fornecedores", "Taxas Marketplace"],
    costCenters: ["E-commerce", "Logística", "Marketing"],
  },
  {
    id: "saude",
    label: "Clínica / estética / saúde",
    icon: "HeartPulse",
    description: "Pacientes, agendamentos, procedimentos e pagamentos.",
    recommendedModules: ["clientes", "financeiro", "projetos", "relatorios"],
    dashboardCards: ["appointments", "patients", "monthlyRevenue", "procedures"],
    questions: [
      NAME_Q("Nome do negócio", "Minha Clínica"),
      { id: "scheduling", label: "Trabalha com agendamentos?", type: "bool" },
      { id: "patients", label: "Precisa controlar clientes/pacientes?", type: "bool" },
      { id: "procedures", label: "Precisa controlar procedimentos?", type: "bool" },
      { id: "payments", label: "Precisa controlar pagamentos?", type: "bool" },
      { id: "professionals", label: "Precisa controlar profissionais?", type: "bool" },
      { id: "reminders", label: "Precisa enviar lembretes?", type: "bool" },
    ],
    financeCategories: ["Atendimentos", "Materiais", "Comissões", "Aluguel", "Impostos"],
    costCenters: ["Atendimento", "Administrativo"],
  },
  {
    id: "restaurante",
    label: "Restaurante / alimentação",
    icon: "UtensilsCrossed",
    description: "Pedidos, insumos, caixa e fornecedores.",
    recommendedModules: ["estoque", "compras", "financeiro", "vendas"],
    dashboardCards: ["dailySales", "lowStock", "cashier", "monthlyRevenue"],
    questions: [
      NAME_Q("Nome do negócio", "Meu Restaurante"),
      { id: "mode", label: "Trabalha com salão, delivery ou ambos?", type: "select", options: ["Salão", "Delivery", "Ambos"] },
      { id: "orders", label: "Precisa controlar pedidos?", type: "bool" },
      { id: "supplies", label: "Precisa controlar estoque de insumos?", type: "bool" },
      { id: "cashier", label: "Precisa controlar caixa?", type: "bool" },
      { id: "reportsByProduct", label: "Precisa de relatórios por produto?", type: "bool" },
      { id: "suppliers", label: "Precisa controlar fornecedores?", type: "bool" },
    ],
    financeCategories: ["Vendas", "Insumos", "Aluguel", "Salários", "Delivery"],
    costCenters: ["Cozinha", "Salão", "Delivery"],
  },
  {
    id: "eventos",
    label: "Eventos",
    icon: "PartyPopper",
    description: "Clientes, contratos, fornecedores e orçamento por evento.",
    recommendedModules: ["projetos", "clientes", "financeiro", "vendas"],
    dashboardCards: ["upcomingEvents", "openContracts", "monthlyRevenue", "clients"],
    questions: [
      NAME_Q("Nome da empresa", "Minha Produtora"),
      { id: "type", label: "Tipo de evento", type: "select", options: ["Festas", "Corporativo", "Shows", "Formaturas", "Outro"] },
      { id: "clients", label: "Precisa controlar clientes?", type: "bool" },
      { id: "contracts", label: "Precisa controlar contratos?", type: "bool" },
      { id: "suppliers", label: "Precisa controlar fornecedores?", type: "bool" },
      { id: "budgetPerEvent", label: "Precisa de orçamento por evento?", type: "bool" },
      { id: "calendar", label: "Precisa de agenda/calendário de eventos?", type: "bool" },
      { id: "team", label: "Precisa controlar equipe?", type: "bool" },
    ],
    financeCategories: ["Eventos", "Fornecedores", "Equipe", "Marketing", "Impostos"],
    costCenters: ["Produção", "Comercial", "Administrativo"],
  },
  {
    id: "academia",
    label: "Academia / studio",
    icon: "Dumbbell",
    description: "Alunos, mensalidades, agenda e financeiro.",
    recommendedModules: ["clientes", "financeiro", "relatorios"],
    dashboardCards: ["activeStudents", "monthlyRevenue", "overdue", "classes"],
    questions: [
      NAME_Q("Nome do negócio", "Meu Studio"),
      { id: "students", label: "Precisa controlar alunos?", type: "bool" },
      { id: "plans", label: "Precisa controlar planos/mensalidades?", type: "bool" },
      { id: "schedule", label: "Precisa controlar agenda/aulas?", type: "bool" },
      { id: "finance", label: "Precisa controlar o financeiro?", type: "bool" },
      { id: "teachers", label: "Precisa controlar professores?", type: "bool" },
      { id: "attendance", label: "Precisa de relatórios de presença?", type: "bool" },
    ],
    financeCategories: ["Mensalidades", "Comissões", "Aluguel", "Equipamentos", "Impostos"],
    costCenters: ["Operação", "Administrativo"],
  },
  {
    id: "consultoria",
    label: "Escritório / consultoria",
    icon: "Building2",
    description: "Clientes recorrentes, contratos, tarefas e propostas.",
    recommendedModules: ["projetos", "clientes", "financeiro", "relatorios"],
    dashboardCards: ["recurringClients", "openContracts", "pendingTasks", "monthlyRevenue"],
    questions: [
      NAME_Q("Nome do escritório", "Meu Escritório"),
      { id: "recurring", label: "Trabalha com clientes recorrentes?", type: "bool" },
      { id: "contracts", label: "Precisa controlar contratos?", type: "bool" },
      { id: "tasks", label: "Precisa controlar tarefas?", type: "bool" },
      { id: "proposals", label: "Precisa controlar propostas?", type: "bool" },
      { id: "finance", label: "Precisa controlar o financeiro?", type: "bool" },
      { id: "reports", label: "Precisa de relatórios por cliente?", type: "bool" },
    ],
    financeCategories: ["Honorários", "Salários", "Ferramentas", "Impostos"],
    costCenters: ["Operação", "Comercial", "Administrativo"],
  },
  {
    id: "industria",
    label: "Indústria / produção",
    icon: "Factory",
    description: "Produção, matéria-prima, pedidos e fornecedores.",
    recommendedModules: ["producao", "estoque", "compras", "financeiro"],
    dashboardCards: ["production", "rawMaterialStock", "openOrders", "monthlyRevenue"],
    questions: [
      NAME_Q("Nome da empresa", "Minha Indústria"),
      { id: "ownProducts", label: "Produz produtos próprios?", type: "bool" },
      { id: "rawStock", label: "Precisa controlar estoque de matéria-prima?", type: "bool" },
      { id: "production", label: "Precisa controlar produção?", type: "bool" },
      { id: "orders", label: "Precisa controlar pedidos?", type: "bool" },
      { id: "suppliers", label: "Precisa controlar fornecedores?", type: "bool" },
      { id: "productivity", label: "Precisa de relatórios de produtividade?", type: "bool" },
    ],
    financeCategories: ["Vendas", "Matéria-prima", "Energia", "Salários", "Manutenção"],
    costCenters: ["Produção", "Compras", "Administrativo"],
  },
  {
    id: "financas_pessoais",
    label: "Gestão financeira pessoal",
    icon: "Wallet",
    description: "Receitas, despesas, contas, cartões, metas e planejamento.",
    isPersonal: true,
    recommendedModules: ["financeiro", "relatorios"],
    dashboardCards: ["monthlyBalance", "income", "expenses", "upcomingBills", "goalsProgress", "byCategory"],
    questions: [
      NAME_Q("Qual o seu nome?", "Seu nome"),
      { id: "incomeExpenses", label: "Quer controlar receitas e despesas?", type: "bool" },
      { id: "fixedBills", label: "Quer organizar contas fixas?", type: "bool" },
      { id: "cards", label: "Quer acompanhar cartões de crédito?", type: "bool" },
      { id: "goals", label: "Quer criar metas financeiras?", type: "bool" },
      { id: "investments", label: "Quer acompanhar investimentos?", type: "bool" },
      { id: "categories", label: "Quer separar gastos por categoria?", type: "bool" },
      { id: "monthlyReports", label: "Quer relatórios mensais?", type: "bool" },
      { id: "dueAlerts", label: "Quer alertas de vencimento?", type: "bool" },
    ],
    financeCategories: ["Salário", "Moradia", "Alimentação", "Transporte", "Lazer", "Saúde", "Educação"],
    costCenters: ["Pessoal"],
  },
  {
    id: "outro",
    label: "Outro segmento",
    icon: "LayoutGrid",
    description: "Configuração geral e equilibrada, adaptável depois.",
    recommendedModules: ["financeiro", "vendas", "clientes", "estoque"],
    dashboardCards: ["monthlyRevenue", "clients", "monthlySales"],
    questions: [
      NAME_Q("Nome da empresa ou projeto", "Meu negócio"),
      { id: "goal", label: "O que você quer organizar principalmente?", type: "text", placeholder: "Ex.: financeiro, clientes, vendas…" },
      { id: "finance", label: "Quer controlar o financeiro?", type: "bool" },
      { id: "clients", label: "Quer controlar clientes?", type: "bool" },
      { id: "sales", label: "Quer controlar vendas?", type: "bool" },
      { id: "stock", label: "Quer controlar estoque?", type: "bool" },
    ],
    financeCategories: ["Receitas", "Despesas", "Salários", "Impostos"],
    costCenters: ["Geral"],
  },
];

/** Aliases de ids antigos (perfis criados antes da expansão de nichos). */
const NICHE_ALIASES: Record<string, string> = {
  varejo: "loja_fisica",
};

export const COMPANY_SIZES = [
  { id: "solo", label: "Apenas eu" },
  { id: "2-10", label: "2 a 10 pessoas" },
  { id: "11-50", label: "11 a 50 pessoas" },
  { id: "50+", label: "Mais de 50 pessoas" },
];

export const CHANNELS = ["Loja física", "Site próprio", "Marketplace", "Redes sociais", "WhatsApp", "Representantes"];

export function getNiche(id: string | null | undefined): NicheConfig {
  if (!id) return NICHES[NICHES.length - 1];
  const resolved = NICHE_ALIASES[id] ?? id;
  return NICHES.find((n) => n.id === resolved) ?? NICHES[NICHES.length - 1];
}

/** Rótulo + descrição curta dos módulos existentes (tela de seleção). */
export const MODULE_META: Record<string, { label: string; description: string }> = {
  financeiro: { label: "Financeiro", description: "Contas a pagar/receber, fluxo de caixa e categorias." },
  vendas: { label: "Vendas / CRM", description: "Funil de oportunidades e acompanhamento de clientes." },
  pedidos: { label: "Pedidos de venda", description: "Pedidos com itens, baixa de estoque e automação." },
  clientes: { label: "Clientes", description: "Cadastro e histórico dos seus clientes." },
  estoque: { label: "Estoque", description: "Produtos, quantidades e movimentações." },
  compras: { label: "Compras", description: "Fornecedores e ordens de compra." },
  producao: { label: "Produção", description: "Ordens de produção e acompanhamento." },
  projetos: { label: "Projetos / Tarefas", description: "Projetos, etapas, tarefas e prazos." },
  relatorios: { label: "Relatórios", description: "Indicadores e relatórios de desempenho." },
  automacoes: { label: "Automações", description: "Regras que agem sozinhas em eventos do sistema." },
  integracoes: { label: "Integrações", description: "Bancos, e-commerce, webhooks e API." },
  suporte: { label: "Suporte", description: "Tickets e atendimento aos clientes." },
};
