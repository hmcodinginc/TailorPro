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
// Material Factory
// -------------------------------------------------------------
export function createMannequinMaterials(theme: ThemeStyle = "tailor", isWireframe: boolean = false) {
  let mannequinColor = 0xe8dfd2 // Linen ecru / canvas
  let roughness = 0.85
  let metalness = 0.05
  let accentColor = 0xc2a68c
  let woodColor = 0x3d271d // Dark mahogany
  let metalColor = 0xb0b7bd // Polished stainless steel
  let garmentColor = 0x2563eb // Royal tailor blue
  let garmentOpacity = 0.45

  if (theme === "slate") {
    mannequinColor = 0x2d3748 // Charcoal slate
    roughness = 0.5
    metalness = 0.2
    accentColor = 0x4a5568
    woodColor = 0x1a202c
    metalColor = 0x718096
    garmentColor = 0x38bdf8 // Sky cyan
    garmentOpacity = 0.5
  } else if (theme === "ivory") {
    mannequinColor = 0xf8fafc // Pure ivory
    roughness = 0.3
    metalness = 0.1
    accentColor = 0xe2e8f0
    woodColor = 0xd97706 // Warm amber oak
    metalColor = 0xf59e0b // Polished brass gold
    garmentColor = 0x6366f1 // Indigo
    garmentOpacity = 0.45
  } else if (theme === "wireframe") {
    mannequinColor = 0x0f172a
    roughness = 0.1
    metalness = 0.8
    accentColor = 0x0284c7
    woodColor = 0x0f172a
    metalColor = 0x0284c7
    garmentColor = 0x06b6d4
    garmentOpacity = 0.4
  }

  const mannequinMat = new THREE.MeshStandardMaterial({
    color: mannequinColor,
    roughness,
    metalness,
    wireframe: isWireframe || theme === "wireframe",
    side: THREE.DoubleSide,
  })

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.4,
    metalness: 0.1,
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
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: garmentOpacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const guideMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6, // Blue
    transparent: true,
    opacity: 0.75,
  })

  const guideActiveMat = new THREE.MeshBasicMaterial({
    color: 0xef4444, // Bright Red
    transparent: true,
    opacity: 0.95,
  })

  const guideHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b, // Amber
    transparent: true,
    opacity: 0.9,
  })

  return {
    mannequinMat,
    accentMat,
    woodMat,
    metalMat,
    garmentMat,
    guideMat,
    guideActiveMat,
    guideHighlightMat,
  }
}

// -------------------------------------------------------------
// Mannequin Mesh Hierarchy Builder
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

  // 1. Head & Neck Group
  const headNeckGroup = new THREE.Group()
  headNeckGroup.name = "headNeckGroup"
  headNeckGroup.position.set(0, 1.52, 0)
  meshRefs["headNeckGroup"] = headNeckGroup
  mannequinGroup.add(headNeckGroup)

  // Finial / Head Crown (Stylized Tailor Cap)
  const capGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.05, 24)
  const capMesh = new THREE.Mesh(capGeo, materials.woodMat)
  capMesh.position.set(0, 0.16, 0)
  capMesh.castShadow = true
  headNeckGroup.add(capMesh)

  // Head Silhouette (Dress form egg silhouette)
  const headGeo = new THREE.SphereGeometry(0.09, 28, 20)
  headGeo.scale(1, 1.25, 1.05)
  const headMesh = new THREE.Mesh(headGeo, materials.mannequinMat)
  headMesh.position.set(0, 0.06, 0)
  headMesh.castShadow = true
  headMesh.userData = { fieldKey: "neck", partName: "Head" }
  headNeckGroup.add(headMesh)
  meshRefs["headMesh"] = headMesh

  // Neck
  const neckRadius = isWomen ? 0.048 : 0.056
  const neckGeo = new THREE.CylinderGeometry(neckRadius * 0.95, neckRadius * 1.1, 0.12, 28)
  const neckMesh = new THREE.Mesh(neckGeo, materials.mannequinMat)
  neckMesh.position.set(0, -0.06, 0)
  neckMesh.castShadow = true
  neckMesh.userData = { fieldKey: "neck", partName: "Neck" }
  headNeckGroup.add(neckMesh)
  meshRefs["neckMesh"] = neckMesh

  // 2. Torso Group
  const torsoGroup = new THREE.Group()
  torsoGroup.name = "torsoGroup"
  torsoGroup.position.set(0, 1.18, 0)
  meshRefs["torsoGroup"] = torsoGroup
  mannequinGroup.add(torsoGroup)

  // Upper Chest / Shoulders Clavicle
  const chestRadiusX = isWomen ? 0.17 : 0.195
  const chestRadiusZ = isWomen ? 0.14 : 0.125
  const upperChestGeo = new THREE.CylinderGeometry(chestRadiusX * 0.85, chestRadiusX, 0.16, 32)
  upperChestGeo.scale(1, 1, chestRadiusZ / chestRadiusX)
  const upperChestMesh = new THREE.Mesh(upperChestGeo, materials.mannequinMat)
  upperChestMesh.position.set(0, 0.18, 0)
  upperChestMesh.castShadow = true
  upperChestMesh.userData = { fieldKey: "chest", partName: "Upper Chest" }
  torsoGroup.add(upperChestMesh)
  meshRefs["upperChestMesh"] = upperChestMesh

  // Female Bust / Male Pectorals
  if (isWomen) {
    const bustLGeo = new THREE.SphereGeometry(0.068, 24, 18)
    bustLGeo.scale(1.05, 1.0, 1.15)
    const bustL = new THREE.Mesh(bustLGeo, materials.mannequinMat)
    bustL.position.set(-0.068, 0.16, 0.075)
    bustL.castShadow = true
    bustL.userData = { fieldKey: "chest", partName: "Bust" }
    torsoGroup.add(bustL)
    meshRefs["bustL"] = bustL

    const bustR = new THREE.Mesh(bustLGeo, materials.mannequinMat)
    bustR.position.set(0.068, 0.16, 0.075)
    bustR.castShadow = true
    bustR.userData = { fieldKey: "chest", partName: "Bust" }
    torsoGroup.add(bustR)
    meshRefs["bustR"] = bustR
  }

  // Mid Torso / Ribs & Waist
  const waistRadiusX = isWomen ? 0.13 : 0.16
  const waistRadiusZ = isWomen ? 0.098 : 0.115
  const midTorsoGeo = new THREE.CylinderGeometry(chestRadiusX, waistRadiusX, 0.18, 32)
  midTorsoGeo.scale(1, 1, waistRadiusZ / waistRadiusX)
  const midTorsoMesh = new THREE.Mesh(midTorsoGeo, materials.mannequinMat)
  midTorsoMesh.position.set(0, 0.01, 0)
  midTorsoMesh.castShadow = true
  midTorsoMesh.userData = { fieldKey: "waist", partName: "Waist" }
  torsoGroup.add(midTorsoMesh)
  meshRefs["midTorsoMesh"] = midTorsoMesh

  // Lower Torso / Pelvis & Hips
  const hipRadiusX = isWomen ? 0.185 : 0.178
  const hipRadiusZ = isWomen ? 0.138 : 0.125
  const pelvisGeo = new THREE.CylinderGeometry(waistRadiusX, hipRadiusX, 0.22, 32)
  pelvisGeo.scale(1, 1, hipRadiusZ / hipRadiusX)
  const pelvisMesh = new THREE.Mesh(pelvisGeo, materials.mannequinMat)
  pelvisMesh.position.set(0, -0.19, 0)
  pelvisMesh.castShadow = true
  pelvisMesh.userData = { fieldKey: "hip", partName: "Hip / Pelvis" }
  torsoGroup.add(pelvisMesh)
  meshRefs["pelvisMesh"] = pelvisMesh

  // 3. Arms (Left & Right)
  const armSpan = isWomen ? 0.21 : 0.245

  // Left Arm Group
  const armLGroup = new THREE.Group()
  armLGroup.name = "armLGroup"
  armLGroup.position.set(-armSpan, 1.38, 0)
  meshRefs["armLGroup"] = armLGroup
  mannequinGroup.add(armLGroup)

  // Shoulder Joint L
  const shoulderGeo = new THREE.SphereGeometry(0.048, 20, 16)
  const shoulderL = new THREE.Mesh(shoulderGeo, materials.mannequinMat)
  shoulderL.castShadow = true
  shoulderL.userData = { fieldKey: "shoulder", partName: "Left Shoulder" }
  armLGroup.add(shoulderL)
  meshRefs["shoulderL"] = shoulderL

  // Upper Arm (Bicep) L
  const bicepRadius = isWomen ? 0.038 : 0.046
  const upperArmGeo = new THREE.CylinderGeometry(bicepRadius * 1.05, bicepRadius * 0.9, 0.28, 20)
  const upperArmL = new THREE.Mesh(upperArmGeo, materials.mannequinMat)
  upperArmL.position.set(-0.02, -0.15, 0)
  upperArmL.rotation.z = -0.06
  upperArmL.castShadow = true
  upperArmL.userData = { fieldKey: "bicep", partName: "Left Bicep" }
  armLGroup.add(upperArmL)
  meshRefs["upperArmL"] = upperArmL

  // Forearm & Wrist L
  const wristRadius = isWomen ? 0.024 : 0.028
  const forearmGeo = new THREE.CylinderGeometry(bicepRadius * 0.9, wristRadius, 0.26, 20)
  const forearmL = new THREE.Mesh(forearmGeo, materials.mannequinMat)
  forearmL.position.set(-0.035, -0.41, 0.02)
  forearmL.rotation.z = -0.04
  forearmL.castShadow = true
  forearmL.userData = { fieldKey: "sleeve_length", partName: "Left Forearm" }
  armLGroup.add(forearmL)
  meshRefs["forearmL"] = forearmL

  // Hand L
  const handGeo = new THREE.ConeGeometry(wristRadius * 1.1, 0.1, 16)
  handGeo.scale(1, 1, 0.5)
  const handL = new THREE.Mesh(handGeo, materials.mannequinMat)
  handL.position.set(-0.045, -0.58, 0.03)
  handL.rotation.x = Math.PI
  armLGroup.add(handL)

  // Right Arm Group
  const armRGroup = new THREE.Group()
  armRGroup.name = "armRGroup"
  armRGroup.position.set(armSpan, 1.38, 0)
  meshRefs["armRGroup"] = armRGroup
  mannequinGroup.add(armRGroup)

  const shoulderR = new THREE.Mesh(shoulderGeo, materials.mannequinMat)
  shoulderR.castShadow = true
  shoulderR.userData = { fieldKey: "shoulder", partName: "Right Shoulder" }
  armRGroup.add(shoulderR)
  meshRefs["shoulderR"] = shoulderR

  const upperArmR = new THREE.Mesh(upperArmGeo, materials.mannequinMat)
  upperArmR.position.set(0.02, -0.15, 0)
  upperArmR.rotation.z = 0.06
  upperArmR.castShadow = true
  upperArmR.userData = { fieldKey: "bicep", partName: "Right Bicep" }
  armRGroup.add(upperArmR)
  meshRefs["upperArmR"] = upperArmR

  const forearmR = new THREE.Mesh(forearmGeo, materials.mannequinMat)
  forearmR.position.set(0.035, -0.41, 0.02)
  forearmR.rotation.z = 0.04
  forearmR.castShadow = true
  forearmR.userData = { fieldKey: "sleeve_length", partName: "Right Forearm" }
  armRGroup.add(forearmR)
  meshRefs["forearmR"] = forearmR

  const handR = new THREE.Mesh(handGeo, materials.mannequinMat)
  handR.position.set(0.045, -0.58, 0.03)
  handR.rotation.x = Math.PI
  armRGroup.add(handR)

  // 4. Legs (Left & Right)
  const legOffsetX = isWomen ? 0.092 : 0.098

  // Left Leg Group
  const legLGroup = new THREE.Group()
  legLGroup.name = "legLGroup"
  legLGroup.position.set(-legOffsetX, 0.88, 0)
  meshRefs["legLGroup"] = legLGroup
  mannequinGroup.add(legLGroup)

  const thighRadius = isWomen ? 0.076 : 0.082
  const kneeRadius = isWomen ? 0.048 : 0.054
  const calfRadius = isWomen ? 0.044 : 0.05
  const ankleRadius = isWomen ? 0.028 : 0.032

  // Thigh L
  const thighGeo = new THREE.CylinderGeometry(thighRadius, kneeRadius * 1.05, 0.42, 24)
  thighGeo.scale(1, 1, 1.08)
  const thighL = new THREE.Mesh(thighGeo, materials.mannequinMat)
  thighL.position.set(0, -0.21, 0)
  thighL.castShadow = true
  thighL.userData = { fieldKey: "thigh", partName: "Left Thigh" }
  legLGroup.add(thighL)
  meshRefs["thighL"] = thighL

  // Knee L
  const kneeGeo = new THREE.SphereGeometry(kneeRadius, 18, 14)
  const kneeL = new THREE.Mesh(kneeGeo, materials.mannequinMat)
  kneeL.position.set(0, -0.44, 0.01)
  kneeL.castShadow = true
  kneeL.userData = { fieldKey: "knee", partName: "Left Knee" }
  legLGroup.add(kneeL)
  meshRefs["kneeL"] = kneeL

  // Lower Leg / Calf & Ankle L
  const calfGeo = new THREE.CylinderGeometry(kneeRadius * 0.95, ankleRadius, 0.42, 24)
  calfGeo.scale(1, 1, 1.1)
  const calfL = new THREE.Mesh(calfGeo, materials.mannequinMat)
  calfL.position.set(0, -0.67, 0.005)
  calfL.castShadow = true
  calfL.userData = { fieldKey: "calf", partName: "Left Calf" }
  legLGroup.add(calfL)
  meshRefs["calfL"] = calfL

  // Foot L
  const footGeo = new THREE.BoxGeometry(ankleRadius * 2.2, 0.05, 0.16)
  const footL = new THREE.Mesh(footGeo, materials.mannequinMat)
  footL.position.set(0, -0.9, 0.045)
  footL.castShadow = true
  legLGroup.add(footL)

  // Right Leg Group
  const legRGroup = new THREE.Group()
  legRGroup.name = "legRGroup"
  legRGroup.position.set(legOffsetX, 0.88, 0)
  meshRefs["legRGroup"] = legRGroup
  mannequinGroup.add(legRGroup)

  const thighR = new THREE.Mesh(thighGeo, materials.mannequinMat)
  thighR.position.set(0, -0.21, 0)
  thighR.castShadow = true
  thighR.userData = { fieldKey: "thigh", partName: "Right Thigh" }
  legRGroup.add(thighR)
  meshRefs["thighR"] = thighR

  const kneeR = new THREE.Mesh(kneeGeo, materials.mannequinMat)
  kneeR.position.set(0, -0.44, 0.01)
  kneeR.castShadow = true
  kneeR.userData = { fieldKey: "knee", partName: "Right Knee" }
  legRGroup.add(kneeR)
  meshRefs["kneeR"] = kneeR

  const calfR = new THREE.Mesh(calfGeo, materials.mannequinMat)
  calfR.position.set(0, -0.67, 0.005)
  calfR.castShadow = true
  calfR.userData = { fieldKey: "calf", partName: "Right Calf" }
  legRGroup.add(calfR)
  meshRefs["calfR"] = calfR

  const footR = new THREE.Mesh(footGeo, materials.mannequinMat)
  footR.position.set(0, -0.9, 0.045)
  footR.castShadow = true
  legRGroup.add(footR)

  // 5. Tailor Stand / Plinth & Pole
  const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.85, 20)
  const pole = new THREE.Mesh(poleGeo, materials.metalMat)
  pole.position.set(0, 0.9, 0)
  pole.castShadow = true
  standGroup.add(pole)

  // Base Tripod / Disc
  const baseGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.04, 32)
  const baseMesh = new THREE.Mesh(baseGeo, materials.woodMat)
  baseMesh.position.set(0, 0.02, 0)
  baseMesh.receiveShadow = true
  standGroup.add(baseMesh)

  const footRingGeo = new THREE.TorusGeometry(0.24, 0.015, 12, 32)
  footRingGeo.rotateX(Math.PI / 2)
  const footRing = new THREE.Mesh(footRingGeo, materials.metalMat)
  footRing.position.set(0, 0.01, 0)
  standGroup.add(footRing)

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

  // Retrieve or fallback with ease allowance
  const getVal = (k: string) => {
    const raw = measurements[k] ?? defaultSize[k] ?? 36
    return Math.max(1, raw)
  }

  const neck = getVal("neck")
  const shoulder = getVal("shoulder")
  const chest = getVal("chest") + ease.chestEase
  const waist = getVal("waist") + ease.waistEase
  const hip = getVal("hip") + ease.hipEase
  const bicep = getVal("bicep")
  const wrist = getVal("wrist")
  const sleeve_length = getVal("sleeve_length") + ease.sleeveEase
  const thigh = getVal("thigh")
  const knee = getVal("knee")
  const calf = getVal("calf")
  const inseam = getVal("inseam")
  const rise = getVal("rise")
  const height = getVal("height")

  // Relative Ratios
  const neckRatio = neck / defaultSize.neck
  const shoulderRatio = shoulder / defaultSize.shoulder
  const chestRatio = chest / defaultSize.chest
  const waistRatio = waist / defaultSize.waist
  const hipRatio = hip / defaultSize.hip
  const bicepRatio = bicep / defaultSize.bicep
  const wristRatio = wrist / defaultSize.wrist
  const sleeveRatio = sleeve_length / defaultSize.sleeve_length
  const thighRatio = thigh / defaultSize.thigh
  const kneeRatio = knee / defaultSize.knee
  const calfRatio = calf / defaultSize.calf
  const legRatio = inseam / defaultSize.inseam
  const heightRatio = height / defaultSize.height

  const refs = hierarchy.meshRefs

  // 1. Overall stature scaling
  hierarchy.mannequinGroup.scale.set(1, heightRatio, 1)

  // 2. Neck morph
  if (refs["neckMesh"]) {
    refs["neckMesh"].scale.set(neckRatio, 1, neckRatio)
  }

  // 3. Torso Morphing (Chest, Waist, Hip)
  if (refs["upperChestMesh"]) {
    refs["upperChestMesh"].scale.set(shoulderRatio * 0.5 + chestRatio * 0.5, 1, chestRatio)
  }
  if (refs["bustL"] && refs["bustR"]) {
    refs["bustL"].scale.set(chestRatio, chestRatio, chestRatio * 1.15)
    refs["bustR"].scale.set(chestRatio, chestRatio, chestRatio * 1.15)
  }
  if (refs["midTorsoMesh"]) {
    refs["midTorsoMesh"].scale.set(waistRatio, 1, waistRatio)
  }
  if (refs["pelvisMesh"]) {
    refs["pelvisMesh"].scale.set(hipRatio, 1 + (rise / defaultSize.rise - 1) * 0.3, hipRatio)
  }

  // 4. Arms Morphing (Shoulder Span, Bicep, Forearm, Sleeve Length)
  const defaultSpan = isWomen ? 0.21 : 0.245
  const newArmSpan = defaultSpan * shoulderRatio

  if (refs["armLGroup"]) {
    refs["armLGroup"].position.x = -newArmSpan
    refs["armLGroup"].scale.set(bicepRatio, sleeveRatio, bicepRatio)
  }
  if (refs["armRGroup"]) {
    refs["armRGroup"].position.x = newArmSpan
    refs["armRGroup"].scale.set(bicepRatio, sleeveRatio, bicepRatio)
  }
  if (refs["forearmL"]) {
    refs["forearmL"].scale.set(wristRatio / bicepRatio, 1, wristRatio / bicepRatio)
  }
  if (refs["forearmR"]) {
    refs["forearmR"].scale.set(wristRatio / bicepRatio, 1, wristRatio / bicepRatio)
  }

  // 5. Legs Morphing (Thigh, Knee, Calf, Inseam)
  const legOffsetX = (isWomen ? 0.092 : 0.098) * hipRatio
  if (refs["legLGroup"]) {
    refs["legLGroup"].position.x = -legOffsetX
    refs["legLGroup"].scale.set(thighRatio, legRatio, thighRatio)
  }
  if (refs["legRGroup"]) {
    refs["legRGroup"].position.x = legOffsetX
    refs["legRGroup"].scale.set(thighRatio, legRatio, thighRatio)
  }
  if (refs["kneeL"]) {
    refs["kneeL"].scale.set(kneeRatio / thighRatio, 1, kneeRatio / thighRatio)
  }
  if (refs["kneeR"]) {
    refs["kneeR"].scale.set(kneeRatio / thighRatio, 1, kneeRatio / thighRatio)
  }
  if (refs["calfL"]) {
    refs["calfL"].scale.set(calfRatio / thighRatio, 1, calfRatio / thighRatio)
  }
  if (refs["calfR"]) {
    refs["calfR"].scale.set(calfRatio / thighRatio, 1, calfRatio / thighRatio)
  }

  // Calculate 3D Anchors for Measurement Guide Rings & Floating Labels
  const anchors: GuideAnchor[] = [
    {
      key: "neck",
      label: "Neck / Collar",
      position: new THREE.Vector3(0, 1.46 * heightRatio, 0),
      radius: (isWomen ? 0.054 : 0.062) * neckRatio,
      orientation: "horizontal",
    },
    {
      key: "shoulder",
      label: "Shoulder Span",
      position: new THREE.Vector3(0, 1.38 * heightRatio, 0),
      radius: newArmSpan,
      orientation: "line",
      lineEnd: new THREE.Vector3(newArmSpan, 1.38 * heightRatio, 0),
    },
    {
      key: "chest",
      label: "Chest / Bust",
      position: new THREE.Vector3(0, 1.32 * heightRatio, 0.02),
      radius: (isWomen ? 0.175 : 0.198) * chestRatio,
      orientation: "horizontal",
    },
    {
      key: "waist",
      label: "Waist",
      position: new THREE.Vector3(0, 1.18 * heightRatio, 0),
      radius: (isWomen ? 0.138 : 0.165) * waistRatio,
      orientation: "horizontal",
    },
    {
      key: "hip",
      label: "Hip",
      position: new THREE.Vector3(0, 0.99 * heightRatio, 0),
      radius: (isWomen ? 0.192 : 0.182) * hipRatio,
      orientation: "horizontal",
    },
    {
      key: "bicep",
      label: "Bicep",
      position: new THREE.Vector3(-newArmSpan - 0.02, 1.24 * heightRatio, 0),
      radius: (isWomen ? 0.042 : 0.05) * bicepRatio,
      orientation: "horizontal",
    },
    {
      key: "wrist",
      label: "Wrist",
      position: new THREE.Vector3(-newArmSpan - 0.04, (1.38 - 0.52 * sleeveRatio) * heightRatio, 0.02),
      radius: (isWomen ? 0.028 : 0.032) * wristRatio,
      orientation: "horizontal",
    },
    {
      key: "sleeve_length",
      label: "Sleeve Length",
      position: new THREE.Vector3(-newArmSpan, 1.38 * heightRatio, 0),
      radius: 0.55 * sleeveRatio,
      orientation: "line",
      lineEnd: new THREE.Vector3(-newArmSpan - 0.04, (1.38 - 0.55 * sleeveRatio) * heightRatio, 0.02),
    },
    {
      key: "thigh",
      label: "Thigh",
      position: new THREE.Vector3(-legOffsetX, 0.72 * heightRatio, 0),
      radius: (isWomen ? 0.082 : 0.088) * thighRatio,
      orientation: "horizontal",
    },
    {
      key: "knee",
      label: "Knee",
      position: new THREE.Vector3(-legOffsetX, (0.88 - 0.44 * legRatio) * heightRatio, 0),
      radius: (isWomen ? 0.052 : 0.058) * kneeRatio,
      orientation: "horizontal",
    },
    {
      key: "calf",
      label: "Calf",
      position: new THREE.Vector3(-legOffsetX, (0.88 - 0.65 * legRatio) * heightRatio, 0),
      radius: (isWomen ? 0.048 : 0.054) * calfRatio,
      orientation: "horizontal",
    },
    {
      key: "inseam",
      label: "Inseam",
      position: new THREE.Vector3(0, 0.88 * heightRatio, 0),
      radius: 0.88 * legRatio,
      orientation: "line",
      lineEnd: new THREE.Vector3(-legOffsetX, 0.02, 0),
    },
    {
      key: "height",
      label: "Height",
      position: new THREE.Vector3(0.38, 0, 0),
      radius: 1.68 * heightRatio,
      orientation: "line",
      lineEnd: new THREE.Vector3(0.38, 1.68 * heightRatio, 0),
    },
  ]

  return anchors
}

// -------------------------------------------------------------
// Dynamic 3D Garment Draping Overlay Mesh Generator
// -------------------------------------------------------------
export function buildGarmentOverlayMesh(
  garmentType: string,
  gender: "Men" | "Women",
  materials: MannequinSceneHierarchy["materials"],
  measurements: Record<string, number>
): THREE.Group {
  const garmentGroup = new THREE.Group()
  garmentGroup.name = "GarmentDrapeMesh"

  const isWomen = gender === "Women"
  const cleanType = garmentType.toLowerCase()

  const chest = measurements.chest || (isWomen ? 36 : 40)
  const waist = measurements.waist || (isWomen ? 28 : 34)
  const hip = measurements.hip || (isWomen ? 38 : 40)
  const length = measurements.length || 30

  const chestRad = (chest / 40) * (isWomen ? 0.185 : 0.205)
  const waistRad = (waist / 34) * (isWomen ? 0.15 : 0.175)
  const hipRad = (hip / 40) * (isWomen ? 0.20 : 0.19)

  if (cleanType.includes("shirt") || cleanType.includes("tshirt") || cleanType.includes("top")) {
    // Tailored Shirt Body Overlay
    const shirtBodyGeo = new THREE.CylinderGeometry(chestRad * 1.04, waistRad * 1.06, 0.44, 32)
    shirtBodyGeo.scale(1, 1, 0.85)
    const shirtBody = new THREE.Mesh(shirtBodyGeo, materials.garmentMat)
    shirtBody.position.set(0, 1.25, 0)
    garmentGroup.add(shirtBody)

    // Collar
    const collarGeo = new THREE.TorusGeometry(0.065, 0.012, 12, 28)
    collarGeo.rotateX(Math.PI / 2)
    const collar = new THREE.Mesh(collarGeo, materials.garmentMat)
    collar.position.set(0, 1.45, 0)
    garmentGroup.add(collar)

    // Shirt Bottom Hem flare
    const hemGeo = new THREE.CylinderGeometry(waistRad * 1.06, hipRad * 1.04, 0.18, 32)
    hemGeo.scale(1, 1, 0.9)
    const hem = new THREE.Mesh(hemGeo, materials.garmentMat)
    hem.position.set(0, 0.98, 0)
    garmentGroup.add(hem)
  } else if (cleanType.includes("kurta") || cleanType.includes("kurti") || cleanType.includes("sherwani")) {
    // Traditional Kurta Tunic extending down below hips
    const kurtaBodyGeo = new THREE.CylinderGeometry(chestRad * 1.05, waistRad * 1.08, 0.45, 32)
    kurtaBodyGeo.scale(1, 1, 0.88)
    const kurtaBody = new THREE.Mesh(kurtaBodyGeo, materials.garmentMat)
    kurtaBody.position.set(0, 1.25, 0)
    garmentGroup.add(kurtaBody)

    // Kurta Long Skirt Drape
    const kurtaSkirtGeo = new THREE.CylinderGeometry(waistRad * 1.08, hipRad * 1.22, 0.65, 32)
    kurtaSkirtGeo.scale(1, 1, 0.95)
    const kurtaSkirt = new THREE.Mesh(kurtaSkirtGeo, materials.garmentMat)
    kurtaSkirt.position.set(0, 0.75, 0)
    garmentGroup.add(kurtaSkirt)

    // Mandarin Collar
    const collarGeo = new THREE.CylinderGeometry(0.062, 0.065, 0.035, 24)
    const collar = new THREE.Mesh(collarGeo, materials.garmentMat)
    collar.position.set(0, 1.46, 0)
    garmentGroup.add(collar)
  } else if (cleanType.includes("blazer") || cleanType.includes("coat") || cleanType.includes("suit") || cleanType.includes("waistcoat") || cleanType.includes("nehru")) {
    // Structured Blazer / Suit Jacket with lapels
    const blazerGeo = new THREE.CylinderGeometry(chestRad * 1.08, waistRad * 1.1, 0.52, 32)
    blazerGeo.scale(1, 1, 0.88)
    const blazer = new THREE.Mesh(blazerGeo, materials.garmentMat)
    blazer.position.set(0, 1.22, 0)
    garmentGroup.add(blazer)

    // Lapel V-Cut simulation
    const lapelGeo = new THREE.ConeGeometry(0.08, 0.28, 4)
    lapelGeo.rotateZ(Math.PI)
    const lapel = new THREE.Mesh(lapelGeo, materials.garmentMat)
    lapel.position.set(0, 1.34, 0.13)
    garmentGroup.add(lapel)

    // If full suit, also add trousers overlay
    if (cleanType.includes("suit") || cleanType.includes("pant") || cleanType.includes("trouser")) {
      const legRadius = 0.088
      const pantLGeo = new THREE.CylinderGeometry(legRadius * 1.15, legRadius * 0.75, 0.88, 24)
      const pantL = new THREE.Mesh(pantLGeo, materials.garmentMat)
      pantL.position.set(-0.1, 0.44, 0)
      garmentGroup.add(pantL)

      const pantR = new THREE.Mesh(pantLGeo, materials.garmentMat)
      pantR.position.set(0.1, 0.44, 0)
      garmentGroup.add(pantR)
    }
  } else if (cleanType.includes("pant") || cleanType.includes("trouser") || cleanType.includes("salwar") || cleanType.includes("chudidhar") || cleanType.includes("dhoti") || cleanType.includes("palazzo")) {
    // Tailored Trousers / Salwar / Palazzo Legs
    const flareMult = cleanType.includes("palazzo") ? 1.7 : cleanType.includes("salwar") ? 1.4 : 0.8
    const legRadius = 0.092
    const pantLGeo = new THREE.CylinderGeometry(legRadius * 1.18, legRadius * flareMult, 0.9, 24)
    const pantL = new THREE.Mesh(pantLGeo, materials.garmentMat)
    pantL.position.set(-0.098, 0.45, 0)
    garmentGroup.add(pantL)

    const pantR = new THREE.Mesh(pantLGeo, materials.garmentMat)
    pantR.position.set(0.098, 0.45, 0)
    garmentGroup.add(pantR)

    // Waistband
    const bandGeo = new THREE.TorusGeometry(waistRad * 1.04, 0.02, 12, 32)
    bandGeo.rotateX(Math.PI / 2)
    const band = new THREE.Mesh(bandGeo, materials.garmentMat)
    band.position.set(0, 0.92, 0)
    garmentGroup.add(band)
  } else if (cleanType.includes("dress") || cleanType.includes("gown") || cleanType.includes("anarkali") || cleanType.includes("lehenga")) {
    // Feminine Dress / Gown Flare
    const dressTopGeo = new THREE.CylinderGeometry(chestRad * 1.04, waistRad * 1.05, 0.42, 32)
    dressTopGeo.scale(1, 1, 0.88)
    const dressTop = new THREE.Mesh(dressTopGeo, materials.garmentMat)
    dressTop.position.set(0, 1.25, 0)
    garmentGroup.add(dressTop)

    // Gown Bell Skirt / Flare Ghera
    const gownFlareGeo = new THREE.ConeGeometry(0.48, 1.05, 36, 1, true)
    const gownFlare = new THREE.Mesh(gownFlareGeo, materials.garmentMat)
    gownFlare.position.set(0, 0.52, 0)
    garmentGroup.add(gownFlare)
  }

  return garmentGroup
}
