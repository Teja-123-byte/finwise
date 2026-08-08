import { useState, type FormEvent } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  autoCategorise,
  categoryById,
  expenseCategories,
  incomeCategories,
  type CategoryId,
  type TxKind,
} from "@/data/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { todayIso } from "@/lib/money";
import { cn } from "@/lib/utils";

/** The 10-second quick-add flow: note + amount, category guessed for you. */
export function QuickAdd() {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const [kind, setKind] = useState<TxKind>("expense");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [override, setOverride] = useState<CategoryId | "auto">("auto");

  const guess = autoCategorise(note || "", kind);
  const category = override === "auto" ? guess : override;
  const options = kind === "income" ? incomeCategories : expenseCategories;

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!note.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error("Add a short note and an amount above zero.");
      return;
    }
    addTransaction({ note: note.trim(), amount: value, kind, date, category, autoClassify: override === "auto" });
    toast.success(`Logged ${note.trim()} to ${categoryById[category].label}`);
    setNote("");
    setAmount("");
    setOverride("auto");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["expense", "income"] as TxKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setOverride("auto");
            }}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              kind === k
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">What was it?</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={kind === "income" ? "Internship stipend" : "Swiggy order with friends"}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Amount (₹)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="240"
            className="tnum mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="tnum mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Category</span>
          <select
            value={override}
            onChange={(e) => setOverride(e.target.value as CategoryId | "auto")}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          >
            <option value="auto">Auto — {categoryById[guess].label}</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Auto-categorised as{" "}
          <span className="font-medium text-foreground">{categoryById[category].label}</span>
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>
    </form>
  );
}
