import { useNavigate } from "react-router";
import { useFinance } from "../context/FinanceContext";
import {
  TrendingUp, TrendingDown, Wallet, Plus, ArrowRight,
  Inbox, AlertCircle, Utensils, Car, GraduationCap,
  Gamepad2, HeartPulse, ShoppingCart, Zap, Package,
  Banknote, Briefcase, Building2
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

const CAT_ICONS: Record<string, React.ElementType> = {
  Food: Utensils, Transport: Car, Academic: GraduationCap,
  Entertainment: Gamepad2, Health: HeartPulse, Shopping: ShoppingCart,
  Utilities: Zap, Other: Package, Allowance: Banknote,
  "Part-time": Briefcase, Scholarship: GraduationCap, Salary: Building2,
};

export default function Dashboard() {
  const {
    transactions, totalIncome, totalExpenses, balance,
    getExpensesByCategory, getMonthlyData, getPrediction,
    getBudgetAlerts, username, formatCurrency, formatDate,
    settings, chartColors,
  } = useFinance();
  const navigate = useNavigate();
  const alerts = getBudgetAlerts();
  const prediction = getPrediction();
  const expByCategory = getExpensesByCategory();
  const monthlyData = getMonthlyData();
  const sym = settings.currency.symbol;

  const pieData = Object.entries(expByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const recentTx = transactions.slice(0, 5);
  const hasData = transactions.length > 0;

  // Mode-aware chart styles
  const isDark = settings.darkMode;
  const tooltipContentStyle = {
    background: isDark ? "#0B0F2E" : "#FFFFFF",
    border: `1px solid ${isDark ? "#1E2D5A" : "#DDD7CE"}`,
    borderRadius: "8px",
    fontSize: 12,
  };
  const tooltipLabelStyle = { color: isDark ? "#F0EBE3" : "#030737", fontWeight: 600, marginBottom: 2 };
  const tooltipItemStyle = { color: isDark ? "#CBD5F1" : "#5A5570" };
  const gridStroke = isDark ? "#1E2D5A" : "#DDD7CE";
  const tickFill   = isDark ? "#8B96B8" : "#5A5570";

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Dashboard</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Overview of your financial position</p>
        </div>
        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-[#EF4444]" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-foreground">Budget Alerts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(a => (
              <span key={a.category} className="inline-flex items-center gap-1.5 bg-muted border border-border text-[12px] text-muted-foreground px-3 py-1 rounded-lg">
                <AlertCircle className="w-3 h-3 text-[#EF4444]" strokeWidth={1.5} />
                {a.category} near limit
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Balance hero */}
      <div className="bg-primary rounded-2xl p-6">
        <p className="text-[12px] text-white/70 mb-2">Total Balance</p>
        <p className={`balance-amount text-[32px] font-bold tracking-[-0.3px] ${balance >= 0 ? "text-white" : "text-[#FFB3AE]"}`}>
          {formatCurrency(balance)}
        </p>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#86EFAC]" strokeWidth={1.5} />
            <span className="text-[13px] text-[#86EFAC] font-medium">{formatCurrency(totalIncome)}</span>
            <span className="text-[11px] text-white/50">income</span>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#FFB3AE]" strokeWidth={1.5} />
            <span className="text-[13px] text-[#FFB3AE] font-medium">{formatCurrency(totalExpenses)}</span>
            <span className="text-[11px] text-white/50">expenses</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Income", value: formatCurrency(totalIncome), icon: TrendingUp, color: "text-[#22C55E]" },
          { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-[#EF4444]" },
          { label: "Transactions", value: transactions.length, icon: Wallet, color: "text-primary" },
          { label: "Next Month Est.", value: formatCurrency(prediction), icon: AlertCircle, color: "text-muted-foreground" },
        ].map(card => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-4 h-4 ${card.color}`} strokeWidth={1.5} />
            </div>
            <p className="text-[11px] text-muted-foreground mb-1">{card.label}</p>
            <p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-foreground">Income vs Expenses</h2>
              <span className="text-[11px] text-muted-foreground">Monthly</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickFormatter={v => `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  separator=""
                  cursor={{ stroke: gridStroke, strokeWidth: 1 }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#22C55E" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-[15px] font-medium text-foreground mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  separator=""
                  cursor={false}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                    <span className="text-[12px] text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="text-[12px] font-medium text-foreground">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-foreground">Recent Transactions</h2>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-1 text-[12px] text-primary hover:opacity-80 font-medium transition-opacity"
          >
            View all <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1} />
            <p className="text-[14px] text-muted-foreground">No transactions yet.</p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">Add your first one to get started.</p>
            <button
              onClick={() => navigate("/transactions")}
              className="mt-4 flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTx.map(tx => {
              const CatIcon = CAT_ICONS[tx.category] || Package;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <CatIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <p className={`text-[13px] font-medium shrink-0 ${tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
