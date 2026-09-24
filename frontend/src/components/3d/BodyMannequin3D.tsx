import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {
  buildParametricMannequin,
  updateMannequinTransforms,
  buildGarmentOverlayMesh,
  normalizeMeasurementValues,
  MannequinSceneHierarchy,
  GuideAnchor,
  ThemeStyle,
} from "./mannequinGeometry"
import { FabricType, createRealisticFabricMaterial } from "./fabricTextures"
import {
  UnitType,
  FitType,
  formatMeasurementValue,
} from "./measurementDimensions"
import {
  GARMENT_COLOR_OPTIONS,
  colorToHexStr,
  colorToNumber,
  findColorOption,
} from "./garmentColors"
import {
  RotateCcw,
  Sparkles,
  Compass,
  Shirt,
  Scissors,
  Eye,
  Palette,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface BodyMannequin3DProps {
  gender?: "Men" | "Women"
  garmentType?: string
  measurements: Record<string, any>
  activeField?: string | null
  onSelectField?: (fieldKey: string) => void
  unit?: UnitType
  fitType?: FitType
  themeStyle?: ThemeStyle
  fabricType?: FabricType
  garmentColor?: number | string
  isOpaqueGarment?: boolean
  onGarmentColorChange?: (colorHex: string) => void
  onGarmentTypeChange?: (garmentType: string) => void
  showGuides?: boolean
  showGarment?: boolean
  showStand?: boolean
  isWireframe?: boolean
  className?: string
}

export interface BodyMannequin3DRef {
  takeScreenshot: () => string | null
  resetCamera: () => void
  setView: (view: "front" | "back" | "left" | "right" | "top" | "iso") => void
}

export const BodyMannequin3D = forwardRef<BodyMannequin3DRef, BodyMannequin3DProps>(
  (
    {
      gender = "Men",
      garmentType = "Shirt",
      measurements,
      activeField = null,
      onSelectField,
      unit = "inches",
      fitType = "regular",
      themeStyle = "tailor",
      fabricType: fabricTypeProp = "cotton",
      garmentColor: garmentColorProp = "#1e3a8a",
      isOpaqueGarment: isOpaqueGarmentProp = true,
      onGarmentColorChange,
      onGarmentTypeChange,
      showGuides = true,
      showGarment = true,
      showStand = true,
      isWireframe = false,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Three.js State Refs
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const hierarchyRef = useRef<MannequinSceneHierarchy | null>(null)
    const garmentMeshRef = useRef<THREE.Group | null>(null)
    const guideMeshesRef = useRef<Record<string, THREE.Mesh | THREE.Line>>({})
    const reqIdRef = useRef<number | null>(null)

    // Camera Animation Lerp
    const targetCamPos = useRef<THREE.Vector3 | null>(null)
    const targetLookAt = useRef<THREE.Vector3 | null>(null)

    // UI state
    const [autoRotate, setAutoRotate] = useState(false)
    const [guideAnchors, setGuideAnchors] = useState<GuideAnchor[]>([])
    const [screenLabels, setScreenLabels] = useState<{ key: string; label: string; x: number; y: number; val: string; isActive: boolean }[]>([])
    const [hoveredField, setHoveredField] = useState<string | null>(null)

    // Raycasting
    const raycaster = useRef(new THREE.Raycaster())
    const mouse = useRef(new THREE.Vector2())

    // Display mode: "fitted" (clothed on form) | "dressform" (pure couture form) | "xray" (semi-transparent)
    const [displayMode, setDisplayMode] = useState<"fitted" | "dressform" | "xray">("fitted")
    const [currentColor, setCurrentColor] = useState<number>(colorToNumber(garmentColorProp))
    const [currentFabric, setCurrentFabric] = useState<FabricType>(fabricTypeProp)

    // Sync garmentColor from prop if changed externally
    useEffect(() => {
      if (garmentColorProp !== undefined && garmentColorProp !== null) {
        const num = colorToNumber(garmentColorProp)
        setCurrentColor(num)
      }
    }, [garmentColorProp])

    const handleColorSelect = (hex: string) => {
      const num = colorToNumber(hex)
      setCurrentColor(num)
      if (onGarmentColorChange) {
        onGarmentColorChange(hex)
      }
    }

    // Convert and normalize raw measurement record into numerical values (in inches)
    const parseMeasurements = useCallback((): Record<string, number> => {
      return normalizeMeasurementValues(measurements, gender)
    }, [measurements, gender])

    // -------------------------------------------------------------
    // Setup Three.js Scene with Luxury Atelier Lighting
    // -------------------------------------------------------------
    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return

      const container = containerRef.current
      const canvas = canvasRef.current
      const width = container.clientWidth || 500
      const height = container.clientHeight || 550

      // Scene
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50)
      camera.position.set(0, 1.15, 2.75)
      cameraRef.current = camera

      // Renderer with antialiasing and high precision
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.18
      rendererRef.current = renderer

      // OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.target.set(0, 0.98, 0)
      controls.minDistance = 1.0
      controls.maxDistance = 5.0
      controls.maxPolarAngle = Math.PI / 2 + 0.12
      controls.autoRotate = autoRotate
      controls.autoRotateSpeed = 1.8
      controlsRef.current = controls

      // Lighting Rig - Professional High-Fashion Atelier Lighting
      const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.45)
      scene.add(ambientLight)

      // Key Light (Warm daylight)
      const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.8)
      keyLight.position.set(2.4, 3.8, 2.6)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.width = 1024
      keyLight.shadow.mapSize.height = 1024
      keyLight.shadow.bias = -0.0004
      scene.add(keyLight)

      // Fill Light (Soft cool ambient bounce)
      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.1)
      fillLight.position.set(-2.5, 2.2, 1.8)
      scene.add(fillLight)

      // Rim Light (Backlight for couture edge contour)
      const rimLight = new THREE.DirectionalLight(0xffffff, 1.35)
      rimLight.position.set(0, 3.2, -2.6)
      scene.add(rimLight)

      // Soft Ground Shadow Plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(3.2, 3.2)
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.25 })
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = 0.005
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      // Circular Grid Floor
      const gridHelper = new THREE.PolarGridHelper(1.5, 16, 8, 32, 0x94a3b8, 0xe2e8f0)
      gridHelper.position.y = 0.002
      scene.add(gridHelper)

      // Build Haute-Couture Atelier Dress Form
      const hierarchy = buildParametricMannequin(gender, themeStyle, isWireframe)
      scene.add(hierarchy.rootGroup)
      hierarchyRef.current = hierarchy

      // Animation Loop
      const animate = () => {
        reqIdRef.current = requestAnimationFrame(animate)

        // Smooth Camera Transition Lerp
        if (targetCamPos.current && cameraRef.current && controlsRef.current) {
          cameraRef.current.position.lerp(targetCamPos.current, 0.08)
          if (targetLookAt.current) {
            controlsRef.current.target.lerp(targetLookAt.current, 0.08)
          }
          if (cameraRef.current.position.distanceTo(targetCamPos.current) < 0.02) {
            targetCamPos.current = null
            targetLookAt.current = null
          }
        }

        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // Resize Observer
      const handleResize = () => {
        if (!container || !renderer || !camera) return
        const w = container.clientWidth
        const h = container.clientHeight
        if (w === 0 || h === 0) return
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }

      const ro = new ResizeObserver(handleResize)
      ro.observe(container)

      return () => {
        if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current)
        ro.disconnect()
        controls.dispose()
        renderer.dispose()
        scene.clear()
      }
    }, [gender, themeStyle, isWireframe])

    // Update Auto-Rotate
    useEffect(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
      }
    }, [autoRotate])

    // Update Stand Visibility
    useEffect(() => {
      if (hierarchyRef.current) {
        hierarchyRef.current.standGroup.visible = showStand
      }
    }, [showStand])

    // -------------------------------------------------------------
    // Real-Time Morph & Dynamic Garment Regeneration
    // -------------------------------------------------------------
    useEffect(() => {
      if (!hierarchyRef.current || !sceneRef.current) return

      const hierarchy = hierarchyRef.current
      const parsedValues = parseMeasurements()

      // Apply morph transforms to the Haute-Couture Dress Form
      const anchors = updateMannequinTransforms(
        hierarchy,
        parsedValues,
        gender,
        garmentType,
        fitType
      )
      setGuideAnchors(anchors)

      // Rebuild 3D Guide Tape Rings
      hierarchy.guidesGroup.clear()
      guideMeshesRef.current = {}

      if (showGuides) {
        anchors.forEach((anchor) => {
          const matchKey = (k: string | null) => {
            if (!k) return false
            if (k === anchor.key) return true
            if ((k === "bust" || k === "chest" || k === "upper_chest") && (anchor.key === "chest" || anchor.key === "bust")) return true
            if ((k === "collar" || k === "neck" || k === "neck_size") && (anchor.key === "neck" || anchor.key === "collar")) return true
            if ((k === "shoulder" || k === "shoulder_width") && anchor.key === "shoulder") return true
            if ((k === "sleeve_length" || k === "sleeve") && anchor.key === "sleeve_length") return true
            if ((k === "sleeve_round" || k === "wrist" || k === "cuff") && (anchor.key === "wrist" || anchor.key === "sleeve_round")) return true
            if ((k === "waist" || k === "waist_round") && anchor.key === "waist") return true
            if ((k === "hip" || k === "hip_round") && anchor.key === "hip") return true
            if ((k === "length" || k === "shirt_length" || k === "total_length") && anchor.key === "length") return true
            return false
          }
          const isActive = matchKey(activeField) || matchKey(hoveredField)
          const mat = isActive
            ? hierarchy.materials.guideActiveMat
            : hierarchy.materials.guideMat

          if (anchor.orientation === "horizontal") {
            const torusGeo = new THREE.TorusGeometry(anchor.radius, isActive ? 0.0055 : 0.0035, 12, 48)
            torusGeo.rotateX(Math.PI / 2)
            const ringMesh = new THREE.Mesh(torusGeo, mat)
            ringMesh.position.copy(anchor.position)
            ringMesh.userData = { fieldKey: anchor.key, isGuide: true }
            hierarchy.guidesGroup.add(ringMesh)
            guideMeshesRef.current[anchor.key] = ringMesh
          } else if (anchor.orientation === "line" && anchor.lineEnd) {
            const points = [anchor.position, anchor.lineEnd]
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
            const lineMat = new THREE.LineDashedMaterial({
              color: isActive ? 0xef4444 : 0x3b82f6,
              dashSize: 0.03,
              gapSize: 0.015,
              linewidth: 2,
            })
            const lineMesh = new THREE.Line(lineGeo, lineMat)
            lineMesh.computeLineDistances()
            lineMesh.userData = { fieldKey: anchor.key, isGuide: true }
            hierarchy.guidesGroup.add(lineMesh)
            guideMeshesRef.current[anchor.key] = lineMesh
          }
        })
      }

      // Rebuild 3D Tailored Garment Draping
      if (garmentMeshRef.current) {
        hierarchy.rootGroup.remove(garmentMeshRef.current)
        garmentMeshRef.current = null
      }

      const shouldRenderGarment = showGarment && displayMode !== "dressform"
      if (shouldRenderGarment) {
        const isXray = displayMode === "xray"
        const customGarmentMat = createRealisticFabricMaterial(
          currentFabric,
          currentColor,
          isXray ? 0.45 : 0.98,
          isXray
        )

        const garmentMesh = buildGarmentOverlayMesh(
          garmentType,
          gender,
          hierarchy.materials,
          parsedValues,
          customGarmentMat
        )
        hierarchy.rootGroup.add(garmentMesh)
        garmentMeshRef.current = garmentMesh
      }
    }, [
      measurements,
      gender,
      garmentType,
      fitType,
      activeField,
      hoveredField,
      showGuides,
      showGarment,
      displayMode,
      currentColor,
      currentFabric,
      parseMeasurements,
    ])

    // -------------------------------------------------------------
    // Calculate 2D Screen Badges for ACTIVE Field Only (Zero Clutter)
    // -------------------------------------------------------------
    const updateScreenBadges = useCallback(() => {
      if (!cameraRef.current || !containerRef.current || !showGuides) {
        setScreenLabels([])
        return
      }

      const targetKey = activeField || hoveredField
      if (!targetKey) {
        setScreenLabels([])
        return
      }

      const camera = cameraRef.current
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight
      const parsedValues = parseMeasurements()

      const matchAnchor = (anchorKey: string, k: string | null) => {
        if (!k) return false
        if (k === anchorKey) return true
        if ((k === "bust" || k === "chest" || k === "upper_chest") && (anchorKey === "chest" || anchorKey === "bust")) return true
        if ((k === "collar" || k === "neck" || k === "neck_size") && (anchorKey === "neck" || anchorKey === "collar")) return true
        if ((k === "shoulder" || k === "shoulder_width") && anchorKey === "shoulder") return true
        if ((k === "sleeve_length" || k === "sleeve") && anchorKey === "sleeve_length") return true
        if ((k === "sleeve_round" || k === "wrist" || k === "cuff") && (anchorKey === "wrist" || anchorKey === "sleeve_round")) return true
        if ((k === "waist" || k === "waist_round") && anchorKey === "waist") return true
        if ((k === "hip" || k === "hip_round") && anchorKey === "hip") return true
        if ((k === "length" || k === "shirt_length" || k === "total_length") && anchorKey === "length") return true
        return false
      }

      const matchedAnchors = guideAnchors.filter((a) => matchAnchor(a.key, targetKey))
      const anchorToUse = matchedAnchors[0] || null

      if (!anchorToUse) {
        setScreenLabels([])
        return
      }

      const wp = anchorToUse.position.clone()
      if (anchorToUse.orientation === "horizontal") {
        wp.x += anchorToUse.radius * 0.95
        wp.z += anchorToUse.radius * 0.35
      }

      wp.project(camera)

      const x = ((wp.x + 1) * width) / 2
      const y = ((-wp.y + 1) * height) / 2
      const isVisible = wp.z < 1

      if (isVisible && x > 15 && x < width - 15 && y > 15 && y < height - 15) {
        const valNum = parsedValues[anchorToUse.key]
        const valStr = formatMeasurementValue(valNum, unit)
        setScreenLabels([
          {
            key: anchorToUse.key,
            label: anchorToUse.label,
            x: Math.round(x),
            y: Math.round(y),
            val: valStr,
            isActive: true,
          },
        ])
      } else {
        setScreenLabels([])
      }
    }, [guideAnchors, activeField, hoveredField, unit, showGuides, parseMeasurements])

    useEffect(() => {
      const interval = setInterval(updateScreenBadges, 80)
      return () => clearInterval(interval)
    }, [updateScreenBadges])

    // -------------------------------------------------------------
    // Raycasting & Click-to-Select Body Part
    // -------------------------------------------------------------
    const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>, isClick: boolean) => {
      if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(mouse.current, cameraRef.current)
      const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true)

      let hitField: string | null = null
      for (const hit of intersects) {
        if (hit.object.userData?.fieldKey) {
          hitField = hit.object.userData.fieldKey
          break
        }
      }

      if (isClick) {
        if (hitField && onSelectField) {
          onSelectField(hitField)
        }
      } else {
        if (hitField !== hoveredField) {
          setHoveredField(hitField)
        }
      }
    }

    // -------------------------------------------------------------
    // Camera View Angles Presets
    // -------------------------------------------------------------
    const setView = (view: "front" | "back" | "left" | "right" | "top" | "iso") => {
      if (!cameraRef.current || !controlsRef.current) return

      const dist = 2.75
      const target = new THREE.Vector3(0, 0.98, 0)
      let pos = new THREE.Vector3()

      switch (view) {
        case "front":
          pos.set(0, 1.15, dist)
          break
        case "back":
          pos.set(0, 1.15, -dist)
          break
        case "left":
          pos.set(-dist, 1.15, 0)
          break
        case "right":
          pos.set(dist, 1.15, 0)
          break
        case "top":
          pos.set(0, dist + 0.8, 0.05)
          break
        case "iso":
        default:
          pos.set(dist * 0.7, 1.45, dist * 0.7)
          break
      }

      targetCamPos.current = pos
      targetLookAt.current = target
    }

    const resetCamera = () => {
      setView("front")
    }

    const takeScreenshot = (): string | null => {
      if (!rendererRef.current) return null
      return rendererRef.current.domElement.toDataURL("image/png")
    }

    useImperativeHandle(ref, () => ({
      takeScreenshot,
      resetCamera,
      setView,
    }))

    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-b from-slate-900/5 via-slate-900/10 to-slate-900/20 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-border shadow-inner ${className}`}>
        
        {/* Main 3D Canvas */}
        <div ref={containerRef} className="relative w-full h-full min-h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
            onClick={(e) => handleCanvasPointer(e, true)}
            onPointerMove={(e) => handleCanvasPointer(e, false)}
          />

          {/* Focused Measurement Badge (Zero clutter - only active/hovered field) */}
          {screenLabels.map((lbl) => (
            <div
              key={lbl.key}
              style={{
                transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -50%)`,
              }}
              className="absolute pointer-events-none transition-all duration-150 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-indigo-600 text-white border border-indigo-300 ring-4 ring-indigo-500/25 scale-105 z-20 animate-in fade-in zoom-in-95 duration-100"
            >
              <span className="text-[10px] uppercase tracking-wider opacity-90">{lbl.label}:</span>
              <span className="font-mono text-sm">{lbl.val}</span>
            </div>
          ))}
        </div>

        {/* Floating Top-Left HUD Controls */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-auto z-10">
          {/* Header Tag */}
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-md border-border font-semibold shadow-2xs text-[10px] py-0 px-1.5">
              {gender === "Women" ? "👩 Women" : "👨 Men"}
            </Badge>
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-border font-semibold shadow-2xs text-[10px] py-0 px-1.5">
              {garmentType}
            </Badge>
          </div>

          {/* Garment Display Mode Switcher */}
          <div className="flex items-center bg-background/90 backdrop-blur-md p-0.5 rounded-lg border border-border/80 shadow-xs">
            <button
              type="button"
              onClick={() => setDisplayMode("fitted")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                displayMode === "fitted"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View Tailored Clothing Fitted on Form"
            >
              <Shirt className="h-3 w-3" />
              <span>Garment</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("dressform")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                displayMode === "dressform"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View Atelier Dress Form & Seams Only"
            >
              <Scissors className="h-3 w-3" />
              <span>Dress Form</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("xray")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                displayMode === "xray"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Semi-Transparent X-Ray Fit Guide"
            >
              <Eye className="h-3 w-3" />
              <span>X-Ray</span>
            </button>
          </div>

          {/* Garment Color Dropdown Menu */}
          {displayMode !== "dressform" && (
            <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur-md p-1 rounded-lg border border-border/80 shadow-xs">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] font-semibold gap-1.5 hover:bg-accent flex items-center"
                    title="Select Garment Color"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-2xs shrink-0"
                      style={{
                        backgroundColor: colorToHexStr(currentColor),
                        borderColor: findColorOption(currentColor)?.border || "rgba(0,0,0,0.2)",
                      }}
                    />
                    <Palette className="h-3 w-3 text-muted-foreground" />
                    <span className="max-w-[85px] truncate font-medium">
                      {findColorOption(currentColor)?.name || colorToHexStr(currentColor)}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto p-1.5 text-xs">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Garment Color</span>
                    <span className="font-mono text-[9px] lowercase">{colorToHexStr(currentColor)}</span>
                  </DropdownMenuLabel>
                  
                  {/* Custom Color Picker Row */}
                  <div className="flex items-center justify-between p-2 mb-1 bg-muted/40 rounded-md border border-border/60">
                    <span className="text-[11px] font-medium text-foreground">Custom Color:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorToHexStr(currentColor)}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent"
                        title="Pick custom color"
                      />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">{colorToHexStr(currentColor)}</span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Curated Color Options Palette */}
                  <div className="grid grid-cols-1 gap-0.5 mt-1">
                    {GARMENT_COLOR_OPTIONS.map((opt) => {
                      const isSelected = currentColor === opt.colorNum || colorToHexStr(currentColor).toLowerCase() === opt.hex.toLowerCase()
                      return (
                        <DropdownMenuItem
                          key={opt.hex}
                          onClick={() => handleColorSelect(opt.hex)}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs ${
                            isSelected ? "bg-primary/10 text-primary font-bold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border shrink-0 shadow-2xs"
                              style={{ backgroundColor: opt.hex, borderColor: opt.border || "#94a3b8" }}
                            />
                            <span>{opt.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{opt.hex}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick mini-swatches for top 4 popular colors */}
              <div className="flex items-center gap-1 pl-1 border-l border-border/60">
                {GARMENT_COLOR_OPTIONS.slice(0, 4).map((opt) => (
                  <button
                    key={opt.hex}
                    type="button"
                    title={opt.name}
                    onClick={() => handleColorSelect(opt.hex)}
                    style={{ backgroundColor: opt.hex, borderColor: opt.border || "#cbd5e1" }}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      currentColor === opt.colorNum
                        ? "ring-2 ring-primary ring-offset-1 scale-110"
                        : "opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Top-Right View Presets Gizmo */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 bg-background/85 backdrop-blur-md p-0.5 rounded-lg border border-border/80 shadow-xs z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] font-semibold"
            title="Front View"
            onClick={() => setView("front")}
          >
            Front
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] font-semibold"
            title="Side Profile"
            onClick={() => setView("right")}
          >
            Side
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] font-semibold"
            title="Back View"
            onClick={() => setView("back")}
          >
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] font-semibold"
            title="Isometric 3/4 View"
            onClick={() => setView("iso")}
          >
            3/4
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            title="Reset Camera"
            onClick={resetCamera}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Floating Bottom Helper & Turntable Toggle */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-border/70 text-[10px] text-muted-foreground shadow-2xs pointer-events-auto">
            <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
            <span>Click any tape ring to focus field</span>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-[10px] font-semibold bg-background/90 backdrop-blur-md shadow-2xs gap-1"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              <Compass className={`h-3 w-3 ${autoRotate ? "animate-spin" : ""}`} />
              <span>360°</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

BodyMannequin3D.displayName = "BodyMannequin3D"
