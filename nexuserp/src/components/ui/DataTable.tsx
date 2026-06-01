"use client";

import { cn } from "@/lib/utils";

export interface Column<T> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => React.ReactNode;
  readonly className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  readonly columns: Column<T>[];
  readonly rows: T[];
  readonly onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-d-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-d-surface-container">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-d-on-surface-variant",
                  c.className
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-t border-d-border text-ice-white",
                onRowClick && "cursor-pointer hover:bg-d-surface-container/60"
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
