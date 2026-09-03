import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Ruler, Phone, Mail, MapPin, ShoppingBag, FileText, ArrowLeft, Download, Pencil } from "lucide-react"
import { getCustomers, getMeasurements, getOrders, getInvoices, updateCustomer, getBusinessProfile } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhoneInput } from "@/components/PhoneInput"
import { findGarmentTemplate } from "@/lib/garments"
import { generateMeasurementPDF } from "@/lib/measurementPdf"
import { generateInvoicePDF } from "@/lib/invoicePdf"

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const s = status?.toLowerCase()
  if (s === "completed" || s === "paid") return "default"
  if (s === "pending") return "secondary"
  if (s === "cancelled") return "destructive"
  return "outline"
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [measurements, setMeasurements] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", address: "" })
  const [editError, setEditError] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  const reloadData = async () => {
    const [customers, allMeasurements, allOrders, allInvoices, biz] = await Promise.all([
      getCustomers(), getMeasurements(), getOrders(), getInvoices(), getBusinessProfile().catch(() => null),
    ])
    setBusiness(biz)

    const c = customers.find((x: any) => x.id === Number(id))
    setCustomer(c)
    if (c) {
      setEditForm({
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        address: c.address || "",
      })
    }
    setMeasurements(allMeasurements.filter((m: any) => m.customer_id === Number(id)))
    setOrders(allOrders.filter((o: any) => o.customer_id === Number(id)))
    setInvoices(allInvoices.filter((i: any) => i.customer_id === Number(id)))
  }

  useEffect(() => {
    reloadData()
  }, [id])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditError("Name and Phone number are required.")
      return
    }
    setEditError("")
    try {
      setEditSubmitting(true)
      await updateCustomer(Number(id), editForm)
      setEditOpen(false)
      await reloadData()
    } catch (err: any) {
      setEditError(err.message || "Failed to update customer.")
    } finally {
      setEditSubmitting(false)
    }
  }

  if (!customer) return <p className="p-6 text-muted-foreground">Loading customer details...</p>

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">

      <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Button>

      {/* ── Customer Profile ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">{customer.name}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5 h-8">
            <Pencil className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            {customer.phone || "—"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            {customer.email || "—"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {customer.address || "—"}
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Full Name *</Label>
              <Input className="h-9 rounded-xl" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phone *</Label>
              <PhoneInput value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input type="email" className="h-9 rounded-xl" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Address</Label>
              <Input className="h-9 rounded-xl" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            {editError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{editError}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 gradient-brand text-white rounded-xl" disabled={editSubmitting}>
                {editSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* ── Measurements ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-indigo-600" />
            <span>Measurements</span>
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {measurements.length} record{measurements.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {measurements.length === 0 && (
            <p className="text-sm text-muted-foreground">No measurements recorded yet.</p>
          )}

          {measurements.map((m: any) => {
            const gender = m.gender || (findGarmentTemplate(m.garment_type)?.gender ?? "Men")
            const template = findGarmentTemplate(m.garment_type, gender)
            const filledFields = template
              ? template.fields.filter((f) => m[f.key] != null && m[f.key] !== "")
              : []

            return (
              <div key={m.id} className="border rounded-xl p-4 space-y-3 bg-card shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template?.emoji ?? "📏"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">
                          {template?.label ?? m.garment_type}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            gender === "Women"
                              ? "bg-pink-50 text-pink-700 border-pink-200 text-[10px]"
                              : "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                          }
                        >
                          {gender === "Women" ? "Women 👩" : "Men 👨"}
                        </Badge>
                      </div>
                      {m.created_at && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Recorded on{" "}
                          {new Date(m.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => generateMeasurementPDF({ measurement: m, customer })}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download PDF 📄
                  </Button>
                </div>

                {filledFields.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                    {filledFields.map((f) => (
                      <div key={f.key} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{f.label}</span>
                        <span className="text-sm font-semibold">{m[f.key]}"</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No specific measurement values recorded.</p>
                )}

                {/* Notes */}
                {m.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 bg-amber-50/50 p-2 rounded">
                    📝 <span className="font-medium">{m.notes}</span>
                  </p>
                )}

                {/* Image */}
                {m.image && (
                  <img
                    src={`http://127.0.0.1:8000/${m.image}`}
                    className="w-40 rounded border mt-1"
                    alt="measurement sketch"
                  />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Orders ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Orders</span>
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {orders.map((o: any) => (
            <div key={o.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{o.description}</p>
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>₹{o.amount}</span>
                {o.due_date && (
                  <span>
                    Due:{" "}
                    {new Date(o.due_date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Invoices ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Invoices</span>
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          )}
          {invoices.map((i: any) => {
            const paid = i.paid_amount ?? 0;
            const remaining = i.remaining_amount ?? Math.max(0, i.amount - paid);
            return (
              <div key={i.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {i.invoice_number || `Invoice #${i.id}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(i.status)}>{remaining <= 0 ? "Paid" : i.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => generateInvoicePDF({ invoice: i, customer, business })}
                    >
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span>Total: <strong>₹{Number(i.amount).toLocaleString()}</strong></span>
                  <span className="text-emerald-600">Paid: <strong>₹{Number(paid).toLocaleString()}</strong></span>
                  <span className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                    Remaining: <strong>₹{Number(remaining).toLocaleString()}</strong>
                  </span>
                  {i.created_at && (
                    <span className="text-muted-foreground ml-auto">
                      {new Date(i.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  )
}