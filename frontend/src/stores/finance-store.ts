import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Goal,
  type Group,
  type SplitEntry,
  type SplitMember,
  type Transaction,
} from "@/data/finance";
import {
  createGoal,
  createSplit,
  createTransaction,
  createGroup as createGroupApi,
  deleteGoal,
  deleteSplit,
  deleteTransaction,
  fetchCurrentUser,
  fetchGoals,
  fetchGroups,
  fetchSplits,
  fetchTransactions,
  loginAccount,
  registerAccount,
  searchUsers as searchUsersApi,
  updateGoal,
  updateSplit,
  type FinanceUser,
} from "@/lib/finance-api";
import { clearAuthTokenCookie, getAuthTokenCookie, setAuthTokenCookie } from "@/lib/auth-cookie";

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  groups: Group[];
  selectedGroupId: string | null;
  members: SplitMember[];
  splits: SplitEntry[];
  user: FinanceUser;
  hydrated: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  theme: "light" | "dark";
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, "id"> & { autoClassify?: boolean }) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  addSplit: (entry: Omit<SplitEntry, "id">) => Promise<void>;
  searchUsers: (query: string) => Promise<SplitMember[]>;
  addMember: (name: string) => void;
  createGroup: (name: string, memberIds: string[]) => Promise<void>;
  setSelectedGroupId: (groupId: string | null) => void;
  removeSplit: (id: string) => Promise<void>;
  toggleGoalCompletion: (id: string) => Promise<void>;
  toggleSplitSettlement: (id: string) => Promise<void>;
  clearAllSettlements: () => Promise<void>;
  updateUser: (user: FinanceUser) => void;
  reset: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const createDefaultUser = () => ({
  id: "",
  name: "",
  email: "",
});

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      groups: [],
      selectedGroupId: null,
      members: [],
      splits: [],
      user: createDefaultUser(),
      hydrated: false,
      isAuthenticated: false,
      loading: false,
      error: null,
      theme: "light",

      initialize: async () => {
        if (typeof window === "undefined") return;
        const token = getAuthTokenCookie() ?? window.localStorage.getItem("fintrail-token");
        const savedTheme = window.localStorage.getItem("fintrail-theme") as "light" | "dark" | null;
        const initialTheme = savedTheme === "dark" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
        if (!token) {
          set({ hydrated: true, isAuthenticated: false, loading: false, theme: initialTheme });
          return;
        }

        set({ loading: true, error: null });
        try {
          const [user, transactions, goals, splits, groups] = await Promise.all([
            fetchCurrentUser(),
            fetchTransactions(),
            fetchGoals(),
            fetchSplits(),
            fetchGroups(),
          ]);
          const selectedGroupId = groups.find((group) => group.id === get().selectedGroupId)?.id ?? groups[0]?.id ?? null;
          const members = selectedGroupId ? groups.find((group) => group.id === selectedGroupId)?.members ?? [] : [];
          set({
            user,
            transactions,
            goals,
            splits,
            groups,
            selectedGroupId,
            members,
            isAuthenticated: true,
            hydrated: true,
            loading: false,
            theme: initialTheme,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unable to sync finance data.",
            isAuthenticated: false,
            hydrated: true,
            loading: false,
            theme: initialTheme,
          });
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        const response = await loginAccount(email, password);
        if (typeof window !== "undefined") {
          setAuthTokenCookie(response.token);
          window.localStorage.setItem("fintrail-token", response.token);
          window.localStorage.setItem("fintrail-auth-v2", "true");
          window.localStorage.setItem("fintrail-signup-name", response.user.name);
          window.localStorage.setItem("fintrail-signup-email", response.user.email);
        }
        const [groups, splits] = await Promise.all([fetchGroups(), fetchSplits()]);
        const selectedGroupId = groups[0]?.id ?? null;
        const members = selectedGroupId ? groups.find((group) => group.id === selectedGroupId)?.members ?? [] : [];
        set({ user: response.user, groups, splits, selectedGroupId, members, isAuthenticated: true, loading: false });
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        const response = await registerAccount(name, email, password);
        if (typeof window !== "undefined") {
          setAuthTokenCookie(response.token);
          window.localStorage.setItem("fintrail-auth-v2", "true");
          window.localStorage.setItem("fintrail-signup-name", response.user.name);
          window.localStorage.setItem("fintrail-signup-email", response.user.email);
        }
        const [groups, splits] = await Promise.all([fetchGroups(), fetchSplits()]);
        const selectedGroupId = groups[0]?.id ?? null;
        const members = selectedGroupId ? groups.find((group) => group.id === selectedGroupId)?.members ?? [] : [];
        set({ user: response.user, groups, splits, selectedGroupId, members, isAuthenticated: true, loading: false });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          clearAuthTokenCookie();
          window.localStorage.removeItem("fintrail-auth-v2");
          window.localStorage.removeItem("fintrail-signup-name");
          window.localStorage.removeItem("fintrail-signup-email");
        }
        set({
          user: createDefaultUser(),
          transactions: [],
          goals: [],
          groups: [],
          selectedGroupId: null,
          members: [],
          splits: [],
          isAuthenticated: false,
          hydrated: true,
          error: null,
        });
      },

      addTransaction: async (tx) => {
        const temporaryId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          transactions: [{ ...tx, id: temporaryId, date: tx.date }, ...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
        }));

        try {
          const saved = await createTransaction(tx);
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === temporaryId ? saved : transaction,
            ),
          }));
        } catch (error) {
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== temporaryId),
            error: error instanceof Error ? error.message : "Unable to save transaction.",
          }));
        }
      },

      removeTransaction: async (id) => {
        set((state) => ({ transactions: state.transactions.filter((transaction) => transaction.id !== id) }));
        try {
          await deleteTransaction(id);
        } catch (error) {
          set((state) => ({
            error: error instanceof Error ? error.message : "Unable to delete transaction.",
          }));
        }
      },

      contributeToGoal: async (id, amount) => {
        const current = get().goals.find((goal) => goal.id === id);
        if (!current) return;
        const nextSaved = Math.max(0, Math.min(current.target, current.saved + amount));
        const optimistic = get().goals.map((goal) => (goal.id === id ? { ...goal, saved: nextSaved, completed: nextSaved >= current.target } : goal));
        set({ goals: optimistic });

        try {
          const updated = await updateGoal(id, { saved: nextSaved, completed: nextSaved >= current.target });
          set((state) => ({ goals: state.goals.map((goal) => (goal.id === id ? updated : goal)) }));
        } catch (error) {
          set((state) => ({
            goals: state.goals.map((goal) => (goal.id === id ? current : goal)),
            error: error instanceof Error ? error.message : "Unable to update goal.",
          }));
        }
      },

      addGoal: async (goal) => {
        try {
          const created = await createGoal(goal);
          set((state) => ({ goals: [created, ...state.goals] }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to save goal." });
        }
      },

      addSplit: async (entry) => {
        try {
          const created = await createSplit(entry);
          set((state) => ({ splits: [created, ...state.splits] }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to save split." });
        }
      },
      searchUsers: async (query) => {
        try {
          return await searchUsersApi(query);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to search users." });
          return [];
        }
      },
      createGroup: async (name, memberIds) => {
        try {
          const created = await createGroupApi(name, memberIds);
          set((state) => ({
            groups: [created, ...state.groups],
            selectedGroupId: created.id,
            members: created.members,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to create group." });
        }
      },
      setSelectedGroupId: (groupId) => {
        set((state) => {
          const selectedGroup = state.groups.find((group) => group.id === groupId);
          return {
            selectedGroupId: groupId,
            members: selectedGroup ? selectedGroup.members : [],
          };
        });
      },

      addMember: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({ members: [...state.members, { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: trimmed }] }));
      },

      removeSplit: async (id) => {
        try {
          await deleteSplit(id);
          set((state) => ({ splits: state.splits.filter((entry) => entry.id !== id) }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to delete split." });
        }
      },

      toggleGoalCompletion: async (id) => {
        const current = get().goals.find((goal) => goal.id === id);
        if (!current) return;
        const nextCompleted = !current.completed;
        const optimistic = get().goals.map((goal) => (goal.id === id ? { ...goal, completed: nextCompleted } : goal));
        set({ goals: optimistic });
        try {
          const updated = await updateGoal(id, { completed: nextCompleted });
          set((state) => ({ goals: state.goals.map((goal) => (goal.id === id ? updated : goal)) }));
        } catch (error) {
          set((state) => ({ goals: state.goals.map((goal) => (goal.id === id ? current : goal)), error: error instanceof Error ? error.message : "Unable to update goal." }));
        }
      },

      toggleSplitSettlement: async (id) => {
        const current = get().splits.find((entry) => entry.id === id);
        if (!current) return;
        const nextSettled = !current.settled;
        const optimistic = get().splits.map((entry) => (entry.id === id ? { ...entry, settled: nextSettled } : entry));
        set({ splits: optimistic });
        try {
          const updated = await updateSplit(id, { settled: nextSettled });
          set((state) => ({ splits: state.splits.map((entry) => (entry.id === id ? updated : entry)) }));
        } catch (error) {
          set((state) => ({ splits: state.splits.map((entry) => (entry.id === id ? current : entry)), error: error instanceof Error ? error.message : "Unable to update split." }));
        }
      },
      clearAllSettlements: async () => {
        const current = get();
        const groupId = current.selectedGroupId;
        const settledSplits = current.splits.filter(
          (entry) => entry.settled && (!groupId || entry.group === groupId),
        );
        if (settledSplits.length === 0) return;

        const previous = current.splits;
        set({
          splits: previous.map((entry) =>
            entry.settled && (!groupId || entry.group === groupId) ? { ...entry, settled: false } : entry,
          ),
        });

        try {
          const updated = await Promise.all(
            settledSplits.map((entry) => updateSplit(entry.id, { settled: false })),
          );
          set((state) => ({
            splits: state.splits.map((entry) => updated.find((update) => update.id === entry.id) ?? entry),
          }));
        } catch (error) {
          set({
            splits: previous,
            error: error instanceof Error ? error.message : "Unable to clear settlements.",
          });
        }
      },

      updateUser: (user) => {
        set({ user });
      },

      reset: () => {
        set({
          transactions: [],
          goals: [],
          groups: [],
          selectedGroupId: null,
          members: [],
          splits: [],
          user: createDefaultUser(),
          error: null,
        });
      },

      setTheme: (theme) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("fintrail-theme", theme);
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },
    }),
    {
      name: "fintrail-state-v3",
      partialize: (state) => ({
        transactions: state.transactions,
        goals: state.goals,
        groups: state.groups,
        selectedGroupId: state.selectedGroupId,
        members: state.members,
        splits: state.splits,
        user: state.user,
        theme: state.theme,
      }),
    },
  ),
);

export function useFinance() {
  return useFinanceStore((state) => state);
}
