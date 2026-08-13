import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, AlertTriangle, TrendingDown, Edit2, Trash2, X,
} from "lucide-react";
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const CATEGORIES = ["Fabric", "Thread", "Button", "Zipper", "Lining", "Elastic", "Lace", "Other"];
const UNITS = ["meters", "yards", "kg", "g", "pieces", "rolls", "spools"];

const SAMPLE: any[] = [
  { id: 1, name: "Cotton Fabric (White)", category: "Fabric",  quantity: 45, unit: "meters",  minStock: 20, price: 120, supplier: "Textile World" },
  { id: 2, name: "Silk Thread (Black)",   category: "Thread",  quantity: 8,  unit: "spools",  minStock: 10, price: 45,  supplier: "Thread House" },
  { id: 3, name: "Pearl Buttons",         category: "Button",  quantity: 340,unit: "pieces",  minStock: 100,price: 2,   supplier: "Button Co"    },
  { id: 4, name: "Invisible Zipper 30cm", category: "Zipper",  quantity: 22, unit: "pieces",  minStock: 15, price: 18,  supplier: "Zip Hub"      },
  { id: 5, name: "Georgette Lining",      category: "Lining",  quantity: 12, unit: "meters",  minStock: 15, price: 85,  supplier: "Lining Store" },
  { id: 6, name: "Elastic Band 2cm",      category: "Elastic", quantity: 60, unit: "meters",  minStock: 20, price: 10,  supplier: "Elastic World"},
];

const emptyForm = { name: "", category: "Fabric", quantity: "", unit: "meters", minStock: "", price: "", supplier: "" };

const CATEGORY_COLORS: Record<string, string> = {
  Fabric: "bg-sky-50 text-sky-700",
  Thread: "bg-violet-50 text-violet-700",
  Button: "bg-amber-50 text-amber-700",
  Zipper: "bg-emerald-50 text-emerald-700",
  Lining: "bg-rose-50 text-rose-700",
  Elastic: "bg-teal-50 text-teal-700",
  Lace: "bg-pink-50 text-pink-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function Inventory() {
  const [items, setItems] = useState(SAMPLE);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = items.filter(
    (i) =>
      (catFilter === "all" || i.category === catFilter) &&
      i.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items.filter((i) => i.quantity <= i.minStock);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setItems([
      ...items,
      {
        id: Date.now(),
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        minStock: Number(form.minStock),
        price: Number(form.price),
        supplier: form.supplier,
      },
    ]);
    setOpen(false);
    setForm(emptyForm);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage fabrics, threads, and materials</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white shadow-brand-sm hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Item Name *</Label>
                <Input className="h-9 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Unit</Label>
                  <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                    <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Qty *</Label>
                  <Input type="number" className="h-9 rounded-xl" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Min Stock</Label>
                  <Input type="number" className="h-9 rounded-xl" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Price ₹</Label>
                  <Input type="number" className="h-9 rounded-xl" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Supplier</Label>
                <Input className="h-9 rounded-xl" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 gradient-brand text-white rounded-xl">Add Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Items", value: items.length, color: "bg-sky-50 text-sky-600" },
          { label: "Low Stock", value: lowStock.length, color: lowStock.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600" },
          { label: "Total Value", value: `₹${totalValue.toLocaleString()}`, color: "bg-teal-50 text-teal-700" },
        ].map(({ label, value, color }) => (
          <motion.div key={label} variants={item} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-extrabold ${color.split(" ")[1]}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <motion.div variants={item} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Low stock alert</p>
            <p className="text-xs text-red-500 mt-0.5">
              {lowStock.map((i) => i.name).join(", ")} {lowStock.length === 1 ? "is" : "are"} running low.
            </p>
          </div>
        </motion.div>
      )}

      {/* Search + filter */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input className="pl-8 h-9 rounded-xl border-gray-200" placeholder="Search items…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="h-9 w-44 rounded-xl border-gray-200"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Items grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inv) => {
          const isLow = inv.quantity <= inv.minStock;
          const stockPct = Math.min(100, (inv.quantity / (inv.minStock * 3)) * 100);
          return (
            <motion.div
              key={inv.id}
              variants={item}
              className={`group bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                isLow ? "border-red-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isLow ? "bg-red-50" : "bg-sky-50"}`}>
                    <Package className={`h-4.5 w-4.5 ${isLow ? "text-red-500" : "text-sky-500"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 leading-tight">{inv.name}</p>
                    <Badge variant="outline" className={`text-[10px] mt-0.5 border-0 px-1.5 ${CATEGORY_COLORS[inv.category] || "bg-gray-100 text-gray-600"}`}>
                      {inv.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div>
                  <p className="text-[11px] text-gray-400">Quantity</p>
                  <p className={`font-bold text-sm flex items-center gap-1 ${isLow ? "text-red-600" : "text-gray-900"}`}>
                    {isLow && <TrendingDown className="h-3 w-3" />}
                    {inv.quantity} {inv.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Min Stock</p>
                  <p className="font-bold text-sm text-gray-900">{inv.minStock} {inv.unit}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Unit Price</p>
                  <p className="font-bold text-sm text-gray-900">₹{inv.price}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Total Value</p>
                  <p className="font-bold text-sm text-teal-600">₹{(inv.quantity * inv.price).toLocaleString()}</p>
                </div>
              </div>

              {inv.supplier && (
                <p className="text-xs text-gray-400 mb-3 truncate">Supplier: {inv.supplier}</p>
              )}

              {/* Stock bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? "bg-red-400" : "bg-sky-400"}`}
                    style={{ width: `${stockPct}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 h-7 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center gap-1">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  className="flex-1 h-7 rounded-lg border border-gray-200 text-xs text-red-500 hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                  onClick={() => { if (window.confirm("Remove this item?")) setItems(items.filter((i) => i.id !== inv.id)); }}
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <motion.div variants={item} className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">No items found</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
