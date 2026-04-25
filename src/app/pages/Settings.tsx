import { useState } from "react";
import { useFinance, AppSettings, Category, ACCENT_CONFIGS } from "../context/FinanceContext";
import {
  User, Palette, Globe, Bell, Tag, Database, Info,
  Check, X, Sun, Moon, Trash2, Download, AlertTriangle,
  ChevronDown, ChevronUp, Anchor
} from "lucide-react";
import { toast } from "sonner";

type Tab = "profile" | "appearance" | "currency" | "notifications" | "categories" | "data" | "about";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "currency", label: "Currency & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "about", label: "About", icon: Info },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

const EXPENSE_CATS: Category[] = ["Food", "Transport", "Academic", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
const INCOME_CATS: Category[] = ["Allowance", "Part-time", "Scholarship", "Salary", "Other"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative rounded-full transition-colors ${on ? "bg-primary" : "bg-border"}`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ left: on ? "calc(100% - 19px)" : "3px" }}
      />
    </button>
  );
}

function SectionRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, username, email, updateSettings, updateProfile, clearAllData, transactions, formatCurrency } = useFinance();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [openAccordion, setOpenAccordion] = useState<Tab | null>("profile");

  const isDark = settings.darkMode;
  const inputBg = isDark ? "#111640" : "#FFFFFF";

  const profileForm_init = { username, email, newPassword: "", confirmPassword: "" };
  const [profileForm, setProfileForm] = useState(profileForm_init);

  const [newCatName, setNewCatName] = useState("");
  const [customCats, setCustomCats] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("harbor_custom_cats") || "[]"); } catch { return []; }
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    if (!profileForm.username.trim()) { toast.error("Username is required"); return; }
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    updateProfile(profileForm.username.trim(), profileForm.email.trim());
    toast.success("Profile updated");
  };

  const handleAddCat = () => {
    if (!newCatName.trim()) { toast.error("Category name required"); return; }
    if (customCats.includes(newCatName.trim())) { toast.error("Category already exists"); return; }
    const updated = [...customCats, newCatName.trim()];
    setCustomCats(updated);
    localStorage.setItem("harbor_custom_cats", JSON.stringify(updated));
    setNewCatName("");
    toast.success("Category added");
  };

  const handleDeleteCat = (cat: string) => {
    const updated = customCats.filter(c => c !== cat);
    setCustomCats(updated);
    localStorage.setItem("harbor_custom_cats", JSON.stringify(updated));
    toast.success("Category removed");
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = transactions.map(t => [t.date, t.type, t.category, t.amount, t.description || ""].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fintrack-transactions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleDeleteAll = () => {
    if (deleteConfirm !== "DELETE") { toast.error("Type DELETE to confirm"); return; }
    clearAllData();
    setDeleteConfirm(""); setShowDeleteConfirm(false);
    toast.success("All data cleared");
  };

  const inputStyle = { backgroundColor: inputBg };
  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const selectClass = "border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-primary";

  const tabContent: Record<Tab, React.ReactNode> = {
    profile: (
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">Username</label>
          <input type="text" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
            style={inputStyle} className={inputClass} />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">Email Address</label>
          <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
            style={inputStyle} className={inputClass} />
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-[13px] font-medium text-foreground mb-3">Change Password</p>
          <div className="space-y-3">
            <input type="password" placeholder="New password" value={profileForm.newPassword}
              onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              style={inputStyle} className={inputClass} />
            <input type="password" placeholder="Confirm new password" value={profileForm.confirmPassword}
              onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
              style={inputStyle} className={inputClass} />
          </div>
        </div>
        <button onClick={handleSaveProfile} className="w-full bg-primary hover:opacity-90 text-white py-2.5 rounded-lg text-[13px] font-medium transition-opacity">
          Save Profile
        </button>
      </div>
    ),

    appearance: (
      <div className="space-y-1">
        <SectionRow label="Theme" sub="Switch between dark and light mode">
          <div className="flex bg-muted border border-border rounded-lg p-1">
            <button
              onClick={() => updateSettings({ darkMode: true })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${settings.darkMode ? "bg-primary text-white" : "text-muted-foreground"}`}
            >
              <Moon className="w-3.5 h-3.5" strokeWidth={1.5} /> Dark
            </button>
            <button
              onClick={() => updateSettings({ darkMode: false })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${!settings.darkMode ? "bg-primary text-white" : "text-muted-foreground"}`}
            >
              <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> Light
            </button>
          </div>
        </SectionRow>

        <SectionRow label="Accent Color" sub="Choose your brand colour">
          <div className="flex gap-2.5 items-center flex-wrap">
            {(["harbor", "crimson", "forest"] as const).map(id => {
              const cfg = ACCENT_CONFIGS[id];
              return (
                <button
                  key={id}
                  onClick={() => updateSettings({ accentColor: id })}
                  title={cfg.label}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 transition-all ${settings.accentColor === id ? "scale-110" : "border-transparent opacity-80 group-hover:opacity-100"}`}
                    style={{
                      backgroundColor: cfg.primary,
                      borderColor: settings.accentColor === id ? "white" : "transparent",
                    }}
                  />
                  <span className={`text-[10px] ${settings.accentColor === id ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionRow>

        <SectionRow label="Layout Density" sub="Choose how compact the interface feels">
          <div className="flex bg-muted border border-border rounded-lg p-1">
            {(["comfortable", "compact"] as const).map(d => (
              <button
                key={d}
                onClick={() => updateSettings({ density: d })}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${settings.density === d ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </SectionRow>
      </div>
    ),

    currency: (
      <div className="space-y-1">
        <SectionRow label="Currency" sub="Default currency for all amounts">
          <select
            value={settings.currency.code}
            onChange={e => {
              const c = CURRENCIES.find(c => c.code === e.target.value);
              if (c) updateSettings({ currency: c });
            }}
            style={inputStyle}
            className={selectClass}
          >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}
          </select>
        </SectionRow>
        <SectionRow label="Date Format" sub="How dates are displayed">
          <select
            value={settings.dateFormat}
            onChange={e => updateSettings({ dateFormat: e.target.value as AppSettings["dateFormat"] })}
            style={inputStyle}
            className={selectClass}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </SectionRow>
        <SectionRow label="Number Format" sub="How numbers are formatted">
          <select
            value={settings.numberFormat}
            onChange={e => updateSettings({ numberFormat: e.target.value as AppSettings["numberFormat"] })}
            style={inputStyle}
            className={selectClass}
          >
            <option value="1,000.00">1,000.00 (US)</option>
            <option value="1.000,00">1.000,00 (EU)</option>
          </select>
        </SectionRow>
      </div>
    ),

    notifications: (
      <div className="space-y-1">
        <SectionRow label="Weekly Summary" sub="Get a weekly recap of your finances">
          <Toggle on={settings.notifications.weeklySummary} onChange={v => updateSettings({ notifications: { ...settings.notifications, weeklySummary: v } })} />
        </SectionRow>
        <SectionRow label="Large Transaction Alerts" sub={`Alert when a single transaction exceeds ${formatCurrency(settings.notifications.largeTxThreshold)}`}>
          <Toggle on={settings.notifications.largeTxAlerts} onChange={v => updateSettings({ notifications: { ...settings.notifications, largeTxAlerts: v } })} />
        </SectionRow>
        {settings.notifications.largeTxAlerts && (
          <div className="pb-3 border-b border-border">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">Alert Threshold</label>
            <input
              type="number"
              value={settings.notifications.largeTxThreshold}
              onChange={e => updateSettings({ notifications: { ...settings.notifications, largeTxThreshold: Number(e.target.value) } })}
              style={{ ...inputStyle, maxWidth: 200 }}
              className={inputClass}
              min="1"
            />
          </div>
        )}
        <SectionRow label="Budget Limit Warnings" sub="Alert when spending nears a budget limit">
          <Toggle on={settings.notifications.budgetWarnings} onChange={v => updateSettings({ notifications: { ...settings.notifications, budgetWarnings: v } })} />
        </SectionRow>
      </div>
    ),

    categories: (
      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-medium text-foreground mb-1">Default Expense Categories</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {EXPENSE_CATS.map(c => (
              <span key={c} className="text-[12px] bg-muted border border-border text-muted-foreground px-3 py-1 rounded-lg">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground mb-1">Default Income Categories</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {INCOME_CATS.map(c => (
              <span key={c} className="text-[12px] bg-muted border border-border text-muted-foreground px-3 py-1 rounded-lg">{c}</span>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-[13px] font-medium text-foreground mb-3">Custom Categories</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Category name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCat()}
              style={inputStyle}
              className={inputClass + " flex-1"}
            />
            <button onClick={handleAddCat} className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
              Add
            </button>
          </div>
          {customCats.length > 0 ? (
            <div className="space-y-2">
              {customCats.map(cat => (
                <div key={cat} className="flex items-center justify-between bg-muted border border-border rounded-lg px-3 py-2">
                  <span className="text-[13px] text-foreground">{cat}</span>
                  <button onClick={() => handleDeleteCat(cat)} className="p-1.5 rounded hover:bg-[#EF4444]/10 text-muted-foreground hover:text-[#EF4444] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">No custom categories yet.</p>
          )}
        </div>
      </div>
    ),

    data: (
      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-medium text-foreground mb-1">Export Data</p>
          <p className="text-[12px] text-muted-foreground mb-3">Download your transaction history</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-lg text-[13px] font-medium hover:border-primary/50 transition-colors">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Export as CSV
            </button>
            <button
              onClick={() => toast.info("PDF export requires Supabase integration")}
              className="flex items-center gap-2 bg-card border border-border text-muted-foreground px-4 py-2.5 rounded-lg text-[13px] font-medium hover:border-primary/50 transition-colors"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Export as PDF
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[13px] font-medium text-foreground mb-1">Danger Zone</p>
          <p className="text-[12px] text-muted-foreground mb-3">These actions are permanent and cannot be undone.</p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 border border-[#EF4444]/40 text-[#EF4444] px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#EF4444]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              Delete All Data
            </button>
          ) : (
            <div className="bg-[#EF4444]/5 border border-[#EF4444]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-[12px] text-muted-foreground">
                  This will permanently delete all transactions, budgets, and goals. Type{" "}
                  <span className="text-foreground font-medium">DELETE</span> to confirm.
                </p>
              </div>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                style={inputStyle}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button onClick={handleDeleteAll} className="flex items-center gap-1.5 bg-[#EF4444] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#DC2626] transition-colors">
                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> Confirm Delete
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm(""); }} className="flex items-center gap-1.5 border border-border text-muted-foreground px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-muted">
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ),

    about: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Anchor className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground tracking-[-0.3px]">Harbor</p>
            <p className="text-[11px] text-muted-foreground">Your finances, anchored.</p>
          </div>
        </div>
        <div className="space-y-1">
          <SectionRow label="Version" sub="Current release"><span className="text-[13px] font-medium text-muted-foreground">1.0.0</span></SectionRow>
          <SectionRow label="Build" sub="Build number"><span className="text-[13px] font-medium text-muted-foreground">2026.04.24</span></SectionRow>
          <SectionRow label="Framework" sub="Technology stack"><span className="text-[13px] font-medium text-muted-foreground">React + Vite</span></SectionRow>
          <SectionRow label="Changelog" sub="See what's new">
            <button onClick={() => toast.info("No changelog available in demo")} className="text-[12px] text-primary hover:opacity-80 font-medium transition-opacity">View →</button>
          </SectionRow>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">Built with Harbor — finance designed for clarity.</p>
        </div>
      </div>
    ),
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-[24px] font-bold text-foreground tracking-[-0.3px]">Settings</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Manage your preferences</p>
      </div>

      {/* Desktop: sidebar + content */}
      <div className="hidden lg:flex gap-5">
        <div className="w-48 shrink-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[13px] border-b border-border last:border-0 transition-colors ${activeTab === id ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-card border border-border rounded-xl p-6">
          <h2 className="text-[18px] font-bold text-foreground tracking-[-0.3px] mb-5">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          {tabContent[activeTab]}
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="lg:hidden space-y-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <div key={id} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
              className="w-full flex items-center gap-3 px-4 py-3.5"
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left text-[13px] font-medium text-foreground">{label}</span>
              {openAccordion === id
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />}
            </button>
            {openAccordion === id && (
              <div className="px-4 pb-4 border-t border-border pt-4">
                {tabContent[id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
