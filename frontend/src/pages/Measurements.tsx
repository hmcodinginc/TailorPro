import { useState } from "react"
import { Plus, Search, Ruler, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getMeasurements,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getCustomers,
} from "@/lib/api"
import { motion } from "framer-motion"

// ── Garment templates ────────────────────────────────────────────────────────

interface GarmentField {
  key: string
  label: string
}

interface GarmentTemplate {
  label: string
  emoji: string
  fields: GarmentField[]
}

const GARMENT_TEMPLATES: Record<string, GarmentTemplate> = {
  Kurta: {
    label: "Kurta (Straight Kurti)",
    emoji: "👗",
    fields: [
      { key: "bust",          label: "Bust / Chest" },
      { key: "waist",         label: "Waist" },
      { key: "hip",           label: "Hip" },
      { key: "shoulder",      label: "Shoulder Width" },
      { key: "armhole",       label: "Armhole" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round",  label: "Sleeve Round" },
      { key: "length",        label: "Kurta Length" },
      { key: "neck_depth",    label: "Neck Depth (Front & Back)" },
      { key: "neck_width",    label: "Neck Width" },
    ],
  },
  Pants: {
    label: "Pants (Straight / Trouser)",
    emoji: "👖",
    fields: [
      { key: "waist",        label: "Waist" },
      { key: "hip",          label: "Hip" },
      { key: "thigh",        label: "Thigh Round" },
      { key: "knee",         label: "Knee Round" },
      { key: "ankle",        label: "Bottom / Ankle Round" },
      { key: "length",       label: "Length (Waist to Ankle)" },
      { key: "rise",         label: "Rise (Crotch Depth)" },
    ],
  },
  Plazo: {
    label: "Plazo (Palazzo Pants)",
    emoji: "👗",
    fields: [
      { key: "waist",        label: "Waist" },
      { key: "hip",          label: "Hip" },
      { key: "length",       label: "Length" },
      { key: "bottom_width", label: "Bottom Width" },
      { key: "rise",         label: "Rise" },
    ],
  },
  Gown: {
    label: "Gown",
    emoji: "👗",
    fields: [
      { key: "bust",          label: "Bust" },
      { key: "waist",         label: "Waist" },
      { key: "hip",           label: "Hip" },
      { key: "shoulder",      label: "Shoulder" },
      { key: "armhole",       label: "Armhole" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length",        label: "Length (Shoulder to Floor)" },
      { key: "neck_depth",    label: "Neck Depth & Width" },
    ],
  },
  Shirt: {
    label: "Shirt (Men / Women)",
    emoji: "👔",
    fields: [
      { key: "chest",         label: "Chest" },
      { key: "waist",         label: "Waist" },
      { key: "hip",           label: "Hip (for long shirts)" },
      { key: "shoulder",      label: "Shoulder" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round",  label: "Sleeve Round" },
      { key: "collar",        label: "Neck / Collar Size" },
      { key: "length",        label: "Shirt Length" },
    ],
  },
  Leggings: {
    label: "Leggings",
    emoji: "👖",
    fields: [
      { key: "waist",  label: "Waist" },
      { key: "hip",    label: "Hip" },
      { key: "thigh",  label: "Thigh" },
      { key: "length", label: "Length" },
      { key: "ankle",  label: "Ankle" },
    ],
  },
  Anarkali: {
    label: "Anarkali Kurti",
    emoji: "👗",
    fields: [
      { key: "bust",          label: "Bust" },
      { key: "waist",         label: "Waist" },
      { key: "shoulder",      label: "Shoulder" },
      { key: "armhole",       label: "Armhole" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length",        label: "Length (below knee / floor)" },
      { key: "neck_depth",    label: "Neck Depth & Width" },
      { key: "flare",         label: "Flare (Umbrella fabric)" },
    ],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type FormValues = Record<string, string>
const emptyBase: FormValues = { customer_id: "", garment_type: "", notes: "" }

function buildFormData(form: FormValues, file: File | null): FormData {
  const fd = new FormData()
  Object.entries(form).forEach(([k, v]) => {
    if (v) fd.append(k, v)
  })
  if (file) fd.append("file", file)
  return fd
}

// ── Measurement form ─────────────────────────────────────────────────────────

function MeasurementForm({
  form,
  setForm,
  file,
  setFile,
  onSubmit,
  isPending,
  submitLabel,
  customers,
}: {
  form: FormValues
  setForm: (f: FormValues) => void
  file: File | null
  setFile: (f: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  submitLabel: string
  customers: any[]
}) {
  const template = form.garment_type ? GARMENT_TEMPLATES[form.garment_type] : null

  const handleGarmentChange = (value: string) => {
    // Keep customer + notes, reset all measurement fields
    setForm({ customer_id: form.customer_id, garment_type: value, notes: form.notes })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Customer */}
      <div className="space-y-2">
        <Label>Customer</Label>
        <Select
          value={form.customer_id}
          onValueChange={(v) => setForm({ ...form, customer_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Garment Type */}
      <div className="space-y-2">
        <Label>Garment Type</Label>
        <Select value={form.garment_type} onValueChange={handleGarmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select garment" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GARMENT_TEMPLATES).map(([key, t]) => (
              <SelectItem key={key} value={key}>
                {t.emoji} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic measurement fields */}
      {template && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {template.emoji} {template.label} — Measurements
          </p>
          <div className="grid grid-cols-2 gap-3">
            {template.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <Input
                  placeholder='e.g. 36"'
                  value={form[field.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="space-y-2">
        <Label>Upload Image (optional)</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) setFile(e.target.files[0])
          }}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Notes</Label>
        <Input
          placeholder="Any special instructions..."
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !form.customer_id || !form.garment_type}
      >
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Measurements() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<FormValues>(emptyBase)
  const [addFile, setAddFile] = useState<File | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormValues>(emptyBase)
  const [editFile, setEditFile] = useState<File | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingMeasurement, setDeletingMeasurement] = useState<any>(null)

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })
  const { data: measurements = [] } = useQuery({ queryKey: ["measurements"], queryFn: getMeasurements })

  const addMutation = useMutation({
    mutationFn: addMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] })
      setAddOpen(false)
      setAddFile(null)
      setAddForm(emptyBase)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => updateMeasurement(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] })
      setEditOpen(false)
      setEditingId(null)
      setEditFile(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] })
      setDeleteOpen(false)
      setDeletingMeasurement(null)
    },
  })

  const openEdit = (m: any) => {
    setEditingId(m.id)
    const { id, image, ...rest } = m
    const stringified: FormValues = {}
    Object.entries(rest).forEach(([k, v]) => {
      stringified[k] = v != null ? String(v) : ""
    })
    setEditForm(stringified)
    setEditOpen(true)
  }

  const filtered = measurements.filter((m: any) => {
    const customer = customers.find((c: any) => c.id === m.customer_id)
    return customer?.name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Measurements</h1>
          <p className="text-muted-foreground">Customer body measurements record</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Measurements</DialogTitle>
            </DialogHeader>
            <MeasurementForm
              form={addForm}
              setForm={setAddForm}
              file={addFile}
              setFile={setAddFile}
              onSubmit={(e) => {
                e.preventDefault()
                addMutation.mutate(buildFormData(addForm, addFile))
              }}
              isPending={addMutation.isPending}
              submitLabel="Save Measurements"
              customers={customers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((m: any) => {
          const customer = customers.find((c: any) => c.id === m.customer_id)
          const template = m.garment_type ? GARMENT_TEMPLATES[m.garment_type] : null

          return (
            <Card key={m.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ruler className="h-4 w-4" />
                    {customer?.name}
                    {template && (
                      <span className="text-sm font-normal text-muted-foreground">
                        — {template.emoji} {template.label}
                      </span>
                    )}
                  </CardTitle>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(m)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setDeletingMeasurement({ ...m, customerName: customer?.name })
                          setDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                {template ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {template.fields.map((field) =>
                      m[field.key] ? (
                        <p key={field.key}>
                          <span className="font-medium">{field.label}:</span>{" "}
                          <span className="text-muted-foreground">{m[field.key]}"</span>
                        </p>
                      ) : null
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No measurements recorded.</p>
                )}
                {m.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">📝 {m.notes}</p>
                )}
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No measurements found
          </p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Measurements</DialogTitle>
          </DialogHeader>
          <MeasurementForm
            form={editForm}
            setForm={setEditForm}
            file={editFile}
            setFile={setEditFile}
            onSubmit={(e) => {
              e.preventDefault()
              if (editingId == null) return
              updateMutation.mutate({ id: editingId, fd: buildFormData(editForm, editFile) })
            }}
            isPending={updateMutation.isPending}
            submitLabel="Save Changes"
            customers={customers}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Measurement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the measurement record for{" "}
              <strong>{deletingMeasurement?.customerName}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deletingMeasurement?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}