import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

/**
 * Bootstrap de PRODUÇÃO: cria os planos + 1 usuário admin já liberado + empresa
 * com assinatura ATIVA. SEM dados demo. Rode uma vez contra o banco gerenciado:
 *
 *   # bash/git-bash:
 *   DATABASE_URL="postgresql://...prod..." ADMIN_EMAIL="voce@empresa.com" ADMIN_PASSWORD="senhaForte123" npm run db:seed:admin
 *
 *   # PowerShell:
 *   $env:DATABASE_URL="postgresql://...prod..."; $env:ADMIN_PASSWORD="senhaForte123"; npm run db:seed:admin
 *
 * Idempotente: pode rodar de novo sem duplicar (upsert).
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@nexuserp.com.br").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "123456";
  const companyName = process.env.ADMIN_COMPANY ?? "Minha Empresa";

  // Planos
  await prisma.plan.upsert({ where: { slug: "start" }, update: { price: 89, setupFee: 0, userLimit: 3 }, create: { name: "Start", slug: "start", price: 89, setupFee: 0, userLimit: 3, isPopular: false, features: ["Até 3 usuários", "Financeiro básico", "Vendas e clientes", "Estoque simples", "Relatórios essenciais", "Suporte por e-mail"] } });
  const growth = await prisma.plan.upsert({ where: { slug: "growth" }, update: { price: 249, setupFee: 0, userLimit: 10 }, create: { name: "Growth", slug: "growth", price: 249, setupFee: 0, userLimit: 10, isPopular: true, features: ["Até 10 usuários", "Financeiro completo", "CRM e funil de vendas", "Compras e estoque avançado", "Projetos e tarefas", "Dashboards avançados", "Automações", "Suporte prioritário"] } });
  await prisma.plan.upsert({ where: { slug: "enterprise" }, update: {}, create: { name: "Enterprise", slug: "enterprise", price: 0, setupFee: 0, userLimit: null, isPopular: false, features: ["Usuários ilimitados", "Módulos personalizados", "Integrações via API", "Relatórios customizados", "Onboarding dedicado", "SLA personalizado", "Suporte premium 24/7"] } });

  // Admin liberado
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: "ACTIVE", accessEnabled: true, emailVerified: new Date() },
    create: { name: "Administrador", email, passwordHash, role: "OWNER", status: "ACTIVE", accessEnabled: true, emailVerified: new Date() },
  });

  // Empresa + vínculo + assinatura ATIVA (idempotente)
  let membership = await prisma.companyMember.findFirst({ where: { userId: admin.id }, include: { company: true } });
  if (!membership) {
    const company = await prisma.company.create({ data: { name: companyName, status: "ACTIVE", members: { create: { userId: admin.id, role: "OWNER" } } } });
    membership = await prisma.companyMember.findFirst({ where: { userId: admin.id }, include: { company: true } });
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    await prisma.subscription.create({ data: { companyId: company.id, planId: growth.id, status: "ACTIVE", currentPeriodEnd: periodEnd } });
  } else {
    const sub = await prisma.subscription.findFirst({ where: { companyId: membership.companyId } });
    if (!sub) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await prisma.subscription.create({ data: { companyId: membership.companyId, planId: growth.id, status: "ACTIVE", currentPeriodEnd: periodEnd } });
    }
  }

  console.log(`✅ Admin pronto: ${email} (acesso liberado, assinatura ATIVA)`);
  console.log(`🔑 Senha: ${process.env.ADMIN_PASSWORD ? "(definida via ADMIN_PASSWORD)" : "123456 — TROQUE depois!"}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
