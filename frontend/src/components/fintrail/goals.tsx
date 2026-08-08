import { useState } from "react";
import { CheckCircle2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Goal } from "@/data/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { daysUntil, inr } from "@/lib/money";

function Ring({ progress, color }: { progress: number; color: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="9" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, progress))}
        style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

export function GoalCard({ goal }: { goal: Goal }) {
  const contributeToGoal = useFinanceStore((state) => state.contributeToGoal);
  const toggleGoalCompletion = useFinanceStore((state) => state.toggleGoalCompletion);
  const [amount, setAmount] = useState("");
  const progress = goal.target > 0 ? goal.saved / goal.target : 0;
  const left = Math.max(0, goal.target - goal.saved);
  const days = daysUntil(goal.deadline);
  const perWeek = days > 0 ? (left / days) * 7 : left;

  return (
    <div className="surface-raised p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring progress={progress} color={goal.color} />
          <span className="kpi-value absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{goal.name}</h3>
            {goal.completed ? (
              <span className="rounded-full bg-(--pos)/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--pos)">
                Done
              </span>
            ) : null}
          </div>
          <p className="tnum mt-0.5 text-sm text-muted-foreground">
            {inr(goal.saved)} of {inr(goal.target)}
          </p>
          {goal.note ? <p className="mt-1 text-xs text-muted-foreground">{goal.note}</p> : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {left === 0
              ? "Goal reached — nice work."
              : days > 0
                ? `${inr(perWeek)} a week for the next ${days} days`
                : "Deadline passed"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="Add savings"
          className="tnum w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
        <button
          onClick={() => {
            const v = Number(amount);
            if (!Number.isFinite(v) || v <= 0) {
              toast.error("Enter an amount above zero.");
              return;
            }
            void contributeToGoal(goal.id, v);
            setAmount("");
            toast.success(`${inr(v)} added to ${goal.name}`);
          }}
          className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-input px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Mark as completed when you hit the target.
        </div>
        <button
          onClick={() => void toggleGoalCompletion(goal.id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <CheckCircle2 className="size-3.5" />
          {goal.completed ? "Undo" : "Complete"}
        </button>
      </div>
    </div>
  );
}

export function NewGoalForm() {
  const addGoal = useFinanceStore((state) => state.addGoal);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="surface-raised flex flex-col gap-3 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-foreground">New savings goal</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What are you saving for?"
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          inputMode="decimal"
          placeholder="Target ₹"
          className="tnum w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="tnum w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. trip fund)"
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />
      <button
        onClick={() => {
          const t = Number(target);
          if (!name.trim() || !Number.isFinite(t) || t <= 0 || !deadline) {
            toast.error("Give the goal a name, a target and a date.");
            return;
          }
          void addGoal({
            name: name.trim(),
            target: t,
            saved: 0,
            deadline,
            color: "var(--cat-education)",
            note: note.trim() || undefined,
          });
          setName("");
          setTarget("");
          setDeadline("");
          setNote("");
          toast.success("Goal created");
        }}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Plus className="size-4" />
        Create goal
      </button>
    </div>
  );
}
