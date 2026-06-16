import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Bell,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Users,
  Ruler,
  ShoppingBag,
  FileText,
  LogOut,
  Menu,
  Scissors
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/measurements", label: "Measurements", icon: Ruler },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/invoices", label: "Invoices", icon: FileText }
];


export default function AppLayout({ children }: { children: React.ReactNode }) {

  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (

    <div className="flex min-h-screen bg-slate-50">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-slate-950 text-white shadow-xl transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        {/* Logo */}

        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">

          <div className="bg-emerald-500 p-2 rounded-md shadow-sm shadow-emerald-950/40">
            <Scissors className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="font-semibold text-white">TailorPro</p>
            <p className="text-xs text-slate-400">Studio operations</p>
          </div>

        </div>


        {/* Navigation */}

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">

          {navItems.map((item) => {

            const active =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

            return (

              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >

                <item.icon className="h-4 w-4" />

                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 text-slate-500" />}

              </Link>

            );

          })}

        </nav>


        {/* Logout */}

        <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs font-medium text-slate-300">Today</p>
          <p className="mt-1 text-sm text-white">Keep orders moving before delivery dates slip.</p>
        </div>

        <div className="px-3 py-4 border-t border-white/10">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-slate-300 hover:bg-white/10 hover:text-white"
          >

            <LogOut className="h-4 w-4" />

            Logout

          </button>

        </div>

      </aside>


      {/* Main */}

      <main className="flex-1 min-w-0">

        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-white/90 px-4 py-3 backdrop-blur lg:px-6">

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden max-w-xl flex-1 items-center lg:flex">
            <Input
              className="h-9 bg-slate-50"
              placeholder="Search customers, orders, invoices..."
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
              <CalendarDays className="h-4 w-4" />
              Today
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="sr-only">

            {navItems.find(
              (n) =>
                n.to === location.pathname ||
                (n.to !== "/" && location.pathname.startsWith(n.to))
            )?.label || "TailorPro"}

          </h1>

        </header>


        <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">

          {children}

        </div>

      </main>

    </div>

  );

}
