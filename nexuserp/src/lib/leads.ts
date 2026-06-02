/**
 * Constantes de solicitações comerciais (leads). Módulo puro — não é "use server",
 * por isso pode ser importado tanto por server actions quanto por componentes client.
 */
export const LEAD_STATUSES = ["new", "contacted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadStatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "yellow";

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: LeadStatusTone }> = {
  new: { label: "Novo", tone: "yellow" },
  contacted: { label: "Contatado", tone: "info" },
  won: { label: "Ganho", tone: "success" },
  lost: { label: "Perdido", tone: "danger" },
};
