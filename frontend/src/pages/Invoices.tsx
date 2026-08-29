import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, Search, Download, Printer } from "lucide-react";
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
  getCustomers, getOrders, getBusinessProfile,
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


function handlePrint(invoice: Invoice, customer?: Customer, order?: Order) {
  setPreviewInvoice(invoice);
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["invoices"] });
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
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  
  const { data: business } = useQuery({ queryKey: ['business'], queryFn: getBusinessProfile });

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
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["invoices"] });
      const previous = queryClient.getQueryData<any[]>(["invoices"]) || [];
      queryClient.setQueryData(["invoices"], previous.filter((inv) => inv.id !== id));
      toast({ title: "Invoice deleted" });
      return { previous };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["invoices"], context.previous);
      }
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
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
                              setPreviewInvoice(inv)
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

      
      
      {/* Preview Dialog */}
      <Dialog
        open={!!previewInvoice}
        onOpenChange={(open) => { if (!open) setPreviewInvoice(null); }}
      >
        <DialogContent className="max-w-[800px] print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none bg-gray-50 border-gray-200">
          <DialogHeader className="print:hidden flex flex-row justify-between items-center w-full">
            <DialogTitle>Invoice Preview</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const element = document.getElementById('printable-invoice');
                if (!element) return;
                import('html2canvas').then((html2canvas) => {
                  html2canvas.default(element, { scale: 2 }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    import('jspdf').then((jsPDF) => {
                      const pdf = new jsPDF.default('p', 'mm', 'a4');
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                      pdf.save(`Invoice_INV-${previewInvoice?.id.toString().padStart(4, '0')}.pdf`);
                    });
                  });
                });
              }}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4 mr-2" /> Print Invoice
              </Button>
            </div>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[80vh] flex justify-center print:overflow-visible">
          {previewInvoice && (() => {
            const customer = getCustomer(previewInvoice.customer_id);
            const order = getOrder(previewInvoice.order_id);
            const isPaid = previewInvoice.status === 'paid';
            const purpleColor = "#925488"; // Matches the Lilly's Closet theme
            
            return (
              <div 
                id="printable-invoice" 
                className="bg-white text-black shadow-sm border print:border-none print:shadow-none mx-auto relative overflow-hidden flex flex-col font-sans"
                style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}
              >
                {/* Background Floral SVGs (approximations using simple curved paths) */}
                <svg className="absolute top-0 left-0 w-72 h-72 opacity-10 pointer-events-none" style={{ color: purpleColor, transform: 'translate(-20%, -20%)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M50 50 C 20 0, 0 20, 50 50 C 80 0, 100 20, 50 50 C 100 80, 80 100, 50 50 C 0 80, 20 100, 50 50" />
                  <path d="M50 50 C 10 20, 10 80, 50 50 C 90 20, 90 80, 50 50 C 20 10, 80 10, 50 50 C 20 90, 80 90, 50 50" />
                </svg>
                <svg className="absolute bottom-10 right-0 w-96 h-96 opacity-10 pointer-events-none" style={{ color: purpleColor, transform: 'translate(20%, 20%)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M50 50 C 20 0, 0 20, 50 50 C 80 0, 100 20, 50 50 C 100 80, 80 100, 50 50 C 0 80, 20 100, 50 50" />
                  <path d="M50 50 C 10 20, 10 80, 50 50 C 90 20, 90 80, 50 50 C 20 10, 80 10, 50 50 C 20 90, 80 90, 50 50" />
                </svg>

                <div className="flex-1 p-14 relative z-10 pt-16">
                  {/* Header */}
                  <div className="flex justify-end items-start mb-20">
                    <div className="text-right">
                      <h1 className="text-5xl font-[cursive] mb-1" style={{ color: purpleColor, fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}>{business?.name || "Tailor Studio"}</h1>
                      <h2 className="text-2xl font-bold tracking-[0.2em] uppercase" style={{ color: '#63395b' }}>INVOICE</h2>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                      <div className="font-bold text-sm uppercase mb-3" style={{ color: purpleColor }}>BILL TO:</div>
                      <div className="text-gray-700 text-sm space-y-1.5">
                        <div className="font-bold text-gray-900">{customer?.name}</div>
                        {customer?.address && <div>{customer.address}</div>}
                        {customer?.phone && <div>{customer.phone}</div>}
                        {customer?.email && <div>{customer.email}</div>}
                      </div>
                    </div>
                    
                    <div className="space-y-3 w-3/4 ml-auto">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>INVOICE #:</span>
                        <span className="text-gray-600">{previewInvoice.id.toString().padStart(4, '0')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Issue Date:</span>
                        <span className="text-gray-600">{format(new Date(previewInvoice.created_at), 'MM/dd/yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Due Date:</span>
                        <span className="text-gray-600">{order?.due_date ? format(new Date(order.due_date), 'MM/dd/yyyy') : format(new Date(previewInvoice.created_at), 'MM/dd/yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-16 border-collapse">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider">
                        <th className="p-3 border border-gray-400 text-left font-bold" style={{ color: purpleColor }}>Description</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-20" style={{ color: purpleColor }}>QTY</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-32" style={{ color: purpleColor }}>Price</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-32" style={{ color: purpleColor }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      <tr className="h-10">
                        <td className="p-3 border border-gray-400">
                          {order?.description || "Custom Tailoring Service"}
                          {order?.garment_type && ` - ${order.garment_type}`}
                        </td>
                        <td className="p-3 border border-gray-400 text-center font-medium">1</td>
                        <td className="p-3 border border-gray-400 text-center font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-3 border border-gray-400 text-center font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                      {/* Empty rows to match style */}
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                    </tbody>
                  </table>

                  {/* Payment & Totals */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="font-bold text-sm uppercase mb-4" style={{ color: purpleColor }}>PAYMENT INFORMATION:</div>
                      <div className="text-gray-700 text-sm space-y-2">
                        {business?.gst_number && <div><span className="font-bold text-gray-900">GST:</span> {business.gst_number}</div>}
                        <div><span className="font-bold text-gray-900">Payment Method:</span> <span className="capitalize">{previewInvoice.payment_type}</span></div>
                        <div><span className="font-bold text-gray-900">Status:</span> <span className="uppercase">{previewInvoice.status}</span></div>
                        {previewInvoice.notes && <div className="mt-2 text-gray-500 italic">{previewInvoice.notes}</div>}
                      </div>
                    </div>
                    <div className="space-y-3 w-3/4 ml-auto">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Subtotal</span>
                        <span className="text-gray-800 font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Tax</span>
                        <span className="text-gray-800 font-medium">0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Deposit</span>
                        <span className="text-gray-800 font-medium">{isPaid ? `₹${previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Balance</span>
                        <span className="text-gray-800 font-bold">₹{isPaid ? "0.00" : previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="py-5 px-14 flex justify-between text-xs w-full mt-auto relative z-10 text-white" style={{ backgroundColor: '#ad679f' }}>
                  <div>{business?.email || "tailor@example.com"}</div>
                  <div>www.tailorpro.com</div>
                  <div>{business?.phone || "(555) 555-5555"}</div>
                </div>
              </div>
            );
          })()}
          </div>
        </DialogContent>
      </Dialog>



    </motion.div>
  );
}
