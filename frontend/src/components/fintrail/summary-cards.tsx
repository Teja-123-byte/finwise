import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import type { MonthSummary } from "@/data/finance";
import { inr, pct } from "@/lib/money";
import { cn } from "@/lib/utils";

function Card({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: "income" | "expense" | "net" | "rate";
}) {
  return (
    <div className="surface-raised p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            tone === "income" && "bg-[var(--pos)]/12 text-[var(--pos)]",
            tone === "expense" && "bg-[var(--neg)]/12 text-[var(--neg)]",
            (tone === "net" || tone === "rate") && "bg-primary/12 text-primary",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="kpi-value mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function SummaryCards({
  summary,
  previous,
}: {
  summary: MonthSummary;
  previous?: MonthSummary;
}) {
  const delta =
    previous && previous.expense > 0
      ? (summary.expense - previous.expense) / previous.expense
      : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        label="Income"
        value={inr(summary.income)}
        sub={`${summary.count} entries logged`}
        tone="income"
        icon={<ArrowUpRight className="size-4" />}
      />
      <Card
        label="Spent"
        value={inr(summary.expense)}
        sub={
          delta === null
            ? "No prior month to compare"
            : `${delta >= 0 ? "+" : ""}${pct(delta)} vs last month`
        }
        tone="expense"
        icon={<ArrowDownRight className="size-4" />}
      />
      <Card
        label="Left over"
        value={inr(summary.net)}
        sub={summary.net >= 0 ? "You are in the green" : "Spending above income"}
        tone="net"
        icon={<Wallet className="size-4" />}
      />
      <Card
        label="Savings rate"
        value={pct(Math.max(0, summary.savingsRate))}
        sub="Share of income kept"
        tone="rate"
        icon={<PiggyBank className="size-4" />}
      />
    </div>
  );
}
