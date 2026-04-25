import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useFinance } from "../context/FinanceContext";
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  TrendingUp, Bell, Menu, X, LogOut, Settings,
  Anchor, ChevronRight, ChevronLeft, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { getBudgetAlerts, balance, username, formatCurrency } = useFinance();
  const navigate = useNavigate();
  const alerts = getBudgetAlerts();
  const initial = username ? username.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.removeItem("harbor_token");
    localStorage.removeItem("harbor_auth");
    toast.success("Logged out");
    // Force full page reload so FinanceProvider remounts completely.
    // Using navigate() keeps the old user's data alive in memory — data leakage.
    window.location.href = "/login";
  };

  /* ── Shared sidebar content (icons-only when collapsed) ── */
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border overflow-hidden">
        <Anchor className="w-5 h-5 text-white shrink-0" strokeWidth={1.5} />
        {(!collapsed || mobile) && (
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white tracking-[-0.3px]">Harbor</p>
            <p className="text-[11px] text-sidebar-accent-foreground/60">Finance</p>
          </div>
        )}
        {mobile && (
          <button className="text-sidebar-accent-foreground/60 hover:text-white ml-auto" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Balance — hidden when collapsed */}
      {(!collapsed || mobile) && (
        <div className="mx-3 mt-4 bg-sidebar-accent border border-sidebar-border rounded-xl px-4 py-3">
          <p className="text-[11px] text-sidebar-accent-foreground/60 mb-1">Total Balance</p>
          <p className={`text-[20px] font-bold tracking-[-0.3px] ${balance >= 0 ? "text-white" : "text-[#EF4444]"}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setMobileOpen(false)}
            title={collapsed && !mobile ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${collapsed && !mobile ? "justify-center" : ""
              } ${isActive
                ? "bg-sidebar-accent text-white font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {(!collapsed || mobile) && <span className="flex-1">{label}</span>}
                {(!collapsed || mobile) && isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Budget alerts — hidden when collapsed */}
      {alerts.length > 0 && (!collapsed || mobile) && (
        <div className="mx-3 mb-3 bg-sidebar-accent border border-sidebar-border rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={1.5} />
            <p className="text-[11px] text-sidebar-foreground/80 font-medium">{alerts.length} budget alert{alerts.length > 1 ? "s" : ""}</p>
          </div>
          {alerts.slice(0, 2).map(a => (
            <p key={a.category} className="text-[11px] text-sidebar-accent-foreground/50">{a.category}: near limit</p>
          ))}
        </div>
      )}

      {/* User / logout */}
      <div className="border-t border-sidebar-border px-2 py-3">
        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? "Log out" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group ${collapsed && !mobile ? "justify-center" : ""}`}
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            {initial}
          </div>
          {(!collapsed || mobile) && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] text-white font-medium truncate">{username}</p>
                <p className="text-[11px] text-sidebar-accent-foreground/50">Log out</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-sidebar-accent-foreground/50 group-hover:text-white" strokeWidth={1.5} />
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile sidebar (drawer) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-60 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* ── Desktop sidebar (collapsible) ── */}
      <aside
        className={`hidden lg:flex flex-col relative bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0 ${collapsed ? "w-[60px]" : "w-60"
          }`}
      >
        <SidebarContent />

        {/* Pull tab — circle near the top of the right edge */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3.5 top-16 z-10 w-7 h-7 bg-primary border border-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md hover:scale-110"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
            : <ChevronLeft  className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
          }
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 md:px-6 py-4 bg-card border-b border-border shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-[14px] font-medium text-foreground">Good {getTimeOfDay()}, {username}</p>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={() => toast.error(`${alerts.length} budget ${alerts.length > 1 ? "categories are" : "category is"} near or over limit`)}
              className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            </button>
          )}
          <div
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[13px] font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
          >
            {initial}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
