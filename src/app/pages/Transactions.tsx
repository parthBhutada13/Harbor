import { useState } from "react";
import { useFinance, Transaction, Category, TransactionType } from "../context/FinanceContext";
import {
  Plus, Search, Pencil, Trash2, X, Check, Inbox,
  Utensils, Car, GraduationCap, Gamepad2, HeartPulse,
  ShoppingCart, Zap, Package, Banknote, Briefcase, Building2
} from "lucide-react";
import { toast } from "sonner";

const CAT_ICONS: Record<string, React.ElementType> = {
  Food: Utensils, Transport: Car, Academic: GraduationCap,
  Entertainment: Gamepad2, Health: HeartPulse, Shopping: ShoppingCart,
  Utilities: Zap, Other: Package, Allowance: Banknote,
  "Part-time": Briefcase, Scholarship: GraduationCap, Salary: Building2,
};

const EXPENSE_CATS: Category[] = ["Food", "Transport", "Academic", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
const INCOME_CATS: Category[] = ["Allowance", "Part-time", "Scholarship", "Salary", "Other"];

interface FormState {
  type: TransactionType;
  amount: string;
  category: Category;
  description: string;
  date: string;
}

const defaultForm: FormState = {
  type: "expense",
  amount: "",
  category: "Food",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, formatCurrency, formatDate, settings } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCat, setFilterCat] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isDark = settings.darkMode;
  const inputBg = isDark ? "#111640" : "#FFFFFF";

  const cats = form.type === "income" ? INCOME_CATS : EXPENSE_CATS;

  const filtered = transactions.filter(t => {
    const matchSearch = (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchCat = filterCat === "all" || t.category === filterCat;
    return matchSearch && matchType && matchCat;
  });

  const allCats = [...new Set(transactions.map(t => t.category))];

  const openAdd = () => { setEditId(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (tx: Transaction) => {
    setEditId(tx.id);
    setForm({ type: tx.type, amount: String(tx.amount), category: tx.category, description: tx.description || "", date: tx.date });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error("Please enter a valid amount"); return;
    }
    const data = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim() || undefined,
      date: form.date,
    };
    if (editId) {
      updateTransaction({ ...data, id: editId });
      toast.success("Transaction updated");
    } else {
      addTransaction(data);
      toast.success(form.type === "income" ? "Income recorded" : "Expense recorded");
    }
    setShowForm(false); setEditId(null); setForm(defaultForm);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id); setDeleteConfirm(null);
    toast.success("Transaction deleted");
  };

  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Transactions</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add
        </button>
      </div>

      {/* Type quick filter */}
      <div className="grid grid-cols-3 gap-3">
        {(["all", "income", "expense"] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-xl p-3 border text-center transition-all ${filterType === type ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground hover:border-primary/50"}`}
          >
            <p className="text-[11px] capitalize mb-0.5">{type === "all" ? "All" : type === "income" ? "Income" : "Expenses"}</p>
            <p className={`text-[15px] font-bold ${filterType === type ? "text-white" : "text-foreground"}`}>
              {type === "all" ? transactions.length : transactions.filter(t => t.type === type).length}
            </p>
          </button>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            style={{ backgroundColor: inputBg }}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ backgroundColor: inputBg }}
          className="border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1} />
            <p className="text-[14px] text-muted-foreground">No transactions found</p>
            <button onClick={openAdd} className="mt-3 text-primary text-[13px] font-medium hover:opacity-80 transition-opacity">
              Add your first one
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(tx => {
              const CatIcon = CAT_ICONS[tx.category] || Package;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <CatIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {tx.description || tx.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded">{tx.category}</span>
                      <span className="text-[11px] text-muted-foreground/60">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <p className={`text-[13px] font-medium shrink-0 ${tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    {deleteConfirm === tx.id ? (
                      <>
                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
                          <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(tx.id)} className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-muted-foreground hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[15px] font-medium text-foreground">{editId ? "Edit Transaction" : "Add Transaction"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="flex bg-muted border border-border rounded-lg p-1">
                {(["expense", "income"] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t, category: t === "income" ? "Allowance" : "Food" }))}
                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${form.type === t ? "bg-primary text-white" : "text-muted-foreground"}`}
                  >
                    {t === "income" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  min="0.01"
                  step="0.01"
                  style={{ backgroundColor: inputBg }}
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category })}
                  style={{ backgroundColor: inputBg }}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-primary"
                >
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{ backgroundColor: inputBg }}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
                  Description <span className="text-muted-foreground/50 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery run"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ backgroundColor: inputBg }}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-border text-muted-foreground py-2.5 rounded-lg text-[13px] font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:opacity-90 text-white py-2.5 rounded-lg text-[13px] font-medium transition-opacity"
                >
                  {editId ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
