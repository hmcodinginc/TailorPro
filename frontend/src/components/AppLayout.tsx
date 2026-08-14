import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Ruler, ShoppingBag, FileText,
  Package, BarChart3, Settings, LogOut, Scissors, Menu, X,
  Bell, Search, Moon, Sun, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Navigation config ──────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
      { to: "/customers",   label: "Customers",    icon: Users           },
      { to: "/orders",      label: "Orders",       icon: ShoppingBag     },
      { to: "/measurements",label: "Measurements", icon: Ruler           },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/invoices",    label: "Billing",      icon: FileText        },
      { to: "/inventory",   label: "Inventory",    icon: Package         },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/reports",     label: "Reports",      icon: BarChart3       },
      { to: "/settings",    label: "Settings",     icon: Settings        },
    ],
  },
];

/* ── Sidebar nav ────────────────────────────────────────────────────── */
function SidebarNav({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/dashboard" &&
                  location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    collapsed && "justify-center",
                    active
                      ? "bg-sky-50 text-sky-700 font-semibold dark:bg-sky-900/25 dark:text-sky-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "shrink-0 transition-colors",
                      collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                      active
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <ChevronRight className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ── Main layout ────────────────────────────────────────────────────── */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => {
    // Persist dark mode preference in localStorage so it survives page refresh
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden relative"
      >
        {/* Logo row — clicking navigates to landing page */}
        <Link
          to="/"
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border shrink-0 px-3 hover:bg-accent/50 transition-colors",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-brand-sm">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="font-bold text-foreground text-sm leading-none">TailorPro</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Studio Manager</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Nav items */}
        <SidebarNav collapsed={collapsed} />

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-0.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile sidebar ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-sidebar border-r border-sidebar-border lg:hidden"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
                  <Scissors className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">TailorPro</p>
                  <p className="text-[10px] text-muted-foreground">Studio Manager</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav collapsed={false} onClose={() => setMobileOpen(false)} />
            <div className="border-t border-sidebar-border p-2 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 lg:px-5 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-30">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className="w-full h-8 pl-8 pr-4 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-background transition-all border border-transparent focus:border-border"
                placeholder="Search customers, orders…"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Dark mode */}
            <button
              onClick={() => setDark(!dark)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
            </button>

            {/* Avatar */}
            <button className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center shadow-brand-sm hover:opacity-90 transition-opacity">
              <span className="text-white text-xs font-bold">T</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
