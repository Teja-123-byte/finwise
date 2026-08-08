import { apiRequest } from "@/lib/api-client";
import { todayIso } from "@/lib/money";
import type { Goal, Group, SplitEntry, SplitMember, Transaction } from "@/data/finance";

interface GoalRecord extends Omit<Goal, "id"> {
  id?: string;
  _id?: string;
}

interface SplitRecord extends Omit<SplitEntry, "id"> {
  id?: string;
  _id?: string;
}

function normalizeGoal(record: GoalRecord): Goal {
  return {
    ...record,
    id: record.id ?? record._id ?? "",
    completed: Boolean(record.completed),
  };
}

function normalizeSplit(record: SplitRecord): SplitEntry {
  const dateString = record.date
    ? typeof record.date === "string"
      ? record.date.slice(0, 10)
      : record.date.toISOString().slice(0, 10)
    : todayIso();

  return {
    ...record,
    id: record.id ?? record._id ?? "",
    settled: Boolean(record.settled),
    date: dateString,
  };
}

export interface FinanceUser {
  id: string;
  name: string;
  email: string;
}

export interface TransactionPayload extends Omit<Transaction, "id"> {
  autoClassify?: boolean;
}

export interface ServerTransaction extends Omit<Transaction, "id" | "date"> {
  id?: string;
  _id?: string;
  date: string;
}

export async function fetchCurrentUser(): Promise<FinanceUser> {
  return apiRequest<FinanceUser>("/auth/me");
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const transactions = await apiRequest<ServerTransaction[]>("/transactions");
  return transactions.map((transaction) => ({
    ...transaction,
    id: transaction.id ?? transaction._id ?? "",
    date: transaction.date.slice(0, 10),
  }));
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const saved = await apiRequest<ServerTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...saved,
    id: saved.id ?? saved._id ?? "",
    date: saved.date.slice(0, 10),
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}

export async function fetchGoals(): Promise<Goal[]> {
  const goals = await apiRequest<GoalRecord[]>("/goals");
  return goals.map(normalizeGoal);
}

export async function createGoal(payload: Omit<Goal, "id">): Promise<Goal> {
  const goal = await apiRequest<GoalRecord>("/goals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeGoal(goal);
}

export async function updateGoal(id: string, payload: Partial<Goal>): Promise<Goal> {
  const goal = await apiRequest<GoalRecord>(`/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeGoal(goal);
}

export async function deleteGoal(id: string): Promise<void> {
  await apiRequest<void>(`/goals/${id}`, { method: "DELETE" });
}

export async function fetchSplits(): Promise<SplitEntry[]> {
  const splits = await apiRequest<SplitRecord[]>("/splits");
  return splits.map(normalizeSplit);
}

export async function fetchGroups(): Promise<Group[]> {
  return apiRequest<Group[]>("/groups");
}

export async function searchUsers(query: string): Promise<SplitMember[]> {
  const users = await apiRequest<SplitMember[]>(`/groups/search?q=${encodeURIComponent(query)}`);
  return users;
}

export async function createGroup(name: string, memberIds: string[]): Promise<Group> {
  return apiRequest<Group>("/groups", {
    method: "POST",
    body: JSON.stringify({ name, memberIds }),
  });
}

export async function createSplit(payload: Omit<SplitEntry, "id">): Promise<SplitEntry> {
  const { group, ...rest } = payload;
  const split = await apiRequest<SplitRecord>("/splits", {
    method: "POST",
    body: JSON.stringify({ ...rest, groupId: group }),
  });
  return normalizeSplit(split);
}

export async function updateSplit(id: string, payload: Partial<SplitEntry>): Promise<SplitEntry> {
  const split = await apiRequest<SplitRecord>(`/splits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeSplit(split);
}

export async function deleteSplit(id: string): Promise<void> {
  await apiRequest<void>(`/splits/${id}`, { method: "DELETE" });
}

export async function loginAccount(email: string, password: string) {
  return apiRequest<{ token: string; user: FinanceUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerAccount(name: string, email: string, password: string) {
  return apiRequest<{ token: string; user: FinanceUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}
