import { useState } from "react"
import { Plus, Search, Ruler, MoreVertical, Pencil, Trash2, Download, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  getGarmentsByGender,
  findGarmentTemplate,
  MEN_GARMENTS,
  WOMEN_GARMENTS,
  GarmentTemplate,
} from "@/lib/garments"
import { generateMeasurementPDF } from "@/lib/measurementPdf"
import { motion } from "framer-motion"
import { GarmentVisualizer } from "@/components/GarmentVisualizer"

type FormValues = Record<string, string>
const emptyBase: FormValues = { customer_id: "", gender: "Men", garment_type: "", notes: "" }

function buildFormData(form: FormValues, file: File | null): FormData {
  const fd = new FormData()
  Object.entries(form).forEach(([k, v]) => {
    if (v != null && v !== "") fd.append(k, v)
  })
  if (file) fd.append("file", file)
  return fd
}

// ── Measurement Form Component ──────────────────────────────────────────────────

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
  const activeGender = (form.gender === "Women" ? "Women" : "Men") as "Men" | "Women"
  const garmentMap = getGarmentsByGender(activeGender)
  const template = form.garment_type ? findGarmentTemplate(form.garment_type, activeGender) : null

  const [activeField, setActiveField] = useState<string | null>(null)

  const handleGenderChange = (selectedGender: "Men" | "Women") => {
    // Reset garment selection when switching gender
    setForm({
      customer_id: form.customer_id,
      gender: selectedGender,
      garment_type: "",
      notes: form.notes,
    })
    setActiveField(null)
  }

  const handleGarmentChange = (value: string) => {
    // Retain customer_id, gender, and notes while setting garment_type
    setForm({
      customer_id: form.customer_id,
      gender: form.gender || "Men",
      garment_type: value,
      notes: form.notes,
    })
    setActiveField(null)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* Customer Selection */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm">Customer</Label>
        <Select
          value={form.customer_id}
          onValueChange={(v) => setForm({ ...form, customer_id: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender Selection Step */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm flex items-center justify-between">
          <span>Select Gender</span>
          <span className="text-xs text-muted-foreground">Step 1 of 2</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleGenderChange("Men")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
              activeGender === "Men"
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="text-xl">👨</span>
            <div className="text-left">
              <div className="font-bold leading-none">Men</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Menswear garments</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleGenderChange("Women")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
              activeGender === "Women"
                ? "border-pink-600 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-500 shadow-sm ring-2 ring-pink-500/20"
                : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="text-xl">👩</span>
            <div className="text-left">
              <div className="font-bold leading-none">Women</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Womenswear garments</div>
            </div>
          </button>
        </div>
      </div>

      {/* Garment Category Selection */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm flex items-center justify-between">
          <span>Clothing Type ({activeGender === "Men" ? "Men 👨" : "Women 👩"})</span>
          <span className="text-xs text-muted-foreground">Step 2 of 2</span>
        </Label>
        <Select value={form.garment_type} onValueChange={handleGarmentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${activeGender === "Men" ? "Men's" : "Women's"} garment...`} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {Object.values(garmentMap).map((t: GarmentTemplate) => (
              <SelectItem key={t.key} value={t.key}>
                <span className="mr-2">{t.emoji}</span> {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Measurement Fields + Garment Visualizer */}
      {template && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 rounded-lg border p-3.5 bg-muted/30">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <span>{template.emoji}</span>
                <span>{template.label} — Measurement Specs</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">(in inches ")</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {template.fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  <Input
                    placeholder='e.g. 36"'
                    value={form[field.key] ?? ""}
                    onFocus={() => setActiveField(field.key)}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="bg-background h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-lg min-h-[300px]">
            <GarmentVisualizer garmentType={form.garment_type} activeField={activeField} fieldValues={form} />
          </div>
        </div>
      )}

      {/* Upload & Notes */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Upload Photo/Sketch (optional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0])
            }}
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Notes / Alteration Instructions</Label>
          <Input
            placeholder="e.g. Tight fit, extra margin..."
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-10 font-semibold"
        disabled={isPending || !form.customer_id || !form.garment_type}
      >
        {isPending ? "Saving Measurements..." : submitLabel}
      </Button>
    </form>
  )
}

// ── Main Page Component ────────────────────────────────────────────────────────

export default function Measurements() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("all")

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
    const { id, image, created_at, business_id, ...rest } = m
    const stringified: FormValues = {}
    Object.entries(rest).forEach(([k, v]) => {
      stringified[k] = v != null ? String(v) : ""
    })
    if (!stringified.gender) stringified.gender = "Men"
    setEditForm(stringified)
    setEditOpen(true)
  }

  const handleDownloadPDF = (m: any, customer: any) => {
    generateMeasurementPDF({
      measurement: m,
      customer: customer,
    })
  }

  // Filtering
  const filtered = measurements.filter((m: any) => {
    const customer = customers.find((c: any) => c.id === m.customer_id)
    const matchesSearch =
      customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer?.phone?.includes(search) ||
      m.garment_type?.toLowerCase().includes(search.toLowerCase())

    const mGender = m.gender || (findGarmentTemplate(m.garment_type)?.gender ?? "Men")

    if (genderFilter === "men" && mGender !== "Men") return false
    if (genderFilter === "women" && mGender !== "Women") return false

    return matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garment Measurements</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer tailoring specifications, body measurements, and printable PDF sheets.
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 font-semibold shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Measurement Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Ruler className="h-5 w-5 text-indigo-600" />
                Record Garment Measurements
              </DialogTitle>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search by customer name, phone, or garment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Gender Tabs Filter */}
        <Tabs value={genderFilter} onValueChange={setGenderFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-[320px] h-9">
            <TabsTrigger value="all" className="text-xs">
              All ({measurements.length})
            </TabsTrigger>
            <TabsTrigger value="men" className="text-xs flex items-center gap-1">
              <span>👨</span> Men
            </TabsTrigger>
            <TabsTrigger value="women" className="text-xs flex items-center gap-1">
              <span>👩</span> Women
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Measurements Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m: any) => {
          const customer = customers.find((c: any) => c.id === m.customer_id)
          const gender = m.gender || (findGarmentTemplate(m.garment_type)?.gender ?? "Men")
          const template = findGarmentTemplate(m.garment_type, gender)

          // Collect non-null measurement fields to display in card
          const displayFields: { label: string; value: any }[] = []
          if (template) {
            template.fields.forEach((f) => {
              if (m[f.key] !== undefined && m[f.key] !== null && m[f.key] !== "") {
                displayFields.push({ label: f.label, value: m[f.key] })
              }
            })
          } else {
            Object.keys(m).forEach((k) => {
              if (
                ![
                  "id",
                  "customer_id",
                  "garment_type",
                  "gender",
                  "image",
                  "notes",
                  "created_at",
                  "business_id",
                ].includes(k) &&
                m[k] != null &&
                m[k] !== ""
              ) {
                displayFields.push({
                  label: k.replace(/_/g, " ").toUpperCase(),
                  value: m[k],
                })
              }
            })
          }

          return (
            <Card
              key={m.id}
              className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-all border-slate-200 dark:border-slate-800"
            >
              <div>
                <CardHeader className="pb-3 border-b bg-muted/15">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span>{customer?.name || "Unknown Customer"}</span>
                      </CardTitle>
                      {customer?.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5">{customer.phone}</p>
                      )}
                    </div>

                    {/* Gender Badge */}
                    <Badge
                      variant="outline"
                      className={
                        gender === "Women"
                          ? "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                      }
                    >
                      {gender === "Women" ? "Women 👩" : "Men 👨"}
                    </Badge>
                  </div>

                  {/* Garment Title */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <span className="text-base">{template?.emoji || "👗"}</span>
                    <span>{template?.label || m.garment_type}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-3 pb-4">
                  {displayFields.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                      {displayFields.slice(0, 10).map((f) => (
                        <div key={f.label} className="flex justify-between items-center py-0.5 border-b border-muted/50">
                          <span className="text-muted-foreground truncate mr-1">{f.label}:</span>
                          <span className="font-bold text-foreground shrink-0">{f.value}"</span>
                        </div>
                      ))}
                      {displayFields.length > 10 && (
                        <p className="col-span-2 text-[11px] text-muted-foreground italic text-right pt-1">
                          +{displayFields.length - 10} more measurements...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No measurement fields populated.</p>
                  )}

                  {m.notes && (
                    <div className="mt-3 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-2 rounded border border-amber-200/60">
                      📝 <span className="font-medium">{m.notes}</span>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Card Actions Footer: Edit & Download PDF side-by-side */}
              <div className="p-3 border-t bg-muted/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full">
                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs font-semibold"
                    onClick={() => openEdit(m)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                    Edit ✏️
                  </Button>

                  {/* Download PDF Button right beside Edit */}
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    onClick={() => handleDownloadPDF(m, customer)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download PDF 📄
                  </Button>

                  {/* Dropdown Menu for Delete */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadPDF(m, customer)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
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
              </div>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-card rounded-xl border border-dashed p-6">
            <Ruler className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-3" />
            <p className="font-semibold text-base">No measurements found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search query or gender filter, or click "Add Measurement Record" to add one.
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Pencil className="h-5 w-5 text-indigo-600" />
              Edit Garment Measurements
            </DialogTitle>
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
            <AlertDialogTitle>Delete Measurement Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the measurement specification for{" "}
              <strong>{deletingMeasurement?.customerName || "this customer"}</strong>? This action cannot be undone.
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