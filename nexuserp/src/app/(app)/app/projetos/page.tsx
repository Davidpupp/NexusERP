import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { ProjectManager } from "@/components/app/projetos/ProjectManager";

export default async function ProjetosPage() {
  const { companyId } = await getCurrentCompany();
  const projects = await prisma.project.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <ProjectManager
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        taskCount: p._count.tasks,
      }))}
    />
  );
}
