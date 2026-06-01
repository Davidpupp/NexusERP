import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(120),
  email: z.string().email("Email inválido").max(200),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .max(100)
    .regex(/[a-zA-Z]/, "Senha deve conter ao menos uma letra")
    .regex(/[0-9]/, "Senha deve conter ao menos um número"),
  companyName: z.string().min(2, "Nome da empresa obrigatório").max(160),
});

/** Server-side checkout payload (server action input contract). */
export const checkoutActionSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(8).max(20),
  companyName: z.string().min(2).max(160),
  cnpj: z.string().max(20).optional(),
  planId: z.string().min(1).max(60),
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]),
});

export const checkoutFormSchema = z.object({
  name: z.string().min(2, "Nome completo obrigatório"),
  email: z.string().email("Email corporativo inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  companyName: z.string().min(2, "Nome da empresa obrigatório"),
  cnpj: z.string().optional(),
  role: z.string().optional(),
  userCount: z.string().optional(),
  planId: z.string().min(1, "Selecione um plano"),
  coupon: z.string().optional(),
});

export const creditCardSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido").max(19),
  cardName: z.string().min(3, "Nome no cartão obrigatório"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Validade inválida (MM/AA)"),
  cvv: z.string().min(3, "CVV inválido").max(4),
  installments: z.string(),
  document: z.string().min(11, "CPF/CNPJ obrigatório"),
});

export const transactionSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  category: z.string().min(1, "Categoria obrigatória"),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Valor deve ser positivo"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELED"]).default("PENDING"),
  method: z.string().optional(),
  dueDate: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  segment: z.string().optional(),
  notes: z.string().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  estimatedValue: z.number().min(0),
  stage: z.enum(["NEW_LEAD", "CONTACTED", "PROPOSAL_SENT", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]),
  customerId: z.string().optional(),
  nextAction: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome do produto obrigatório"),
  sku: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0).default(0),
  minQuantity: z.number().min(0).default(0),
  costPrice: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  supplierId: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type OpportunityFormData = z.infer<typeof opportunitySchema>;
export type ProductFormData = z.infer<typeof productSchema>;

// ── Sub-projeto 2: schemas adicionais ────────────────────────────────────────

export const supplierSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().optional(),
  total: z.number().min(0, "Total inválido"),
  status: z.string().min(1).default("PENDING"),
  expectedDate: z.string().optional(),
});

export const costCenterSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

export const inventoryMovementSchema = z.object({
  productId: z.string().min(1, "Produto obrigatório"),
  type: z.enum(["IN", "OUT", "ADJUST"]),
  quantity: z.number().int(),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELED"]).default("PLANNING"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).default("BACKLOG"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(2, "Assunto obrigatório"),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CLIENT", "RESOLVED", "CLOSED"]).default("OPEN"),
  customerId: z.string().optional(),
});

export const supportMessageSchema = z.object({
  content: z.string().min(1, "Mensagem obrigatória"),
});

export const automationSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  trigger: z.string().min(1, "Gatilho obrigatório"),
  action: z.string().min(1, "Ação obrigatória"),
  status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE"),
});

export const companySettingsSchema = z.object({
  name: z.string().min(2, "Nome da empresa obrigatório"),
  cnpj: z.string().optional(),
});

/** Pedido de venda (alimenta automação venda→estoque→financeiro). */
export const saleItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Descrição do item obrigatória"),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  unitPrice: z.number().min(0, "Preço inválido"),
});
export const saleSchema = z.object({
  customerId: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(saleItemSchema).min(1, "Adicione ao menos um item"),
});
export type SaleItemFormData = z.infer<typeof saleItemSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;

/** Formulário comercial "Adquirir nossos serviços" (lead público). */
export const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(120),
  company: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").max(200),
  phone: z.string().min(8, "Telefone/WhatsApp obrigatório").max(20),
  segment: z.string().max(80).optional().or(z.literal("")),
  usersQuantity: z.string().max(40).optional().or(z.literal("")),
  mainNeed: z.string().max(160).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});
export type LeadFormData = z.infer<typeof leadSchema>;

/** Convite de membro por admin (substitui o cadastro público). */
export const inviteSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(120),
  email: z.string().email("E-mail inválido").max(200),
  role: z.enum(["ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION", "CLIENT"]),
});
export type InviteFormData = z.infer<typeof inviteSchema>;

export type SupplierFormData = z.infer<typeof supplierSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type CostCenterFormData = z.infer<typeof costCenterSchema>;
export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;
export type SupportMessageFormData = z.infer<typeof supportMessageSchema>;
export type AutomationFormData = z.infer<typeof automationSchema>;
export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
