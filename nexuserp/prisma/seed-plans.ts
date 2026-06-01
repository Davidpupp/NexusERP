import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seed APENAS dos planos — seguro para rodar em produção (sem dados demo).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.plan.upsert({
    where: { slug: "start" },
    update: { price: 89, setupFee: 0, userLimit: 3 },
    create: {
      name: "Start", slug: "start", price: 89, setupFee: 0, userLimit: 3, isPopular: false,
      features: ["Até 3 usuários", "Financeiro básico", "Vendas e clientes", "Estoque simples", "Relatórios essenciais", "Suporte por e-mail"],
    },
  });
  await prisma.plan.upsert({
    where: { slug: "growth" },
    update: { price: 249, setupFee: 0, userLimit: 10 },
    create: {
      name: "Growth", slug: "growth", price: 249, setupFee: 0, userLimit: 10, isPopular: true,
      features: ["Até 10 usuários", "Financeiro completo", "CRM e funil de vendas", "Compras e estoque avançado", "Projetos e tarefas", "Dashboards avançados", "Automações", "Suporte prioritário"],
    },
  });
  await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise", slug: "enterprise", price: 0, setupFee: 0, userLimit: null, isPopular: false,
      features: ["Usuários ilimitados", "Módulos personalizados", "Integrações via API", "Relatórios customizados", "Onboarding dedicado", "SLA personalizado", "Suporte premium 24/7"],
    },
  });
  console.log("✅ Planos criados/atualizados");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
