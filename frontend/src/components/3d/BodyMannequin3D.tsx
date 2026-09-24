import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {
  buildParametricMannequin,
  updateMannequinTransforms,
  buildGarmentOverlayMesh,
  MannequinSceneHierarchy,
  GuideAnchor,
  ThemeStyle,
} from "./mannequinGeometry"
import {
  buildRealisticHumanAvatar,
  buildRealistic3DGarment,
  AvatarStyle,
  SkinTone,
  SKIN_TONES,
  FABRIC_COLORS,
} from "./realisticHumanGeometry"
import { FabricType } from "./fabricTextures"
import {
  UnitType,
  FitType,
  formatMeasurementValue,
  inchesToCm,
} from "./measurementDimensions"
import {
  RotateCcw,
  Eye,
  Maximize2,
  Camera,
  Layers,
  Sparkles,
  Grid,
  Shield,
  Palette,
  Compass,
  User,
  Shirt,
  Scissors,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface BodyMannequin3DProps {
  gender?: "Men" | "Women"
  garmentType?: string
  measurements: Record<string, any>
  activeField?: string | null
  onSelectField?: (fieldKey: string) => void
  unit?: UnitType
  fitType?: FitType
  themeStyle?: ThemeStyle
  avatarStyle?: AvatarStyle
  skinTone?: SkinTone
  fabricType?: FabricType
  garmentColor?: number
  isOpaqueGarment?: boolean
  onAvatarStyleChange?: (style: AvatarStyle) => void
  onSkinToneChange?: (tone: SkinTone) => void
  onFabricTypeChange?: (fabric: FabricType) => void
  onGarmentColorChange?: (color: number) => void
  onOpaqueGarmentChange?: (isOpaque: boolean) => void
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
      avatarStyle: avatarStyleProp,
      skinTone: skinToneProp,
      fabricType: fabricTypeProp,
      garmentColor: garmentColorProp,
      isOpaqueGarment: isOpaqueGarmentProp,
      onAvatarStyleChange,
      onSkinToneChange,
      onFabricTypeChange,
      onGarmentColorChange,
      onOpaqueGarmentChange,
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

    // Realistic Avatar & Fabric State (Controlled or Uncontrolled fallback)
    const [internalAvatarStyle, setInternalAvatarStyle] = useState<AvatarStyle>(avatarStyleProp || "human")
    const [internalSkinTone, setInternalSkinTone] = useState<SkinTone>(skinToneProp || "medium")
    const [internalFabricType, setInternalFabricType] = useState<FabricType>(fabricTypeProp || "cotton")
    const [internalColor, setInternalColor] = useState<number>(garmentColorProp ?? 0x2563eb)
    const [internalOpaque, setInternalOpaque] = useState<boolean>(isOpaqueGarmentProp ?? true)
    const [showClothSettings, setShowClothSettings] = useState<boolean>(false)

    const avatarStyle = avatarStyleProp ?? internalAvatarStyle
    const skinTone = skinToneProp ?? internalSkinTone
    const fabricType = fabricTypeProp ?? internalFabricType
    const garmentColor = garmentColorProp ?? internalColor
    const isOpaqueGarment = isOpaqueGarmentProp ?? internalOpaque

    const handleAvatarStyleChange = (s: AvatarStyle) => {
      setInternalAvatarStyle(s)
      onAvatarStyleChange?.(s)
    }

    const handleSkinToneChange = (t: SkinTone) => {
      setInternalSkinTone(t)
      onSkinToneChange?.(t)
    }

    const handleFabricTypeChange = (f: FabricType) => {
      setInternalFabricType(f)
      onFabricTypeChange?.(f)
    }

    const handleColorChange = (c: number) => {
      setInternalColor(c)
      onGarmentColorChange?.(c)
    }

    const handleOpaqueToggle = () => {
      const next = !isOpaqueGarment
      setInternalOpaque(next)
      onOpaqueGarmentChange?.(next)
    }

    // Convert raw measurement record into numerical values (in inches)
    const parseMeasurements = useCallback((): Record<string, number> => {
      const parsed: Record<string, number> = {}
      if (!measurements) return parsed
      Object.entries(measurements).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          const num = parseFloat(String(v))
          if (!isNaN(num)) parsed[k] = num
        }
      })
      return parsed
    }, [measurements])

    // -------------------------------------------------------------
    // Setup Three.js Scene
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
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50)
      camera.position.set(0, 1.15, 2.7)
      cameraRef.current = camera

      // Renderer with antialiasing and preserveDrawingBuffer for screenshots
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
      renderer.toneMappingExposure = 1.15
      rendererRef.current = renderer

      // OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.target.set(0, 0.95, 0)
      controls.minDistance = 1.0
      controls.maxDistance = 5.5
      controls.maxPolarAngle = Math.PI / 2 + 0.15 // Allow slightly low view but not under floor
      controls.autoRotate = autoRotate
      controls.autoRotateSpeed = 1.8
      controlsRef.current = controls

      // Lighting Rig - Professional 3-Point Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
      scene.add(ambientLight)

      // Key Light
      const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8)
      keyLight.position.set(2.5, 3.5, 2.5)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.width = 1024
      keyLight.shadow.mapSize.height = 1024
      keyLight.shadow.bias = -0.0005
      scene.add(keyLight)

      // Fill Light
      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.0)
      fillLight.position.set(-2.5, 2.0, 1.8)
      scene.add(fillLight)

      // Rim Light (Backlight for natural human silhouette contour)
      const rimLight = new THREE.DirectionalLight(0xffffff, 1.3)
      rimLight.position.set(0, 3.0, -2.5)
      scene.add(rimLight)

      // Subtle Ground Shadow Plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(3.5, 3.5)
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 })
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = 0.005
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      // Subtle Circular Grid Floor
      const gridHelper = new THREE.PolarGridHelper(1.6, 16, 8, 32, 0x94a3b8, 0xe2e8f0)
      gridHelper.position.y = 0.002
      scene.add(gridHelper)

      // Build Realistic Human Avatar OR Parametric Mannequin
      const hierarchy = avatarStyle === "human"
        ? buildRealisticHumanAvatar(gender, skinTone, fabricType, garmentColor, isOpaqueGarment, isWireframe)
        : buildParametricMannequin(gender, themeStyle, isWireframe)

      scene.add(hierarchy.rootGroup)
      hierarchyRef.current = hierarchy

      // Animation Loop
      const animate = () => {
        reqIdRef.current = requestAnimationFrame(animate)

        // Smooth Camera Transition Lerp if active
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
    }, [gender, themeStyle, isWireframe, avatarStyle, skinTone, fabricType, garmentColor, isOpaqueGarment])

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
    // Real-Time Morph & Guide Rings Generation
    // -------------------------------------------------------------
    useEffect(() => {
      if (!hierarchyRef.current || !sceneRef.current) return

      const hierarchy = hierarchyRef.current
      const parsedValues = parseMeasurements()

      // Apply morph transforms
      const anchors = updateMannequinTransforms(
        hierarchy,
        parsedValues,
        gender,
        garmentType,
        fitType
      )
      setGuideAnchors(anchors)

      // Rebuild 3D Guide Rings
      hierarchy.guidesGroup.clear()
      guideMeshesRef.current = {}

      if (showGuides) {
        anchors.forEach((anchor) => {
          const isActive = activeField === anchor.key || hoveredField === anchor.key
          const mat = isActive
            ? hierarchy.materials.guideActiveMat
            : hierarchy.materials.guideMat

          if (anchor.orientation === "horizontal") {
            const torusGeo = new THREE.TorusGeometry(anchor.radius, isActive ? 0.005 : 0.0035, 12, 48)
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

      // Rebuild 3D Garment Draping Overlay / Realistic Clothes
      if (garmentMeshRef.current) {
        hierarchy.rootGroup.remove(garmentMeshRef.current)
      }
      if (showGarment) {
        const garmentMesh = avatarStyle === "human"
          ? buildRealistic3DGarment(
              garmentType,
              gender,
              (hierarchy as any).materials,
              parsedValues
            )
          : buildGarmentOverlayMesh(
              garmentType,
              gender,
              hierarchy.materials,
              parsedValues
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
      avatarStyle,
      skinTone,
      fabricType,
      garmentColor,
      isOpaqueGarment,
      parseMeasurements,
    ])

    // -------------------------------------------------------------
    // Calculate 2D Screen Badges from 3D Anchors
    // -------------------------------------------------------------
    const updateScreenBadges = useCallback(() => {
      if (!cameraRef.current || !containerRef.current || !showGuides) {
        setScreenLabels([])
        return
      }

      const camera = cameraRef.current
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight
      const parsedValues = parseMeasurements()

      // Only show badges for the active field or primary core measurements
      const priorityKeys = [
        activeField,
        "chest",
        "waist",
        "hip",
        "shoulder",
        "sleeve_length",
        "neck",
        "inseam",
      ].filter(Boolean) as string[]

      const labels = guideAnchors
        .filter((a) => priorityKeys.includes(a.key))
        .map((anchor) => {
          const wp = anchor.position.clone()
          // Offset slightly outward in 3D for legibility
          if (anchor.orientation === "horizontal") {
            wp.x += anchor.radius * 0.95
            wp.z += anchor.radius * 0.35
          }

          wp.project(camera)

          const x = ((wp.x + 1) * width) / 2
          const y = ((-wp.y + 1) * height) / 2
          const isVisible = wp.z < 1 // In front of camera

          const valNum = parsedValues[anchor.key]
          const valStr = formatMeasurementValue(valNum, unit)

          return {
            key: anchor.key,
            label: anchor.label,
            x: Math.round(x),
            y: Math.round(y),
            val: valStr,
            isActive: activeField === anchor.key,
            isVisible,
          }
        })
        .filter((l) => l.isVisible && l.x > 10 && l.x < width - 10 && l.y > 10 && l.y < height - 10)

      setScreenLabels(labels)
    }, [guideAnchors, activeField, unit, showGuides, parseMeasurements])

    useEffect(() => {
      const interval = setInterval(updateScreenBadges, 100)
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
        setHoveredField(hitField)
      }
    }

    // -------------------------------------------------------------
    // Camera View Controller Methods
    // -------------------------------------------------------------
    const setView = useCallback((view: "front" | "back" | "left" | "right" | "top" | "iso") => {
      setAutoRotate(false)
      const look = new THREE.Vector3(0, 0.95, 0)
      targetLookAt.current = look

      switch (view) {
        case "front":
          targetCamPos.current = new THREE.Vector3(0, 1.1, 2.7)
          break
        case "back":
          targetCamPos.current = new THREE.Vector3(0, 1.1, -2.7)
          break
        case "left":
          targetCamPos.current = new THREE.Vector3(-2.7, 1.1, 0)
          break
        case "right":
          targetCamPos.current = new THREE.Vector3(2.7, 1.1, 0)
          break
        case "top":
          targetCamPos.current = new THREE.Vector3(0, 3.4, 0.1)
          break
        case "iso":
        default:
          targetCamPos.current = new THREE.Vector3(1.8, 1.6, 2.1)
          break
      }
    }, [])

    const resetCamera = useCallback(() => {
      setView("front")
    }, [setView])

    const takeScreenshot = useCallback((): string | null => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      return rendererRef.current.domElement.toDataURL("image/png")
    }, [])

    useImperativeHandle(ref, () => ({
      takeScreenshot,
      resetCamera,
      setView,
    }))

    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-b from-slate-900/5 via-slate-900/10 to-slate-900/20 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-border shadow-inner ${className}`}>
        
        {/* Main 3D Canvas */}
        <div ref={containerRef} className="relative w-full h-full min-h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
            onClick={(e) => handleCanvasPointer(e, true)}
            onPointerMove={(e) => handleCanvasPointer(e, false)}
          />

          {/* Floating 3D Measurement Badges Projected on Canvas */}
          {screenLabels.map((lbl) => (
            <button
              key={lbl.key}
              type="button"
              onClick={() => onSelectField?.(lbl.key)}
              style={{
                transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -50%)`,
              }}
              className={`absolute pointer-events-auto transition-all duration-200 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md border ${
                lbl.isActive
                  ? "bg-red-600 text-white border-red-300 ring-4 ring-red-500/25 scale-110 z-20"
                  : "bg-background/90 text-foreground border-border/80 hover:border-primary hover:scale-105 z-10"
              }`}
            >
              <span className="text-[10px] font-medium opacity-80">{lbl.label}:</span>
              <span className="font-mono">{lbl.val}</span>
            </button>
          ))}
        </div>

        {/* Floating Top-Left Garment & Avatar Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-auto z-10 max-w-[280px]">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-md border-border font-semibold shadow-xs text-[11px]">
              {gender === "Women" ? "👩 Women" : "👨 Men"}
            </Badge>
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-border font-semibold shadow-xs text-[11px]">
              {garmentType}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                fitType === "slim"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : fitType === "loose"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {fitType === "slim" ? "Slim" : fitType === "loose" ? "Relaxed" : "Regular"}
            </Badge>
          </div>

          {/* Model Switcher: Realistic Human vs Dress Form */}
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-md">
            <Button
              variant={avatarStyle === "human" ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2 text-[11px] font-bold gap-1"
              onClick={() => handleAvatarStyleChange("human")}
            >
              <User className="h-3 w-3" />
              <span>Human Avatar</span>
            </Button>
            <Button
              variant={avatarStyle === "mannequin" ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2 text-[11px] font-semibold gap-1"
              onClick={() => handleAvatarStyleChange("mannequin")}
            >
              <Scissors className="h-3 w-3" />
              <span>Mannequin</span>
            </Button>
            
            {avatarStyle === "human" && (
              <Button
                variant={showClothSettings ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-1.5 text-[11px] font-semibold ml-auto"
                title="Customize Fabric, Skin & Colors"
                onClick={() => setShowClothSettings(!showClothSettings)}
              >
                <Palette className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Expanded Clothing & Skin Customizer Panel */}
          {avatarStyle === "human" && showClothSettings && (
            <div className="flex flex-col gap-2 p-2.5 bg-background/95 backdrop-blur-lg rounded-xl border border-border/90 shadow-xl text-[11px] animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Complexion / Skin Tone */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">Skin Tone:</span>
                <div className="flex items-center gap-1">
                  {(Object.keys(SKIN_TONES) as SkinTone[]).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => handleSkinToneChange(tone)}
                      title={SKIN_TONES[tone].label}
                      style={{ backgroundColor: `#${SKIN_TONES[tone].color.toString(16).padStart(6, "0")}` }}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        skinTone === tone
                          ? "ring-2 ring-primary ring-offset-1 scale-110 border-white"
                          : "border-black/20 opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Garment Drape Mode: Opaque Clothes vs Translucent Fit Guide */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">Cloth View:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] font-medium"
                  onClick={handleOpaqueToggle}
                >
                  {isOpaqueGarment ? "👔 Actual Fabric" : "🔍 Fit X-Ray"}
                </Button>
              </div>

              {/* Fabric Weave */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">Fabric Material:</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["cotton", "wool", "silk", "linen", "denim"] as FabricType[]).map((f) => (
                    <Button
                      key={f}
                      variant={fabricType === f ? "default" : "outline"}
                      size="sm"
                      className="h-5 px-1 text-[9px] capitalize"
                      onClick={() => handleFabricTypeChange(f)}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fabric Color Swatches */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">Fabric Color:</span>
                <div className="flex flex-wrap gap-1 items-center">
                  {FABRIC_COLORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => handleColorChange(c.color)}
                      title={c.label}
                      style={{ backgroundColor: `#${c.color.toString(16).padStart(6, "0")}` }}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        garmentColor === c.color
                          ? "ring-2 ring-primary ring-offset-1 scale-110 border-white"
                          : "border-black/20 opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Top-Right View Presets Gizmo */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/85 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-md z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] font-semibold"
            title="Front View"
            onClick={() => setView("front")}
          >
            Front
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] font-semibold"
            title="Side Profile"
            onClick={() => setView("right")}
          >
            Side
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] font-semibold"
            title="Back View"
            onClick={() => setView("back")}
          >
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] font-semibold"
            title="Isometric 3/4 View"
            onClick={() => setView("iso")}
          >
            3/4
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Reset Camera"
            onClick={resetCamera}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Floating Bottom Center Helper & Turntable Toggle */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/70 text-[11px] text-muted-foreground shadow-sm pointer-events-auto">
            <Sparkles className="h-3 w-3 text-primary shrink-0 animate-pulse" />
            <span>Click any body part or guide loop to focus & edit measurement</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              className="h-7 text-[11px] font-semibold bg-background/90 backdrop-blur-md shadow-sm gap-1"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              <Compass className={`h-3.5 w-3.5 ${autoRotate ? "animate-spin" : ""}`} />
              <span>360° Rotate</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

BodyMannequin3D.displayName = "BodyMannequin3D"
