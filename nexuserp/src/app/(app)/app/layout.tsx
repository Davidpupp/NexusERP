import { AppShell } from "@/components/app/AppShell";
import { getCurrentCompany } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { readonly children: React.ReactNode }) {
  const ctx = await getCurrentCompany();
  const notifications = await prisma.notification.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const notifItems = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    severity: n.severity,
    read: n.readAt !== null,
    date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(n.createdAt),
  }));

  return (
    <AppShell
      sidebar={{
        planSlug: ctx.planSlug,
        role: ctx.role,
        userName: ctx.userName,
        userEmail: ctx.userEmail,
        primaryModules: ctx.primaryModules,
      }}
      userName={ctx.userName}
      notifications={notifItems}
    >
      {children}
    </AppShell>
  );
}
