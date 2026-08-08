import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { settlements, splitBalances, type SplitMember } from "@/data/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { inr, shortDate, todayIso } from "@/lib/money";
import { cn } from "@/lib/utils";

export function SplitSummary() {
  const groups = useFinanceStore((state) => state.groups);
  const selectedGroupId = useFinanceStore((state) => state.selectedGroupId);
  const members = useFinanceStore((state) => state.members);
  const user = useFinanceStore((state) => state.user);
  const splits = useFinanceStore((state) => state.splits);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const splitMembers = selectedGroup
    ? selectedGroup.members
    : user.id
      ? [{ id: user.id, name: "Me" }, ...members.filter((m) => m.id !== user.id)]
      : members;
  const filteredSplits = selectedGroupId ? splits.filter((entry) => entry.group === selectedGroupId) : [];
  const balances = splitBalances(splitMembers, filteredSplits);
  const owed = settlements(splitMembers, filteredSplits);

  return (
    <div className="space-y-4">
      <ul className="grid gap-2 sm:grid-cols-2">
        {balances.map(({ member, net }) => (
          <li
            key={member.id}
            className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2"
          >
            <span className="text-sm font-medium text-foreground">{member.name}</span>
            <span
              className={cn(
                "tnum text-sm font-semibold",
                net > 0.5
                  ? "text-(--pos)"
                  : net < -0.5
                    ? "text-(--neg)"
                    : "text-muted-foreground",
              )}
            >
              {net > 0.5 ? `gets ${inr(net)}` : net < -0.5 ? `owes ${inr(-net)}` : "settled"}
            </span>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Simplest way to settle
        </p>
        {owed.length === 0 ? (
          <p className="text-sm text-muted-foreground">Everyone is square.</p>
        ) : (
          <ul className="space-y-1.5">
            {owed.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <span className="font-medium">{s.from.name}</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="font-medium">{s.to.name}</span>
                <span className="tnum ml-auto font-semibold">{inr(s.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SplitEntries() {
  const groups = useFinanceStore((state) => state.groups);
  const selectedGroupId = useFinanceStore((state) => state.selectedGroupId);
  const members = useFinanceStore((state) => state.members);
  const user = useFinanceStore((state) => state.user);
  const splits = useFinanceStore((state) => state.splits);
  const removeSplit = useFinanceStore((state) => state.removeSplit);
  const toggleSplitSettlement = useFinanceStore((state) => state.toggleSplitSettlement);
  const clearAllSettlements = useFinanceStore((state) => state.clearAllSettlements);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const splitMembers = selectedGroup
    ? selectedGroup.members
    : user.id
      ? [{ id: user.id, name: "Me" }, ...members.filter((m) => m.id !== user.id)]
      : members;
  const filteredSplits = selectedGroupId ? splits.filter((entry) => entry.group === selectedGroupId) : [];
  const settledSplits = filteredSplits.filter((entry) => entry.settled);
  const nameOf = (id: string) => splitMembers.find((m) => m.id === id)?.name ?? "Someone";

  return (
    <div className="space-y-3">
      {settledSplits.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <p className="text-sm font-medium text-foreground">{settledSplits.length} settled expense{settledSplits.length === 1 ? "" : "s"}</p>
          <button
            type="button"
            onClick={async () => {
              await clearAllSettlements();
              toast.success("Cleared all settled expenses.");
            }}
            className="rounded-full border border-input px-3 py-1 text-xs font-medium transition hover:bg-muted"
          >
            Clear all settled
          </button>
        </div>
      ) : null}

      <ul className="divide-y divide-border">
        {filteredSplits.map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{e.label}</p>
                {e.settled ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-500">
                    Settled
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {nameOf(e.paidBy)} paid · split {e.among.length} ways · {shortDate(e.date)}
              </p>
            </div>
            <span className="tnum text-sm font-semibold text-foreground">{inr(e.amount)}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void toggleSplitSettlement(e.id)}
                aria-label={`Mark ${e.label} as ${e.settled ? "unsettled" : "settled"}`}
                className={cn("rounded-lg p-1.5 transition", e.settled ? "bg-(--pos)/12 text-(--pos)" : "text-muted-foreground hover:bg-muted")}
              >
                <CheckCircle2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void removeSplit(e.id)}
                aria-label={`Delete ${e.label}`}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewSplitForm() {
  const groups = useFinanceStore((state) => state.groups);
  const selectedGroupId = useFinanceStore((state) => state.selectedGroupId);
  const members = useFinanceStore((state) => state.members);
  const user = useFinanceStore((state) => state.user);
  const addSplit = useFinanceStore((state) => state.addSplit);
  const createGroup = useFinanceStore((state) => state.createGroup);
  const setSelectedGroupId = useFinanceStore((state) => state.setSelectedGroupId);
  const searchUsers = useFinanceStore((state) => state.searchUsers);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SplitMember[]>([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<SplitMember[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const splitMembers = selectedGroup ? selectedGroup.members : user.id
    ? [{ id: user.id, name: "Me" }, ...members.filter((m) => m.id !== user.id)]
    : members;
  const [paidBy, setPaidBy] = useState(splitMembers[0]?.id ?? "");
  const [among, setAmong] = useState<string[]>(splitMembers.map((m) => m.id));

  useEffect(() => {
    if (splitMembers.length === 0) return;
    if (!splitMembers.some((member) => member.id === paidBy)) {
      setPaidBy(splitMembers[0].id);
    }
    setAmong((current) =>
      current.length === 0 || current.some((id) => !splitMembers.some((member) => member.id === id))
        ? splitMembers.map((member) => member.id)
        : current,
    );
  }, [splitMembers, paidBy]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      const results = await searchUsers(searchQuery.trim());
      setSearchResults(results.filter((candidate) => candidate.id !== user.id && !selectedGroupUsers.some((member) => member.id === candidate.id)));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery, searchUsers, user.id, selectedGroupUsers]);

  const toggle = (id: string) =>
    setAmong((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const addSelectedUser = (member: SplitMember) => {
    setSelectedGroupUsers((current) => Array.from(new Map([...current, member].map((m) => [m.id, m])).values()));
  };

  const removeSelectedUser = (id: string) => {
    setSelectedGroupUsers((current) => current.filter((member) => member.id !== id));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Enter a name for the group.");
      return;
    }
    if (selectedGroupUsers.length === 0) {
      toast.error("Add at least one registered member to create a group.");
      return;
    }

    await createGroup(groupName.trim(), selectedGroupUsers.map((member) => member.id));
    setGroupName("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedGroupUsers([]);
    setShowCreateGroup(false);
    toast.success("Group created and selected.");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-input p-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Group</p>
            <p className="text-sm text-foreground">Select the shared group for this split.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateGroup((current) => !current)}
            className="rounded-full border border-input px-3 py-1 text-xs font-medium transition hover:bg-muted"
          >
            {showCreateGroup ? "Cancel" : "Create group"}
          </button>
        </div>

        {groups.length > 0 ? (
          <select
            value={selectedGroupId ?? ""}
            onChange={(e) => setSelectedGroupId(e.target.value || null)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          >
            <option value="" disabled>
              Select a group
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">No groups yet. Create one to share expenses with registered users.</p>
        )}

        {selectedGroupId ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Group members</p>
            <div className="flex flex-wrap gap-2">
              {splitMembers.map((member) => (
                <span key={member.id} className="rounded-full border border-input px-3 py-1 text-xs font-medium">
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {showCreateGroup ? (
        <div className="rounded-xl border border-input p-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <button
              type="button"
              onClick={handleCreateGroup}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create group
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
              <Search className="size-4 text-muted-foreground" />
            </div>

            {searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((result) => (
                  <li key={result.id} className="flex items-center justify-between rounded-xl border border-input px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSelectedUser(result)}
                      className="rounded-full border border-input px-3 py-1 text-xs font-medium transition hover:bg-muted"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchQuery.trim() ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : null}

            {selectedGroupUsers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected members</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGroupUsers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => removeSelectedUser(member.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1 text-xs font-medium"
                    >
                      <span>{member.name}</span>
                      <span className="text-muted-foreground">×</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="What was shared? e.g. Groceries run"
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. trip groceries)"
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="Total ₹"
          className="tnum w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        >
          {splitMembers.map((m) => (
            <option key={m.id} value={m.id}>
              Paid by {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {splitMembers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => toggle(m.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              among.includes(m.id)
                ? "border-primary bg-primary/12 text-primary"
                : "border-input text-muted-foreground hover:bg-muted",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
      <button
        onClick={async () => {
          const v = Number(amount);
          if (!selectedGroupId) {
            toast.error("Please select or create a group before adding a shared expense.");
            return;
          }
          if (!label.trim() || !Number.isFinite(v) || v <= 0 || among.length === 0) {
            toast.error("Add a label, an amount and at least one person.");
            return;
          }
          try {
            await addSplit({
              group: selectedGroupId,
              label: label.trim(),
              amount: v,
              paidBy,
              among,
              date: todayIso(),
              note: note.trim() || undefined,
              settled: false,
            });
            setLabel("");
            setAmount("");
            setNote("");
            toast.success("Shared expense added");
          } catch {
            toast.error("Unable to add shared expense.");
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Add shared expense
      </button>
    </div>
  );
}
