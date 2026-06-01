import type { ModuleKey } from "@/lib/authz";

export interface SegmentConfig {
  id: string;
  label: string;
  description: string;
  /** Módulos destacados na sidebar/dashboard para este segmento. */
  primaryModules: ModuleKey[];
  /** Categorias financeiras padrão semeadas no onboarding. */
  financeCategories: string[];
  /** Centros de custo padrão. */
  costCenters: string[];
}

export const SEGMENTS: SegmentConfig[] = [
  {
    id: "varejo",
    label: "Varejo / Loja física",
    description: "Vendas no balcão, controle de estoque e caixa.",
    primaryModules: ["vendas", "estoque", "financeiro", "clientes"],
    financeCategories: ["Vendas", "Fornecedores", "Aluguel", "Salários", "Impostos"],
    costCenters: ["Loja", "Administrativo"],
  },
  {
    id: "ecommerce",
    label: "E-commerce / Marketplace",
    description: "Vendas online, múltiplos canais e logística.",
    primaryModules: ["vendas", "estoque", "compras", "financeiro"],
    financeCategories: ["Vendas Online", "Frete", "Marketing", "Fornecedores", "Taxas Marketplace"],
    costCenters: ["E-commerce", "Logística", "Marketing"],
  },
  {
    id: "servicos",
    label: "Prestação de serviços",
    description: "Projetos, contratos e faturamento por serviço.",
    primaryModules: ["projetos", "financeiro", "clientes", "vendas"],
    financeCategories: ["Serviços Prestados", "Salários", "Ferramentas", "Impostos"],
    costCenters: ["Operação", "Comercial", "Administrativo"],
  },
  {
    id: "industria",
    label: "Indústria / Produção",
    description: "Produção, insumos e controle de fabricação.",
    primaryModules: ["producao", "estoque", "compras", "financeiro"],
    financeCategories: ["Vendas", "Matéria-prima", "Energia", "Salários", "Manutenção"],
    costCenters: ["Produção", "Compras", "Administrativo"],
  },
  {
    id: "restaurante",
    label: "Restaurante / Alimentação",
    description: "Insumos, fornecedores e controle de custos.",
    primaryModules: ["estoque", "compras", "financeiro", "vendas"],
    financeCategories: ["Vendas", "Insumos", "Aluguel", "Salários", "Delivery"],
    costCenters: ["Cozinha", "Salão", "Delivery"],
  },
  {
    id: "outro",
    label: "Outro",
    description: "Configuração geral e equilibrada.",
    primaryModules: ["financeiro", "vendas", "clientes", "estoque"],
    financeCategories: ["Receitas", "Despesas", "Salários", "Impostos"],
    costCenters: ["Geral"],
  },
];

export const COMPANY_SIZES = [
  { id: "solo", label: "Apenas eu" },
  { id: "2-10", label: "2 a 10 pessoas" },
  { id: "11-50", label: "11 a 50 pessoas" },
  { id: "50+", label: "Mais de 50 pessoas" },
];

export const CHANNELS = [
  "Loja física",
  "Site próprio",
  "Marketplace",
  "Redes sociais",
  "WhatsApp",
  "Representantes",
];

export function getSegment(id: string): SegmentConfig {
  return SEGMENTS.find((s) => s.id === id) ?? SEGMENTS[SEGMENTS.length - 1];
}
