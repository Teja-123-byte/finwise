import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { ArrowRight } from "lucide-react";
import { AppShell, Panel } from "@/components/fintrail/app-shell";
import { useFinance } from "@/components/fintrail/finance-provider";
import { LoginPage } from "@/components/fintrail/login-page";
import { SummaryCards } from "@/components/fintrail/summary-cards";
import { CategoryDonut, DailyTrendChart, MonthlyBars } from "@/components/fintrail/charts";
import { QuickAdd } from "@/components/fintrail/quick-add";
import { TransactionList } from "@/components/fintrail/transaction-list";
import { AnomalyAlerts } from "@/components/fintrail/anomaly-alerts";
import { anomalies, monthKey, monthLabel, monthsIn, summarise } from "@/data/finance";

const title = "Fintrail — student money dashboard";
const description =
  "Log income and expenses in seconds and see monthly summaries, category breakdowns, savings goals and spending alerts in one clear picture.";

export const Route = createFileRoute("/")({
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
  component: HomePage,
});

function HomePage() {
  const isAuthenticated = useFinanceStore((state) => state.isAuthenticated);
  const hydrated = useFinanceStore((state) => state.hydrated);
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!hydrated) return null;
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => undefined} />;
  }

  return <DashboardPage />;
}

function DashboardPage() {
  const { transactions } = useFinance();

  const months = useMemo(() => monthsIn(transactions), [transactions]);
  const [month, setMonth] = useState<string | null>(null);
  // A new workspace has no transaction month yet. Use the current month so
  // charts and labels receive a valid date while the dashboard is empty.
  const active = month && months.includes(month) ? month : (months[0] ?? monthKey(new Date().toISOString()));

  const rows = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === active),
    [transactions, active],
  );
  const prevKey = months[months.indexOf(active) + 1];
  const prev = useMemo(
    () => (prevKey ? summarise(transactions.filter((t) => monthKey(t.date) === prevKey)) : undefined),
    [transactions, prevKey],
  );
  const summary = summarise(rows);
  const alerts = useMemo(() => anomalies(transactions, active), [transactions, active]);

  return (
    <AppShell
      title={`Your money, ${monthLabel(active)}`}
      subtitle="Every rupee in and out, categorised automatically. Add an entry in about ten seconds and the whole dashboard updates."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {months.slice(0, 6).map((m) => (
          <button
            key={m}
            onClick={() => setMonth(m)}
            className={
              m === active
                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                : "rounded-full border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            }
          >
            {monthLabel(m)}
          </button>
        ))}
      </div>

      <SummaryCards summary={summary} previous={prev} />

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Spending through the month"
          hint="Cumulative spend, day by day"
          className="lg:col-span-2"
        >
          <DailyTrendChart transactions={transactions} month={active} />
        </Panel>

        <Panel title="Quick add" hint="Note, amount, done">
          <QuickAdd />
        </Panel>

        <Panel title="Where it goes" hint="Category breakdown this month" className="lg:col-span-2">
          <CategoryDonut transactions={rows} />
        </Panel>

        <Panel title="Heads up" hint="Unusual spending we spotted">
          <AnomalyAlerts items={alerts} />
        </Panel>

        <Panel title="Income vs spending" hint="Last six months" className="lg:col-span-3">
          <MonthlyBars transactions={transactions} />
        </Panel>

        <Panel
          title="Recent activity"
          className="lg:col-span-3"
          action={
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              See all <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <TransactionList transactions={rows} limit={8} />
        </Panel>
      </div>
    </AppShell>
  );
}
