import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PlanSlug, UserRole } from "@/lib/authz";

export interface TenantContext {
  userId: string;
  userName: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  role: UserRole;
  planSlug: PlanSlug;
  subscriptionStatus: string | null;
  onboarded: boolean;
  primaryModules: string[];
}

/**
 * Resolve a empresa do usuário logado. Deduplicado por request via React cache().
 * Sem sessão → /login. Sem empresa → /onboarding.
 * Produto pago: empresa bloqueada ou sem assinatura ATIVA → /sem-acesso
 * (não rebaixa silenciosamente para "start").
 */
export const getCurrentCompany = cache(async (): Promise<TenantContext> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.companyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      company: {
        include: {
          // Company.subscriptions é 1-N; pegamos a mais recente.
          subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
          profile: { select: { onboardedAt: true, primaryModules: true } },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  const sub = membership.company.subscriptions[0] ?? null;
  const companyActive = membership.company.status === "ACTIVE";
  const subActive = sub?.status === "ACTIVE";
  // Acesso ao painel exige empresa ativa + assinatura ATIVA. Caso contrário,
  // mesmo um usuário válido é levado à página de contratação/renovação.
  if (!companyActive || !subActive) redirect("/sem-acesso");

  const planSlug: PlanSlug = sub!.plan.slug as PlanSlug;

  return {
    userId: session.user.id,
    userName: membership.user.name,
    userEmail: membership.user.email,
    companyId: membership.companyId,
    companyName: membership.company.name,
    role: membership.role as UserRole,
    planSlug,
    subscriptionStatus: sub?.status ?? null,
    onboarded: Boolean(membership.company.profile?.onboardedAt),
    primaryModules: membership.company.profile?.primaryModules ?? [],
  };
});
