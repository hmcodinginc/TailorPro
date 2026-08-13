import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, ShoppingBag, FileText, BarChart3, Award } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { getCustomers, getInvoices, getOrders } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b", Stitching: "#0ea5e9", "In Progress": "#0ea5e9",
  Ready: "#10b981", Delivered: "#6b7280", Cancelled: "#ef4444",
};

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-3 text-xs">
      <p className="text-gray-500 font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.dataKey === "revenue" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function Reports() {
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: orders = [] }    = useQuery({ queryKey: ["orders"],    queryFn: getOrders    });
  const { data: invoices = [] }  = useQuery({ queryKey: ["invoices"],  queryFn: getInvoices  });

  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return MONTHS[d.getMonth()];
  });

  const monthlyData = last6.map((m) => ({
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

  const pipeline = Object.entries(
    orders.reduce((acc: any, o: any) => {
      const s = o.status || "Unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "#6b7280" }));

  const topCustomers = customers
    .map((c: any) => ({
      name: c.name,
      revenue: invoices
        .filter((i: any) => i.customer_id === c.id && String(i.status).toLowerCase() === "paid")
        .reduce((s: number, i: any) => s + Number(i.amount || 0), 0),
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 6);

  const totalRevenue = invoices
    .filter((i: any) => String(i.status).toLowerCase() === "paid")
    .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  const outstanding = invoices
    .filter((i: any) => String(i.status).toLowerCase() !== "paid")
    .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  const deliveredRate = orders.length
    ? Math.round((orders.filter((o: any) => o.status === "Delivered").length / orders.length) * 100)
    : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business insights and performance metrics</p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: formatCurrency(totalRevenue), icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Outstanding",    value: formatCurrency(outstanding),  icon: FileText,   color: "bg-amber-50 text-amber-600"    },
          { label: "Total Clients",  value: customers.length,             icon: Users,      color: "bg-sky-50 text-sky-600"        },
          { label: "Delivery Rate",  value: `${deliveredRate}%`,          icon: Award,      color: "bg-violet-50 text-violet-600"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={item} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue trend */}
      <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold text-gray-900 text-sm">Revenue & Orders Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last 6 months performance</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#rg)" />
            <Area type="monotone" dataKey="orders"  name="Orders"  stroke="#14b8a6" strokeWidth={2} fill="url(#og)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pipeline pie */}
        <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-5">Order Status Breakdown</h3>
          {pipeline.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="h-9 w-9 mb-2 opacity-30" />
              <p className="text-xs">No orders yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                    {pipeline.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
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
            </div>
          )}
        </motion.div>

        {/* Top customers */}
        <motion.div variants={item} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-sky-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Top Customers by Revenue</h3>
          </div>
          {topCustomers.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Users className="h-9 w-9 mb-2 opacity-30" />
              <p className="text-xs">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#0ea5e9" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
