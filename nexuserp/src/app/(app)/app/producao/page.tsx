import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { TaskBoard } from "@/components/app/producao/TaskBoard";

export default async function ProducaoPage() {
  const { companyId } = await getCurrentCompany();
  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.project.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <TaskBoard
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      }))}
      projects={projects}
    />
  );
}
