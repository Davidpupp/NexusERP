import "dotenv/config";
import { PrismaClient, TransactionType, TransactionStatus, OpportunityStage, ProjectStatus, TaskStatus, TaskPriority } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Plans
  await prisma.plan.upsert({
    where: { slug: "start" },
    update: { price: 89, setupFee: 0, userLimit: 3 },
    create: {
      name: "Start",
      slug: "start",
      price: 89,
      setupFee: 0,
      userLimit: 3,
      features: ["Até 3 usuários", "Financeiro básico", "Vendas e clientes", "Estoque simples", "Relatórios essenciais", "Suporte por e-mail"],
      isPopular: false,
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { slug: "growth" },
    update: { price: 249, setupFee: 0, userLimit: 10 },
    create: {
      name: "Growth",
      slug: "growth",
      price: 249,
      setupFee: 0,
      userLimit: 10,
      features: ["Até 10 usuários", "Financeiro completo", "CRM e funil de vendas", "Compras e estoque avançado", "Projetos e tarefas", "Dashboards avançados", "Automações", "Suporte prioritário"],
      isPopular: true,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      price: 0,
      setupFee: 0,
      userLimit: null,
      features: ["Usuários ilimitados", "Módulos personalizados", "Integrações via API", "Relatórios customizados", "Onboarding dedicado", "SLA personalizado", "Suporte premium 24/7"],
      isPopular: false,
    },
  });

  console.log("✅ Plans created");

  // Admin user
  const passwordHash = await bcrypt.hash("123456", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nexuserp.com.br" },
    update: { status: "ACTIVE", accessEnabled: true, emailVerified: new Date() },
    create: {
      name: "Admin NexusERP",
      email: "admin@nexuserp.com.br",
      passwordHash,
      role: "OWNER",
      status: "ACTIVE",
      accessEnabled: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin user created: admin@nexuserp.com.br / 123456");

  // Demo company
  const company = await prisma.company.upsert({
    where: { cnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      name: "Costa Distribuidora Ltda",
      cnpj: "12.345.678/0001-90",
      segment: "Distribuidora",
      employeeCount: 45,
    },
  });

  // Link admin to company
  await prisma.companyMember.upsert({
    where: { userId_companyId: { userId: adminUser.id, companyId: company.id } },
    update: {},
    create: {
      userId: adminUser.id,
      companyId: company.id,
      role: "OWNER",
    },
  });

  // Subscription
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.subscription.create({
    data: {
      companyId: company.id,
      planId: growthPlan.id,
      status: "ACTIVE",
      currentPeriodEnd: periodEnd,
    },
  });

  // Perfil já configurado (admin não é forçado ao onboarding).
  await prisma.companyProfile.upsert({
    where: { companyId: company.id },
    update: { onboardedAt: new Date() },
    create: {
      companyId: company.id,
      segment: "comercio",
      niche: "comercio",
      primaryModules: ["vendas", "estoque", "financeiro", "clientes", "relatorios"],
      selectedModules: ["vendas", "estoque", "financeiro", "clientes", "relatorios"],
      dashboardConfig: { cards: ["monthlySales", "lowStock", "recentOrders", "monthlyRevenue", "clients"] },
      onboardedAt: new Date(),
    },
  });

  console.log("✅ Company and subscription created");

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { companyId: company.id, name: "Construtora Alfa Ltda", email: "compras@alfa.com.br", phone: "(11) 99999-0001", segment: "Construção Civil", status: "ACTIVE" } }),
    prisma.customer.create({ data: { companyId: company.id, name: "Supermercado Beta", email: "financeiro@beta.com.br", phone: "(11) 99999-0002", segment: "Varejo", status: "ACTIVE" } }),
    prisma.customer.create({ data: { companyId: company.id, name: "Tech Solutions ME", email: "contato@techsolutions.com.br", phone: "(11) 99999-0003", segment: "Tecnologia", status: "ACTIVE" } }),
    prisma.customer.create({ data: { companyId: company.id, name: "Farmácia Saúde+", email: "gerencia@saudemais.com.br", phone: "(11) 99999-0004", segment: "Saúde", status: "ACTIVE" } }),
    prisma.customer.create({ data: { companyId: company.id, name: "Academia FitPro", email: "admin@fitpro.com.br", phone: "(11) 99999-0005", segment: "Fitness", status: "ACTIVE" } }),
  ]);

  console.log("✅ Customers created");

  // Opportunities
  await Promise.all([
    prisma.opportunity.create({ data: { companyId: company.id, customerId: customers[0].id, title: "Contrato anual de distribuição", estimatedValue: 180000, stage: OpportunityStage.PROPOSAL_SENT } }),
    prisma.opportunity.create({ data: { companyId: company.id, customerId: customers[1].id, title: "Fornecimento mensal de produtos", estimatedValue: 45000, stage: OpportunityStage.NEGOTIATION } }),
    prisma.opportunity.create({ data: { companyId: company.id, customerId: customers[2].id, title: "Parceria tecnológica Q3", estimatedValue: 28000, stage: OpportunityStage.CONTACTED } }),
    prisma.opportunity.create({ data: { companyId: company.id, customerId: customers[3].id, title: "Distribuição regional Sul", estimatedValue: 92000, stage: OpportunityStage.CLOSED_WON } }),
    prisma.opportunity.create({ data: { companyId: company.id, customerId: customers[4].id, title: "Suprimentos fitness Q4", estimatedValue: 15000, stage: OpportunityStage.NEW_LEAD } }),
  ]);

  console.log("✅ Opportunities created");

  // Transactions (last 6 months)
  const now = new Date();
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const revenueData = [180000, 210000, 195000, 240000, 228000, 265000];
  const expenseData = [120000, 135000, 128000, 155000, 148000, 162000];

  for (let m = 0; m < 6; m++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (5 - m));

    await prisma.transaction.createMany({
      data: [
        { companyId: company.id, description: `Receita ${months[m]} - Vendas`, category: "Vendas", type: TransactionType.INCOME, amount: revenueData[m] * 0.6, status: TransactionStatus.PAID, dueDate: date, paidAt: date },
        { companyId: company.id, description: `Receita ${months[m]} - Serviços`, category: "Serviços", type: TransactionType.INCOME, amount: revenueData[m] * 0.4, status: TransactionStatus.PAID, dueDate: date, paidAt: date },
        { companyId: company.id, description: `Despesa ${months[m]} - Fornecedores`, category: "Fornecedores", type: TransactionType.EXPENSE, amount: expenseData[m] * 0.5, status: TransactionStatus.PAID, dueDate: date, paidAt: date },
        { companyId: company.id, description: `Despesa ${months[m]} - Operacional`, category: "Operacional", type: TransactionType.EXPENSE, amount: expenseData[m] * 0.3, status: TransactionStatus.PAID, dueDate: date, paidAt: date },
        { companyId: company.id, description: `Despesa ${months[m]} - RH`, category: "RH", type: TransactionType.EXPENSE, amount: expenseData[m] * 0.2, status: TransactionStatus.PAID, dueDate: date, paidAt: date },
      ],
    });
  }

  // Pending transactions
  await prisma.transaction.createMany({
    data: [
      { companyId: company.id, description: "Fatura - Fornecedor ABC", category: "Fornecedores", type: TransactionType.EXPENSE, amount: 12500, status: TransactionStatus.PENDING, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { companyId: company.id, description: "Recebimento - Construtora Alfa", category: "Vendas", type: TransactionType.INCOME, amount: 45000, status: TransactionStatus.PENDING, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { companyId: company.id, description: "Aluguel galpão", category: "Operacional", type: TransactionType.EXPENSE, amount: 8500, status: TransactionStatus.OVERDUE, dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
  });

  console.log("✅ Transactions created");

  // Supplier
  const supplier = await prisma.supplier.create({
    data: { companyId: company.id, name: "Distribuidora Nacional SA", email: "vendas@distribnacional.com.br", phone: "(11) 3333-0001", cnpj: "98.765.432/0001-10" },
  });

  // Products
  await prisma.product.createMany({
    data: [
      { companyId: company.id, name: "Produto A - Premium", sku: "PROD-001", category: "Categoria A", quantity: 150, minQuantity: 20, costPrice: 45.00, salePrice: 89.90, supplierId: supplier.id },
      { companyId: company.id, name: "Produto B - Standard", sku: "PROD-002", category: "Categoria B", quantity: 8, minQuantity: 15, costPrice: 22.00, salePrice: 45.90, supplierId: supplier.id },
      { companyId: company.id, name: "Produto C - Basic", sku: "PROD-003", category: "Categoria A", quantity: 320, minQuantity: 50, costPrice: 12.50, salePrice: 28.90, supplierId: supplier.id },
      { companyId: company.id, name: "Produto D - Ultra", sku: "PROD-004", category: "Categoria C", quantity: 3, minQuantity: 10, costPrice: 120.00, salePrice: 249.90, supplierId: supplier.id },
      { companyId: company.id, name: "Produto E - Pro", sku: "PROD-005", category: "Categoria B", quantity: 67, minQuantity: 20, costPrice: 78.00, salePrice: 159.90, supplierId: supplier.id },
    ],
  });

  console.log("✅ Products created");

  // Project
  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      name: "Implantação Sistema de Logística",
      description: "Projeto de modernização da cadeia logística",
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.createMany({
    data: [
      { companyId: company.id, projectId: project.id, title: "Mapeamento de processos", status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, assigneeId: adminUser.id },
      { companyId: company.id, projectId: project.id, title: "Configuração de rotas", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: adminUser.id },
      { companyId: company.id, projectId: project.id, title: "Treinamento da equipe", status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM },
      { companyId: company.id, projectId: project.id, title: "Integração com WMS", status: TaskStatus.IN_REVIEW, priority: TaskPriority.CRITICAL, assigneeId: adminUser.id },
      { companyId: company.id, projectId: project.id, title: "Testes de carga", status: TaskStatus.BACKLOG, priority: TaskPriority.LOW },
    ],
  });

  // Support ticket
  await prisma.supportTicket.create({
    data: {
      companyId: company.id,
      customerId: customers[0].id,
      subject: "Dúvida sobre relatório financeiro",
      category: "Financeiro",
      priority: "MEDIUM",
      status: "OPEN",
      messages: {
        create: { content: "Como faço para exportar o DRE em PDF?" },
      },
    },
  });

  console.log("✅ Projects, tasks, and tickets created");
  console.log("🎉 Seed completed successfully!");
  console.log("📧 Login: admin@nexuserp.com.br");
  console.log("🔑 Password: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
