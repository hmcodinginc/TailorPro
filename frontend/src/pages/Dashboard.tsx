import { AlertTriangle, CheckCircle2, Clock, FileText, Scissors, TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { EmptyState } from "@/components/EmptyState"
import { MetricCard } from "@/components/MetricCard"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCustomers, getInvoices, getOrders } from "@/lib/api"
import { getOrderStatusMeta } from "@/lib/domain"
import { formatCurrency, formatDate, isOverdue } from "@/lib/format"

const pipelineColors: Record<string, string> = {
  Pending: "#f59e0b",
  Stitching: "#2563eb",
  Ready: "#059669",
  Delivered: "#64748b",
}

export default function Dashboard() {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  const activeOrders = orders.filter((o: any) => !["Delivered", "Cancelled"].includes(o.status)).length
  const overdueOrders = orders.filter((o: any) => o.status !== "Delivered" && isOverdue(o.due_date)).length
  const paidRevenue = invoices
    .filter((i: any) => String(i.status).toLowerCase() === "paid")
    .reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0)
  const outstanding = invoices
    .filter((i: any) => String(i.status).toLowerCase() !== "paid")
    .reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0)

  const pipelineData = ["Pending", "Stitching", "Ready", "Delivered"].map((status) => ({
    status,
    count: orders.filter((o: any) => (o.status === "In Progress" ? "Stitching" : o.status) === status).length,
  }))

  const revenueData = Object.values(
    invoices.reduce((acc: any, inv: any) => {
      const date = inv.created_at ? new Date(inv.created_at) : new Date()
      const month = date.toLocaleString("default", { month: "short" })
      if (!acc[month]) acc[month] = { month, revenue: 0 }
      if (String(inv.status).toLowerCase() === "paid") acc[month].revenue += Number(inv.amount || 0)
      return acc
    }, {})
  )

  const dueSoon = [...orders]
    .filter((o: any) => o.status !== "Delivered")
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 6)

  const recentOrders = [...orders].sort((a: any, b: any) => b.id - a.id).slice(0, 5)
  const loading = customersLoading || ordersLoading || invoicesLoading

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <PageHeader
        title="Studio Dashboard"
        description="Track today's workload, delivery risks, revenue, and customer activity."
        actions={
          <>
            <Button variant="outline">Export Report</Button>
            <Button>New Order</Button>
          </>
        }
      />

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Customers" value={customers.length} detail="Profiles in your studio" icon={Users} tone="slate" />
        <MetricCard title="Active Orders" value={activeOrders} detail={`${overdueOrders} overdue`} icon={Scissors} tone={overdueOrders ? "rose" : "emerald"} />
        <MetricCard title="Collected Revenue" value={formatCurrency(paidRevenue)} detail="From paid invoices" icon={TrendingUp} tone="emerald" />
        <MetricCard title="Outstanding" value={formatCurrency(outstanding)} detail="Pending and unpaid invoices" icon={FileText} tone="amber" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Paid invoice value by month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenueData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No revenue yet" description="Paid invoices will appear here once payments are recorded." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Order Pipeline</CardTitle>
            <CardDescription>Current workload by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pipelineData} dataKey="count" nameKey="status" innerRadius={62} outerRadius={94} paddingAngle={3}>
                    {pipelineData.map((entry) => (
                      <Cell key={entry.status} fill={pipelineColors[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {pipelineData.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pipelineColors[item.status] }} />
                  <span className="text-muted-foreground">{item.status}</span>
                  <span className="ml-auto font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Due Soon
            </CardTitle>
            <CardDescription>Orders that need attention first</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : dueSoon.length ? (
              <div className="divide-y rounded-md border">
                {dueSoon.map((order: any) => {
                  const customer = customers.find((c: any) => c.id === order.customer_id)
                  const overdue = isOverdue(order.due_date)
                  return (
                    <div key={order.id} className="flex items-center gap-4 p-3">
                      <div className={overdue ? "text-red-600" : "text-slate-500"}>
                        {overdue ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-950">{order.order_code || `Order #${order.id}`}</p>
                        <p className="truncate text-xs text-muted-foreground">{customer?.name ?? "Unknown customer"} - {order.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className={overdue ? "font-medium text-red-600" : "font-medium"}>{formatDate(order.due_date)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(order.amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState title="No active due dates" description="New active orders will appear in this queue." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders from your studio</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : recentOrders.length ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => {
                  const customer = customers.find((c: any) => c.id === order.customer_id)
                  const meta = getOrderStatusMeta(order.status)
                  return (
                    <div key={order.id} className="flex items-center justify-between gap-4 rounded-md border bg-white p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">{customer?.name ?? "Unknown customer"}</p>
                        <p className="truncate text-sm text-muted-foreground">{order.description}</p>
                      </div>
                      <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState title="No orders yet" description="Create an order to start tracking studio activity." />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

