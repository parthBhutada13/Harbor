import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Lightbulb, Inbox } from "lucide-react";

type Period = "all" | "3m" | "6m";

export default function Analytics() {
  const {
    transactions, getExpensesByCategory, getMonthlyData, getPrediction,
    totalExpenses, totalIncome, formatCurrency, settings, chartColors,
  } = useFinance();
  const [period, setPeriod] = useState<Period>("all");

  const prediction = getPrediction();
  const monthlyData = getMonthlyData();
  const sym = settings.currency.symbol;

  const isDark = settings.darkMode;
  const tooltipContentStyle = {
    background: isDark ? "#0B0F2E" : "#FFFFFF",
    border: `1px solid ${isDark ? "#1E2D5A" : "#DDD7CE"}`,
    borderRadius: "8px",
    fontSize: 12,
  };
  const tooltipLabelStyle = { color: isDark ? "#F0EBE3" : "#030737", fontWeight: 600, marginBottom: 2 };
  const tooltipItemStyle  = { color: isDark ? "#CBD5F1" : "#5A5570" };
  const gridStroke    = isDark ? "#1E2D5A" : "#DDD7CE";
  const tickFill      = isDark ? "#8B96B8" : "#5A5570";
  const tickFillMuted = isDark ? "#8B96B8" : "#5A5570";

  const now = new Date();
  const filteredTx = transactions.filter(t => {
    if (period === "all") return true;
    const d = new Date(t.date);
    const months = period === "3m" ? 3 : 6;
    return d >= new Date(now.getFullYear(), now.getMonth() - months, 1);
  });

  const filteredExpByCategory: Record<string, number> = {};
  filteredTx.filter(t => t.type === "expense").forEach(t => {
    filteredExpByCategory[t.category] = (filteredExpByCategory[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(filteredExpByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const totalFilteredExp = pieData.reduce((s, d) => s + d.value, 0);
  const barData = Object.entries(filteredExpByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const predMonthlyData = [...monthlyData];
  if (monthlyData.length > 0) {
    const last = monthlyData[monthlyData.length - 1];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const [month, year] = last.month.split(" ");
    const mIdx = months.indexOf(month);
    const nextIdx = (mIdx + 1) % 12;
    const nextYear = nextIdx === 0 ? parseInt(year) + 1 : parseInt(year);
    predMonthlyData.push({ month: `${months[nextIdx]} ${nextYear}`, income: 0, expenses: prediction });
  }

  const sortedCats = Object.entries(filteredExpByCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats[0];
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : "0";

  const recommendations: { icon: React.ElementType; text: string; accent: "warn" | "good" | "info" }[] = [];
  if (topCategory && (topCategory[1] / totalFilteredExp) > 0.35)
    recommendations.push({ icon: AlertCircle, text: `Your ${topCategory[0]} spending is very high (${((topCategory[1] / totalFilteredExp) * 100).toFixed(0)}%). Consider a budget limit.`, accent: "warn" });
  if (filteredExpByCategory["Entertainment"] && (filteredExpByCategory["Entertainment"] / totalFilteredExp) > 0.15)
    recommendations.push({ icon: AlertCircle, text: "Entertainment exceeds 15% of expenses. Consider setting a monthly cap.", accent: "warn" });
  if (Number(savingsRate) < 10)
    recommendations.push({ icon: Lightbulb, text: "Savings rate is below 10%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.", accent: "info" });
  if (Number(savingsRate) >= 25)
    recommendations.push({ icon: CheckCircle2, text: `Excellent — you're saving ${savingsRate}% of your income. Consider putting surplus into goals.`, accent: "good" });
  if (recommendations.length === 0)
    recommendations.push({ icon: CheckCircle2, text: "Your spending looks balanced. Keep tracking regularly to maintain healthy habits.", accent: "good" });

  const hasData = transactions.length > 0;
  const tickKFormat = (v: number) => `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Analytics</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Understand your spending behavior</p>
        </div>
        <div className="flex bg-muted border border-border rounded-lg p-1 gap-1">
          {(["all", "3m", "6m"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${period === p ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p === "all" ? "All Time" : p === "3m" ? "3 Months" : "6 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" strokeWidth={1.5} />
            <p className="text-[11px] text-muted-foreground">Savings Rate</p>
          </div>
          <p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{savingsRate}%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{Number(savingsRate) >= 20 ? "Healthy" : "Needs improvement"}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-[#EF4444]" strokeWidth={1.5} />
            <p className="text-[11px] text-muted-foreground">Top Category</p>
          </div>
          <p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{topCategory?.[0] || "—"}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{topCategory ? formatCurrency(topCategory[1]) : "No data"}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <p className="text-[11px] text-muted-foreground">Next Month Est.</p>
          </div>
          <p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{formatCurrency(prediction)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Predicted expenses</p>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-[14px] text-muted-foreground">No data yet</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Add some transactions to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-[15px] font-medium text-foreground mb-4">Expense Distribution</h2>
              {pieData.length === 0 ? (
                <p className="text-center py-10 text-[13px] text-muted-foreground">No expense data for this period</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
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
                  <div className="space-y-2 mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                          <span className="text-[12px] text-muted-foreground">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground/60">{totalFilteredExp > 0 ? ((d.value / totalFilteredExp) * 100).toFixed(0) : 0}%</span>
                          <span className="text-[12px] font-medium text-foreground">{formatCurrency(d.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bar */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-[15px] font-medium text-foreground mb-4">Category Comparison</h2>
              {barData.length === 0 ? (
                <p className="text-center py-10 text-[13px] text-muted-foreground">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickFormatter={tickKFormat} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: tickFillMuted }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      separator=""
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
                      formatter={(v: number) => [formatCurrency(v), ""]}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly trend */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-foreground">Monthly Trend & Prediction</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /><span className="text-[11px] text-muted-foreground">Income</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /><span className="text-[11px] text-muted-foreground">Expenses</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={predMonthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} tickFormatter={tickKFormat} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  separator=""
                  cursor={{ stroke: gridStroke, strokeWidth: 1 }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
                {predMonthlyData.length > 0 && (
                  <ReferenceLine x={predMonthlyData[predMonthlyData.length - 1]?.month} stroke="var(--primary)" strokeDasharray="4 4" />
                )}
                <Line type="monotone" dataKey="income" name="Income" stroke="#22C55E" strokeWidth={2} dot={{ r: 3, fill: "#22C55E" }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: "#EF4444" }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 bg-muted border border-border rounded-lg">
              <p className="text-[12px] text-muted-foreground">
                <span className="font-medium text-foreground">Prediction: </span>
                Based on your spending history, next month's estimated expenses are <span className="font-medium text-foreground">{formatCurrency(prediction)}</span>.
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h2 className="text-[15px] font-medium text-foreground">Spending Insights</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 bg-muted border rounded-lg px-4 py-3 ${r.accent === "warn" ? "border-[#EF4444]/20" : r.accent === "good" ? "border-[#22C55E]/20" : "border-border"}`}>
                  <r.icon className={`w-4 h-4 mt-0.5 shrink-0 ${r.accent === "warn" ? "text-[#EF4444]" : r.accent === "good" ? "text-[#22C55E]" : "text-primary"}`} strokeWidth={1.5} />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Behavior */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-[15px] font-medium text-foreground mb-4">Behavior Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Transactions", value: filteredTx.length },
                { label: "Avg per Transaction", value: formatCurrency(filteredTx.filter(t => t.type === "expense").length > 0 ? Math.round(filteredTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) / filteredTx.filter(t => t.type === "expense").length) : 0) },
                { label: "Expense Categories", value: Object.keys(filteredExpByCategory).length },
                { label: "Expense Ratio", value: `${totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : 0}%` },
              ].map(card => (
                <div key={card.label} className="bg-muted border border-border rounded-lg p-4">
                  <p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
