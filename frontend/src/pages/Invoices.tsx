import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices, addInvoice, updateInvoice, deleteInvoice,
  getCustomers, getOrders,
} from "@/lib/api";
import { format } from "date-fns";
import { motion } from "framer-motion";
type Customer = any
type Order = any

// ── Types ─────────────────────────────────────────────────────────────────────

type InvoiceStatus  = "pending" | "paid" | "unpaid";
type PaymentType    = "cash" | "online";

interface Invoice {
  id:           number;
  customer_id:  number;
  order_id:     number;
  amount:       number;
  status:       InvoiceStatus;
  payment_type: PaymentType;
  notes?:       string;
  created_at:   string;
}

interface IForm {
  customer_id:  string;
  order_id:     string;
  amount:       string;
  status:       InvoiceStatus;
  payment_type: PaymentType;
  notes:        string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid:    "bg-green-500/10  text-green-400  border-green-500/20",
  unpaid:  "bg-red-500/10   text-red-400    border-red-500/20",
};

const PAYMENT_STYLES: Record<PaymentType, string> = {
  cash:   "bg-blue-500/10   text-blue-400   border-blue-500/20",
  online: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const PAYMENT_ICONS: Record<PaymentType, string> = {
  cash:   "💵",
  online: "💳",
};

const emptyForm: IForm = {
  customer_id:  "",
  order_id:     "",
  amount:       "",
  status:       "pending",
  payment_type: "cash",
  notes:        "",
};

// ── PDF Generator (no external lib needed) ────────────────────────────────────

function generateInvoicePDF(invoice: Invoice, customer?: Customer, order?: Order) {
  const lines: string[] = [
    "=".repeat(50),
    "           TAILOR STUDIO — INVOICE",
    "=".repeat(50),
    "",
    `Invoice #   : ${invoice.id}`,
    `Date        : ${format(new Date(invoice.created_at), "MMMM d, yyyy")}`,
    "",
    "─".repeat(50),
    "CUSTOMER",
    "─".repeat(50),
    `Name        : ${customer?.name ?? "—"}`,
    `Phone       : ${customer?.phone ?? "—"}`,
    "",
    "─".repeat(50),
    "ORDER",
    "─".repeat(50),
    `Order #     : ${order?.order_number ?? `#${invoice.order_id}`}`,
    `Garment     : ${order?.garment_type ?? "—"}`,
    "",
    "─".repeat(50),
    "PAYMENT",
    "─".repeat(50),
    `Amount      : ₹${invoice.amount.toLocaleString()}`,
    `Status      : ${invoice.status.toUpperCase()}`,
    `Payment     : ${invoice.payment_type === "cash" ? "Cash" : "Online"}`,
    invoice.notes ? `Notes       : ${invoice.notes}` : "",
    "",
    "=".repeat(50),
    "    Thank you for choosing Tailor Studio!",
    "=".repeat(50),
  ].filter((l) => l !== undefined);

  const text    = lines.join("\n");
  const blob    = new Blob([text], { type: "text/plain" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = `invoice-${invoice.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── InvoiceDialog ─────────────────────────────────────────────────────────────

interface InvoiceDialogProps {
  invoice?:  Invoice | null;
  customers: Customer[];
  orders:    Order[];
  onClose:   () => void;
}

function InvoiceDialog({ invoice, customers, orders, onClose }: InvoiceDialogProps) {
  const editing = !!invoice;

  const [form, setForm] = useState<IForm>(
    invoice
      ? {
          customer_id:  String(invoice.customer_id),
          order_id:     String(invoice.order_id),
          amount:       String(invoice.amount),
          status:       invoice.status,
          payment_type: invoice.payment_type,
          notes:        invoice.notes ?? "",
        }
      : emptyForm
  );

  const { toast }   = useToast();
  const queryClient = useQueryClient();

  // Filter orders by selected customer
  const customerOrders = form.customer_id
    ? orders.filter((o) => o.customer_id === Number(form.customer_id))
    : orders;

  const mutation = useMutation({
    mutationFn: (data: IForm) => {
      const payload = {
        customer_id:  Number(data.customer_id),
        order_id:     Number(data.order_id),
        amount:       Number(data.amount),
        status:       data.status,
        payment_type: data.payment_type,
        notes:        data.notes || null,
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
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
      className="space-y-4"
    >
      {/* Customer */}
      <div className="space-y-2">
        <Label>Customer *</Label>
        <Select
          value={form.customer_id}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, customer_id: v, order_id: "" }))
          }
        >
          <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Order — filtered by customer */}
      <div className="space-y-2">
        <Label>Order *</Label>
        <Select
          value={form.order_id}
          onValueChange={(v) => setForm((f) => ({ ...f, order_id: v }))}
        >
          <SelectTrigger>
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
        
      
<SelectContent>

{customerOrders.map((o) => (

  <SelectItem
    key={o.id}
    value={String(o.id)}
  >
    {o.order_code} - ₹{o.amount}
  </SelectItem>

))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount (₹) *</Label>
        <Input
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
      </div>

      {/* Payment Type + Status side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Payment Type</Label>
          <Select
            value={form.payment_type}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, payment_type: v as PaymentType }))
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">💵 Cash</SelectItem>
              <SelectItem value="online">💳 Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as InvoiceStatus }))
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          placeholder="Optional notes…"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          disabled={
            mutation.isPending ||
            !form.customer_id  ||
            !form.order_id     ||
            !form.amount
          }
        >
          {mutation.isPending
            ? "Saving…"
            : editing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Invoices() {
  const [search, setSearch]       = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const { toast }                 = useToast();
  const queryClient               = useQueryClient();

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn:  getInvoices,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn:  () => getCustomers(),
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn:  () => getOrders(),
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted" });
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getCustomer = (id: number) => customers.find((c) => c.id === id);
  const getOrder    = (id: number) => orders.find((o) => o.id === id);

  const filtered = invoices.filter((inv) => {
    const name = getCustomer(inv.customer_id)?.name ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Totals for summary bar
  const totalAmount = filtered.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount  = filtered
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingAmt  = totalAmount - paidAmount;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 animate-fade-in"
    >

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <InvoiceDialog
              customers={customers}
              orders={orders}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",   value: totalAmount, color: "text-foreground" },
          { label: "Paid",    value: paidAmount,  color: "text-green-400" },
          { label: "Pending", value: pendingAmt,  color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {label}
              </p>
              <p className={`font-serif text-2xl font-bold ${color}`}>
                ₹{value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by customer…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
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
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((inv) => {
                  const customer = getCustomer(inv.customer_id);
                  const order    = getOrder(inv.order_id);

                  return (
                    <TableRow key={inv.id}>
                      {/* Invoice # */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary">
                          <FileText className="h-3.5 w-3.5" />
                          #{inv.id}
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="font-medium text-foreground">
                        {customer?.name ?? "—"}
                      </TableCell>

                      {/* Order */}
                      <TableCell className="text-xs text-muted-foreground">
                        {order?.order_number ?? `#${inv.order_id}`}
                        {order && (
                          <span className="ml-1 text-muted-foreground/60">
                            {order.garment_type}
                          </span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs">
                        {format(new Date(inv.created_at), "MMM d, yyyy")}
                      </TableCell>

                      {/* Payment type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={PAYMENT_STYLES[inv.payment_type]}
                        >
                          {PAYMENT_ICONS[inv.payment_type]}{" "}
                          {inv.payment_type === "cash" ? "Cash" : "Online"}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLES[inv.status]}
                        >
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-semibold text-foreground">
                        ₹{inv.amount.toLocaleString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditInvoice(inv)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Download */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() =>
                              generateInvoicePDF(inv, customer, order)
                            }
                            title="Download invoice"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete Invoice #${inv.id}? This cannot be undone.`
                                )
                              ) {
                                deleteMutation.mutate(inv.id);
                              }
                            }}
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
                    <TableCell colSpan={8}>
                      <div className="flex flex-col items-center py-14 text-muted-foreground">
                        <FileText className="mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">
                          {search ? "No invoices match your search" : "No invoices yet"}
                        </p>
                        <p className="text-sm">
                          {search
                            ? "Try a different name"
                            : "Create your first invoice above"}
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

      {/* Edit dialog */}
      <Dialog
        open={!!editInvoice}
        onOpenChange={(open) => { if (!open) setEditInvoice(null); }}
      >
        <DialogContent className="max-w-md">
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

    </motion.div>
  );
}
