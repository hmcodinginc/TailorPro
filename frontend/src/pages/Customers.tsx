import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Search, Phone, Mail, MapPin,
  Edit2, Trash2, Eye, MoreHorizontal, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/PhoneInput";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  [key: string]: unknown;
}

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function Customers() {
  const qc = useQueryClient();
  const { data: customersData = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const customers = customersData as Customer[];
  const createMut = useMutation({
    mutationFn: addCustomer,
    onMutate: async (newCust) => {
      await qc.cancelQueries({ queryKey: ["customers"] });
      const previous = qc.getQueryData<Customer[]>(["customers"]) || [];
      const optimisticCust: Customer = {
        id: Date.now(),
        name: newCust.name,
        phone: newCust.phone,
        email: newCust.email || "",
        address: newCust.address || "",
      };
      qc.setQueryData(["customers"], [optimisticCust, ...previous]);
      return { previous };
    },
    onError: (err, _newCust, context) => {
      if (context?.previous) {
        qc.setQueryData(["customers"], context.previous);
      }
      const msg = (err as any)?.message || "";
      if (msg.includes("limit") || msg.includes("10-client")) {
        setLimitModalOpen(true);
      } else {
        setError(msg || "Failed to add customer.");
        setOpen(true);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCustomer,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["customers"] });
      const previous = qc.getQueryData<Customer[]>(["customers"]) || [];
      qc.setQueryData(["customers"], previous.filter((c) => c.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(["customers"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditOpen(false);
      setEditingCustomer(null);
    },
    onError: (err: any) => {
      setEditError(err.message || "Failed to update customer.");
    }
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filtered = customers.filter((c: Customer) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and Phone number are required.");
      return;
    }
    setError("");
    const newForm = { ...form };
    setOpen(false);
    setForm(emptyForm);
    createMut.mutate(newForm);
  };

  const openEditDialog = (c: Customer) => {
    setEditingCustomer(c);
    setEditForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditError("Name and Phone number are required.");
      return;
    }
    setEditError("");
    updateMut.mutate({ id: editingCustomer.id, data: editForm });
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    deleteMut.mutate(id);
  };


  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Trial Limit Reached Modal */}
      <Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-600 flex items-center gap-2">
              <span>Free Trial Limit Reached</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-foreground">
              You've reached the 10-client limit for your free trial. Subscribe to continue adding clients.
            </p>
            <div className="p-3 bg-muted/60 rounded-xl text-xs text-muted-foreground border">
              Your existing customer profiles and measurements remain safely stored and fully accessible.
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setLimitModalOpen(false)}>
                Cancel
              </Button>
              <Link to="/subscription" className="flex-1">
                <Button className="w-full gradient-brand text-white rounded-xl">
                  Subscribe to Continue
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <motion.div variants={itemV} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Customers</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-medium">
              {customers.length} Client Records
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Manage your client profiles and measurements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white shadow-brand-sm hover:opacity-90 transition-opacity gap-2">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Full Name *</Label>
                <Input className="h-9 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Phone *</Label>
                <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input type="email" className="h-9 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Address</Label>
                <Input className="h-9 rounded-xl" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 gradient-brand text-white rounded-xl" disabled={createMut.isPending}>
                  {createMut.isPending ? "Adding…" : "Add Customer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
                <Button type="submit" className="flex-1 gradient-brand text-white rounded-xl" disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </motion.div>

      {/* Search + count */}
      <motion.div variants={itemV} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            className="pl-8 h-9 rounded-xl border-gray-200"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-400 shrink-0">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {/* Customer grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemV} className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium text-sm">No customers found</p>
          <p className="text-xs mt-1">{search ? "Try a different search term" : "Add your first customer to get started"}</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: Customer, idx: number) => {
            const avatarClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <motion.div
                key={c.id}
                variants={itemV}
                className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarClass}`}>
                      {initials(c.name || "?")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Customer #{c.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link to={`/customers/${c.id}`} className="flex items-center gap-2 text-sm">
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm text-sky-600 focus:text-sky-600"
                        onClick={() => openEditDialog(c)}>
                        <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(c.id, c.name)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>

                  </DropdownMenu>
                </div>

                <div className="space-y-1.5">
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/customers/${c.id}`}
                  className="mt-4 flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Profile
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
