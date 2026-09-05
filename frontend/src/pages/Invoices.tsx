import { useState } from "react";
import {
  Plus, FileText, Pencil, Trash2, Search, Download, Printer, CreditCard, DollarSign, Calendar, ChevronRight, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices, addInvoice, updateInvoice, deleteInvoice, getCustomers, getOrders, getBusinessProfile,
  recordInvoicePayment, deleteInvoicePayment
} from "@/lib/api";
import { generateInvoicePDF } from "@/lib/invoicePdf";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import type { Customer, Order, Invoice, InvoiceStatus, PaymentType, PaymentRecord } from "@/lib/types";


interface IForm {
  customer_id: string;
  order_id: string;
  amount: string;
  status: InvoiceStatus;
  payment_type: PaymentType;
  notes: string;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unpaid: "bg-rose-50 text-rose-700 border-rose-200",
};

const PAYMENT_STYLES: Record<PaymentType, string> = {
  cash: "bg-blue-50 text-blue-700 border-blue-200",
  online: "bg-purple-50 text-purple-700 border-purple-200",
};

const emptyForm: IForm = {
  customer_id: "",
  order_id: "",
  amount: "",
  status: "pending",
  payment_type: "cash",
  notes: "",
};

// ── Invoice Creation / Edit Dialog ─────────────────────────────────────────────

interface InvoiceDialogProps {
  invoice?: Invoice | null;
  customers: Customer[];
  orders: Order[];
  onClose: () => void;
}

function InvoiceDialog({ invoice, customers, orders, onClose }: InvoiceDialogProps) {
  const editing = !!invoice;

  const [form, setForm] = useState<IForm>(
    invoice
      ? {
          customer_id: String(invoice.customer_id),
          order_id: String(invoice.order_id),
          amount: String(invoice.amount),
          status: invoice.status,
          payment_type: invoice.payment_type,
          notes: invoice.notes ?? "",
        }
      : emptyForm
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const customerOrders = form.customer_id
    ? orders.filter((o) => o.customer_id === Number(form.customer_id))
    : orders;

  const mutation = useMutation({
    mutationFn: (data: IForm) => {
      const payload = {
        customer_id: Number(data.customer_id),
        order_id: Number(data.order_id),
        amount: Number(data.amount),
        status: data.status,
        payment_type: data.payment_type,
        notes: data.notes || null,
      };
      return editing
        ? updateInvoice(invoice!.id, payload)
        : addInvoice(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: editing ? "Invoice updated" : "Invoice created" });
      onClose();
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Customer *</Label>
        <Select
          value={form.customer_id}
          onValueChange={(v) => {
            const custOrders = orders.filter((o) => o.customer_id === Number(v));
            setForm((f) => ({
              ...f,
              customer_id: v,
              order_id: custOrders.length > 0 ? String(custOrders[0].id) : "",
              amount: custOrders.length > 0 ? String(custOrders[0].amount || "") : f.amount,
            }));
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Order *</Label>
        <Select
          value={form.order_id}
          onValueChange={(v) => {
            const selectedOrder = orders.find((o) => o.id === Number(v));
            setForm((f) => ({
              ...f,
              order_id: v,
              amount: selectedOrder ? String(selectedOrder.amount || "") : f.amount,
            }));
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue
              placeholder={
                form.customer_id
                  ? customerOrders.length
                    ? "Select order"
                    : "No orders for this customer"
                  : "Select customer first"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {customerOrders.map((o) => (
              <SelectItem key={o.id} value={String(o.id)}>
                {o.order_code || `Order #${o.id}`} - ₹{o.amount} ({o.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Total Amount (₹) *</Label>
        <Input
          type="number"
          min="0"
          step="any"
          placeholder="0"
          className="rounded-xl"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Payment Type</Label>
          <Select
            value={form.payment_type}
            onValueChange={(v) => setForm((f) => ({ ...f, payment_type: v as PaymentType }))}
          >
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">💵 Cash</SelectItem>
              <SelectItem value="online">💳 Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v as InvoiceStatus }))}
          >
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Notes</Label>
        <Input
          placeholder="Optional notes or terms…"
          className="rounded-xl"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          className="rounded-xl gradient-brand text-white"
          disabled={mutation.isPending || !form.customer_id || !form.order_id || !form.amount}
        >
          {mutation.isPending ? "Saving…" : editing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}

// ── Record Payment Modal ───────────────────────────────────────────────────────

interface PaymentDialogProps {
  invoice: Invoice;
  onClose: () => void;
}

function PaymentDialog({ invoice, onClose }: PaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const remaining = invoice.remaining_amount ?? Math.max(0, invoice.amount - (invoice.paid_amount || 0));

  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : "");
  const [paymentType, setPaymentType] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const recordMutation = useMutation({
    mutationFn: (data: any) => recordInvoicePayment(invoice.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Payment recorded successfully" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to record payment", description: err.message, variant: "destructive" });
    },
  });

  const deletePayMutation = useMutation({
    mutationFn: (paymentId: number) => deleteInvoicePayment(invoice.id, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Payment record deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete payment", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) {
      toast({ title: "Invalid amount", description: "Payment amount must be greater than 0.", variant: "destructive" });
      return;
    }
    recordMutation.mutate({
      amount: val,
      payment_type: paymentType,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const payments = invoice.payments || [];

  return (
    <div className="space-y-5">
      {/* Balances Banner */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <div>
          <p className="text-[11px] text-slate-500 font-medium">Invoice Total</p>
          <p className="text-sm font-bold text-slate-900">₹{Number(invoice.amount).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-emerald-600 font-medium">Total Paid</p>
          <p className="text-sm font-bold text-emerald-600">₹{Number(invoice.paid_amount || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-rose-600 font-medium">Remaining</p>
          <p className="text-sm font-bold text-rose-600">₹{Number(remaining).toLocaleString()}</p>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Record New Payment</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Payment Amount (₹) *</Label>
            <Input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 10000"
              className="h-9 rounded-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Method</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="online">💳 Online / UPI</SelectItem>
                <SelectItem value="card">💳 Card</SelectItem>
                <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Reference / Txn ID</Label>
            <Input
              placeholder="e.g. UPI Ref / Cheque #"
              className="h-9 rounded-lg"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Notes</Label>
            <Input
              placeholder="e.g. Advance deposit"
              className="h-9 rounded-lg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-9 rounded-lg gradient-brand text-white font-semibold text-xs"
          disabled={recordMutation.isPending}
        >
          {recordMutation.isPending ? "Recording…" : "Save Payment Record"}
        </Button>
      </form>

      {/* Payment History List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-slate-400" /> Payment History ({payments.length})
          </h4>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-xl">
            No payments recorded yet for this invoice.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    ₹{Number(p.amount).toLocaleString()}
                    <span className="ml-2 font-normal text-slate-500 uppercase text-[10px] bg-white border px-1.5 py-0.5 rounded">
                      {p.payment_type}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {p.payment_date ? format(new Date(p.payment_date), "MMM d, yyyy h:mm a") : "—"}
                    {p.reference && ` • Ref: ${p.reference}`}
                    {p.notes && ` • ${p.notes}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all"
                  onClick={() => {
                    if (window.confirm(`Delete payment of ₹${p.amount}? Balance will recalculate.`)) {
                      deletePayMutation.mutate(p.id);
                    }
                  }}
                  title="Remove payment record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t">
        <Button variant="outline" className="rounded-xl" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// ── Main Invoices Component ────────────────────────────────────────────────────

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const { data: business } = useQuery({ queryKey: ["business"], queryFn: getBusinessProfile });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const getCustomer = (id: number) => customers.find((c) => c.id === id);
  const getOrder = (id: number) => orders.find((o) => o.id === id);

  const filtered = invoices.filter((inv) => {
    const name = getCustomer(inv.customer_id)?.name ?? "";
    const order = getOrder(inv.order_id);
    const searchVal = search.toLowerCase();
    return (
      name.toLowerCase().includes(searchVal) ||
      String(inv.id).includes(searchVal) ||
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(searchVal)) ||
      (order?.order_code && order.order_code.toLowerCase().includes(searchVal))
    );
  });


  // Calculate live persisted invoice totals
  const totalAmount = filtered.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalPaid = filtered.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0);
  const totalRemaining = filtered.reduce((sum, i) => sum + (Number(i.remaining_amount) || 0), 0);

  const handleDownloadPdf = (inv: Invoice) => {
    const cust = getCustomer(inv.customer_id);
    const ord = getOrder(inv.order_id);
    generateInvoicePDF({ invoice: inv, customer: cust, order: ord, business });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices & Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} invoice{filtered.length !== 1 ? "s" : ""} • Track advances, payments & outstanding balances
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white shadow-brand-sm hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <InvoiceDialog
              customers={customers}
              orders={orders}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Total Invoiced
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              ₹{totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Total Paid
            </p>
            <p className="text-2xl font-extrabold text-emerald-600">
              ₹{totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Remaining Balance
            </p>
            <p className="text-2xl font-extrabold text-rose-600">
              ₹{totalRemaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by customer, invoice #, or order…"
          className="pl-8 h-9 rounded-xl border-gray-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Invoices Table */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-gray-500">Invoice</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500">Customer</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500">Order</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500">Date</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500 text-right">Total</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500 text-right">Paid</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500 text-right">Remaining</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((inv) => {
                  const customer = getCustomer(inv.customer_id);
                  const order = getOrder(inv.order_id);
                  const paid = inv.paid_amount ?? 0;
                  const remaining = inv.remaining_amount ?? Math.max(0, inv.amount - paid);

                  return (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Invoice # */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-600">
                          <FileText className="h-3.5 w-3.5" />
                          {inv.invoice_number || `INV-${String(inv.id).padStart(4, "0")}`}
                        </div>
                      </TableCell>


                      {/* Customer */}
                      <TableCell className="font-medium text-gray-900 text-sm">
                        {customer?.name ?? "—"}
                      </TableCell>

                      {/* Order */}
                      <TableCell className="text-xs text-gray-500">
                        {order?.order_code || `#${inv.order_id}`}
                        {order?.description && (
                          <span className="ml-1 text-gray-400 block truncate max-w-[140px]">
                            {order.description}
                          </span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-gray-500">
                        {inv.created_at ? format(new Date(inv.created_at), "MMM d, yyyy") : "—"}
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="text-right font-bold text-gray-900 text-sm">
                        ₹{Number(inv.amount).toLocaleString()}
                      </TableCell>

                      {/* Paid Amount */}
                      <TableCell className="text-right font-semibold text-emerald-600 text-sm">
                        ₹{Number(paid).toLocaleString()}
                      </TableCell>

                      {/* Remaining Amount */}
                      <TableCell className="text-right font-bold text-sm">
                        <span className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                          ₹{Number(remaining).toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[inv.status] || "bg-gray-100 text-gray-600"}`}>
                          {remaining <= 0 ? "Paid in full" : inv.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          {/* Record / View Payments */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 rounded-lg gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            onClick={() => setPaymentInvoice(inv)}
                            title="Record payment / view history"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Payment</span>
                          </Button>

                          {/* Download PDF */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                            onClick={() => handleDownloadPdf(inv)}
                            title="Download invoice PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            onClick={() => setEditInvoice(inv)}
                            title="Edit invoice"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            onClick={() => {
                              const label = inv.invoice_number || `Invoice #${inv.id}`;
                              if (window.confirm(`Delete ${label}? This will also delete payment history.`)) {
                                deleteMutation.mutate(inv.id);
                              }
                            }}

                            title="Delete invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex flex-col items-center py-14 text-gray-400">
                        <FileText className="mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium text-sm">
                          {search ? "No invoices match your search" : "No invoices created yet"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {search ? "Try searching for a different customer name" : "Click 'New Invoice' above to bill a customer"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={(open) => { if (!open) setEditInvoice(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          {editInvoice && (
            <InvoiceDialog
              invoice={editInvoice}
              customers={customers}
              orders={orders}
              onClose={() => setEditInvoice(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment & History Dialog */}
      <Dialog open={!!paymentInvoice} onOpenChange={(open) => { if (!open) setPaymentInvoice(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4.5 w-4.5 text-emerald-600" />
              Manage Payments — {paymentInvoice?.invoice_number || `Invoice #${paymentInvoice?.id}`}
            </DialogTitle>
          </DialogHeader>

          {paymentInvoice && (
            <PaymentDialog
              invoice={invoices.find((i) => i.id === paymentInvoice.id) || paymentInvoice}
              onClose={() => setPaymentInvoice(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
