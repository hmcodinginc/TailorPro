import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag, Plus, Search, Calendar, AlertTriangle,
  Scissors, MoreHorizontal, X, Filter,
} from "lucide-react";
import { getOrders, getCustomers, addOrder, deleteOrder } from "@/lib/api";
import { formatCurrency, formatDate, isOverdue } from "@/lib/format";
import { getOrderStatusMeta, ORDER_STATUSES } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const emptyForm = {
  customer_id: "", description: "", amount: "", due_date: "", status: "Pending",
};

export default function Orders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const createMut = useMutation({ mutationFn: addOrder, onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }) });
  const deleteMut = useMutation({ mutationFn: deleteOrder, onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }) });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filtered = orders.filter((o: any) => {
    const matchesSearch = o.description?.toLowerCase().includes(search.toLowerCase())
      || o.order_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = orders.filter((o: any) => o.status !== "Delivered" && isOverdue(o.due_date)).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createMut.mutateAsync({
        ...form,
        customer_id: Number(form.customer_id),
        amount: Number(form.amount),
      });
      setOpen(false);
      setForm(emptyForm);
    } catch {
      setError("Failed to create order.");
    }
  };

  const statusCount = (s: string) => orders.filter((o: any) => o.status === s).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track garments from order to delivery</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white shadow-brand-sm hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create Order</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Customer *</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger className="h-9 rounded-xl"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Description *</Label>
                <Input className="h-9 rounded-xl" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Amount (₹)</Label>
                  <Input type="number" className="h-9 rounded-xl" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Due Date</Label>
                  <Input type="date" className="h-9 rounded-xl" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 gradient-brand text-white rounded-xl" disabled={createMut.isPending}>
                  {createMut.isPending ? "Creating…" : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Status pills */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((s) => {
          const count = s === "all" ? orders.length : statusCount(s);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? "gradient-brand text-white shadow-brand-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {s === "all" ? "All" : s}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${statusFilter === s ? "bg-white/20" : "bg-gray-100"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <motion.div variants={item} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdueCount} overdue order{overdueCount > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-red-500 mt-0.5">These orders have passed their due date and are still active.</p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            className="pl-8 h-9 rounded-xl border-gray-200"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-400 shrink-0">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {/* Orders table-like list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex items-center gap-4">
              <div className="h-9 w-9 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-28" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium text-sm">No orders found</p>
          <p className="text-xs mt-1">{search || statusFilter !== "all" ? "Try different filters" : "Create your first order"}</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: any) => {
            const meta = getOrderStatusMeta(order.status);
            const overdue = isOverdue(order.due_date) && order.status !== "Delivered";
            return (
              <motion.div
                key={order.id}
                variants={item}
                className={`group bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all duration-200 ${
                  overdue ? "border-red-200 bg-red-50/30" : "border-gray-100"
                }`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${overdue ? "bg-red-100" : "bg-sky-50"}`}>
                  {overdue
                    ? <AlertTriangle className="h-4 w-4 text-red-500" />
                    : <Scissors className="h-4 w-4 text-sky-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {order.order_code || `Order #${order.id}`}
                    </p>
                    {overdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">OVERDUE</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{order.description}</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(order.due_date)}
                </div>

                <p className="hidden md:block text-sm font-semibold text-gray-700 shrink-0 w-20 text-right">
                  {order.amount ? formatCurrency(order.amount) : "—"}
                </p>

                <Badge variant="outline" className={`text-xs shrink-0 ${meta.className}`}>
                  {meta.label}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      className="text-sm text-red-600 focus:text-red-600"
                      onClick={() => {
                        if (window.confirm("Delete this order?")) deleteMut.mutate(order.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
