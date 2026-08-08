import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/fintrail/app-shell";
import { useFinanceStore } from "@/stores/finance-store";
import { GoalCard, NewGoalForm } from "@/components/fintrail/goals";
import { inr } from "@/lib/money";

const title = "Savings goals — Fintrail";
const description =
  "Track savings goals with progress rings, see how much to set aside each week, and add contributions as you go.";

export const Route = createFileRoute("/goals")({
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
  component: GoalsPage,
});

function GoalsPage() {
  const goals = useFinanceStore((state) => state.goals);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <AppShell
      title="Savings goals"
      subtitle="Pick something worth saving for, then watch the ring close. Fintrail works out the weekly amount you need to stay on pace."
    >
      <Panel
        title="All goals together"
        hint={`${inr(totalSaved)} saved of ${inr(totalTarget)} across ${goals.length} goals`}
      >
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
          />
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
        <NewGoalForm />
      </div>
    </AppShell>
  );
}
