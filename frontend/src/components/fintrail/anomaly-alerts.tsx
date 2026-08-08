import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { Anomaly } from "@/data/finance";
import { cn } from "@/lib/utils";

export function AnomalyAlerts({ items }: { items: Anomaly[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-[var(--pos)]" />
        Nothing unusual this month — your spending is tracking normally.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li
          key={a.id}
          className={cn(
            "flex gap-3 rounded-xl border p-3",
            a.severity === "high"
              ? "border-[var(--neg)]/35 bg-[var(--neg)]/8"
              : "border-border bg-muted/50",
          )}
        >
          <AlertTriangle
            className={cn(
              "mt-0.5 size-4 shrink-0",
              a.severity === "high" ? "text-[var(--neg)]" : "text-muted-foreground",
            )}
          />
          <div>
            <p className="text-sm font-medium text-foreground">{a.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
