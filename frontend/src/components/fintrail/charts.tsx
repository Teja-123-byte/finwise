import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { byCategory, dailySeries, monthlyTotals, type Transaction } from "@/data/finance";
import { inr } from "@/lib/money";

const axis = {
  stroke: "var(--color-border)",
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--surface-border)",
    borderRadius: "0.75rem",
    fontSize: "12px",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

export function DailyTrendChart({
  transactions,
  month,
}: {
  transactions: Transaction[];
  month: string;
}) {
  const data = dailySeries(transactions, month);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--neg)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--neg)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" {...axis} interval={4} />
        <YAxis {...axis} width={54} tickFormatter={(v: number) => inr(v, { compact: true })} />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number, name: string) => [inr(v), name === "cumulative" ? "Spent so far" : "Spent"]}
          labelFormatter={(d: number) => `Day ${d}`}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="var(--neg)"
          strokeWidth={2}
          fill="url(#spendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ transactions }: { transactions: Transaction[] }) {
  const rows = byCategory(transactions);
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No spending logged yet.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="label"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {rows.map((r) => (
              <Cell key={r.id} fill={r.color} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v: number) => inr(v)} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-2">
        {rows.slice(0, 6).map((r) => (
          <li key={r.id} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="truncate text-foreground">{r.label}</span>
            <span className="tnum ml-auto text-muted-foreground">{inr(r.value)}</span>
            <span className="tnum w-10 text-right text-xs text-muted-foreground">
              {Math.round(r.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthlyBars({ transactions }: { transactions: Transaction[] }) {
  const data = monthlyTotals(transactions);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2}>
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} width={54} tickFormatter={(v: number) => inr(v, { compact: true })} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
          formatter={(v: number, name: string) => [inr(v), name === "income" ? "Income" : name === "expense" ? "Spent" : "Savings"]}
        />
        <Bar dataKey="income" fill="var(--pos)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="var(--neg)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="savings" fill="var(--accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
