import { useState } from "react";
import { useFinance, SavingsGoal } from "../context/FinanceContext";
import {
  Plus, Pencil, Trash2, X, Check, Target, TrendingUp,
  Calendar, Trophy, Laptop, Plane, PiggyBank, Home, Car,
  Smartphone, GraduationCap, Briefcase, Camera, Gamepad2, Inbox
} from "lucide-react";
import { toast } from "sonner";

const GOAL_ICONS: { name: string; Icon: React.ElementType }[] = [
  { name: "Laptop", Icon: Laptop }, { name: "Plane", Icon: Plane }, { name: "PiggyBank", Icon: PiggyBank },
  { name: "Home", Icon: Home }, { name: "Car", Icon: Car }, { name: "Smartphone", Icon: Smartphone },
  { name: "GraduationCap", Icon: GraduationCap }, { name: "Briefcase", Icon: Briefcase },
  { name: "Camera", Icon: Camera }, { name: "Gamepad2", Icon: Gamepad2 }, { name: "Target", Icon: Target },
  { name: "Trophy", Icon: Trophy },
];

function GoalIcon({ name, className }: { name: string; className?: string }) {
  const found = GOAL_ICONS.find(g => g.name === name);
  const Icon = found?.Icon || Target;
  return <Icon className={className} strokeWidth={1.5} />;
}

interface FormState {
  name: string; target: string; current: string; deadline: string; icon: string;
}
const defaultForm: FormState = { name: "", target: "", current: "0", deadline: "", icon: "Target" };

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, formatCurrency, settings, addFundsToGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addFundsId, setAddFundsId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const isDark = settings.darkMode;
  const inputBg = isDark ? "#111640" : "#FFFFFF";

  const totalTargeted = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const completed = goals.filter(g => g.current >= g.target).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Goal name is required"); return; }
    if (!form.target || isNaN(Number(form.target)) || Number(form.target) <= 0) { toast.error("Valid target amount required"); return; }
    if (!form.deadline) { toast.error("Deadline is required"); return; }
    const data = { name: form.name.trim(), target: Number(form.target), current: Number(form.current) || 0, deadline: form.deadline, icon: form.icon };
    if (editId) { updateGoal({ ...data, id: editId }); toast.success("Goal updated"); }
    else { addGoal(data); toast.success("Goal created"); }
    setShowForm(false); setEditId(null); setForm(defaultForm);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditId(g.id);
    setForm({ name: g.name, target: String(g.target), current: String(g.current), deadline: g.deadline, icon: g.icon });
    setShowForm(true);
  };

  const handleAddFunds = (g: SavingsGoal) => {
    const amt = Number(addAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    addFundsToGoal(g, amt);
    setAddFundsId(null); setAddAmount("");
  };

  const getDaysLeft = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary";

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Savings Goals</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Track your financial milestones</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm(defaultForm); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary rounded-xl p-4">
          <p className="text-[11px] text-white/70 mb-1">Total Targeted</p>
          <p className="text-[20px] font-bold text-white tracking-[-0.3px]">{formatCurrency(totalTargeted)}</p>
          <p className="text-[11px] text-white/70 mt-1">{goals.length} goals</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Total Saved</p>
          <p className="text-[20px] font-bold text-foreground tracking-[-0.3px]">{formatCurrency(totalSaved)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {totalTargeted > 0 ? `${Math.round((totalSaved / totalTargeted) * 100)}%` : "0%"} of target
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Completed</p>
          <p className="text-[20px] font-bold text-foreground tracking-[-0.3px]">{completed}</p>
          <p className="text-[11px] text-muted-foreground mt-1">of {goals.length}</p>
        </div>
      </div>

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-[14px] text-muted-foreground">No goals yet</p>
          <button onClick={() => { setForm(defaultForm); setShowForm(true); }} className="mt-3 text-primary text-[13px] font-medium hover:opacity-80 transition-opacity">
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            const daysLeft = getDaysLeft(goal.deadline);
            const isCompleted = goal.current >= goal.target;
            return (
              <div key={goal.id} className={`bg-card border rounded-xl p-5 ${isCompleted ? "border-[#22C55E]/30" : "border-border"}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <GoalIcon name={goal.icon} className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-medium text-foreground">{goal.name}</p>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] text-[#22C55E]">
                          <Trophy className="w-3 h-3" strokeWidth={1.5} /> Done
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[11px] text-muted-foreground">
                        {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Due today" : "Overdue"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    {deleteConfirm === goal.id ? (
                      <>
                        <button onClick={() => { deleteGoal(goal.id); setDeleteConfirm(null); toast.success("Goal deleted"); }} className="p-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
                          <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(goal.id)} className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-muted-foreground hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex justify-between mb-2">
                  <div><p className="text-[11px] text-muted-foreground">Saved</p><p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{formatCurrency(goal.current)}</p></div>
                  <div className="text-right"><p className="text-[11px] text-muted-foreground">Target</p><p className="text-[18px] font-bold text-foreground tracking-[-0.3px]">{formatCurrency(goal.target)}</p></div>
                </div>

                {/* Progress */}
                <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: isCompleted ? "#22C55E" : "var(--primary)" }}
                  />
                </div>
                <div className="flex justify-between">
                  <p className="text-[11px] font-medium text-primary">{pct.toFixed(0)}%</p>
                  {!isCompleted && <p className="text-[11px] text-muted-foreground">{formatCurrency(goal.target - goal.current)} to go</p>}
                </div>

                {/* Add funds */}
                {!isCompleted && (
                  <div className="mt-4">
                    {addFundsId === goal.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={addAmount}
                          onChange={e => setAddAmount(e.target.value)}
                          style={{ backgroundColor: inputBg }}
                          className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                          autoFocus
                          onKeyDown={e => e.key === "Enter" && handleAddFunds(goal)}
                        />
                        <button onClick={() => handleAddFunds(goal)} className="bg-primary text-white px-3 py-2 rounded-lg text-[13px] font-medium hover:opacity-90">Add</button>
                        <button onClick={() => { setAddFundsId(null); setAddAmount(""); }} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted">
                          <X className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddFundsId(goal.id); setAddAmount(""); }}
                        className="w-full flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 py-2 rounded-lg text-[13px] font-medium transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Add Funds
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[15px] font-medium text-foreground">{editId ? "Edit Goal" : "New Savings Goal"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {GOAL_ICONS.map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: name })}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${form.icon === name ? "bg-primary/20 border border-primary" : "bg-muted border border-border hover:border-primary/50"}`}
                    >
                      <Icon className={`w-4 h-4 ${form.icon === name ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Goal Name</label>
                <input type="text" placeholder="e.g. New Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ backgroundColor: inputBg }} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Target</label>
                  <input type="number" placeholder="50000" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} min="1"
                    style={{ backgroundColor: inputBg }} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Current</label>
                  <input type="number" placeholder="0" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} min="0"
                    style={{ backgroundColor: inputBg }} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                  style={{ backgroundColor: inputBg }} className={inputClass} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border text-muted-foreground py-2.5 rounded-lg text-[13px] font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 bg-primary hover:opacity-90 text-white py-2.5 rounded-lg text-[13px] font-medium transition-opacity">{editId ? "Save" : "Create Goal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
