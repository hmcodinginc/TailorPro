import * as THREE from "three"
import { STANDARD_SIZES, FitType, FIT_ALLOWANCE } from "./measurementDimensions"

export type ThemeStyle = "tailor" | "wireframe" | "slate" | "ivory"

export interface MannequinSceneHierarchy {
  rootGroup: THREE.Group
  mannequinGroup: THREE.Group
  garmentGroup: THREE.Group
  guidesGroup: THREE.Group
  standGroup: THREE.Group
  materials: {
    mannequinMat: THREE.MeshStandardMaterial
    accentMat: THREE.MeshStandardMaterial
    woodMat: THREE.MeshStandardMaterial
    metalMat: THREE.MeshStandardMaterial
    garmentMat: THREE.MeshStandardMaterial
    guideMat: THREE.MeshBasicMaterial
    guideActiveMat: THREE.MeshBasicMaterial
    guideHighlightMat: THREE.MeshBasicMaterial
    seamMat?: THREE.MeshStandardMaterial
    buttonMat?: THREE.MeshStandardMaterial
  }
  meshRefs: Record<string, THREE.Object3D>
}

export interface GuideAnchor {
  key: string
  label: string
  position: THREE.Vector3
  radius: number
  orientation?: "horizontal" | "vertical" | "line"
  lineEnd?: THREE.Vector3
}

// -------------------------------------------------------------
// Helper: Normalize Measurement Keys from Any Form / Garment
// -------------------------------------------------------------
export function normalizeMeasurementValues(
  raw: Record<string, any> | undefined,
  gender: "Men" | "Women"
): Record<string, number> {
  const isWomen = gender === "Women"
  const defaultSize = STANDARD_SIZES[isWomen ? "Women" : "Men"].M

  const getNum = (keys: string[], fallback: number): number => {
    if (!raw) return fallback
    for (const k of keys) {
      const v = raw[k]
      if (v !== undefined && v !== null && v !== "") {
        const parsed = parseFloat(String(v))
        if (!isNaN(parsed) && parsed > 0) return parsed
      }
    }
    return fallback
  }

  return {
    chest: getNum(["bust", "chest", "upper_chest"], defaultSize.chest),
    waist: getNum(["waist", "waist_round"], defaultSize.waist),
    hip: getNum(["hip", "hip_round", "hips"], defaultSize.hip),
    shoulder: getNum(["shoulder", "shoulder_width"], defaultSize.shoulder),
    neck: getNum(["collar", "neck", "neck_size", "neck_round"], defaultSize.neck),
    sleeve_length: getNum(["sleeve_length", "sleeve"], defaultSize.sleeve_length),
    sleeve_round: getNum(["sleeve_round", "wrist", "cuff"], defaultSize.wrist),
    length: getNum(["length", "total_length", "shirt_length", "kurta_length", "coat_length"], 28),
    thigh: getNum(["thigh", "thigh_round"], defaultSize.thigh),
    knee: getNum(["knee", "knee_round"], defaultSize.knee),
    calf: getNum(["calf", "calf_round"], defaultSize.calf),
    ankle: getNum(["ankle", "ankle_round", "bottom_round"], 14),
    inseam: getNum(["inseam", "inseam_length"], defaultSize.inseam),
    rise: getNum(["rise", "crotch_depth"], defaultSize.rise),
    height: getNum(["height"], defaultSize.height),
  }
}

// -------------------------------------------------------------
// Material Factory: Haute-Couture Atelier Style
// -------------------------------------------------------------
export function createMannequinMaterials(theme: ThemeStyle = "tailor", isWireframe: boolean = false) {
  // 1. Luxury Bespoke Atelier Linen Canvas (Warm Ecru)
  let mannequinColor = 0xf6f1ea
  let roughness = 0.82
  let metalness = 0.04
  let accentColor = 0xd4af37 // Polished Champagne Brass
  let woodColor = 0x2d1a12 // Vintage Dark Walnut
  let metalColor = 0x94a3b8 // Brushed Stainless Steel
  let seamColor = 0x334155 // Classic French Seam Ribbon Tape

  // Crisp White Tailored Oxford Cloth with Soft Satin Sheen
  let garmentColor = 0xf8fafc
  let garmentRoughness = 0.72
  let garmentMetalness = 0.03
  let garmentOpacity = 0.98

  if (theme === "slate") {
    mannequinColor = 0x1e293b // Dark Charcoal Atelier
    roughness = 0.6
    metalness = 0.1
    accentColor = 0x38bdf8
    woodColor = 0x0f172a
    metalColor = 0x64748b
    seamColor = 0x0284c7
    garmentColor = 0x38bdf8
    garmentOpacity = 0.95
  } else if (theme === "ivory") {
    mannequinColor = 0xffffff // Pure Ivory Silk
    roughness = 0.4
    metalness = 0.05
    accentColor = 0xf59e0b
    woodColor = 0xd97706
    metalColor = 0xf59e0b
    seamColor = 0xb45309
    garmentColor = 0x6366f1
    garmentOpacity = 0.95
  } else if (theme === "wireframe") {
    mannequinColor = 0x090d16
    roughness = 0.1
    metalness = 0.85
    accentColor = 0x06b6d4
    woodColor = 0x090d16
    metalColor = 0x06b6d4
    seamColor = 0x0284c7
    garmentColor = 0x06b6d4
    garmentOpacity = 0.6
  }

  const mannequinMat = new THREE.MeshStandardMaterial({
    color: mannequinColor,
    roughness,
    metalness,
    wireframe: isWireframe || theme === "wireframe",
    side: THREE.DoubleSide,
  })

  const seamMat = new THREE.MeshStandardMaterial({
    color: seamColor,
    roughness: 0.6,
    metalness: 0.1,
  })

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.25,
    metalness: 0.85, // Gold / brass polish
  })

  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.35,
    metalness: 0.05,
  })

  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.2,
    metalness: 0.9,
  })

  const garmentMat = new THREE.MeshStandardMaterial({
    color: garmentColor,
    roughness: garmentRoughness,
    metalness: garmentMetalness,
    side: THREE.DoubleSide,
    transparent: garmentOpacity < 1,
    opacity: garmentOpacity,
  })

  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Mother of Pearl
    roughness: 0.25,
    metalness: 0.15,
  })

  // Measurement Guide Tape Rings
  const guideMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.8,
  })

  const guideActiveMat = new THREE.MeshBasicMaterial({
    color: 0xef4444, // Glowing Active Red
    transparent: true,
    opacity: 0.95,
  })

  const guideHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b, // Amber Gold
    transparent: true,
    opacity: 0.9,
  })

  return {
    mannequinMat,
    seamMat,
    accentMat,
    woodMat,
    metalMat,
    garmentMat,
    buttonMat,
    guideMat,
    guideActiveMat,
    guideHighlightMat,
  }
}

// -------------------------------------------------------------
// Bespoke Atelier Dress Form Builder
// -------------------------------------------------------------
export function buildParametricMannequin(
  gender: "Men" | "Women" = "Men",
  theme: ThemeStyle = "tailor",
  isWireframe: boolean = false
): MannequinSceneHierarchy {
  const rootGroup = new THREE.Group()
  rootGroup.name = "MannequinRoot"

  const mannequinGroup = new THREE.Group()
  mannequinGroup.name = "MannequinBody"
  rootGroup.add(mannequinGroup)

  const garmentGroup = new THREE.Group()
  garmentGroup.name = "GarmentOverlay"
  rootGroup.add(garmentGroup)

  const guidesGroup = new THREE.Group()
  guidesGroup.name = "MeasurementGuides"
  rootGroup.add(guidesGroup)

  const standGroup = new THREE.Group()
  standGroup.name = "TailorStand"
  rootGroup.add(standGroup)

  const materials = createMannequinMaterials(theme, isWireframe)
  const meshRefs: Record<string, THREE.Object3D> = {}

  const isWomen = gender === "Women"

  // -----------------------------------------------------------
  // 1. Turned Finial Cap & Sculpted Neck
  // -----------------------------------------------------------
  const headNeckGroup = new THREE.Group()
  headNeckGroup.position.set(0, 1.52, 0)
  headNeckGroup.name = "headNeckGroup"
  meshRefs["headNeckGroup"] = headNeckGroup
  mannequinGroup.add(headNeckGroup)

  // Brass Neck Ring Collar
  const brassRingGeo = new THREE.CylinderGeometry(0.052, 0.056, 0.015, 32)
  const brassRing = new THREE.Mesh(brassRingGeo, materials.accentMat)
  brassRing.position.set(0, 0.055, 0)
  headNeckGroup.add(brassRing)

  // Turned Wooden Finial Top (Bespoke Atelier Crown)
  const finialGeo = new THREE.CylinderGeometry(0.024, 0.048, 0.065, 32)
  const finial = new THREE.Mesh(finialGeo, materials.woodMat)
  finial.position.set(0, 0.095, 0)
  finial.castShadow = true
  headNeckGroup.add(finial)

  const finialBallGeo = new THREE.SphereGeometry(0.026, 24, 18)
  const finialBall = new THREE.Mesh(finialBallGeo, materials.accentMat)
  finialBall.position.set(0, 0.14, 0)
  headNeckGroup.add(finialBall)

  // Smooth Elegant Neck
  const neckRadius = isWomen ? 0.048 : 0.056
  const neckGeo = new THREE.CylinderGeometry(neckRadius * 0.94, neckRadius * 1.08, 0.12, 32)
  const neckMesh = new THREE.Mesh(neckGeo, materials.mannequinMat)
  neckMesh.position.set(0, -0.04, 0)
  neckMesh.castShadow = true
  neckMesh.userData = { fieldKey: "neck", partName: "Neck / Collar" }
  headNeckGroup.add(neckMesh)
  meshRefs["neckMesh"] = neckMesh

  // -----------------------------------------------------------
  // 2. Continuous Sculpted Torso (Chest, Bust, Waist, Hips)
  // -----------------------------------------------------------
  const torsoGroup = new THREE.Group()
  torsoGroup.position.set(0, 1.18, 0)
  torsoGroup.name = "torsoGroup"
  meshRefs["torsoGroup"] = torsoGroup
  mannequinGroup.add(torsoGroup)

  // Upper Chest / Shoulders Clavicle
  const chestRadiusX = isWomen ? 0.175 : 0.205
  const chestRadiusZ = isWomen ? 0.142 : 0.135
  const upperChestGeo = new THREE.CylinderGeometry(chestRadiusX * 0.88, chestRadiusX, 0.22, 36)
  upperChestGeo.scale(1.12, 1, chestRadiusZ / chestRadiusX)
  const upperChestMesh = new THREE.Mesh(upperChestGeo, materials.mannequinMat)
  upperChestMesh.position.set(0, 0.15, 0)
  upperChestMesh.castShadow = true
  upperChestMesh.userData = { fieldKey: "chest", partName: "Chest / Bust" }
  torsoGroup.add(upperChestMesh)
  meshRefs["upperChestMesh"] = upperChestMesh

  // Female Bust Contours (Soft and Realistic)
  if (isWomen) {
    const bustLGeo = new THREE.SphereGeometry(0.075, 28, 20)
    bustLGeo.scale(1.05, 0.95, 1.18)
    const bustL = new THREE.Mesh(bustLGeo, materials.mannequinMat)
    bustL.position.set(-0.068, 0.14, 0.078)
    bustL.castShadow = true
    bustL.userData = { fieldKey: "chest", partName: "Bust" }
    torsoGroup.add(bustL)
    meshRefs["bustL"] = bustL

    const bustR = new THREE.Mesh(bustLGeo, materials.mannequinMat)
    bustR.position.set(0.068, 0.14, 0.078)
    bustR.castShadow = true
    bustR.userData = { fieldKey: "chest", partName: "Bust" }
    torsoGroup.add(bustR)
    meshRefs["bustR"] = bustR
  }

  // Natural Contoured Waist
  const waistRadiusX = isWomen ? 0.135 : 0.168
  const waistRadiusZ = isWomen ? 0.105 : 0.125
  const midTorsoGeo = new THREE.CylinderGeometry(chestRadiusX, waistRadiusX, 0.18, 36)
  midTorsoGeo.scale(1.1, 1, waistRadiusZ / waistRadiusX)
  const midTorsoMesh = new THREE.Mesh(midTorsoGeo, materials.mannequinMat)
  midTorsoMesh.position.set(0, -0.04, 0)
  midTorsoMesh.castShadow = true
  midTorsoMesh.userData = { fieldKey: "waist", partName: "Waist" }
  torsoGroup.add(midTorsoMesh)
  meshRefs["midTorsoMesh"] = midTorsoMesh

  // Flared Pelvis / Hips
  const hipRadiusX = isWomen ? 0.188 : 0.182
  const hipRadiusZ = isWomen ? 0.145 : 0.132
  const pelvisGeo = new THREE.CylinderGeometry(waistRadiusX, hipRadiusX, 0.24, 36)
  pelvisGeo.scale(1.14, 1, hipRadiusZ / hipRadiusX)
  const pelvisMesh = new THREE.Mesh(pelvisGeo, materials.mannequinMat)
  pelvisMesh.position.set(0, -0.24, 0)
  pelvisMesh.castShadow = true
  pelvisMesh.userData = { fieldKey: "hip", partName: "Hips" }
  torsoGroup.add(pelvisMesh)
  meshRefs["pelvisMesh"] = pelvisMesh

  // -----------------------------------------------------------
  // Bespoke French Seam Ribbon Lines (Atelier Signature)
  // -----------------------------------------------------------
  if (materials.seamMat) {
    // 1. Center Front Vertical Tape
    const centerFrontGeo = new THREE.BoxGeometry(0.005, 0.62, 0.006)
    const centerFront = new THREE.Mesh(centerFrontGeo, materials.seamMat)
    centerFront.position.set(0, 0, chestRadiusZ * 1.08)
    torsoGroup.add(centerFront)
    meshRefs["centerFront"] = centerFront

    // 2. Horizontal Waistline Ribbon Tape
    const waistTapeGeo = new THREE.TorusGeometry(waistRadiusX * 1.02, 0.0035, 12, 48)
    waistTapeGeo.rotateX(Math.PI / 2)
    waistTapeGeo.scale(1.1, waistRadiusZ / waistRadiusX, 1)
    const waistTape = new THREE.Mesh(waistTapeGeo, materials.seamMat)
    waistTape.position.set(0, -0.12, 0)
    torsoGroup.add(waistTape)
    meshRefs["waistTape"] = waistTape

    // 3. Horizontal Hipline Ribbon Tape
    const hipTapeGeo = new THREE.TorusGeometry(hipRadiusX * 1.02, 0.0035, 12, 48)
    hipTapeGeo.rotateX(Math.PI / 2)
    hipTapeGeo.scale(1.12, hipRadiusZ / hipRadiusX, 1)
    const hipTape = new THREE.Mesh(hipTapeGeo, materials.seamMat)
    hipTape.position.set(0, -0.34, 0)
    torsoGroup.add(hipTape)
    meshRefs["hipTape"] = hipTape
  }

  // -----------------------------------------------------------
  // 3. Articulated Atelier Arms & Wooden Shoulder Caps
  // -----------------------------------------------------------
  const armSpan = isWomen ? 0.215 : 0.252

  // Left Arm Group
  const armLGroup = new THREE.Group()
  armLGroup.position.set(-armSpan, 1.36, 0)
  armLGroup.name = "armLGroup"
  meshRefs["armLGroup"] = armLGroup
  mannequinGroup.add(armLGroup)

  // Turned Wooden Shoulder Joint Cap
  const shoulderCapGeo = new THREE.CylinderGeometry(0.042, 0.046, 0.025, 24)
  shoulderCapGeo.rotateZ(Math.PI / 2)
  const shoulderCapL = new THREE.Mesh(shoulderCapGeo, materials.woodMat)
  armLGroup.add(shoulderCapL)

  // Upper Arm (Bicep)
  const bicepRadius = isWomen ? 0.038 : 0.045
  const upperArmGeo = new THREE.CylinderGeometry(bicepRadius * 1.05, bicepRadius * 0.9, 0.28, 20)
  const upperArmL = new THREE.Mesh(upperArmGeo, materials.mannequinMat)
  upperArmL.position.set(-0.015, -0.15, 0)
  upperArmL.rotation.z = -0.06
  upperArmL.castShadow = true
  upperArmL.userData = { fieldKey: "sleeve_length", partName: "Left Arm" }
  armLGroup.add(upperArmL)

  // Wooden Elbow Joint Ball
  const elbowGeo = new THREE.SphereGeometry(bicepRadius * 0.85, 16, 12)
  const elbowL = new THREE.Mesh(elbowGeo, materials.woodMat)
  elbowL.position.set(-0.024, -0.3, 0)
  armLGroup.add(elbowL)

  // Forearm & Wrist
  const forearmGeo = new THREE.CylinderGeometry(bicepRadius * 0.85, bicepRadius * 0.65, 0.26, 20)
  const forearmL = new THREE.Mesh(forearmGeo, materials.mannequinMat)
  forearmL.position.set(-0.028, -0.44, 0)
  forearmL.rotation.z = -0.04
  forearmL.castShadow = true
  armLGroup.add(forearmL)
  meshRefs["forearmL"] = forearmL

  // Stylized Wooden Hand
  const handL = buildStylizedAtelierHand(materials.woodMat, "left")
  handL.position.set(-0.032, -0.58, 0)
  armLGroup.add(handL)

  // Right Arm Group
  const armRGroup = new THREE.Group()
  armRGroup.position.set(armSpan, 1.36, 0)
  armRGroup.name = "armRGroup"
  meshRefs["armRGroup"] = armRGroup
  mannequinGroup.add(armRGroup)

  const shoulderCapR = new THREE.Mesh(shoulderCapGeo, materials.woodMat)
  armRGroup.add(shoulderCapR)

  const upperArmR = new THREE.Mesh(upperArmGeo, materials.mannequinMat)
  upperArmR.position.set(0.015, -0.15, 0)
  upperArmR.rotation.z = 0.06
  upperArmR.castShadow = true
  upperArmR.userData = { fieldKey: "sleeve_length", partName: "Right Arm" }
  armRGroup.add(upperArmR)

  const elbowR = new THREE.Mesh(elbowGeo, materials.woodMat)
  elbowR.position.set(0.024, -0.3, 0)
  armRGroup.add(elbowR)

  const forearmR = new THREE.Mesh(forearmGeo, materials.mannequinMat)
  forearmR.position.set(0.028, -0.44, 0)
  forearmR.rotation.z = 0.04
  forearmR.castShadow = true
  armRGroup.add(forearmR)
  meshRefs["forearmR"] = forearmR

  const handR = buildStylizedAtelierHand(materials.woodMat, "right")
  handR.position.set(0.032, -0.58, 0)
  armRGroup.add(handR)

  // -----------------------------------------------------------
  // 4. Mannequin Stand Base & Upright Rod (Savile Row Atelier Pedestal)
  // -----------------------------------------------------------
  const baseGroup = new THREE.Group()
  standGroup.add(baseGroup)

  // Heavy Cast Pedestal Disk / Brass Trim
  const baseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.04, 36)
  const baseMesh = new THREE.Mesh(baseGeo, materials.woodMat)
  baseMesh.position.set(0, 0.02, 0)
  baseMesh.receiveShadow = true
  baseGroup.add(baseMesh)

  const baseRingGeo = new THREE.CylinderGeometry(0.282, 0.285, 0.015, 36)
  const baseRing = new THREE.Mesh(baseRingGeo, materials.accentMat)
  baseRing.position.set(0, 0.008, 0)
  baseGroup.add(baseRing)

  // Polished Stainless / Brass Telescoping Rod
  const poleGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.0, 24)
  const pole = new THREE.Mesh(poleGeo, materials.metalMat)
  pole.position.set(0, 0.52, 0)
  pole.castShadow = true
  baseGroup.add(pole)

  // Vintage Height Adjustment Knob
  const knobGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.035, 16)
  const knob = new THREE.Mesh(knobGeo, materials.accentMat)
  knob.position.set(0, 0.58, 0.018)
  knob.rotateX(Math.PI / 2)
  baseGroup.add(knob)

  // Soft Contact Floor Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowCanvas = document.createElement("canvas")
  shadowCanvas.width = 128
  shadowCanvas.height = 128
  const sctx = shadowCanvas.getContext("2d")!
  const gradient = sctx.createRadialGradient(64, 64, 4, 64, 64, 60)
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.35)")
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.12)")
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, 128, 128)

  const shadowTex = new THREE.CanvasTexture(shadowCanvas)
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  })
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
  shadowMesh.position.set(0, 0.002, 0)
  standGroup.add(shadowMesh)

  return {
    rootGroup,
    mannequinGroup,
    garmentGroup,
    guidesGroup,
    standGroup,
    materials,
    meshRefs,
  }
}

// -------------------------------------------------------------
// Helper: Stylized Atelier Wooden Hand
// -------------------------------------------------------------
function buildStylizedAtelierHand(woodMat: THREE.Material, side: "left" | "right"): THREE.Group {
  const hand = new THREE.Group()

  // Palm
  const palmGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.065, 16)
  palmGeo.scale(1, 1, 0.55)
  const palm = new THREE.Mesh(palmGeo, woodMat)
  palm.castShadow = true
  hand.add(palm)

  // Gentle fingers block
  const fingersGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.045, 16)
  fingersGeo.scale(1, 1, 0.5)
  const fingers = new THREE.Mesh(fingersGeo, woodMat)
  fingers.position.set(0, -0.045, 0)
  hand.add(fingers)

  // Thumb
  const thumbGeo = new THREE.CylinderGeometry(0.006, 0.007, 0.03, 8)
  const thumb = new THREE.Mesh(thumbGeo, woodMat)
  const thumbX = side === "left" ? 0.018 : -0.018
  thumb.position.set(thumbX, -0.015, 0.01)
  thumb.rotateZ(side === "left" ? -0.3 : 0.3)
  hand.add(thumb)

  return hand
}

// -------------------------------------------------------------
// Real-Time Morphing & Dynamic Parametric Updates
// -------------------------------------------------------------
export function updateMannequinTransforms(
  hierarchy: MannequinSceneHierarchy,
  measurements: Record<string, number>,
  gender: "Men" | "Women" = "Men",
  garmentType: string = "Shirt",
  fitType: FitType = "regular"
): GuideAnchor[] {
  const isWomen = gender === "Women"
  const defaultSize = STANDARD_SIZES[isWomen ? "Women" : "Men"].M
  const ease = FIT_ALLOWANCE[fitType]

  // Extract normalized values
  const getVal = (k: string) => {
    const raw = measurements[k] ?? defaultSize[k] ?? 36
    return Math.max(1, raw)
  }

  const neck = getVal("neck")
  const shoulder = getVal("shoulder")
  const chest = getVal("chest") + ease.chestEase
  const waist = getVal("waist") + ease.waistEase
  const hip = getVal("hip") + ease.hipEase
  const sleeve_length = getVal("sleeve_length") + ease.sleeveEase
  const height = getVal("height")

  // Relative scaling ratios vs standard Medium
  const neckRatio = THREE.MathUtils.clamp(neck / defaultSize.neck, 0.8, 1.4)
  const shoulderRatio = THREE.MathUtils.clamp(shoulder / defaultSize.shoulder, 0.8, 1.4)
  const chestRatio = THREE.MathUtils.clamp(chest / defaultSize.chest, 0.75, 1.5)
  const waistRatio = THREE.MathUtils.clamp(waist / defaultSize.waist, 0.75, 1.5)
  const hipRatio = THREE.MathUtils.clamp(hip / defaultSize.hip, 0.75, 1.5)
  const sleeveRatio = THREE.MathUtils.clamp(sleeve_length / defaultSize.sleeve_length, 0.75, 1.4)
  const heightRatio = THREE.MathUtils.clamp(height / defaultSize.height, 0.85, 1.25)

  const refs = hierarchy.meshRefs

  // 1. Overall stature scaling
  hierarchy.mannequinGroup.scale.set(1, heightRatio, 1)

  // 2. Neck morph
  if (refs["neckMesh"]) {
    refs["neckMesh"].scale.set(neckRatio, 1, neckRatio)
  }

  // 3. Torso Morphing (Chest, Bust, Waist, Hips)
  if (refs["upperChestMesh"]) {
    refs["upperChestMesh"].scale.set(shoulderRatio * 0.45 + chestRatio * 0.55, 1, chestRatio)
  }
  if (refs["bustL"] && refs["bustR"]) {
    refs["bustL"].scale.set(chestRatio, chestRatio, chestRatio * 1.1)
    refs["bustR"].scale.set(chestRatio, chestRatio, chestRatio * 1.1)
  }
  if (refs["midTorsoMesh"]) {
    refs["midTorsoMesh"].scale.set(waistRatio, 1, waistRatio)
  }
  if (refs["waistTape"]) {
    refs["waistTape"].scale.set(waistRatio, 1, waistRatio)
  }
  if (refs["pelvisMesh"]) {
    refs["pelvisMesh"].scale.set(hipRatio, 1, hipRatio)
  }
  if (refs["hipTape"]) {
    refs["hipTape"].scale.set(hipRatio, 1, hipRatio)
  }
  if (refs["centerFront"]) {
    refs["centerFront"].scale.set(1, 1, chestRatio)
  }

  // 4. Arms Morphing (Shoulder Span & Sleeve Length)
  const defaultSpan = isWomen ? 0.215 : 0.252
  const newArmSpan = defaultSpan * shoulderRatio

  if (refs["armLGroup"]) {
    refs["armLGroup"].position.x = -newArmSpan
    refs["armLGroup"].scale.set(1, sleeveRatio, 1)
  }
  if (refs["armRGroup"]) {
    refs["armRGroup"].position.x = newArmSpan
    refs["armRGroup"].scale.set(1, sleeveRatio, 1)
  }

  // 5. Dynamic 3D Guide Anchors (Measuring Tape Rings)
  const chestHeight = 1.33 * heightRatio
  const waistHeight = 1.06 * heightRatio
  const hipHeight = 0.84 * heightRatio

  const anchors: GuideAnchor[] = [
    {
      key: "collar",
      label: "Neck / Collar",
      position: new THREE.Vector3(0, 1.48 * heightRatio, 0),
      radius: (isWomen ? 0.052 : 0.058) * neckRatio,
      orientation: "horizontal",
    },
    {
      key: "neck",
      label: "Neck Size",
      position: new THREE.Vector3(0, 1.48 * heightRatio, 0),
      radius: (isWomen ? 0.052 : 0.058) * neckRatio,
      orientation: "horizontal",
    },
    {
      key: "shoulder",
      label: "Shoulder Span",
      position: new THREE.Vector3(0, 1.37 * heightRatio, 0),
      radius: newArmSpan,
      orientation: "line",
      lineEnd: new THREE.Vector3(newArmSpan, 1.37 * heightRatio, 0),
    },
    {
      key: "bust",
      label: "Bust / Chest",
      position: new THREE.Vector3(0, chestHeight, 0),
      radius: (isWomen ? 0.18 : 0.21) * chestRatio,
      orientation: "horizontal",
    },
    {
      key: "chest",
      label: "Chest Round",
      position: new THREE.Vector3(0, chestHeight, 0),
      radius: (isWomen ? 0.18 : 0.21) * chestRatio,
      orientation: "horizontal",
    },
    {
      key: "waist",
      label: "Waist Round",
      position: new THREE.Vector3(0, waistHeight, 0),
      radius: (isWomen ? 0.14 : 0.17) * waistRatio,
      orientation: "horizontal",
    },
    {
      key: "hip",
      label: "Hip Round",
      position: new THREE.Vector3(0, hipHeight, 0),
      radius: (isWomen ? 0.19 : 0.185) * hipRatio,
      orientation: "horizontal",
    },
    {
      key: "sleeve_length",
      label: "Sleeve Length",
      position: new THREE.Vector3(-newArmSpan, 1.36 * heightRatio, 0),
      radius: 0.55 * sleeveRatio,
      orientation: "line",
      lineEnd: new THREE.Vector3(-newArmSpan, (1.36 - 0.55 * sleeveRatio) * heightRatio, 0),
    },
    {
      key: "length",
      label: "Garment Length",
      position: new THREE.Vector3(0.18, 1.38 * heightRatio, 0),
      radius: 0.65,
      orientation: "line",
      lineEnd: new THREE.Vector3(0.18, (1.38 - 0.65) * heightRatio, 0),
    },
  ]

  return anchors
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// High-End Fitted 3D Garment Generator (Accurate Tailoring Specs)
// -------------------------------------------------------------
export function buildGarmentOverlayMesh(
  garmentType: string,
  gender: "Men" | "Women",
  materials: MannequinSceneHierarchy["materials"],
  measurements: Record<string, number>,
  customGarmentMat?: THREE.Material
): THREE.Group {
  const garmentGroup = new THREE.Group()
  garmentGroup.name = "FittedTailoredGarment"

  const gMat = customGarmentMat || materials.garmentMat
  const isWomen = gender === "Women"
  const cleanType = (garmentType || "Shirt").toLowerCase().replace(/[^a-z0-9]/g, "")

  const baseSize = STANDARD_SIZES[isWomen ? "Women" : "Men"].M

  const chest = measurements.chest || baseSize.chest
  const waist = measurements.waist || baseSize.waist
  const hip = measurements.hip || baseSize.hip
  const shoulder = measurements.shoulder || baseSize.shoulder
  const neck = measurements.neck || baseSize.neck
  const sleeve = measurements.sleeve_length || baseSize.sleeve_length
  const lengthVal = measurements.length || (cleanType.includes("kurta") ? 42 : cleanType.includes("dress") || cleanType.includes("gown") ? 52 : cleanType.includes("anarkali") ? 48 : 28)

  const chestScale = chest / baseSize.chest
  const waistScale = waist / baseSize.waist
  const hipScale = hip / baseSize.hip
  const shoulderScale = shoulder / baseSize.shoulder
  const neckScale = neck / baseSize.neck
  const sleeveScale = sleeve / baseSize.sleeve_length

  // Radii closely hug the dress form with a clean ease allowance
  const chestR = (isWomen ? 0.182 : 0.212) * chestScale
  const waistR = (isWomen ? 0.142 : 0.176) * waistScale
  const hipR = (isWomen ? 0.196 : 0.190) * hipScale
  const armSpan = (isWomen ? 0.215 : 0.252) * shoulderScale

  // ===========================================================
  // 1. SAREE BLOUSE / CROP TOP (Fitted short cropped upper bodice)
  // ===========================================================
  if (cleanType.includes("sareeblouse") || cleanType.includes("crop") || cleanType === "blouse") {
    const blouse = new THREE.Group()
    blouse.name = "SareeBlouse"

    // Cropped fitted bodice
    const bodiceGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.01, 0.26, 36)
    bodiceGeo.scale(1.12, 1, 0.84)
    const bodice = new THREE.Mesh(bodiceGeo, gMat)
    bodice.position.set(0, 1.30, 0)
    bodice.castShadow = true
    blouse.add(bodice)

    // Deep Sweetheart Neckline Trim
    const neckTrimGeo = new THREE.TorusGeometry(0.068 * neckScale, 0.008, 12, 32)
    neckTrimGeo.rotateX(Math.PI / 2.2)
    const neckTrim = new THREE.Mesh(neckTrimGeo, materials.accentMat || gMat)
    neckTrim.position.set(0, 1.40, 0.03)
    blouse.add(neckTrim)

    // Short Fitted Sleeves
    const shortArmLen = 0.16 * sleeveScale
    const sleeveR = 0.044 * chestScale
    const sleeveGeo = new THREE.CylinderGeometry(sleeveR * 1.02, sleeveR * 0.9, shortArmLen, 24)

    const sleeveL = new THREE.Mesh(sleeveGeo, gMat)
    sleeveL.position.set(-armSpan - 0.015, 1.36 - shortArmLen * 0.5, 0)
    sleeveL.rotation.z = -0.06
    blouse.add(sleeveL)

    const sleeveRMesh = new THREE.Mesh(sleeveGeo, gMat)
    sleeveRMesh.position.set(armSpan + 0.015, 1.36 - shortArmLen * 0.5, 0)
    sleeveRMesh.rotation.z = 0.06
    blouse.add(sleeveRMesh)

    garmentGroup.add(blouse)
  }

  // ===========================================================
  // 2. T-SHIRT / TEE / POLO
  // ===========================================================
  else if (cleanType.includes("tshirt") || cleanType.includes("tee") || cleanType.includes("polo")) {
    const tee = new THREE.Group()
    tee.name = "TShirt"

    // Casual Torso Body
    const bodyGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.04, 0.54, 36)
    bodyGeo.scale(1.13, 1, 0.84)
    const body = new THREE.Mesh(bodyGeo, gMat)
    body.position.set(0, 1.18, 0)
    body.castShadow = true
    tee.add(body)

    // Ribbed Crewneck Collar Ring
    const collarGeo = new THREE.TorusGeometry(0.062 * neckScale, 0.012, 12, 36)
    collarGeo.rotateX(Math.PI / 2)
    const collar = new THREE.Mesh(collarGeo, gMat)
    collar.position.set(0, 1.45, 0.005)
    tee.add(collar)

    // Half Sleeves
    const halfArmLen = 0.24 * sleeveScale
    const sR = 0.048 * chestScale
    const sGeo = new THREE.CylinderGeometry(sR * 1.02, sR * 0.92, halfArmLen, 24)

    const sL = new THREE.Mesh(sGeo, gMat)
    sL.position.set(-armSpan - 0.018, 1.36 - halfArmLen * 0.5, 0)
    sL.rotation.z = -0.08
    tee.add(sL)

    const sRMesh = new THREE.Mesh(sGeo, gMat)
    sRMesh.position.set(armSpan + 0.018, 1.36 - halfArmLen * 0.5, 0)
    sRMesh.rotation.z = 0.08
    tee.add(sRMesh)

    garmentGroup.add(tee)
  }

  // ===========================================================
  // 3. NEHRU JACKET / WAISTCOAT / VEST
  // ===========================================================
  else if (cleanType.includes("nehru") || cleanType.includes("waistcoat") || cleanType.includes("vest")) {
    const vest = new THREE.Group()
    vest.name = "NehruJacket"

    // Mandarin Stand Collar
    const mandarinGeo = new THREE.CylinderGeometry(0.056 * neckScale, 0.058 * neckScale, 0.035, 32)
    const mandarin = new THREE.Mesh(mandarinGeo, gMat)
    mandarin.position.set(0, 1.46, 0)
    vest.add(mandarin)

    // Fitted Sleeveless Vest Torso
    const vestBodyGeo = new THREE.CylinderGeometry(chestR * 1.03, waistR * 1.04, 0.50, 36)
    vestBodyGeo.scale(1.14, 1, 0.85)
    const vestBody = new THREE.Mesh(vestBodyGeo, gMat)
    vestBody.position.set(0, 1.20, 0)
    vestBody.castShadow = true
    vest.add(vestBody)

    // Angled Cut Waistcoat Hem
    const hemGeo = new THREE.CylinderGeometry(waistR * 1.04, hipR * 1.03, 0.12, 36)
    hemGeo.scale(1.14, 1, 0.86)
    const hem = new THREE.Mesh(hemGeo, gMat)
    hem.position.set(0, 0.94, 0)
    vest.add(hem)

    // Front Metallic Button Placket
    const placketGeo = new THREE.BoxGeometry(0.022, 0.56, 0.006)
    const placket = new THREE.Mesh(placketGeo, materials.accentMat || gMat)
    placket.position.set(0, 1.18, chestR * 0.84 + 0.005)
    vest.add(placket)

    // 6 Gold / Metallic Buttons
    const btnGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 16)
    btnGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 6; i++) {
      const btn = new THREE.Mesh(btnGeo, materials.accentMat || materials.buttonMat || gMat)
      btn.position.set(0, 1.40 - i * 0.085, chestR * 0.84 + 0.009)
      vest.add(btn)
    }

    // Breast Pocket Welt
    const weltGeo = new THREE.BoxGeometry(0.044, 0.008, 0.005)
    const welt = new THREE.Mesh(weltGeo, materials.accentMat || gMat)
    welt.position.set(-0.08, 1.28, chestR * 0.82 + 0.004)
    vest.add(welt)

    garmentGroup.add(vest)
  }

  // ===========================================================
  // 4. LEHENGA / CIRCULAR SKIRT
  // ===========================================================
  else if (cleanType.includes("lehenga") || cleanType === "skirt") {
    const lehenga = new THREE.Group()
    lehenga.name = "Lehenga"

    // Fitted Choli Top
    const choliGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.01, 0.28, 36)
    choliGeo.scale(1.12, 1, 0.84)
    const choli = new THREE.Mesh(choliGeo, gMat)
    choli.position.set(0, 1.29, 0)
    lehenga.add(choli)

    // Dramatic Flared Umbrella Lehenga Skirt
    const skirtGeo = new THREE.ConeGeometry(0.58 * hipScale, 1.08, 48, 1, true)
    const skirt = new THREE.Mesh(skirtGeo, gMat)
    skirt.position.set(0, 0.48, 0)
    skirt.castShadow = true
    lehenga.add(skirt)

    // Gold Ornate Waistband & Border
    const bandGeo = new THREE.CylinderGeometry(waistR * 1.04, waistR * 1.06, 0.06, 36)
    bandGeo.scale(1.14, 1, 0.86)
    const band = new THREE.Mesh(bandGeo, materials.accentMat || gMat)
    band.position.set(0, 0.98, 0)
    lehenga.add(band)

    const borderGeo = new THREE.TorusGeometry(0.56 * hipScale, 0.015, 12, 48)
    borderGeo.rotateX(Math.PI / 2)
    const border = new THREE.Mesh(borderGeo, materials.accentMat || gMat)
    border.position.set(0, 0.02, 0)
    lehenga.add(border)

    garmentGroup.add(lehenga)
  }

  // ===========================================================
  // 5. ANARKALI SUIT / GOWN / DRESS
  // ===========================================================
  else if (
    cleanType.includes("anarkali") ||
    cleanType.includes("dress") ||
    cleanType.includes("gown") ||
    cleanType.includes("onepiece")
  ) {
    const dress = new THREE.Group()
    dress.name = "AnarkaliGown"

    // Fitted Bodice
    const bodiceGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.03, 0.44, 36)
    bodiceGeo.scale(1.12, 1, 0.85)
    const bodice = new THREE.Mesh(bodiceGeo, gMat)
    bodice.position.set(0, 1.22, 0)
    bodice.castShadow = true
    dress.add(bodice)

    // Flowing Flared Pleated Umbrella Skirt
    const skirtHeight = 1.02
    const skirtGeo = new THREE.ConeGeometry(0.52 * hipScale, skirtHeight, 48, 1, true)
    const skirt = new THREE.Mesh(skirtGeo, gMat)
    skirt.position.set(0, 0.50, 0)
    skirt.castShadow = true
    dress.add(skirt)

    // Gold Waistline Border Tape
    const waistTapeGeo = new THREE.CylinderGeometry(waistR * 1.04, waistR * 1.04, 0.025, 36)
    waistTapeGeo.scale(1.13, 1, 0.85)
    const waistTape = new THREE.Mesh(waistTapeGeo, materials.accentMat || gMat)
    waistTape.position.set(0, 1.0, 0)
    dress.add(waistTape)

    // Fitted Full Sleeves
    const armLen = 0.50 * sleeveScale
    const sR = 0.044 * chestScale
    const sGeo = new THREE.CylinderGeometry(sR * 1.05, sR * 0.78, armLen, 24)

    const sL = new THREE.Mesh(sGeo, gMat)
    sL.position.set(-armSpan - 0.02, 1.36 - armLen * 0.5, 0)
    sL.rotation.z = -0.06
    dress.add(sL)

    const sRMesh = new THREE.Mesh(sGeo, gMat)
    sRMesh.position.set(armSpan + 0.02, 1.36 - armLen * 0.5, 0)
    sRMesh.rotation.z = 0.06
    dress.add(sRMesh)

    garmentGroup.add(dress)
  }

  // ===========================================================
  // 6. TAILORED SUIT / BLAZER / COAT / TUXEDO
  // ===========================================================
  else if (
    cleanType.includes("blazer") ||
    cleanType.includes("suit") ||
    cleanType.includes("coat") ||
    cleanType.includes("tuxedo")
  ) {
    const suit = new THREE.Group()
    suit.name = "TailoredSuit"

    // Jacket Body
    const jacketGeo = new THREE.CylinderGeometry(chestR * 1.04, waistR * 1.05, 0.58, 36)
    jacketGeo.scale(1.15, 1, 0.86)
    const jacket = new THREE.Mesh(jacketGeo, gMat)
    jacket.position.set(0, 1.16, 0)
    jacket.castShadow = true
    suit.add(jacket)

    // Notched Lapels
    const lapelGeo = new THREE.BoxGeometry(0.045, 0.26, 0.008)
    lapelGeo.rotateZ(0.24)
    const lapelL = new THREE.Mesh(lapelGeo, gMat)
    lapelL.position.set(-0.065, 1.32, chestR * 0.85 + 0.006)
    suit.add(lapelL)

    const lapelRGeo = new THREE.BoxGeometry(0.045, 0.26, 0.008)
    lapelRGeo.rotateZ(-0.24)
    const lapelR = new THREE.Mesh(lapelRGeo, gMat)
    lapelR.position.set(0.065, 1.32, chestR * 0.85 + 0.006)
    suit.add(lapelR)

    // 2 Front Buttons
    if (materials.buttonMat) {
      const btnGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.004, 16)
      btnGeo.rotateX(Math.PI / 2)
      for (let i = 0; i < 2; i++) {
        const btn = new THREE.Mesh(btnGeo, materials.buttonMat)
        btn.position.set(0, 1.15 - i * 0.09, chestR * 0.86 + 0.008)
        suit.add(btn)
      }
    }

    // Welt Pocket with White Silk Pocket Square
    const weltGeo = new THREE.BoxGeometry(0.048, 0.01, 0.006)
    const welt = new THREE.Mesh(weltGeo, gMat)
    welt.position.set(-0.088, 1.28, chestR * 0.83 + 0.004)
    suit.add(welt)

    const squareMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    const pocketSquareGeo = new THREE.ConeGeometry(0.014, 0.02, 3)
    const pocketSquare = new THREE.Mesh(pocketSquareGeo, squareMat)
    pocketSquare.position.set(-0.088, 1.292, chestR * 0.83 + 0.006)
    suit.add(pocketSquare)

    // Suit Sleeves
    const sleeveGeo = new THREE.CylinderGeometry(0.052, 0.042, 0.54 * sleeveScale, 24)
    const sleeveL = new THREE.Mesh(sleeveGeo, gMat)
    sleeveL.position.set(-armSpan - 0.02, 1.08, 0)
    suit.add(sleeveL)

    const sleeveR = new THREE.Mesh(sleeveGeo, gMat)
    sleeveR.position.set(armSpan + 0.02, 1.08, 0)
    suit.add(sleeveR)

    // For Full Suit, also add trousers
    if (cleanType.includes("suit")) {
      const legOffsetX = 0.096
      const legR = 0.088
      const pantLGeo = new THREE.CylinderGeometry(legR * 1.04, legR * 0.72, 0.88, 24)
      pantLGeo.scale(1, 1, 1.04)

      const pantL = new THREE.Mesh(pantLGeo, gMat)
      pantL.position.set(-legOffsetX, 0.44, 0)
      suit.add(pantL)

      const pantR = new THREE.Mesh(pantLGeo, gMat)
      pantR.position.set(legOffsetX, 0.44, 0)
      suit.add(pantR)
    }

    garmentGroup.add(suit)
  }

  // ===========================================================
  // 7. TRADITIONAL KURTA / KURTI / SHERWANI / INDO-WESTERN
  // ===========================================================
  else if (
    cleanType.includes("kurta") ||
    cleanType.includes("kurti") ||
    cleanType.includes("sherwani") ||
    cleanType.includes("indowestern")
  ) {
    const kurta = new THREE.Group()
    kurta.name = "TraditionalKurta"

    // Mandarin Collar
    const mandarinGeo = new THREE.CylinderGeometry(0.056 * neckScale, 0.058 * neckScale, 0.035, 32)
    const mandarin = new THREE.Mesh(mandarinGeo, gMat)
    mandarin.position.set(0, 1.46, 0)
    kurta.add(mandarin)

    // Kurta Chest Body
    const chestGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.04, 0.44, 36)
    chestGeo.scale(1.12, 1, 0.84)
    const kBody = new THREE.Mesh(chestGeo, gMat)
    kBody.position.set(0, 1.22, 0)
    kBody.castShadow = true
    kurta.add(kBody)

    // Front Placket with Gold Trim
    const placketGeo = new THREE.BoxGeometry(0.022, 0.28, 0.006)
    const placket = new THREE.Mesh(placketGeo, materials.accentMat || gMat)
    placket.position.set(0, 1.3, chestR * 0.84 + 0.004)
    kurta.add(placket)

    // Long A-Line Tunic Skirt with Side Slits
    const skirtLength = THREE.MathUtils.clamp((lengthVal / 28) * 0.6, 0.48, 0.88)
    const skirtGeo = new THREE.CylinderGeometry(waistR * 1.04, hipR * 1.18, skirtLength, 36)
    skirtGeo.scale(1.14, 1, 0.88)
    const skirt = new THREE.Mesh(skirtGeo, gMat)
    skirt.position.set(0, 1.0 - skirtLength * 0.5, 0)
    skirt.castShadow = true
    kurta.add(skirt)

    // Sleeves
    const sleeveGeo = new THREE.CylinderGeometry(0.048, 0.04, 0.52 * sleeveScale, 24)
    const sleeveL = new THREE.Mesh(sleeveGeo, gMat)
    sleeveL.position.set(-armSpan - 0.02, 1.08, 0)
    kurta.add(sleeveL)

    const sleeveR = new THREE.Mesh(sleeveGeo, gMat)
    sleeveR.position.set(armSpan + 0.02, 1.08, 0)
    kurta.add(sleeveR)

    garmentGroup.add(kurta)
  }

  // ===========================================================
  // 8. PALAZZO / PLAZO (Dramatic Wide Leg Flare)
  // ===========================================================
  else if (cleanType.includes("palazzo") || cleanType.includes("plazo")) {
    const palazzo = new THREE.Group()
    palazzo.name = "PalazzoPants"

    // High Waistband
    const bandGeo = new THREE.CylinderGeometry(waistR * 1.03, hipR * 1.02, 0.12, 32)
    bandGeo.scale(1.14, 1, 0.84)
    const band = new THREE.Mesh(bandGeo, gMat)
    band.position.set(0, 0.94, 0)
    palazzo.add(band)

    // Wide Flared Legs
    const legOffsetX = 0.11
    const legTopR = 0.092
    const legBottomR = 0.165 // Wide flare
    const legGeo = new THREE.CylinderGeometry(legTopR, legBottomR, 0.88, 28)

    const legL = new THREE.Mesh(legGeo, gMat)
    legL.position.set(-legOffsetX, 0.44, 0)
    legL.castShadow = true
    palazzo.add(legL)

    const legR = new THREE.Mesh(legGeo, gMat)
    legR.position.set(legOffsetX, 0.44, 0)
    legR.castShadow = true
    palazzo.add(legR)

    garmentGroup.add(palazzo)
  }

  // ===========================================================
  // 9. SALWAR / PATIALA / CHUDIDHAR / DHOTI
  // ===========================================================
  else if (
    cleanType.includes("salwar") ||
    cleanType.includes("patiala") ||
    cleanType.includes("chudidhar") ||
    cleanType.includes("churidar") ||
    cleanType.includes("dhoti")
  ) {
    const ethnicBottom = new THREE.Group()
    ethnicBottom.name = "EthnicBottom"

    // Waistband
    const bandGeo = new THREE.CylinderGeometry(waistR * 1.04, hipR * 1.08, 0.14, 32)
    bandGeo.scale(1.15, 1, 0.86)
    const band = new THREE.Mesh(bandGeo, gMat)
    band.position.set(0, 0.93, 0)
    ethnicBottom.add(band)

    const isChudidhar = cleanType.includes("chudidhar") || cleanType.includes("churidar")
    const isSalwar = cleanType.includes("salwar") || cleanType.includes("patiala")

    const legOffsetX = 0.098
    const topR = isSalwar ? 0.145 : isChudidhar ? 0.095 : 0.13
    const botR = isSalwar ? 0.065 : isChudidhar ? 0.048 : 0.075

    const legGeo = new THREE.CylinderGeometry(topR, botR, 0.86, 24)

    const legL = new THREE.Mesh(legGeo, gMat)
    legL.position.set(-legOffsetX, 0.44, 0)
    ethnicBottom.add(legL)

    const legR = new THREE.Mesh(legGeo, gMat)
    legR.position.set(legOffsetX, 0.44, 0)
    ethnicBottom.add(legR)

    // For Chudidhar, add gathered bangle rings around the ankle
    if (isChudidhar) {
      const ringGeo = new THREE.TorusGeometry(0.052, 0.008, 8, 24)
      ringGeo.rotateX(Math.PI / 2)
      for (let i = 0; i < 4; i++) {
        const ringL = new THREE.Mesh(ringGeo, gMat)
        ringL.position.set(-legOffsetX, 0.06 + i * 0.035, 0)
        ethnicBottom.add(ringL)

        const ringR = new THREE.Mesh(ringGeo, gMat)
        ringR.position.set(legOffsetX, 0.06 + i * 0.035, 0)
        ethnicBottom.add(ringR)
      }
    }

    garmentGroup.add(ethnicBottom)
  }

  // ===========================================================
  // 10. TAILORED TROUSERS / PANTS / JEANS / PYJAMA / LEGGINGS
  // ===========================================================
  else if (
    cleanType.includes("pant") ||
    cleanType.includes("trouser") ||
    cleanType.includes("jean") ||
    cleanType.includes("pyjama") ||
    cleanType.includes("legging")
  ) {
    const pants = new THREE.Group()
    pants.name = "TailoredTrousers"

    // Waistband
    const bandGeo = new THREE.CylinderGeometry(waistR * 1.03, hipR * 1.02, 0.12, 32)
    bandGeo.scale(1.14, 1, 0.84)
    const band = new THREE.Mesh(bandGeo, gMat)
    band.position.set(0, 0.94, 0)
    pants.add(band)

    // Legs
    const legOffsetX = 0.096
    const legR = 0.088
    const pantLGeo = new THREE.CylinderGeometry(legR * 1.05, legR * 0.72, 0.88, 24)
    pantLGeo.scale(1, 1, 1.04)

    const pantL = new THREE.Mesh(pantLGeo, gMat)
    pantL.position.set(-legOffsetX, 0.44, 0)
    pantL.castShadow = true
    pants.add(pantL)

    // Sharp Center Crease Line
    const creaseGeo = new THREE.BoxGeometry(0.005, 0.86, 0.006)
    const creaseMat = materials.seamMat || gMat
    const creaseL = new THREE.Mesh(creaseGeo, creaseMat)
    creaseL.position.set(-legOffsetX, 0.44, legR * 1.02)
    pants.add(creaseL)

    const pantR = new THREE.Mesh(pantLGeo, gMat)
    pantR.position.set(legOffsetX, 0.44, 0)
    pantR.castShadow = true
    pants.add(pantR)

    const creaseR = new THREE.Mesh(creaseGeo, creaseMat)
    creaseR.position.set(legOffsetX, 0.44, legR * 1.02)
    pants.add(creaseR)

    garmentGroup.add(pants)
  }

  // ===========================================================
  // 11. DEFAULT / TAILORED SHIRT / BUTTON-DOWN / TOP
  // ===========================================================
  else {
    const shirt = new THREE.Group()
    shirt.name = "TailoredShirt"

    // A. Fitted Torso Body
    const shirtBodyGeo = new THREE.CylinderGeometry(chestR * 1.02, waistR * 1.03, 0.44, 36)
    shirtBodyGeo.scale(1.12, 1, 0.82)
    const shirtBody = new THREE.Mesh(shirtBodyGeo, gMat)
    shirtBody.position.set(0, 1.22, 0)
    shirtBody.castShadow = true
    shirt.add(shirtBody)

    // B. Curved Tailored Shirt Hem
    const hemLength = THREE.MathUtils.clamp((lengthVal / 28) * 0.22, 0.16, 0.32)
    const hemGeo = new THREE.CylinderGeometry(waistR * 1.03, hipR * 1.02, hemLength, 36)
    hemGeo.scale(1.14, 1, 0.85)
    const hem = new THREE.Mesh(hemGeo, gMat)
    hem.position.set(0, 1.0 - hemLength * 0.4, 0)
    hem.castShadow = true
    shirt.add(hem)

    // C. Crisp Folded Spread Collar
    const collarBandGeo = new THREE.CylinderGeometry(0.054 * neckScale, 0.058 * neckScale, 0.035, 32)
    const collarBand = new THREE.Mesh(collarBandGeo, gMat)
    collarBand.position.set(0, 1.46, 0)
    shirt.add(collarBand)

    const collarPointsGeo = new THREE.TorusGeometry(0.062 * neckScale, 0.014, 12, 32)
    collarPointsGeo.rotateX(Math.PI / 2.3)
    const collarPoints = new THREE.Mesh(collarPointsGeo, gMat)
    collarPoints.position.set(0, 1.45, 0.01)
    shirt.add(collarPoints)

    // D. Center Front Button Placket
    const placketGeo = new THREE.BoxGeometry(0.024, 0.58, 0.006)
    const placket = new THREE.Mesh(placketGeo, gMat)
    placket.position.set(0, 1.15, chestR * 0.82 + 0.004)
    shirt.add(placket)

    // E. 5 Mother-of-Pearl Buttons
    if (materials.buttonMat) {
      const buttonGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 16)
      buttonGeo.rotateX(Math.PI / 2)
      for (let i = 0; i < 5; i++) {
        const btn = new THREE.Mesh(buttonGeo, materials.buttonMat)
        btn.position.set(0, 1.38 - i * 0.1, chestR * 0.82 + 0.008)
        shirt.add(btn)
      }
    }

    // F. Left Chest Pocket
    const pocketGeo = new THREE.BoxGeometry(0.045, 0.052, 0.004)
    const pocket = new THREE.Mesh(pocketGeo, gMat)
    pocket.position.set(-0.08, 1.25, chestR * 0.8 + 0.002)
    shirt.add(pocket)

    // G. Tailored Sleeves & Cuffs
    const armLength = 0.52 * sleeveScale
    const sleeveR = 0.046 * chestScale

    const sleeveGeo = new THREE.CylinderGeometry(sleeveR * 1.05, sleeveR * 0.78, armLength, 24)

    // Left Sleeve
    const sleeveL = new THREE.Mesh(sleeveGeo, gMat)
    sleeveL.position.set(-armSpan - 0.02, 1.36 - armLength * 0.5, 0)
    sleeveL.rotation.z = -0.06
    sleeveL.castShadow = true
    shirt.add(sleeveL)

    // Left Cuff
    const cuffGeo = new THREE.CylinderGeometry(sleeveR * 0.8, sleeveR * 0.8, 0.045, 24)
    const cuffL = new THREE.Mesh(cuffGeo, gMat)
    cuffL.position.set(-armSpan - 0.035, 1.36 - armLength - 0.02, 0)
    shirt.add(cuffL)

    // Right Sleeve
    const sleeveRMesh = new THREE.Mesh(sleeveGeo, gMat)
    sleeveRMesh.position.set(armSpan + 0.02, 1.36 - armLength * 0.5, 0)
    sleeveRMesh.rotation.z = 0.06
    sleeveRMesh.castShadow = true
    shirt.add(sleeveRMesh)

    // Right Cuff
    const cuffR = new THREE.Mesh(cuffGeo, gMat)
    cuffR.position.set(armSpan + 0.035, 1.36 - armLength - 0.02, 0)
    shirt.add(cuffR)

    garmentGroup.add(shirt)
  }

  return garmentGroup
}
