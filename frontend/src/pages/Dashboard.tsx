import { motion } from "framer-motion";
import {
  TrendingUp, Users, ShoppingBag, Package,
  AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
  Scissors, MoreHorizontal, Calendar,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getCustomers, getInvoices, getOrders } from "@/lib/api";
import { formatCurrency, formatDate, isOverdue } from "@/lib/format";
import { getOrderStatusMeta } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";

/* ── Framer variants ─────────────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Recharts custom tooltip ─────────────────────────────────────────── */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-3 text-xs">
      <p className="text-gray-500 font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}:{" "}
          {p.dataKey === "revenue" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, trend, icon: Icon, iconBg,
}: {
  label: string; value: string | number; sub?: string;
  trend?: number; icon: any; iconBg: string;
}) {
  const positive = (trend ?? 0) >= 0;
  return (
    <motion.div
      variants={item}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Stitching: "#0ea5e9",
  "In Progress": "#0ea5e9",
  Ready: "#10b981",
  Delivered: "#6b7280",
  Cancelled: "#ef4444",
};

export default function Dashboard() {
  const { data: customers = [], isLoading: cl } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: orders = [], isLoading: ol } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const { data: invoices = [], isLoading: il } = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });

  const loading = cl || ol || il;

  const paidRevenue = invoices
    .filter((i: any) => String(i.status).toLowerCase() === "paid")
    .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  const outstanding = invoices
    .filter((i: any) => String(i.status).toLowerCase() !== "paid")
    .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  const activeOrders = orders.filter((o: any) => !["Delivered", "Cancelled"].includes(o.status)).length;
  const overdueOrders = orders.filter((o: any) => o.status !== "Delivered" && isOverdue(o.due_date)).length;

  /* Revenue chart data */
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return MONTHS[d.getMonth()];
  });

  const chartData = last6.map((m) => ({
    month: m,
    revenue: invoices
      .filter((inv: any) => {
        const d = inv.created_at ? new Date(inv.created_at) : new Date();
        return MONTHS[d.getMonth()] === m && String(inv.status).toLowerCase() === "paid";
      })
      .reduce((s: number, i: any) => s + Number(i.amount || 0), 0),
    orders: orders.filter((o: any) => {
      const d = o.order_date ? new Date(o.order_date) : new Date();
      return MONTHS[d.getMonth()] === m;
    }).length,
  }));

  /* Pipeline breakdown */
  const pipeline = Object.entries(
    orders.reduce((acc: any, o: any) => {
      acc[o.status || "Unknown"] = (acc[o.status || "Unknown"] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "#6b7280" }));

  const dueSoon = [...orders]
    .filter((o: any) => o.status !== "Delivered")
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const recentOrders = [...orders].sort((a: any, b: any) => b.id - a.id).slice(0, 6);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Page header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-sky-500" />
          {new Date().getFullYear()}
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={loading ? "—" : `$${(paidRevenue / 1000).toFixed(1)}k`}
          sub="Collected this year"
          trend={12}
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Orders"
          value={loading ? "—" : orders.length}
          sub={`${activeOrders} active`}
          trend={8}
          icon={ShoppingBag}
          iconBg="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Clients"
          value={loading ? "—" : customers.length}
          sub="Total profiles"
          trend={24}
          icon={Users}
          iconBg="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Fabrics"
          value="68"
          sub={overdueOrders > 0 ? `${overdueOrders} overdue orders` : "All stocked"}
          trend={overdueOrders > 0 ? -overdueOrders : 5}
          icon={Package}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <motion.div variants={item} className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Paid invoices — last 6 months</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="h-7 w-7 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pipeline pie */}
        <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 text-sm">Order Pipeline</h3>
            <p className="text-xs text-gray-400 mt-0.5">Current stage breakdown</p>
          </div>
          {loading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="h-7 w-7 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            </div>
          ) : pipeline.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-400">
              <Scissors className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-xs">No orders yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={3} strokeWidth={0}>
                    {pipeline.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {pipeline.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-500">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{d.value as number}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid xl:grid-cols-2 gap-4">
        {/* Due soon */}
        <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Due Soon</h3>
            </div>
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
              {dueSoon.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-8 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-28" />
                    <div className="h-2.5 bg-gray-100 rounded w-20" />
                  </div>
                </div>
              ))
              : dueSoon.length === 0
              ? (
                <div className="px-5 py-10 text-center text-gray-400">
                  <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-emerald-400" />
                  <p className="text-xs">No upcoming deadlines</p>
                </div>
              )
              : dueSoon.map((order: any) => {
                  const overdue = isOverdue(order.due_date);
                  return (
                    <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                        overdue ? "bg-red-50" : "bg-emerald-50"
                      }`}>
                        {overdue
                          ? <AlertTriangle className="h-4 w-4 text-red-500" />
                          : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.order_code || `Order #${order.id}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{order.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-semibold ${overdue ? "text-red-500" : "text-gray-700"}`}>
                          {formatDate(order.due_date)}
                        </p>
                        <p className="text-xs text-gray-400">{formatCurrency(order.amount)}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Orders</h3>
            <a href="/orders" className="text-xs text-sky-600 hover:underline font-medium">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-8 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-28" />
                    <div className="h-2.5 bg-gray-100 rounded w-20" />
                  </div>
                  <div className="h-5 w-14 bg-gray-100 rounded-full" />
                </div>
              ))
              : recentOrders.length === 0
              ? (
                <div className="px-5 py-10 text-center text-gray-400">
                  <Scissors className="h-7 w-7 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No orders yet</p>
                </div>
              )
              : recentOrders.map((order: any) => {
                  const meta = getOrderStatusMeta(order.status);
                  return (
                    <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <Scissors className="h-4 w-4 text-sky-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.order_code || `Order #${order.id}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{order.description}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${meta.className}`}>
                        {meta.label}
                      </Badge>
                    </div>
                  );
                })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
