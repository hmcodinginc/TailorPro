import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  Ruler,
  User,
  Scissors,
  Download,
  Printer,
  Camera,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Sliders,
  Eye,
  Layers,
  FileText,
  History,
  Tag,
  Palette,
  ArrowLeft,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { BodyMannequin3D, BodyMannequin3DRef } from "@/components/3d/BodyMannequin3D"
import {
  MEASUREMENT_FIELDS,
  STANDARD_SIZES,
  GARMENT_3D_PRESETS,
  FIT_ALLOWANCE,
  UnitType,
  FitType,
  inchesToCm,
  cmToInches,
  formatMeasurementValue,
} from "@/components/3d/measurementDimensions"
import { ThemeStyle } from "@/components/3d/mannequinGeometry"
import {
  getCustomers,
  getMeasurements,
  addMeasurement,
  updateMeasurement,
} from "@/lib/api"
import { findGarmentTemplate, garmentsMatch } from "@/lib/garments"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function MeasurementStudio3D() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const mannequin3DRef = useRef<BodyMannequin3DRef>(null)

  // URL Params or Defaults
  const paramCustomerId = searchParams.get("customer_id")
  const paramGarment = searchParams.get("garment") || "Shirt"
  const paramGender = (searchParams.get("gender") === "Women" ? "Women" : "Men") as "Men" | "Women"
  const paramRecordId = searchParams.get("record_id")

  // Core Studio State
  const [gender, setGender] = useState<"Men" | "Women">(paramGender)
  const [garmentType, setGarmentType] = useState<string>(paramGarment)
  const [customerId, setCustomerId] = useState<string>(paramCustomerId || "")
  const [unit, setUnit] = useState<UnitType>("inches")
  const [fitType, setFitType] = useState<FitType>("regular")
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>("tailor")
  const [activeField, setActiveField] = useState<string | null>("chest")
  const [activeTab, setActiveTab] = useState<"upper" | "lower" | "overall">("upper")
  const [notes, setNotes] = useState<string>("")
  const [editingRecordId, setEditingRecordId] = useState<number | null>(paramRecordId ? Number(paramRecordId) : null)

  // Display Toggles
  const [showGuides, setShowGuides] = useState(true)
  const [showGarment, setShowGarment] = useState(true)
  const [showStand, setShowStand] = useState(true)
  const [isWireframe, setIsWireframe] = useState(false)

  // Live Measurement Values in INCHES (Authoritative backend format)
  const [measurements, setMeasurements] = useState<Record<string, number>>(() => {
    return { ...STANDARD_SIZES[paramGender || "Men"].M }
  })

  // Export / Print Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [snapshotImg, setSnapshotImg] = useState<string | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // Queries
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })
  const { data: allMeasurements = [] } = useQuery({ queryKey: ["measurements"], queryFn: getMeasurements })

  const currentCustomer = customers.find((c: any) => String(c.id) === String(customerId))

  // Customer measurements history
  const customerHistory = allMeasurements.filter(
    (m: any) => String(m.customer_id) === String(customerId)
  )

  // Load existing measurements when customer/garment changes or when record_id is passed
  useEffect(() => {
    if (paramRecordId && allMeasurements.length > 0) {
      const match = allMeasurements.find((m: any) => m.id === Number(paramRecordId))
      if (match) {
        setEditingRecordId(match.id)
        if (match.customer_id) setCustomerId(String(match.customer_id))
        if (match.gender) setGender(match.gender === "Women" ? "Women" : "Men")
        if (match.garment_type) setGarmentType(match.garment_type)
        if (match.notes) setNotes(match.notes)

        const loaded: Record<string, number> = {}
        MEASUREMENT_FIELDS.forEach((f) => {
          if (match[f.key] != null && match[f.key] !== "") {
            loaded[f.key] = Number(match[f.key])
          }
        })
        setMeasurements((prev) => ({ ...prev, ...loaded }))
        return
      }
    }

    if (customerId && allMeasurements.length > 0) {
      const match = allMeasurements
        .filter(
          (m: any) =>
            String(m.customer_id) === String(customerId) &&
            garmentsMatch(m.garment_type, garmentType)
        )
        .sort((a: any, b: any) => (b.id || 0) - (a.id || 0))[0]

      if (match) {
        setEditingRecordId(match.id)
        if (match.notes) setNotes(match.notes)
        const loaded: Record<string, number> = {}
        MEASUREMENT_FIELDS.forEach((f) => {
          if (match[f.key] != null && match[f.key] !== "") {
            loaded[f.key] = Number(match[f.key])
          }
        })
        setMeasurements((prev) => ({ ...prev, ...loaded }))
      } else {
        setEditingRecordId(null)
      }
    }
  }, [customerId, garmentType, paramRecordId, allMeasurements])

  // Apply Standard Size Preset
  const applyStandardSize = (sizeKey: string) => {
    const preset = STANDARD_SIZES[gender][sizeKey]
    if (preset) {
      setMeasurements({ ...preset })
    }
  }

  // Handle Measurement Value Change
  const handleValueChange = (fieldKey: string, valInCurrentUnit: number) => {
    const valInInches = unit === "cm" ? cmToInches(valInCurrentUnit) : valInCurrentUnit
    setMeasurements((prev) => ({
      ...prev,
      [fieldKey]: Number(valInInches.toFixed(2)),
    }))
  }

  // Save / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Please select a customer first.")

      const fd = new FormData()
      fd.append("customer_id", customerId)
      fd.append("garment_type", garmentType)
      fd.append("gender", gender)
      if (notes) fd.append("notes", notes)

      Object.entries(measurements).forEach(([k, v]) => {
        if (v !== undefined && v !== null && !isNaN(v)) {
          fd.append(k, String(v))
        }
      })

      if (editingRecordId) {
        return updateMeasurement(editingRecordId, fd)
      } else {
        return addMeasurement(fd)
      }
    },
    onSuccess: (savedData: any) => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] })
      if (savedData?.id) setEditingRecordId(savedData.id)
      alert("Measurements saved successfully to customer profile!")
    },
    onError: (err: any) => {
      alert(`Error saving measurements: ${err.message}`)
    },
  })

  // Take Snapshot & Open Export Modal
  const handleOpenExportModal = () => {
    if (mannequin3DRef.current) {
      const snap = mannequin3DRef.current.takeScreenshot()
      setSnapshotImg(snap)
    }
    setExportModalOpen(true)
  }

  // Download High-Resolution PDF
  const handleDownloadPDF = async () => {
    try {
      setIsExportingPdf(true)
      const element = document.getElementById("printable-cad-spec")
      if (!element) throw new Error("CAD Spec element not found")

      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      const custName = currentCustomer?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "Customer"
      const gName = garmentType.replace(/[^a-zA-Z0-9]/g, "_")
      pdf.save(`TailorPro_3D_Spec_${custName}_${gName}.pdf`)
    } catch (err) {
      console.error("PDF generation failed:", err)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Grouped Measurement Fields
  const upperFields = MEASUREMENT_FIELDS.filter((f) => f.category === "upper")
  const lowerFields = MEASUREMENT_FIELDS.filter((f) => f.category === "lower")
  const overallFields = MEASUREMENT_FIELDS.filter(
    (f) => f.category === "overall" || f.category === "detail"
  )

  const activeFieldDef = MEASUREMENT_FIELDS.find((f) => f.key === activeField)

  return (
    <ErrorBoundary>
      <div className="space-y-4 max-w-7xl mx-auto pb-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigate("/measurements")}
              title="Back to Measurements"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span className="p-1.5 rounded-lg gradient-brand text-white shadow-brand-sm">
                    <Scissors className="h-4 w-4" />
                  </span>
                  <span>3D Measurement & Body Visualization Studio</span>
                </h1>
                <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200 font-mono text-xs">
                  CAD v2.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Interactive real-time 3D tailoring mannequin with live dimension morphing and garment specs.
              </p>
            </div>
          </div>

          {/* Quick Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Unit Switcher */}
            <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setUnit("inches")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  unit === "inches"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inches (")
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  unit === "cm"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Metric (cm)
              </button>
            </div>

            {/* Snapshot / PDF Export */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
              onClick={handleOpenExportModal}
            >
              <Camera className="h-3.5 w-3.5 text-indigo-600" />
              <span>Snapshot & PDF</span>
            </Button>

            {/* Save to Customer */}
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1.5 text-xs font-bold gradient-brand text-white shadow-brand-sm"
              disabled={saveMutation.isPending || !customerId}
              onClick={() => saveMutation.mutate()}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{editingRecordId ? "Update Record" : "Save Record"}</span>
            </Button>
          </div>
        </div>

        {/* Customer & Garment Selector Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-card p-3 rounded-xl border shadow-xs">
          
          {/* Customer Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Customer</span>
              {currentCustomer && (
                <span className="text-[10px] text-muted-foreground truncate">{currentCustomer.phone}</span>
              )}
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {customers.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Silhouette */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mannequin Silhouette</Label>
            <div className="grid grid-cols-2 gap-1 bg-muted p-0.5 rounded-lg border">
              <button
                type="button"
                onClick={() => setGender("Men")}
                className={`py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  gender === "Men"
                    ? "bg-background text-blue-600 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>👨</span> Men
              </button>
              <button
                type="button"
                onClick={() => setGender("Women")}
                className={`py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  gender === "Women"
                    ? "bg-background text-pink-600 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>👩</span> Women
              </button>
            </div>
          </div>

          {/* Garment Preset */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Garment Preset</Label>
            <Select value={garmentType} onValueChange={setGarmentType}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Select garment..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {GARMENT_3D_PRESETS.map((gp) => (
                  <SelectItem key={gp.key} value={gp.key}>
                    <span className="mr-1.5">{gp.emoji}</span> {gp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fit Silhouette Allowance */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Fit Profile</Label>
            <div className="grid grid-cols-3 gap-1 bg-muted p-0.5 rounded-lg border">
              <button
                type="button"
                onClick={() => setFitType("slim")}
                className={`py-1 rounded-md text-[11px] font-semibold transition-all ${
                  fitType === "slim"
                    ? "bg-background text-emerald-600 shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Slim
              </button>
              <button
                type="button"
                onClick={() => setFitType("regular")}
                className={`py-1 rounded-md text-[11px] font-semibold transition-all ${
                  fitType === "regular"
                    ? "bg-background text-blue-600 shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => setFitType("loose")}
                className={`py-1 rounded-md text-[11px] font-semibold transition-all ${
                  fitType === "loose"
                    ? "bg-background text-amber-600 shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                Relaxed
              </button>
            </div>
          </div>

        </div>

        {/* Main CAD Studio Viewport + Side Measurement Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT: 3D Interactive Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative w-full h-[540px] lg:h-[620px] rounded-2xl overflow-hidden border shadow-sm bg-card">
              <BodyMannequin3D
                ref={mannequin3DRef}
                gender={gender}
                garmentType={garmentType}
                measurements={measurements}
                activeField={activeField}
                onSelectField={(f) => {
                  setActiveField(f)
                  const fieldObj = MEASUREMENT_FIELDS.find((item) => item.key === f)
                  if (fieldObj) {
                    if (fieldObj.category === "upper") setActiveTab("upper")
                    else if (fieldObj.category === "lower") setActiveTab("lower")
                    else setActiveTab("overall")
                  }
                }}
                unit={unit}
                fitType={fitType}
                themeStyle={themeStyle}
                showGuides={showGuides}
                showGarment={showGarment}
                showStand={showStand}
                isWireframe={isWireframe}
                className="h-full"
              />
            </div>

            {/* 3D Viewport Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-card rounded-xl border text-xs shadow-xs">
              
              {/* Studio Materials Style */}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-semibold text-[11px] mr-1">Style:</span>
                <Button
                  variant={themeStyle === "tailor" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setThemeStyle("tailor")}
                >
                  Dress Form
                </Button>
                <Button
                  variant={themeStyle === "slate" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setThemeStyle("slate")}
                >
                  Slate
                </Button>
                <Button
                  variant={themeStyle === "ivory" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setThemeStyle("ivory")}
                >
                  Ivory
                </Button>
                <Button
                  variant={themeStyle === "wireframe" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setThemeStyle("wireframe")}
                >
                  Wireframe
                </Button>
              </div>

              {/* Element Toggles */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant={showGuides ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  title="Toggle 3D Measurement Loops"
                  onClick={() => setShowGuides(!showGuides)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Guide Rings
                </Button>
                <Button
                  variant={showGarment ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  title="Toggle Garment Drape Mesh"
                  onClick={() => setShowGarment(!showGarment)}
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Garment Drape
                </Button>
                <Button
                  variant={showStand ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  title="Toggle Tailor Stand"
                  onClick={() => setShowStand(!showStand)}
                >
                  Stand
                </Button>
              </div>
            </div>

            {/* Sizing Standard Quick Presets */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> Baseline Standard Sizes:
              </span>
              <div className="flex items-center gap-1.5">
                {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                  <Button
                    key={sz}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs font-mono font-bold bg-background hover:bg-primary hover:text-white transition-all shadow-2xs"
                    onClick={() => applyStandardSize(sz)}
                  >
                    {sz}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Real-time Measurement Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Active Field Focus Banner */}
            {activeFieldDef && (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Selected Body Region
                  </p>
                  <h3 className="text-base font-bold text-foreground mt-0.5">
                    {activeFieldDef.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{activeFieldDef.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-extrabold text-primary">
                    {formatMeasurementValue(measurements[activeFieldDef.key], unit)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {unit === "inches"
                      ? `${inchesToCm(measurements[activeFieldDef.key] || 0)} cm`
                      : `${measurements[activeFieldDef.key] || 0}"`}
                  </div>
                </div>
              </div>
            )}

            {/* Measurement Category Tabs */}
            <Card className="shadow-xs border-border">
              <CardHeader className="pb-2 pt-4 px-4 border-b">
                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                  <TabsList className="grid grid-cols-3 h-9 w-full">
                    <TabsTrigger value="upper" className="text-xs font-semibold">
                      Upper Body
                    </TabsTrigger>
                    <TabsTrigger value="lower" className="text-xs font-semibold">
                      Lower Body
                    </TabsTrigger>
                    <TabsTrigger value="overall" className="text-xs font-semibold">
                      Full & Specs
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
                {/* Upper Body Fields */}
                {activeTab === "upper" && (
                  <div className="space-y-3.5">
                    {upperFields.map((field) => {
                      const valInInches = measurements[field.key] ?? (gender === "Women" ? field.defaultWomenInches : field.defaultMenInches)
                      const displayVal = unit === "cm" ? inchesToCm(valInInches) : valInInches
                      const minVal = unit === "cm" ? inchesToCm(field.minInches) : field.minInches
                      const maxVal = unit === "cm" ? inchesToCm(field.maxInches) : field.maxInches
                      const stepVal = unit === "cm" ? 0.5 : field.stepInches
                      const isActive = activeField === field.key

                      return (
                        <div
                          key={field.key}
                          onClick={() => setActiveField(field.key)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/10"
                              : "bg-background hover:bg-muted/30 border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs font-bold cursor-pointer">{field.label}</Label>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                step={stepVal}
                                value={displayVal || ""}
                                onChange={(e) => handleValueChange(field.key, parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs font-mono font-bold text-right"
                              />
                              <span className="text-[11px] font-mono text-muted-foreground w-4">
                                {unit === "cm" ? "cm" : '"'}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Precision Slider */}
                          <Slider
                            value={[displayVal || 0]}
                            min={minVal}
                            max={maxVal}
                            step={stepVal}
                            onValueChange={([val]) => handleValueChange(field.key, val)}
                            className="my-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Lower Body Fields */}
                {activeTab === "lower" && (
                  <div className="space-y-3.5">
                    {lowerFields.map((field) => {
                      const valInInches = measurements[field.key] ?? (gender === "Women" ? field.defaultWomenInches : field.defaultMenInches)
                      const displayVal = unit === "cm" ? inchesToCm(valInInches) : valInInches
                      const minVal = unit === "cm" ? inchesToCm(field.minInches) : field.minInches
                      const maxVal = unit === "cm" ? inchesToCm(field.maxInches) : field.maxInches
                      const stepVal = unit === "cm" ? 0.5 : field.stepInches
                      const isActive = activeField === field.key

                      return (
                        <div
                          key={field.key}
                          onClick={() => setActiveField(field.key)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/10"
                              : "bg-background hover:bg-muted/30 border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs font-bold cursor-pointer">{field.label}</Label>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                step={stepVal}
                                value={displayVal || ""}
                                onChange={(e) => handleValueChange(field.key, parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs font-mono font-bold text-right"
                              />
                              <span className="text-[11px] font-mono text-muted-foreground w-4">
                                {unit === "cm" ? "cm" : '"'}
                              </span>
                            </div>
                          </div>

                          <Slider
                            value={[displayVal || 0]}
                            min={minVal}
                            max={maxVal}
                            step={stepVal}
                            onValueChange={([val]) => handleValueChange(field.key, val)}
                            className="my-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Overall & Specs */}
                {activeTab === "overall" && (
                  <div className="space-y-3.5">
                    {overallFields.map((field) => {
                      const valInInches = measurements[field.key] ?? (gender === "Women" ? field.defaultWomenInches : field.defaultMenInches)
                      const displayVal = unit === "cm" ? inchesToCm(valInInches) : valInInches
                      const minVal = unit === "cm" ? inchesToCm(field.minInches) : field.minInches
                      const maxVal = unit === "cm" ? inchesToCm(field.maxInches) : field.maxInches
                      const stepVal = unit === "cm" ? 0.5 : field.stepInches
                      const isActive = activeField === field.key

                      return (
                        <div
                          key={field.key}
                          onClick={() => setActiveField(field.key)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/10"
                              : "bg-background hover:bg-muted/30 border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs font-bold cursor-pointer">{field.label}</Label>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                step={stepVal}
                                value={displayVal || ""}
                                onChange={(e) => handleValueChange(field.key, parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs font-mono font-bold text-right"
                              />
                              <span className="text-[11px] font-mono text-muted-foreground w-4">
                                {unit === "cm" ? "cm" : '"'}
                              </span>
                            </div>
                          </div>

                          <Slider
                            value={[displayVal || 0]}
                            min={minVal}
                            max={maxVal}
                            step={stepVal}
                            onValueChange={([val]) => handleValueChange(field.key, val)}
                            className="my-1.5"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fitting Notes Box */}
            <div className="space-y-1.5 bg-card p-3 rounded-xl border shadow-xs">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Tailoring & Alteration Notes</span>
              </Label>
              <Input
                placeholder="e.g. Broad shoulders, customer prefers slim taper on cuffs..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Customer History Quick Loader */}
            {customerHistory.length > 0 && (
              <div className="bg-card p-3 rounded-xl border shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Prior Customer Fittings ({customerHistory.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {customerHistory.slice(0, 4).map((h: any) => (
                    <Button
                      key={h.id}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] font-medium"
                      onClick={() => {
                        setEditingRecordId(h.id)
                        if (h.garment_type) setGarmentType(h.garment_type)
                        if (h.notes) setNotes(h.notes)
                        const loaded: Record<string, number> = {}
                        MEASUREMENT_FIELDS.forEach((f) => {
                          if (h[f.key] != null && h[f.key] !== "") {
                            loaded[f.key] = Number(h[f.key])
                          }
                        })
                        setMeasurements((prev) => ({ ...prev, ...loaded }))
                      }}
                    >
                      {h.garment_type} (#{h.id})
                    </Button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Export & Print Preview Modal ── */}
        <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-slate-50 border-slate-200">
            <DialogHeader className="flex flex-row justify-between items-center pb-2">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-600" />
                3D CAD Measurement Spec Sheet & Snapshot
              </DialogTitle>
            </DialogHeader>

            {/* Printable Document Container */}
            <div id="printable-cad-spec" className="bg-white p-8 space-y-6 shadow-sm border rounded-xl text-slate-800">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">TailorPro Studio</h1>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                    3D Parametric Body & Garment Spec Sheet
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {editingRecordId ? `Spec Ref: #3D-${editingRecordId}` : "Spec Ref: #3D-DRAFT"}
                  </p>
                  <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer Name</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{currentCustomer?.name || "Unassigned Customer"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact</p>
                  <p className="font-medium text-slate-900 mt-0.5">{currentCustomer?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Garment Type</p>
                  <p className="font-bold text-indigo-600 mt-0.5">{garmentType} ({gender})</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fit Allowance</p>
                  <p className="font-semibold text-slate-900 mt-0.5 capitalize">{fitType} Fit</p>
                </div>
              </div>

              {/* Side-by-side 3D snapshot + Measurement Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* 3D Mannequin Snapshot */}
                <div className="bg-slate-50 border rounded-xl p-3 flex flex-col items-center justify-center min-h-[360px]">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">3D Tailoring Reference</p>
                  {snapshotImg ? (
                    <img
                      src={snapshotImg}
                      alt="3D Mannequin Snapshot"
                      className="max-h-[320px] w-auto object-contain rounded-lg drop-shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-slate-400 text-xs italic">
                      Snapshot rendering...
                    </div>
                  )}
                </div>

                {/* Dimension Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
                    Exact Tailoring Measurements
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {MEASUREMENT_FIELDS.map((f) => {
                      const valInInches = measurements[f.key]
                      if (!valInInches) return null
                      const valInCm = inchesToCm(valInInches)
                      return (
                        <div key={f.key} className="flex justify-between items-baseline py-1 border-b border-dashed border-slate-200">
                          <span className="text-slate-500 font-medium">{f.label}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {valInInches}" <span className="text-[10px] text-slate-400 font-normal">({valInCm} cm)</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {notes && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitting Notes</p>
                      <p className="text-xs text-slate-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-1">
                        📝 {notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end border-t border-slate-200">
                <div className="border-t border-slate-300 pt-1 w-44 text-center text-[11px] text-slate-400">
                  Customer Approval
                </div>
                <div className="border-t border-slate-300 pt-1 w-44 text-center text-[11px] text-slate-400">
                  Master Tailor Verification
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setExportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-md"
                disabled={isExportingPdf}
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4" />
                <span>{isExportingPdf ? "Generating PDF..." : "Download CAD Spec PDF"}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </ErrorBoundary>
  )
}
