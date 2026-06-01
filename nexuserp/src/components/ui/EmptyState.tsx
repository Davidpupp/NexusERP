import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-d-surface-container flex items-center justify-center mb-4">
        <Icon size={28} className="text-d-on-surface-variant" />
      </div>
      <p className="text-ice-white font-semibold">{title}</p>
      {description && <p className="text-sm text-d-on-surface-variant mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
