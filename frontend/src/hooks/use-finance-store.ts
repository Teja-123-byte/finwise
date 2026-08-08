import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Goal,
  type SplitEntry,
  type SplitMember,
  type Transaction,
} from "@/data/finance";
import { apiRequest } from "@/lib/api-client";

// Versioned so existing demo records are not carried into a new user's workspace.
const KEY = "fintrail-state-v3";

function createFreshState(): Persisted {
  const name = typeof window !== "undefined" ? (window.localStorage.getItem("fintrail-signup-name") ?? "") : "";
  const email = typeof window !== "undefined" ? (window.localStorage.getItem("fintrail-signup-email") ?? "") : "";
  return {
    transactions: [],
    goals: [],
    members: [],
    splits: [],
    user: {
      name,
      email,
    },
  };
}

export interface User {
  name: string;
  email: string;
}

interface Persisted {
  transactions: Transaction[];
  goals: Goal[];
  members: SplitMember[];
  splits: SplitEntry[];
  user: User;
}

/**
 * Finance store. Everything lives in React state and is mirrored to
 * localStorage so edits survive a refresh. Swap this for API calls when a
 * backend lands — the components only use the returned actions.
 */
export function useFinanceStore() {
  const [state, setState] = useState<Persisted>(createFreshState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!window.localStorage.getItem("fintrail-token")) return;
    apiRequest<User & { id: string }>("/auth/me")
      .then(({ name, email }) => setState((current) => ({ ...current, user: { name, email } })))
      .catch(() => {
        // The route guard will send a user with an expired token back to sign in on reload.
      });
    apiRequest<Array<Omit<Transaction, "id" | "date"> & { id: string; _id?: string; date: string }>>("/transactions")
      .then((transactions) => setState((current) => ({
        ...current,
        transactions: transactions.map((transaction) => ({
          ...transaction,
          id: transaction.id ?? transaction._id ?? "",
          date: transaction.date.slice(0, 10),
        })),
      })))
      .catch(() => {
        // The cache remains available if the API is temporarily unreachable.
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, hydrated]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id"> & { autoClassify?: boolean }) => {
    const { autoClassify, ...transactionData } = tx;
    const temporaryId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setState((s) => ({
      ...s,
      transactions: [{ ...transactionData, id: temporaryId }, ...s.transactions].sort(
        (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
      ),
    }));
    apiRequest<Transaction & { _id?: string }>("/transactions", { method: "POST", body: JSON.stringify(tx) })
      .then((saved) => setState((s) => ({
        ...s,
        transactions: s.transactions.map((transaction) => transaction.id === temporaryId
          ? { ...saved, id: saved.id ?? saved._id ?? temporaryId, date: saved.date.slice(0, 10) }
          : transaction),
      })))
      .catch(() => setState((s) => ({ ...s, transactions: s.transactions.filter((transaction) => transaction.id !== temporaryId) })));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
    apiRequest<void>(`/transactions/${id}`, { method: "DELETE" }).catch(() => {
      // A refresh reloads the last server-confirmed version if the request fails.
    });
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, saved: Math.max(0, Math.min(g.target, g.saved + amount)) } : g,
      ),
    }));
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...goal, id: `g-${Date.now()}` }] }));
  }, []);

  const addSplit = useCallback((entry: Omit<SplitEntry, "id">) => {
    setState((s) => ({ ...s, splits: [{ ...entry, id: `s-${Date.now()}` }, ...s.splits] }));
  }, []);

  const addMember = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setState((s) => ({
      ...s,
      members: [...s.members, { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: trimmedName }],
    }));
  }, []);

  const removeSplit = useCallback((id: string) => {
    setState((s) => ({ ...s, splits: s.splits.filter((e) => e.id !== id) }));
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const reset = useCallback(() => setState(createFreshState()), []);

  return {
    ...state,
    hydrated,
    addTransaction,
    removeTransaction,
    contributeToGoal,
    addGoal,
    addSplit,
    addMember,
    removeSplit,
    updateUser,
    reset,
  };
}
