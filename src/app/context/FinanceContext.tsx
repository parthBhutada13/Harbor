import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────────────────────────
export type TransactionType = "income" | "expense";

export type Category =
  | "Food" | "Transport" | "Academic" | "Entertainment"
  | "Health" | "Shopping" | "Utilities"
  | "Salary" | "Allowance" | "Part-time" | "Scholarship" | "Other";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description?: string;
  date: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
}

export interface AppSettings {
  darkMode: boolean;
  accentColor: "harbor" | "crimson" | "forest";
  density: "comfortable" | "compact";
  currency: { code: string; symbol: string; name: string };
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  numberFormat: "1,000.00" | "1.000,00";
  notifications: {
    weeklySummary: boolean;
    largeTxAlerts: boolean;
    largeTxThreshold: number;
    budgetWarnings: boolean;
  };
}

/** Full colour config per accent choice — brand colours only, surfaces are fixed in theme.css */
export const ACCENT_CONFIGS: Record<
  "harbor" | "crimson" | "forest",
  { primary: string; hover: string; light: string; label: string; charts: string[] }
> = {
  harbor: {
    primary: "#2563EB",
    hover: "#1D4ED8",
    light: "#DBEAFE",
    label: "Harbor Blue",
    charts: ["#2563EB", "#3B82F6", "#60A5FA", "#1D4ED8", "#93C5FD", "#BFDBFE", "#1E40AF"],
  },
  crimson: {
    primary: "#9B1C1C",
    hover: "#7C1010",
    light: "#FFE4E1",
    label: "Crimson Red",
    charts: ["#9B1C1C", "#B91C1C", "#DC2626", "#7C1010", "#F87171", "#FCA5A5", "#FECACA"],
  },
  forest: {
    primary: "#166534",
    hover: "#14532D",
    light: "#D1FAE5",
    label: "Forest Green",
    charts: ["#166534", "#15803D", "#16A34A", "#14532D", "#4ADE80", "#86EFAC", "#BBF7D0"],
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  accentColor: "harbor" as "harbor" | "crimson" | "forest",
  density: "comfortable",
  currency: { code: "USD", symbol: "$", name: "US Dollar" },
  dateFormat: "MM/DD/YYYY",
  numberFormat: "1,000.00",
  notifications: {
    weeklySummary: true,
    largeTxAlerts: true,
    largeTxThreshold: 500,
    budgetWarnings: true,
  },
};

// ── API Helper ──────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("harbor_token") || "";
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    // Token expired or invalid – log the user out
    localStorage.removeItem("harbor_token");
    localStorage.removeItem("harbor_auth");
    window.location.href = "/login";
    throw new Error("Unauthorised");
  }
  return res;
}

// ── Context type ────────────────────────────────────────────────────────────
interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  settings: AppSettings;
  username: string;
  email: string;
  chartColors: string[];
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudgetLimit: (category: Category, limit: number) => Promise<void>;
  addGoal: (g: Omit<SavingsGoal, "id">) => Promise<void>;
  updateGoal: (g: SavingsGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  updateProfile: (username: string, email: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  getExpensesByCategory: () => Record<string, number>;
  getMonthlyData: () => { month: string; income: number; expenses: number }[];
  getPrediction: () => number;
  getCategorySpent: (category: Category) => number;
  getBudgetAlerts: () => { category: Category; spent: number; limit: number }[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function migrateAccent(val: string): "harbor" | "crimson" | "forest" {
  if (val === "teal" || val === "purple") return "crimson";
  if (val === "indigo") return "forest";
  if (val === "harbor" || val === "crimson" || val === "forest") return val;
  return "harbor";
}

// ── Provider ────────────────────────────────────────────────────────────────
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ── Bootstrap: load everything from API on mount ────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }

    async function bootstrap() {
      try {
        const [meRes, txRes, budRes, goalRes] = await Promise.all([
          apiFetch("/api/auth/me"),
          apiFetch("/api/transactions"),
          apiFetch("/api/budgets"),
          apiFetch("/api/goals"),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          setUsername(me.username);
          setEmail(me.email);
          if (me.settings) {
            const s = { ...DEFAULT_SETTINGS, ...me.settings };
            s.accentColor = migrateAccent(s.accentColor);
            setSettings(s);
          }
        }
        if (txRes.ok)   setTransactions(await txRes.json());
        if (budRes.ok)  setBudgets(await budRes.json());
        if (goalRes.ok) setGoals(await goalRes.json());
      } catch (err) {
        console.error("Bootstrap error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  // ── Apply theme / accent to document ────────────────────────────────────
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [settings.darkMode]);

  useEffect(() => {
    // Only set accent brand colours — surfaces are fixed in theme.css
    const cfg = ACCENT_CONFIGS[settings.accentColor] ?? ACCENT_CONFIGS.harbor;
    const root = document.documentElement;
    root.style.setProperty("--primary",         cfg.primary);
    root.style.setProperty("--primary-hover",   cfg.hover);
    root.style.setProperty("--primary-light",   cfg.light);
    root.style.setProperty("--ring",            cfg.primary);
    root.style.setProperty("--sidebar-primary", cfg.primary);
    root.style.setProperty("--sidebar-ring",    cfg.primary);
    cfg.charts.forEach((c, i) => root.style.setProperty(`--chart-${i + 1}`, c));
  }, [settings.accentColor, settings.darkMode]);

  // ── Transactions ─────────────────────────────────────────────────────────
  const addTransaction = async (t: Omit<Transaction, "id">) => {
    try {
      const res = await apiFetch("/api/transactions", { method: "POST", body: JSON.stringify(t) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to add transaction"); return; }
      setTransactions((prev) => [data, ...prev]);
    } catch { toast.error("Network error"); }
  };

  const updateTransaction = async (t: Transaction) => {
    try {
      const res = await apiFetch(`/api/transactions/${t.id}`, { method: "PUT", body: JSON.stringify(t) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update transaction"); return; }
      setTransactions((prev) => prev.map((x) => (x.id === t.id ? data : x)));
    } catch { toast.error("Network error"); }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete"); return; }
      setTransactions((prev) => prev.filter((x) => x.id !== id));
    } catch { toast.error("Network error"); }
  };

  // ── Budgets ──────────────────────────────────────────────────────────────
  const setBudgetLimit = async (category: Category, limit: number) => {
    try {
      const res = await apiFetch("/api/budgets", { method: "PUT", body: JSON.stringify({ category, limit }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to set budget"); return; }
      setBudgets((prev) => {
        const exists = prev.find((b) => b.category === category);
        if (exists) return prev.map((b) => (b.category === category ? data : b));
        return [...prev, data];
      });
    } catch { toast.error("Network error"); }
  };

  // ── Goals ────────────────────────────────────────────────────────────────
  const addGoal = async (g: Omit<SavingsGoal, "id">) => {
    try {
      const res = await apiFetch("/api/goals", { method: "POST", body: JSON.stringify(g) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to add goal"); return; }
      setGoals((prev) => [...prev, data]);
    } catch { toast.error("Network error"); }
  };

  const updateGoal = async (g: SavingsGoal) => {
    try {
      const res = await apiFetch(`/api/goals/${g.id}`, { method: "PUT", body: JSON.stringify(g) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update goal"); return; }
      setGoals((prev) => prev.map((x) => (x.id === g.id ? data : x)));
    } catch { toast.error("Network error"); }
  };

  const deleteGoal = async (id: string) => {
    try {
      const res = await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete goal"); return; }
      setGoals((prev) => prev.filter((x) => x.id !== id));
    } catch { toast.error("Network error"); }
  };

  // ── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = async (s: Partial<AppSettings>) => {
    const merged: AppSettings = {
      ...settings,
      ...s,
      accentColor: s.accentColor ? migrateAccent(s.accentColor) : settings.accentColor,
      notifications: { ...settings.notifications, ...(s.notifications || {}) },
    };
    setSettings(merged); // optimistic
    try {
      const res = await apiFetch("/api/auth/settings", { method: "PUT", body: JSON.stringify(merged) });
      if (!res.ok) toast.error("Failed to save settings");
    } catch { toast.error("Network error saving settings"); }
  };

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = async (newUsername: string, newEmail: string) => {
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ username: newUsername, email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update profile"); return; }
      setUsername(data.username);
      setEmail(data.email);
      localStorage.setItem("harbor_auth", JSON.stringify({ username: data.username, email: data.email }));
      toast.success("Profile updated!");
    } catch { toast.error("Network error"); }
  };

  // ── Clear all data ───────────────────────────────────────────────────────
  const clearAllData = async () => {
    try {
      await Promise.all([
        ...transactions.map((t) => apiFetch(`/api/transactions/${t.id}`, { method: "DELETE" })),
        ...goals.map((g) => apiFetch(`/api/goals/${g.id}`, { method: "DELETE" })),
        ...budgets.map((b) => apiFetch(`/api/budgets/${b.category}`, { method: "DELETE" })),
      ]);
      setTransactions([]);
      setGoals([]);
      setBudgets([]);
    } catch { toast.error("Network error clearing data"); }
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalIncome   = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpenses;

  const getExpensesByCategory = useCallback(() => {
    const map: Record<string, number> = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const getMonthlyData = useCallback(() => {
    const map: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const d   = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!map[key]) map[key] = { income: 0, expenses: 0 };
      if (t.type === "income") map[key].income += t.amount;
      else                     map[key].expenses += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [year, month] = key.split("-").map(Number);
        return { month: `${MONTHS[month]} ${year}`, ...val };
      });
  }, [transactions]);

  const getPrediction = useCallback(() => {
    const monthly = getMonthlyData();
    if (monthly.length === 0) return 0;
    const avg  = monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length;
    const last = monthly[monthly.length - 1]?.expenses || avg;
    return Math.round((avg * 0.6 + last * 0.4) * 1.05);
  }, [getMonthlyData]);

  const getCategorySpent = useCallback((category: Category) => {
    const now = new Date();
    return transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const getBudgetAlerts = useCallback(() => {
    return budgets
      .map((b) => ({ category: b.category, spent: getCategorySpent(b.category), limit: b.limit }))
      .filter((b) => b.spent >= b.limit * 0.8);
  }, [budgets, getCategorySpent]);

  const formatCurrency = useCallback((amount: number) => {
    const sym = settings.currency.symbol;
    if (settings.numberFormat === "1.000,00") {
      return `${sym}${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [settings.currency.symbol, settings.numberFormat]);

  const formatDate = useCallback((dateStr: string) => {
    const d    = new Date(dateStr);
    const dd   = String(d.getDate()).padStart(2, "0");
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    if (settings.dateFormat === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
    if (settings.dateFormat === "YYYY-MM-DD") return `${yyyy}-${mm}-${dd}`;
    return `${mm}/${dd}/${yyyy}`;
  }, [settings.dateFormat]);

  const chartColors = (ACCENT_CONFIGS[settings.accentColor] ?? ACCENT_CONFIGS.harbor).charts;

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, goals, settings, username, email,
      chartColors, isLoading,
      addTransaction, updateTransaction, deleteTransaction,
      setBudgetLimit, addGoal, updateGoal, deleteGoal,
      updateSettings, updateProfile, clearAllData,
      totalIncome, totalExpenses, balance,
      getExpensesByCategory, getMonthlyData, getPrediction,
      getCategorySpent, getBudgetAlerts,
      formatCurrency, formatDate,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
