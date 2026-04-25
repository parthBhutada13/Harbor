import { useState } from "react";
import { useFinance, Category } from "../context/FinanceContext";
import { Pencil, Check, X, AlertCircle, CheckCircle2, TrendingDown, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const EXPENSE_CATS: Category[] = ["Food", "Transport", "Academic", "Entertainment", "Health", "Shopping", "Utilities"];

export default function Budget() {
  const {
    budgets, setBudgetLimit, getCategorySpent, getExpensesByCategory,
    formatCurrency, settings, chartColors,
  } = useFinance();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editVal, setEditVal] = useState("");

  const expByCategory = getExpensesByCategory();
  const sym = settings.currency.symbol;
  const isDark = settings.darkMode;

  const tooltipContentStyle = {
    background: isDark ? "#0B0F2E" : "#FFFFFF",
    border: `1px solid ${isDark ? "#1E2D5A" : "#DDD7CE"}`,
    borderRadius: "8px",
    fontSize: 12,
    padding: "8px 12px",
  };
  const gridStroke = isDark ? "#1E2D5A" : "#DDD7CE";
  const tickFill   = isDark ? "#8B96B8" : "#5A5570";

  const budgetData = EXPENSE_CATS.map(cat => {
    const budget = budgets.find(b => b.category === cat);
    const limit = budget?.limit || 0;
    const spent = getCategorySpent(cat);
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const status = pct >= 100 ? "over" : pct >= 80 ? "warning" : "ok";
    return { cat, limit, spent, pct, status };
  });

  const totalBudget = budgetData.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgetData.filter(b => b.status === "over").length;

  const handleSave = (cat: Category) => {
    const val = Number(editVal);
    if (isNaN(val) || val <= 0) { toast.error("Enter a valid limit"); return; }
    setBudgetLimit(cat, val);
    setEditCat(null);
    toast.success(`Budget for ${cat} updated`);
  };

  const recommendations = budgetData
    .filter(b => b.spent > 0 && b.limit > 0)
    .map(b => {
      const allTime = expByCategory[b.cat] || 0;
      const suggested = Math.ceil(allTime * 1.1 / 100) * 100;
      return { ...b, suggested };
    })
    .filter(b => Math.abs(b.suggested - b.limit) > 100);

  const chartData = budgetData.map(b => ({ category: b.cat, Budget: b.limit, Spent: b.spent }));

  const getBarColor = (status: string) =>
    status === "over" || status === "warning" ? "#EF4444" : "var(--primary)";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipContentStyle}>
        <p style={{ marginBottom: 4, fontWeight: 600, color: isDark ? "#F0EBE3" : "#030737" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: isDark ? "#CBD5F1" : "#5A5570" }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const inputBg = isDark ? "#111640" : "#FFFFFF";
  const inputClass = `w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Budget Planner</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Set and track monthly spending limits</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary rounded-xl p-4">
          <p className="text-[11px] text-white/70 mb-1">Total Budget</p>
          <p className="text-[20px] font-bold text-white tracking-[-0.3px]">{formatCurrency(totalBudget)}</p>
          <p className="text-[11px] text-white/70 mt-1">This month</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Total Spent</p>
          <p className={`text-[20px] font-bold tracking-[-0.3px] ${totalSpent > totalBudget ? "text-[#EF4444]" : "text-foreground"}`}>
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% used` : "No limits set"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Over Budget</p>
          <p className={`text-[20px] font-bold tracking-[-0.3px] ${overBudget > 0 ? "text-[#EF4444]" : "text-foreground"}`}>{overBudget}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{overBudget === 0 ? "All within limits" : "categories"}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-[15px] font-medium text-foreground mb-4">Budget vs Actual</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false}
              tickFormatter={v => `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="Budget" fill={isDark ? "#1E2D5A" : "#DFD5C9"} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => {
                const d = budgetData[i];
                return <Cell key={i} fill={getBarColor(d?.status || "ok")} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetData.map(({ cat, limit, spent, pct, status }) => (
          <div key={cat} className={`bg-card border rounded-xl p-4 ${status === "over" ? "border-[#EF4444]/40" : "border-border"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium text-foreground">{cat}</p>
                  {status === "over" && (
                    <span className="flex items-center gap-1 text-[11px] text-[#EF4444]">
                      <AlertCircle className="w-3 h-3" strokeWidth={1.5} /> Over
                    </span>
                  )}
                  {status === "warning" && (
                    <span className="flex items-center gap-1 text-[11px] text-[#EF4444]">
                      <TrendingDown className="w-3 h-3" strokeWidth={1.5} /> Near limit
                    </span>
                  )}
                  {status === "ok" && spent > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[#22C55E]">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> On track
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {formatCurrency(spent)} / {limit > 0 ? formatCurrency(limit) : "No limit"}
                </p>
              </div>
              {editCat === cat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    style={{ backgroundColor: inputBg }}
                    className="w-20 border border-border rounded-lg px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary"
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleSave(cat)}
                  />
                  <button onClick={() => handleSave(cat)} className="p-1.5 bg-primary text-white rounded-lg hover:opacity-90">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setEditCat(null)} className="p-1.5 bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditCat(cat); setEditVal(String(limit)); }}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            {/* Progress */}
            <div className="w-full bg-muted rounded-full h-1.5 mb-1">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: status === "over" || status === "warning" ? "#EF4444" : "var(--primary)" }}
              />
            </div>
            <div className="flex justify-between">
              <p className="text-[11px] text-muted-foreground">{pct.toFixed(0)}%</p>
              <p className="text-[11px] text-muted-foreground">
                {limit > 0 ? (limit - spent > 0 ? `${formatCurrency(limit - spent)} left` : `${formatCurrency(spent - limit)} over`) : "Set a limit"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-[15px] font-medium text-foreground">Smart Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map(r => (
              <div key={r.cat} className="flex items-center justify-between bg-muted border border-border rounded-lg px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{r.cat}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Suggest {formatCurrency(r.suggested)}/mo based on your history
                  </p>
                </div>
                <button
                  onClick={() => { setBudgetLimit(r.cat, r.suggested); toast.success(`Budget updated to ${formatCurrency(r.suggested)}`); }}
                  className="text-[12px] bg-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
