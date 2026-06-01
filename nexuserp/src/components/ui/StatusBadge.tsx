import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "yellow";

const TONES: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  yellow: "bg-nexus-yellow/15 text-nexus-yellow",
  neutral: "bg-d-surface-container text-d-on-surface-variant",
};

export function StatusBadge({ label, tone = "neutral" }: { readonly label: string; readonly tone?: Tone }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", TONES[tone])}>
      {label}
    </span>
  );
}
