import { useMemo, useState } from "react"
import { Pencil, Plus, Search, ShoppingBag, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addOrder, deleteOrder, getCustomers, getOrders, updateOrder } from "@/lib/api"
import { ORDER_STATUSES, getOrderStatusMeta } from "@/lib/domain"
import { formatCurrency, formatDate, isOverdue } from "@/lib/format"

const initialForm = {
  customer_id: "",
  description: "",
  amount: "",
  order_date: "",
  due_date: "",
  status: "Pending",
}

export default function Orders() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders })
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })

  const mutation = useMutation({
    mutationFn: (data: any) => (editingId ? updateOrder(editingId, data) : addOrder(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setOpen(false)
      setEditingId(null)
      setForm(initialForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  })

  const customerById = useMemo(() => {
    return customers.reduce((acc: any, customer: any) => {
      acc[customer.id] = customer
      return acc
    }, {})
  }, [customers])

  const filtered = orders.filter((order: any) => {
    const customer = customerById[order.customer_id]
    const text = `${order.order_code || ""} ${order.description || ""} ${customer?.name || ""}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const normalizedStatus = order.status === "In Progress" ? "Stitching" : order.status
    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      customer_id: Number(form.customer_id),
      description: form.description,
      amount: Number(form.amount),
      order_date: form.order_date,
      due_date: form.due_date,
      status: form.status,
    })
  }

  const openEdit = (order: any) => {
    setEditingId(order.id)
    setForm({
      customer_id: String(order.customer_id),
      description: order.description,
      amount: String(order.amount),
      order_date: order.order_date,
      due_date: order.due_date,
      status: order.status === "In Progress" ? "Stitching" : order.status,
    })
    setOpen(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <PageHeader
        title="Orders"
        description="Track production stages, delivery dates, customer work, and order value."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setForm(initialForm) }}>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Order" : "Create Order"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={form.customer_id} onValueChange={(value) => setForm({ ...form, customer_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Order Date</Label>
                    <Input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={mutation.isPending || !form.customer_id}>
                  {mutation.isPending ? "Saving..." : editingId ? "Update Order" : "Create Order"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search orders, customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{filtered.length} of {orders.length} orders</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" />}
          title={search || statusFilter !== "all" ? "No orders match these filters" : "No orders yet"}
          description={search || statusFilter !== "all" ? "Adjust the search or status filter to find more orders." : "Create your first order to start tracking production and delivery."}
          action={!search && statusFilter === "all" && <Button onClick={() => setOpen(true)}>Create Order</Button>}
        />
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order: any) => {
                  const customer = customerById[order.customer_id]
                  const meta = getOrderStatusMeta(order.status)
                  const overdue = order.status !== "Delivered" && isOverdue(order.due_date)
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium text-slate-950">{order.order_code || `Order #${order.id}`}</div>
                        <div className="max-w-[280px] truncate text-sm text-muted-foreground">{order.description}</div>
                      </TableCell>
                      <TableCell>{customer?.name ?? "-"}</TableCell>
                      <TableCell><Badge variant="outline" className={meta.className}>{meta.label}</Badge></TableCell>
                      <TableCell>
                        <span className={overdue ? "font-medium text-red-600" : ""}>{formatDate(order.due_date)}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(order.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(order)} aria-label="Edit order">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (window.confirm(`Delete ${order.order_code || "this order"}?`)) deleteMutation.mutate(order.id)
                            }}
                            aria-label="Delete order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
