import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/fintrail/app-shell";
import { NewSplitForm, SplitEntries, SplitSummary } from "@/components/fintrail/split";
import { useFinanceStore } from "@/stores/finance-store";

const title = "Split expenses — Fintrail";
const description =
  "Share costs with roommates or a group trip: log who paid, who is in, and get the shortest list of transfers to settle up.";

export const Route = createFileRoute("/split")({
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
  component: SplitPage,
});

function SplitPage() {
  const clearAllSettlements = useFinanceStore((state) => state.clearAllSettlements);

  return (
    <AppShell
      title="Split with the group"
      subtitle="Rent, groceries, cab fares — log the shared stuff once and Fintrail works out who owes whom in the fewest transfers."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Who owes what" hint="Net position across all shared expenses" className="lg:col-span-2">
          <SplitSummary />
        </Panel>

        <Panel title="Add a shared expense" hint="Tap the names sharing the cost">
          <NewSplitForm />
        </Panel>

        <Panel
          title="Shared expenses"
          className="lg:col-span-3"
          action={
            <button
              type="button"
              onClick={() => void clearAllSettlements()}
              className="rounded-full border border-input px-3 py-1 text-xs font-medium transition hover:bg-muted"
            >
              Clear all settlements
            </button>
          }
        >
          <SplitEntries />
        </Panel>
      </div>
    </AppShell>
  );
}
