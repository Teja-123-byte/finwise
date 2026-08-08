import { Trash2 } from "lucide-react";
import { categoryById, type Transaction } from "@/data/finance";
import { inr, longDate } from "@/lib/money";
import { cn } from "@/lib/utils";

export function TransactionList({
  transactions,
  onRemove,
  limit,
}: {
  transactions: Transaction[];
  onRemove?: (id: string) => void;
  limit?: number;
}) {
  const rows = limit ? transactions.slice(0, limit) : transactions;

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nothing here yet. Add your first entry above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((t) => {
        const cat = categoryById[t.category];
        return (
          <li key={t.id} className="group flex items-center gap-3 py-2.5">
            <span
              className="size-8 shrink-0 rounded-lg"
              style={{ background: `color-mix(in oklch, ${cat.color} 22%, transparent)` }}
              aria-hidden
            >
              <span
                className="mx-auto mt-[13px] block size-2.5 rounded-full"
                style={{ background: cat.color }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{t.note}</p>
              <p className="text-xs text-muted-foreground">
                {cat.label} · {longDate(t.date)}
              </p>
            </div>
            <span
              className={cn(
                "tnum text-sm font-semibold",
                t.kind === "income" ? "text-[var(--pos)]" : "text-foreground",
              )}
            >
              {t.kind === "income" ? "+" : "−"}
              {inr(t.amount)}
            </span>
            {onRemove ? (
              <button
                onClick={() => onRemove(t.id)}
                aria-label={`Delete ${t.note}`}
                className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
