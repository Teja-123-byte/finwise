/**
 * ---------------------------------------------------------------------------
 * Fintrail — demo data + domain logic (frontend only, no backend yet)
 * ---------------------------------------------------------------------------
 * Everything the app renders starts here. Swap `seedTransactions()` for a real
 * API call later; the derivations below only depend on the Transaction shape.
 */

export type TxKind = "income" | "expense";

export type CategoryId =
  | "food"
  | "rent"
  | "transport"
  | "education"
  | "entertainment"
  | "shopping"
  | "subscriptions"
  | "health"
  | "other"
  | "allowance"
  | "stipend"
  | "freelance";

export interface Category {
  id: CategoryId;
  label: string;
  kind: TxKind;
  color: string;
  /** Keywords used by the auto-categoriser. */
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food & drink", kind: "expense", color: "var(--cat-food)", keywords: ["cafe", "coffee", "mess", "canteen", "swiggy", "zomato", "pizza", "restaurant", "grocery", "snack", "chai", "lunch", "dinner"] },
  { id: "rent", label: "Rent & bills", kind: "expense", color: "var(--cat-rent)", keywords: ["rent", "hostel", "electricity", "water", "wifi", "broadband", "maintenance", "gas"] },
  { id: "transport", label: "Transport", kind: "expense", color: "var(--cat-transport)", keywords: ["uber", "ola", "metro", "bus", "train", "petrol", "fuel", "auto", "cab", "ticket"] },
  { id: "education", label: "Education", kind: "expense", color: "var(--cat-education)", keywords: ["book", "course", "tuition", "exam", "fee", "stationery", "printout", "udemy", "coursera"] },
  { id: "entertainment", label: "Entertainment", kind: "expense", color: "var(--cat-entertainment)", keywords: ["movie", "cinema", "concert", "game", "steam", "party", "outing", "bowling"] },
  { id: "shopping", label: "Shopping", kind: "expense", color: "var(--cat-shopping)", keywords: ["amazon", "flipkart", "myntra", "clothes", "shoes", "headphone", "gadget", "decor"] },
  { id: "subscriptions", label: "Subscriptions", kind: "expense", color: "var(--cat-subscriptions)", keywords: ["netflix", "spotify", "prime", "icloud", "youtube", "subscription", "chatgpt", "notion"] },
  { id: "health", label: "Health", kind: "expense", color: "var(--cat-health)", keywords: ["pharmacy", "medicine", "doctor", "gym", "clinic", "dentist"] },
  { id: "other", label: "Other", kind: "expense", color: "var(--cat-other)", keywords: [] },
  { id: "allowance", label: "Allowance", kind: "income", color: "var(--cat-allowance)", keywords: ["allowance", "pocket money", "from home", "parents"] },
  { id: "stipend", label: "Stipend", kind: "income", color: "var(--cat-stipend)", keywords: ["stipend", "intern", "scholarship", "salary"] },
  { id: "freelance", label: "Freelance", kind: "income", color: "var(--cat-freelance)", keywords: ["freelance", "client", "gig", "project", "design work", "tutoring"] },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

export const expenseCategories = CATEGORIES.filter((c) => c.kind === "expense");
export const incomeCategories = CATEGORIES.filter((c) => c.kind === "income");

export interface Transaction {
  id: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  note: string;
  amount: number;
  kind: TxKind;
  category: CategoryId;
}

/* -------------------------------------------------------------------------
 * Auto-categorisation: keyword match, with a small fallback heuristic.
 * ---------------------------------------------------------------------- */

export function autoCategorise(note: string, kind: TxKind): CategoryId {
  const text = note.toLowerCase();
  const pool = kind === "income" ? incomeCategories : expenseCategories;
  let best: { id: CategoryId; score: number } | null = null;
  for (const cat of pool) {
    for (const kw of cat.keywords) {
      if (text.includes(kw) && (!best || kw.length > best.score)) {
        best = { id: cat.id, score: kw.length };
      }
    }
  }
  if (best) return best.id;
  return kind === "income" ? "allowance" : "other";
}

/* -------------------------------------------------------------------------
 * Savings goals
 * ---------------------------------------------------------------------- */

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** ISO date the student wants to hit the target by. */
  deadline: string;
  color: string;
  note?: string;
  completed?: boolean;
}

/* -------------------------------------------------------------------------
 * Split expenses (roommates / group trips)
 * ---------------------------------------------------------------------- */

export interface SplitMember {
  id: string;
  name: string;
  email?: string;
}

export interface Group {
  id: string;
  name: string;
  members: SplitMember[];
  createdAt: string;
}

export interface SplitEntry {
  id: string;
  group: string;
  label: string;
  amount: number;
  paidBy: string;
  /** member ids sharing the cost */
  among: string[];
  date: string;
  note?: string;
  settled?: boolean;
}

export const SEED_SPLITS: SplitEntry[] = [
  { id: "s-1", label: "Flat rent — August", amount: 0, paidBy: "m-you", among: ["m-you", "m-sai", "m-saksham", "m-riya"], date: "2026-08-01" },
  { id: "s-2", label: "Groceries run", amount: 0, paidBy: "m-sai", among: ["m-you", "m-sai", "m-saksham", "m-riya"], date: "2026-08-03" },
  { id: "s-3", label: "Wifi bill", amount: 0, paidBy: "m-saksham", among: ["m-you", "m-sai", "m-saksham", "m-riya"], date: "2026-08-02" },
  { id: "s-4", label: "Pizza night", amount:0, paidBy: "m-riya", among: ["m-you", "m-riya", "m-sai"], date: "2026-08-04" },
  { id: "s-5", label: "Cab to campus fest", amount: 0, paidBy: "m-you", among: ["m-you", "m-saksham"], date: "2026-08-05" },
];

/** Net position per member: positive = they are owed, negative = they owe. */
export function splitBalances(members: SplitMember[], entries: SplitEntry[]) {
  const net = Object.fromEntries(members.map((m) => [m.id, 0])) as Record<string, number>;
  const activeEntries = entries.filter((entry) => !entry.settled);
  for (const e of activeEntries) {
    const share = e.amount / Math.max(1, e.among.length);
    net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
    for (const m of e.among) net[m] = (net[m] ?? 0) - share;
  }
  return members.map((m) => ({ member: m, net: Math.round((net[m.id] ?? 0) * 100) / 100 }));
}

/** Greedy settle-up: who pays whom, in the fewest transfers. */
export function settlements(members: SplitMember[], entries: SplitEntry[]) {
  const balances = splitBalances(members, entries).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < -0.5).sort((a, b) => a.net - b.net);
  const creditors = balances.filter((b) => b.net > 0.5).sort((a, b) => b.net - a.net);
  const out: { from: SplitMember; to: SplitMember; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].net, creditors[j].net);
    if (amount > 0.5) {
      out.push({ from: debtors[i].member, to: creditors[j].member, amount: Math.round(amount) });
    }
    debtors[i].net += amount;
    creditors[j].net -= amount;
    if (-debtors[i].net < 0.5) i += 1;
    if (creditors[j].net < 0.5) j += 1;
  }
  return out;
}

/* -------------------------------------------------------------------------
 * Seed transactions — deterministic, so SSR and the client agree.
 * ---------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RECURRING: { note: string; amount: number; day: number; category: CategoryId; kind: TxKind }[] = [
  { note: "Monthly allowance from home", amount: 15000, day: 1, category: "allowance", kind: "income" },
  { note: "Internship stipend", amount: 12000, day: 7, category: "stipend", kind: "income" },
  { note: "Hostel rent", amount: 6000, day: 2, category: "rent", kind: "expense" },
  { note: "Wifi broadband", amount: 649, day: 4, category: "rent", kind: "expense" },
  { note: "Spotify subscription", amount: 119, day: 9, category: "subscriptions", kind: "expense" },
  { note: "Netflix subscription", amount: 199, day: 12, category: "subscriptions", kind: "expense" },
  { note: "Gym membership", amount: 800, day: 15, category: "health", kind: "expense" },
];

const VARIABLE: { note: string; category: CategoryId; min: number; max: number; weight: number }[] = [
  { note: "Canteen lunch", category: "food", min: 60, max: 180, weight: 10 },
  { note: "Coffee at the campus cafe", category: "food", min: 90, max: 260, weight: 7 },
  { note: "Swiggy order", category: "food", min: 220, max: 640, weight: 6 },
  { note: "Grocery top-up", category: "food", min: 300, max: 900, weight: 3 },
  { note: "Metro card recharge", category: "transport", min: 100, max: 400, weight: 4 },
  { note: "Auto to campus", category: "transport", min: 40, max: 160, weight: 6 },
  { note: "Ola cab", category: "transport", min: 180, max: 520, weight: 2 },
  { note: "Printouts and stationery", category: "education", min: 40, max: 220, weight: 3 },
  { note: "Reference book", category: "education", min: 350, max: 1200, weight: 1 },
  { note: "Movie night", category: "entertainment", min: 250, max: 700, weight: 2 },
  { note: "Steam game sale", category: "entertainment", min: 300, max: 1400, weight: 1 },
  { note: "Amazon order", category: "shopping", min: 400, max: 2400, weight: 2 },
  { note: "Pharmacy", category: "health", min: 90, max: 480, weight: 1 },
  { note: "Freelance design gig", category: "freelance", min: 1500, max: 5000, weight: 1 },
];

const pickWeighted = (rnd: () => number) => {
  const total = VARIABLE.reduce((s, v) => s + v.weight, 0);
  let r = rnd() * total;
  for (const v of VARIABLE) {
    r -= v.weight;
    if (r <= 0) return v;
  }
  return VARIABLE[0];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * ~120 days of realistic student activity ending today. Deterministic per day,
 * so the server render and the first client render produce identical rows.
 */
export function seedTransactions(today = new Date()): Transaction[] {
  const rnd = mulberry32(20260806);
  const out: Transaction[] = [];
  const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const days = 120;

  for (let back = days; back >= 0; back--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - back);
    const dom = d.getUTCDate();

    for (const r of RECURRING) {
      if (r.day === dom) {
        out.push({
          id: `r-${iso(d)}-${r.category}-${r.day}`,
          date: iso(d),
          note: r.note,
          amount: r.amount,
          kind: r.kind,
          category: r.category,
        });
      }
    }

    const count = Math.floor(rnd() * 3) + (rnd() > 0.72 ? 2 : 1);
    for (let i = 0; i < count; i++) {
      const v = pickWeighted(rnd);
      const spike = rnd() > 0.975 ? 3.4 : 1;
      const amount = Math.round((v.min + rnd() * (v.max - v.min)) * spike);
      out.push({
        id: `v-${iso(d)}-${i}`,
        date: iso(d),
        note: v.note,
        amount,
        kind: v.category === "freelance" ? "income" : "expense",
        category: v.category,
      });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* -------------------------------------------------------------------------
 * Derivations
 * ---------------------------------------------------------------------- */

export const monthKey = (isoDate: string) => isoDate.slice(0, 7);

export const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export function monthsIn(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((t) => monthKey(t.date)))].sort().reverse();
}

export interface MonthSummary {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  count: number;
}

export function summarise(transactions: Transaction[]): MonthSummary {
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  return {
    income,
    expense,
    net: income - expense,
    savingsRate: income > 0 ? (income - expense) / income : 0,
    count: transactions.length,
  };
}

export function byCategory(transactions: Transaction[]) {
  const acc = new Map<CategoryId, number>();
  for (const t of transactions) {
    if (t.kind !== "expense") continue;
    acc.set(t.category, (acc.get(t.category) ?? 0) + t.amount);
  }
  const total = [...acc.values()].reduce((s, v) => s + v, 0);
  return [...acc.entries()]
    .map(([id, value]) => ({
      id,
      label: categoryById[id].label,
      color: categoryById[id].color,
      value,
      share: total > 0 ? value / total : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Daily income/expense series for one month, for the trend chart. */
export function dailySeries(transactions: Transaction[], month: string) {
  const rows = transactions.filter((t) => monthKey(t.date) === month);
  const days = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0,
  ).getDate();
  const series = Array.from({ length: days }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return { day: i + 1, date: `${month}-${day}`, income: 0, expense: 0, cumulative: 0 };
  });
  for (const t of rows) {
    const idx = Number(t.date.slice(8, 10)) - 1;
    if (!series[idx]) continue;
    if (t.kind === "income") series[idx].income += t.amount;
    else series[idx].expense += t.amount;
  }
  let running = 0;
  for (const s of series) {
    running += s.expense;
    s.cumulative = running;
  }
  return series;
}

/** Last six months of income vs expense, oldest first. */
export function monthlyTotals(transactions: Transaction[], count = 6) {
  const keys = monthsIn(transactions).slice(0, count).reverse();
  return keys.map((key) => {
    const s = summarise(transactions.filter((t) => monthKey(t.date) === key));
    return {
      key,
      label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        timeZone: "UTC",
      }),
      income: s.income,
      expense: s.expense,
      net: s.net,
    };
  });
}

/* -------------------------------------------------------------------------
 * Spending anomalies — a transaction, or a category, well above its own norm.
 * ---------------------------------------------------------------------- */

export interface Anomaly {
  id: string;
  kind: "transaction" | "category";
  title: string;
  detail: string;
  amount: number;
  severity: "high" | "medium";
}

export function anomalies(transactions: Transaction[], month: string): Anomaly[] {
  const out: Anomaly[] = [];
  const inMonth = transactions.filter((t) => monthKey(t.date) === month && t.kind === "expense");
  const history = transactions.filter((t) => monthKey(t.date) < month && t.kind === "expense");
  if (history.length < 10) return out;

  // 1. Single transactions far above the category's historical average.
  const catStats = new Map<CategoryId, { sum: number; n: number }>();
  for (const t of history) {
    const s = catStats.get(t.category) ?? { sum: 0, n: 0 };
    catStats.set(t.category, { sum: s.sum + t.amount, n: s.n + 1 });
  }
  for (const t of inMonth) {
    const s = catStats.get(t.category);
    if (!s || s.n < 4) continue;
    const avg = s.sum / s.n;
    if (t.amount > avg * 2.5 && t.amount > 500) {
      out.push({
        id: `a-tx-${t.id}`,
        kind: "transaction",
        title: `${t.note} looks unusually large`,
        detail: `${Math.round(t.amount / avg)}x your usual ${categoryById[t.category].label.toLowerCase()} spend of about ₹${Math.round(avg).toLocaleString("en-IN")}.`,
        amount: t.amount,
        severity: t.amount > avg * 4 ? "high" : "medium",
      });
    }
  }

  // 2. Whole categories running hot versus their monthly average.
  const prevMonths = [...new Set(history.map((t) => monthKey(t.date)))];
  const perCatMonthly = new Map<CategoryId, number[]>();
  for (const key of prevMonths) {
    for (const row of byCategory(history.filter((t) => monthKey(t.date) === key))) {
      const arr = perCatMonthly.get(row.id) ?? [];
      arr.push(row.value);
      perCatMonthly.set(row.id, arr);
    }
  }
  for (const row of byCategory(inMonth)) {
    const hist = perCatMonthly.get(row.id);
    if (!hist || hist.length < 2) continue;
    const avg = hist.reduce((s, v) => s + v, 0) / hist.length;
    if (row.value > avg * 1.5 && row.value - avg > 800) {
      out.push({
        id: `a-cat-${row.id}`,
        kind: "category",
        title: `${row.label} is ${Math.round(((row.value - avg) / avg) * 100)}% above your average`,
        detail: `₹${Math.round(row.value).toLocaleString("en-IN")} this month versus ₹${Math.round(avg).toLocaleString("en-IN")} typically.`,
        amount: row.value,
        severity: row.value > avg * 2 ? "high" : "medium",
      });
    }
  }

  return out.sort((a, b) => b.amount - a.amount).slice(0, 5);
}
