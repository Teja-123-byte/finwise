import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Panel } from "@/components/fintrail/app-shell";
import { useFinanceStore } from "@/stores/finance-store";
import { QuickAdd } from "@/components/fintrail/quick-add";
import { TransactionList } from "@/components/fintrail/transaction-list";
import { CATEGORIES, monthKey, monthLabel, monthsIn, summarise, type CategoryId } from "@/data/finance";
import { inr } from "@/lib/money";

const title = "Transactions — Fintrail";
const description =
  "Search, filter and manage every logged income and expense entry, grouped by month and category.";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const removeTransaction = useFinanceStore((state) => state.removeTransaction);
  const months = useMemo(() => monthsIn(transactions), [transactions]);
  const [month, setMonth] = useState("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (month === "all" || monthKey(t.date) === month) &&
          (category === "all" || t.category === category) &&
          (query.trim() === "" || t.note.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [transactions, month, category, query],
  );
  const summary = summarise(rows);

  return (
    <AppShell
      title="Transactions"
      subtitle="Everything you have logged. Filter by month, category or keyword, and delete anything you added by mistake."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Add an entry" hint="Auto-categorised as you type">
          <QuickAdd />
        </Panel>

        <Panel title="All entries" hint={`${rows.length} shown`} className="lg:col-span-2">
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            >
              <option value="all">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId | "all")}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 flex flex-wrap gap-4 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              In <span className="tnum font-semibold text-[var(--pos)]">{inr(summary.income)}</span>
            </span>
            <span>
              Out <span className="tnum font-semibold text-[var(--neg)]">{inr(summary.expense)}</span>
            </span>
            <span>
              Net <span className="tnum font-semibold text-foreground">{inr(summary.net)}</span>
            </span>
          </div>

          <TransactionList transactions={rows} onRemove={removeTransaction} />
        </Panel>
      </div>
    </AppShell>
  );
}
