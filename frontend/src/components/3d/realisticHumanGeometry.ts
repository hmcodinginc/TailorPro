import * as THREE from "three"
import { FabricType, createRealisticFabricMaterial } from "./fabricTextures"
import { GuideAnchor, MannequinSceneHierarchy } from "./mannequinGeometry"

export type AvatarStyle = "human" | "mannequin"
export type SkinTone = "fair" | "medium" | "olive" | "deep"

export const SKIN_TONES: Record<SkinTone, { label: string; color: number; roughness: number }> = {
  fair: { label: "Fair / Light", color: 0xf5d6c6, roughness: 0.65 },
  medium: { label: "Medium / Warm", color: 0xdfb190, roughness: 0.68 },
  olive: { label: "Olive / Tan", color: 0xba855f, roughness: 0.7 },
  deep: { label: "Deep / Rich", color: 0x643d28, roughness: 0.72 },
}

export const FABRIC_COLORS: { label: string; color: number }[] = [
  { label: "Navy Blue", color: 0x1e3a8a },
  { label: "Royal Blue", color: 0x2563eb },
  { label: "Charcoal Grey", color: 0x374151 },
  { label: "Crisp White", color: 0xf8fafc },
  { label: "Royal Black", color: 0x18181b },
  { label: "Emerald Green", color: 0x065f46 },
  { label: "Wine / Burgundy", color: 0x881337 },
  { label: "Camel / Beige", color: 0xd97706 },
]

export interface RealisticAvatarHierarchy extends MannequinSceneHierarchy {
  bodyGroup: THREE.Group
  clothesGroup: THREE.Group
  shoesGroup: THREE.Group
  shadowGroup: THREE.Group
  materials: MannequinSceneHierarchy["materials"] & {
    skinMat: THREE.MeshStandardMaterial
    hairMat: THREE.MeshStandardMaterial
    eyeMat: THREE.MeshStandardMaterial
    shoeMat: THREE.MeshStandardMaterial
    soleMat: THREE.MeshStandardMaterial
    buttonMat: THREE.MeshStandardMaterial
  }
}

// -------------------------------------------------------------
// Materials Factory for Realistic Human + Clothes
// -------------------------------------------------------------
export function createRealisticAvatarMaterials(
  skinTone: SkinTone = "medium",
  fabricType: FabricType = "cotton",
  garmentColor: number = 0x2563eb,
  isOpaqueGarment: boolean = true,
  isWireframe: boolean = false
) {
  const toneInfo = SKIN_TONES[skinTone] || SKIN_TONES.medium

  // 1. Organic Human Skin Material
  const skinMat = new THREE.MeshStandardMaterial({
    color: toneInfo.color,
    roughness: toneInfo.roughness,
    metalness: 0.04,
    wireframe: isWireframe,
  })

  // 2. Realistic Hair Material
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917, // Natural dark espresso
    roughness: 0.9,
    metalness: 0.1,
    wireframe: isWireframe,
  })

  // 3. Subtle Eye / Facial Detail Material
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x292524,
    roughness: 0.2,
    metalness: 0.05,
  })

  // 4. Formal Leather Dress Shoes / Loafers
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917, // Burnished oxford leather
    roughness: 0.35,
    metalness: 0.15,
  })

  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Wood/leather layered sole edge
    roughness: 0.8,
    metalness: 0.05,
  })

  // 5. PBR Tailored Garment Material
  const garmentMat = createRealisticFabricMaterial(
    fabricType,
    garmentColor,
    isOpaqueGarment ? 0.98 : 0.55,
    !isOpaqueGarment
  )

  // 6. Buttons (Mother of Pearl or Horn)
  const buttonMat = new THREE.MeshStandardMaterial({
    color: garmentColor === 0xf8fafc ? 0x1e293b : 0xf1f5f9, // Contrast buttons
    roughness: 0.3,
    metalness: 0.2,
  })

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Polished brass / gold accents
    roughness: 0.25,
    metalness: 0.85,
  })

  // 7. Guides
  const guideMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.75,
  })
  const guideActiveMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.95,
  })
  const guideHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.9,
  })

  return {
    mannequinMat: skinMat,
    accentMat: skinMat,
    woodMat: shoeMat,
    metalMat,
    garmentMat,
    guideMat,
    guideActiveMat,
    guideHighlightMat,
    skinMat,
    hairMat,
    eyeMat,
    shoeMat,
    soleMat,
    buttonMat,
  }
}

// -------------------------------------------------------------
// Realistic Human Anatomy Sculptor
// -------------------------------------------------------------
export function buildRealisticHumanAvatar(
  gender: "Men" | "Women" = "Men",
  skinTone: SkinTone = "medium",
  fabricType: FabricType = "cotton",
  garmentColor: number = 0x2563eb,
  isOpaqueGarment: boolean = true,
  isWireframe: boolean = false
): RealisticAvatarHierarchy {
  const rootGroup = new THREE.Group()
  rootGroup.name = "RealisticAvatarRoot"

  const bodyGroup = new THREE.Group()
  bodyGroup.name = "HumanBody"
  rootGroup.add(bodyGroup)

  const clothesGroup = new THREE.Group()
  clothesGroup.name = "RealisticClothes"
  rootGroup.add(clothesGroup)

  const shoesGroup = new THREE.Group()
  shoesGroup.name = "Shoes"
  rootGroup.add(shoesGroup)

  const guidesGroup = new THREE.Group()
  guidesGroup.name = "Guides"
  rootGroup.add(guidesGroup)

  const shadowGroup = new THREE.Group()
  shadowGroup.name = "StudioGroundShadow"
  rootGroup.add(shadowGroup)

  const materials = createRealisticAvatarMaterials(
    skinTone,
    fabricType,
    garmentColor,
    isOpaqueGarment,
    isWireframe
  )
  const meshRefs: Record<string, THREE.Object3D> = {}

  const isWomen = gender === "Women"

  // -----------------------------------------------------------
  // 1. HEAD & FACE SCULPT
  // -----------------------------------------------------------
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 1.58, 0)
  headGroup.name = "headGroup"
  meshRefs["headNeckGroup"] = headGroup
  bodyGroup.add(headGroup)

  // Cranium / Face Base (Egg-shape with chin taper)
  const craniumGeo = new THREE.SphereGeometry(0.092, 32, 24)
  craniumGeo.scale(0.85, 1.15, 0.95)
  const cranium = new THREE.Mesh(craniumGeo, materials.skinMat)
  cranium.position.set(0, 0.04, 0)
  cranium.castShadow = true
  cranium.userData = { fieldKey: "neck", partName: "Head" }
  headGroup.add(cranium)
  meshRefs["headMesh"] = cranium

  // Jaw & Chin definition
  const jawGeo = new THREE.CylinderGeometry(0.065, 0.038, 0.08, 16)
  jawGeo.scale(1, 1, 0.8)
  const jaw = new THREE.Mesh(jawGeo, materials.skinMat)
  jaw.position.set(0, -0.04, 0.02)
  jaw.castShadow = true
  headGroup.add(jaw)

  // Subtle Nose Bridge
  const noseGeo = new THREE.ConeGeometry(0.012, 0.035, 8)
  noseGeo.rotateX(Math.PI / 2.3)
  const nose = new THREE.Mesh(noseGeo, materials.skinMat)
  nose.position.set(0, 0.01, 0.09)
  headGroup.add(nose)

  // Hair Mesh (Clean Tailored Cut)
  const hairGeo = new THREE.SphereGeometry(0.095, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58)
  hairGeo.scale(0.88, isWomen ? 1.4 : 1.18, 0.98)
  const hair = new THREE.Mesh(hairGeo, materials.hairMat)
  hair.position.set(0, 0.05, -0.005)
  hair.castShadow = true
  headGroup.add(hair)

  // Ears
  const earGeo = new THREE.SphereGeometry(0.018, 12, 8)
  earGeo.scale(0.4, 1.2, 0.8)
  const earL = new THREE.Mesh(earGeo, materials.skinMat)
  earL.position.set(-0.08, 0.01, 0)
  const earR = new THREE.Mesh(earGeo, materials.skinMat)
  earR.position.set(0.08, 0.01, 0)
  headGroup.add(earL, earR)

  // -----------------------------------------------------------
  // 2. NECK & CLAVICLES
  // -----------------------------------------------------------
  const neckRadius = isWomen ? 0.046 : 0.054
  const neckGeo = new THREE.CylinderGeometry(neckRadius * 0.92, neckRadius * 1.08, 0.13, 28)
  const neckMesh = new THREE.Mesh(neckGeo, materials.skinMat)
  neckMesh.position.set(0, 1.48, 0)
  neckMesh.castShadow = true
  neckMesh.userData = { fieldKey: "neck", partName: "Neck" }
  bodyGroup.add(neckMesh)
  meshRefs["neckMesh"] = neckMesh

  // Clavicle & Upper Trapezius slope
  const clavicleGroup = new THREE.Group()
  clavicleGroup.position.set(0, 1.41, 0)
  meshRefs["clavicleGroup"] = clavicleGroup
  bodyGroup.add(clavicleGroup)

  const trapGeo = new THREE.CylinderGeometry(neckRadius * 1.1, isWomen ? 0.17 : 0.20, 0.07, 28)
  trapGeo.scale(1.2, 1, 0.75)
  const trap = new THREE.Mesh(trapGeo, materials.skinMat)
  trap.castShadow = true
  clavicleGroup.add(trap)

  // -----------------------------------------------------------
  // 3. TORSO (CHEST, WAIST, ABDOMEN, PELVIS)
  // -----------------------------------------------------------
  const torsoGroup = new THREE.Group()
  torsoGroup.position.set(0, 1.18, 0)
  torsoGroup.name = "torsoGroup"
  meshRefs["torsoGroup"] = torsoGroup
  bodyGroup.add(torsoGroup)

  // Upper Chest / Pectorals
  const chestR = isWomen ? 0.175 : 0.198
  const chestGeo = new THREE.CylinderGeometry(chestR * 1.05, chestR * 0.94, 0.24, 32)
  chestGeo.scale(1.15, 1, 0.76)
  const chestMesh = new THREE.Mesh(chestGeo, materials.skinMat)
  chestMesh.position.set(0, 0.12, 0)
  chestMesh.castShadow = true
  chestMesh.userData = { fieldKey: "chest", partName: "Chest / Bust" }
  torsoGroup.add(chestMesh)
  meshRefs["upperChestMesh"] = chestMesh

  // Women Bust contours
  if (isWomen) {
    const bustGeo = new THREE.SphereGeometry(0.082, 24, 18)
    bustGeo.scale(1, 0.95, 1.15)
    const bustL = new THREE.Mesh(bustGeo, materials.skinMat)
    bustL.position.set(-0.068, 0.1, 0.075)
    bustL.castShadow = true
    torsoGroup.add(bustL)
    meshRefs["bustL"] = bustL

    const bustR = new THREE.Mesh(bustGeo, materials.skinMat)
    bustR.position.set(0.068, 0.1, 0.075)
    bustR.castShadow = true
    torsoGroup.add(bustR)
    meshRefs["bustR"] = bustR
  }

  // Mid Torso / Natural Waist
  const waistR = isWomen ? 0.142 : 0.168
  const midTorsoGeo = new THREE.CylinderGeometry(chestR * 0.94, waistR, 0.18, 32)
  midTorsoGeo.scale(1.12, 1, 0.78)
  const midTorso = new THREE.Mesh(midTorsoGeo, materials.skinMat)
  midTorso.position.set(0, -0.07, 0)
  midTorso.castShadow = true
  midTorso.userData = { fieldKey: "waist", partName: "Waist" }
  torsoGroup.add(midTorso)
  meshRefs["midTorsoMesh"] = midTorso

  // Pelvis / Hips
  const hipR = isWomen ? 0.192 : 0.182
  const pelvisGeo = new THREE.CylinderGeometry(waistR, hipR, 0.22, 32)
  pelvisGeo.scale(1.18, 1, 0.82)
  const pelvis = new THREE.Mesh(pelvisGeo, materials.skinMat)
  pelvis.position.set(0, -0.26, 0)
  pelvis.castShadow = true
  pelvis.userData = { fieldKey: "hip", partName: "Hips / Pelvis" }
  torsoGroup.add(pelvis)
  meshRefs["pelvisMesh"] = pelvis

  // -----------------------------------------------------------
  // 4. ARMS & DETAILED 3D HANDS (LEFT & RIGHT)
  // -----------------------------------------------------------
  const armSpan = isWomen ? 0.22 : 0.255

  // Left Arm Group
  const armLGroup = new THREE.Group()
  armLGroup.position.set(-armSpan, 1.36, 0)
  meshRefs["armLGroup"] = armLGroup
  bodyGroup.add(armLGroup)

  // Deltoid Shoulder Cap
  const shoulderGeo = new THREE.SphereGeometry(isWomen ? 0.052 : 0.062, 20, 16)
  const shoulderL = new THREE.Mesh(shoulderGeo, materials.skinMat)
  shoulderL.castShadow = true
  armLGroup.add(shoulderL)

  // Bicep / Upper Arm
  const bicepR = isWomen ? 0.042 : 0.052
  const bicepGeo = new THREE.CylinderGeometry(bicepR, bicepR * 0.88, 0.28, 20)
  const bicepL = new THREE.Mesh(bicepGeo, materials.skinMat)
  bicepL.position.set(0, -0.15, 0)
  bicepL.castShadow = true
  bicepL.userData = { fieldKey: "bicep", partName: "Bicep" }
  armLGroup.add(bicepL)

  // Elbow Joint
  const elbowGeo = new THREE.SphereGeometry(bicepR * 0.84, 16, 12)
  const elbowL = new THREE.Mesh(elbowGeo, materials.skinMat)
  elbowL.position.set(0, -0.3, 0)
  armLGroup.add(elbowL)

  // Forearm
  const forearmGeo = new THREE.CylinderGeometry(bicepR * 0.84, bicepR * 0.65, 0.26, 20)
  const forearmL = new THREE.Mesh(forearmGeo, materials.skinMat)
  forearmL.position.set(0, -0.44, 0)
  forearmL.castShadow = true
  forearmL.userData = { fieldKey: "wrist", partName: "Forearm / Wrist" }
  armLGroup.add(forearmL)
  meshRefs["forearmL"] = forearmL

  // 3D Sculpted Hand (Palm + Thumb + Fingers)
  const handL = buildSculptedHand(materials.skinMat, isWomen, "left")
  handL.position.set(0, -0.6, 0)
  armLGroup.add(handL)

  // Right Arm Group
  const armRGroup = new THREE.Group()
  armRGroup.position.set(armSpan, 1.36, 0)
  meshRefs["armRGroup"] = armRGroup
  bodyGroup.add(armRGroup)

  const shoulderR = new THREE.Mesh(shoulderGeo, materials.skinMat)
  shoulderR.castShadow = true
  armRGroup.add(shoulderR)

  const bicepRMesh = new THREE.Mesh(bicepGeo, materials.skinMat)
  bicepRMesh.position.set(0, -0.15, 0)
  bicepRMesh.castShadow = true
  bicepRMesh.userData = { fieldKey: "bicep", partName: "Bicep" }
  armRGroup.add(bicepRMesh)

  const elbowR = new THREE.Mesh(elbowGeo, materials.skinMat)
  elbowR.position.set(0, -0.3, 0)
  armRGroup.add(elbowR)

  const forearmR = new THREE.Mesh(forearmGeo, materials.skinMat)
  forearmR.position.set(0, -0.44, 0)
  forearmR.castShadow = true
  forearmR.userData = { fieldKey: "wrist", partName: "Forearm / Wrist" }
  armRGroup.add(forearmR)
  meshRefs["forearmR"] = forearmR

  const handR = buildSculptedHand(materials.skinMat, isWomen, "right")
  handR.position.set(0, -0.6, 0)
  armRGroup.add(handR)

  // -----------------------------------------------------------
  // 5. LEGS & NATURAL FEET / TAILORED DRESS SHOES
  // -----------------------------------------------------------
  const legOffsetX = (isWomen ? 0.092 : 0.104)

  // Left Leg Group
  const legLGroup = new THREE.Group()
  legLGroup.position.set(-legOffsetX, 0.88, 0)
  meshRefs["legLGroup"] = legLGroup
  bodyGroup.add(legLGroup)

  // Thigh (Quadriceps)
  const thighR = isWomen ? 0.082 : 0.088
  const thighGeo = new THREE.CylinderGeometry(thighR, thighR * 0.72, 0.42, 24)
  thighGeo.scale(1, 1, 1.08)
  const thighL = new THREE.Mesh(thighGeo, materials.skinMat)
  thighL.position.set(0, -0.21, 0)
  thighL.castShadow = true
  thighL.userData = { fieldKey: "thigh", partName: "Thigh" }
  legLGroup.add(thighL)

  // Kneecap (Patella)
  const kneeGeo = new THREE.SphereGeometry(thighR * 0.68, 18, 14)
  kneeGeo.scale(1, 1.15, 0.95)
  const kneeL = new THREE.Mesh(kneeGeo, materials.skinMat)
  kneeL.position.set(0, -0.44, 0.015)
  kneeL.castShadow = true
  kneeL.userData = { fieldKey: "knee", partName: "Knee" }
  legLGroup.add(kneeL)
  meshRefs["kneeL"] = kneeL

  // Calf & Ankle
  const calfGeo = new THREE.CylinderGeometry(thighR * 0.65, thighR * 0.44, 0.42, 24)
  calfGeo.scale(1, 1, 1.1)
  const calfL = new THREE.Mesh(calfGeo, materials.skinMat)
  calfL.position.set(0, -0.67, 0)
  calfL.castShadow = true
  calfL.userData = { fieldKey: "calf", partName: "Calf" }
  legLGroup.add(calfL)
  meshRefs["calfL"] = calfL

  // Left Shoe / Foot
  const shoeL = buildTailoredShoe(materials.shoeMat, materials.soleMat, isWomen)
  shoeL.position.set(0, -0.87, 0.02)
  legLGroup.add(shoeL)

  // Right Leg Group
  const legRGroup = new THREE.Group()
  legRGroup.position.set(legOffsetX, 0.88, 0)
  meshRefs["legRGroup"] = legRGroup
  bodyGroup.add(legRGroup)

  const thighRMesh = new THREE.Mesh(thighGeo, materials.skinMat)
  thighRMesh.position.set(0, -0.21, 0)
  thighRMesh.castShadow = true
  thighRMesh.userData = { fieldKey: "thigh", partName: "Thigh" }
  legRGroup.add(thighRMesh)

  const kneeR = new THREE.Mesh(kneeGeo, materials.skinMat)
  kneeR.position.set(0, -0.44, 0.015)
  kneeR.castShadow = true
  kneeR.userData = { fieldKey: "knee", partName: "Knee" }
  legRGroup.add(kneeR)
  meshRefs["kneeR"] = kneeR

  const calfR = new THREE.Mesh(calfGeo, materials.skinMat)
  calfR.position.set(0, -0.67, 0)
  calfR.castShadow = true
  calfR.userData = { fieldKey: "calf", partName: "Calf" }
  legRGroup.add(calfR)
  meshRefs["calfR"] = calfR

  const shoeR = buildTailoredShoe(materials.shoeMat, materials.soleMat, isWomen)
  shoeR.position.set(0, -0.87, 0.02)
  legRGroup.add(shoeR)

  // -----------------------------------------------------------
  // 6. REALISTIC STUDIO GROUND SHADOW (No hard cutoffs)
  // -----------------------------------------------------------
  const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6)
  shadowGeo.rotateX(-Math.PI / 2)

  // Procedural soft circular contact shadow canvas texture
  const shadowCanvas = document.createElement("canvas")
  shadowCanvas.width = 128
  shadowCanvas.height = 128
  const sctx = shadowCanvas.getContext("2d")!
  const gradient = sctx.createRadialGradient(64, 64, 4, 64, 64, 60)
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.45)")
  gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.22)")
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
  shadowMesh.position.set(0, 0.002, 0.02)
  shadowGroup.add(shadowMesh)

  return {
    rootGroup,
    mannequinGroup: bodyGroup,
    garmentGroup: clothesGroup,
    guidesGroup,
    standGroup: shadowGroup,
    bodyGroup,
    clothesGroup,
    shoesGroup,
    shadowGroup,
    materials,
    meshRefs,
  }
}

// -------------------------------------------------------------
// Helper: Sculpted 3D Human Hand
// -------------------------------------------------------------
function buildSculptedHand(
  skinMat: THREE.Material,
  isWomen: boolean,
  side: "left" | "right"
): THREE.Group {
  const hand = new THREE.Group()

  // Palm
  const palmGeo = new THREE.BoxGeometry(0.048, 0.08, 0.024)
  const palm = new THREE.Mesh(palmGeo, skinMat)
  palm.castShadow = true
  hand.add(palm)

  // Thumb
  const thumbGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.042, 8)
  const thumb = new THREE.Mesh(thumbGeo, skinMat)
  const thumbX = side === "left" ? 0.026 : -0.026
  thumb.position.set(thumbX, -0.01, 0.015)
  thumb.rotateZ(side === "left" ? -0.4 : 0.4)
  thumb.castShadow = true
  hand.add(thumb)

  // 4 Relaxed Fingers (Index, Middle, Ring, Pinky)
  const fingerOffsets = [-0.018, -0.006, 0.006, 0.018]
  const fingerLengths = [0.046, 0.052, 0.048, 0.038]

  fingerOffsets.forEach((x, idx) => {
    const fLen = fingerLengths[idx] * (isWomen ? 0.9 : 1.0)
    const fingerGeo = new THREE.CylinderGeometry(0.0065, 0.0075, fLen, 8)
    const finger = new THREE.Mesh(fingerGeo, skinMat)
    finger.position.set(x, -0.04 - fLen * 0.48, 0)
    finger.rotateX(0.08) // Natural relaxed curl
    finger.castShadow = true
    hand.add(finger)
  })

  return hand
}

// -------------------------------------------------------------
// Helper: Tailored Dress Shoe / Oxford Loafer
// -------------------------------------------------------------
function buildTailoredShoe(
  shoeMat: THREE.Material,
  soleMat: THREE.Material,
  isWomen: boolean
): THREE.Group {
  const shoeGroup = new THREE.Group()

  // Upper Shoe
  const upperGeo = new THREE.BoxGeometry(0.075, 0.055, 0.18)
  upperGeo.scale(1, 1, 1)
  const upper = new THREE.Mesh(upperGeo, shoeMat)
  upper.position.set(0, 0.028, 0.03)
  upper.castShadow = true
  shoeGroup.add(upper)

  // Toe Cap Taper
  const toeGeo = new THREE.CylinderGeometry(0.01, 0.037, 0.06, 16)
  toeGeo.rotateX(Math.PI / 2)
  toeGeo.scale(1, 0.65, 1)
  const toe = new THREE.Mesh(toeGeo, shoeMat)
  toe.position.set(0, 0.02, 0.12)
  shoeGroup.add(toe)

  // Sole & Heel
  const soleGeo = new THREE.BoxGeometry(0.08, 0.014, 0.22)
  const sole = new THREE.Mesh(soleGeo, soleMat)
  sole.position.set(0, 0.007, 0.03)
  shoeGroup.add(sole)

  const heelGeo = new THREE.BoxGeometry(0.078, isWomen ? 0.028 : 0.018, 0.065)
  const heel = new THREE.Mesh(heelGeo, soleMat)
  heel.position.set(0, isWomen ? 0.02 : 0.015, -0.05)
  shoeGroup.add(heel)

  return shoeGroup
}

// -------------------------------------------------------------
// REALISTIC 3D GARMENTS BUILDER (Actual Clothes-Look)
// -------------------------------------------------------------
export function buildRealistic3DGarment(
  garmentType: string,
  gender: "Men" | "Women",
  materials: RealisticAvatarHierarchy["materials"],
  measurements: Record<string, number>
): THREE.Group {
  const clothesGroup = new THREE.Group()
  clothesGroup.name = "RealisticTailoredGarment"

  const isWomen = gender === "Women"
  const cleanType = garmentType.toLowerCase()

  const chest = measurements.chest || (isWomen ? 36 : 40)
  const waist = measurements.waist || (isWomen ? 28 : 34)
  const hip = measurements.hip || (isWomen ? 38 : 40)
  const sleeve = measurements.sleeve_length || (isWomen ? 22 : 25)

  const chestScale = chest / 40
  const waistScale = waist / 34
  const hipScale = hip / 40

  const chestR = chestScale * (isWomen ? 0.185 : 0.21)
  const waistR = waistScale * (isWomen ? 0.155 : 0.18)
  const hipR = hipScale * (isWomen ? 0.205 : 0.195)

  // ===========================================================
  // A. TAILORED DRESS SHIRT / CASUAL SHIRT
  // ===========================================================
  if (cleanType.includes("shirt") || cleanType.includes("top")) {
    const shirt = new THREE.Group()
    shirt.name = "TailoredDressShirt"

    // 1. Shirt Torso Body (Contours around chest and waist)
    const bodyGeo = new THREE.CylinderGeometry(chestR * 1.05, waistR * 1.06, 0.46, 36)
    bodyGeo.scale(1.15, 1, 0.82)
    const body = new THREE.Mesh(bodyGeo, materials.garmentMat)
    body.position.set(0, 1.25, 0)
    body.castShadow = true
    shirt.add(body)

    // 2. Curved Shirt Hem (Tailored shirt-tail curve)
    const hemGeo = new THREE.CylinderGeometry(waistR * 1.06, hipR * 1.05, 0.2, 36)
    hemGeo.scale(1.16, 1, 0.84)
    const hem = new THREE.Mesh(hemGeo, materials.garmentMat)
    hem.position.set(0, 0.96, 0)
    shirt.add(hem)

    // 3. Folded Collar with Points
    const collarStandGeo = new THREE.CylinderGeometry(0.062, 0.068, 0.04, 28)
    const collarStand = new THREE.Mesh(collarStandGeo, materials.garmentMat)
    collarStand.position.set(0, 1.48, 0)
    shirt.add(collarStand)

    const collarFoldGeo = new THREE.TorusGeometry(0.072, 0.016, 12, 32)
    collarFoldGeo.rotateX(Math.PI / 2.3)
    const collarFold = new THREE.Mesh(collarFoldGeo, materials.garmentMat)
    collarFold.position.set(0, 1.47, 0.01)
    shirt.add(collarFold)

    // 4. Center Front Button Placket
    const placketGeo = new THREE.BoxGeometry(0.024, 0.62, 0.008)
    const placket = new THREE.Mesh(placketGeo, materials.garmentMat)
    placket.position.set(0, 1.16, chestR * 0.82 + 0.005)
    shirt.add(placket)

    // 5 Mother-of-Pearl Buttons down the placket
    const buttonGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 16)
    buttonGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 5; i++) {
      const button = new THREE.Mesh(buttonGeo, materials.buttonMat)
      button.position.set(0, 1.42 - i * 0.11, chestR * 0.82 + 0.01)
      shirt.add(button)
    }

    // 5. Breast Pocket on Left Chest
    const pocketGeo = new THREE.BoxGeometry(0.048, 0.056, 0.006)
    const pocket = new THREE.Mesh(pocketGeo, materials.garmentMat)
    pocket.position.set(-0.085, 1.28, chestR * 0.8 + 0.004)
    shirt.add(pocket)

    // 6. Fitted Sleeves with Cuffs
    const armSpan = isWomen ? 0.22 : 0.255
    const sleeveR = 0.054 * chestScale
    const sleeveGeo = new THREE.CylinderGeometry(sleeveR * 1.08, sleeveR * 0.82, 0.54, 24)
    
    // Left Sleeve
    const sleeveL = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveL.position.set(-armSpan, 1.1, 0)
    shirt.add(sleeveL)

    // Left Cuff
    const cuffGeo = new THREE.CylinderGeometry(sleeveR * 0.85, sleeveR * 0.85, 0.055, 24)
    const cuffL = new THREE.Mesh(cuffGeo, materials.garmentMat)
    cuffL.position.set(-armSpan, 0.8, 0)
    shirt.add(cuffL)

    // Cuff Button
    const cuffBtnL = new THREE.Mesh(buttonGeo, materials.buttonMat)
    cuffBtnL.position.set(-armSpan - sleeveR * 0.84, 0.8, 0)
    cuffBtnL.rotateY(Math.PI / 2)
    shirt.add(cuffBtnL)

    // Right Sleeve
    const sleeveRMesh = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveRMesh.position.set(armSpan, 1.1, 0)
    shirt.add(sleeveRMesh)

    const cuffR = new THREE.Mesh(cuffGeo, materials.garmentMat)
    cuffR.position.set(armSpan, 0.8, 0)
    shirt.add(cuffR)

    const cuffBtnR = new THREE.Mesh(buttonGeo, materials.buttonMat)
    cuffBtnR.position.set(armSpan + sleeveR * 0.84, 0.8, 0)
    cuffBtnR.rotateY(Math.PI / 2)
    shirt.add(cuffBtnR)

    clothesGroup.add(shirt)
  }

  // ===========================================================
  // B. BUSINESS SUIT / BLAZER & TAILORED TROUSERS
  // ===========================================================
  else if (
    cleanType.includes("blazer") ||
    cleanType.includes("suit") ||
    cleanType.includes("coat") ||
    cleanType.includes("tuxedo")
  ) {
    const suit = new THREE.Group()
    suit.name = "TailoredBusinessSuit"

    // 1. Structured Blazer Body with padded shoulders
    const jacketGeo = new THREE.CylinderGeometry(chestR * 1.1, waistR * 1.12, 0.62, 36)
    jacketGeo.scale(1.18, 1, 0.86)
    const jacket = new THREE.Mesh(jacketGeo, materials.garmentMat)
    jacket.position.set(0, 1.18, 0)
    jacket.castShadow = true
    suit.add(jacket)

    // 2. Structured Notched Lapels
    const lapelGeo = new THREE.BoxGeometry(0.045, 0.28, 0.012)
    lapelGeo.rotateZ(0.22)
    const lapelL = new THREE.Mesh(lapelGeo, materials.garmentMat)
    lapelL.position.set(-0.065, 1.34, chestR * 0.85 + 0.01)
    suit.add(lapelL)

    const lapelRGeo = new THREE.BoxGeometry(0.045, 0.28, 0.012)
    lapelRGeo.rotateZ(-0.22)
    const lapelR = new THREE.Mesh(lapelRGeo, materials.garmentMat)
    lapelR.position.set(0.065, 1.34, chestR * 0.85 + 0.01)
    suit.add(lapelR)

    // 3. Two-Button Front Closure
    const buttonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 16)
    buttonGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 2; i++) {
      const btn = new THREE.Mesh(buttonGeo, materials.buttonMat)
      btn.position.set(0, 1.18 - i * 0.1, chestR * 0.86 + 0.012)
      suit.add(btn)
    }

    // 4. Welt Pocket with Silk Pocket Square
    const weltPocketGeo = new THREE.BoxGeometry(0.052, 0.012, 0.008)
    const welt = new THREE.Mesh(weltPocketGeo, materials.garmentMat)
    welt.position.set(-0.09, 1.3, chestR * 0.84 + 0.008)
    suit.add(welt)

    const pocketSquareGeo = new THREE.ConeGeometry(0.016, 0.024, 3)
    const squareMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    const pocketSquare = new THREE.Mesh(pocketSquareGeo, squareMat)
    pocketSquare.position.set(-0.09, 1.314, chestR * 0.84 + 0.01)
    suit.add(pocketSquare)

    // 5. Flap Waist Pockets
    const flapGeo = new THREE.BoxGeometry(0.062, 0.02, 0.01)
    const flapL = new THREE.Mesh(flapGeo, materials.garmentMat)
    flapL.position.set(-0.11, 1.02, chestR * 0.8 + 0.01)
    suit.add(flapL)

    const flapR = new THREE.Mesh(flapGeo, materials.garmentMat)
    flapR.position.set(0.11, 1.02, chestR * 0.8 + 0.01)
    suit.add(flapR)

    // 6. Suit Jacket Sleeves
    const armSpan = isWomen ? 0.22 : 0.255
    const sleeveGeo = new THREE.CylinderGeometry(0.062, 0.048, 0.56, 24)
    const sleeveL = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveL.position.set(-armSpan, 1.1, 0)
    suit.add(sleeveL)

    const sleeveR = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveR.position.set(armSpan, 1.1, 0)
    suit.add(sleeveR)

    // 7. Pressed Tailored Trousers (Matching the suit)
    const pantGroup = buildTailoredTrousers(waistR, hipR, materials)
    suit.add(pantGroup)

    clothesGroup.add(suit)
  }

  // ===========================================================
  // C. TRADITIONAL KURTA / SHERWANI
  // ===========================================================
  else if (
    cleanType.includes("kurta") ||
    cleanType.includes("kurti") ||
    cleanType.includes("sherwani")
  ) {
    const kurta = new THREE.Group()
    kurta.name = "TraditionalKurta"

    // 1. Mandarin / Nehru Stand Collar
    const mandarinGeo = new THREE.CylinderGeometry(0.064, 0.066, 0.038, 28)
    const mandarin = new THREE.Mesh(mandarinGeo, materials.garmentMat)
    mandarin.position.set(0, 1.48, 0)
    kurta.add(mandarin)

    // 2. Kurta Chest Body
    const chestGeo = new THREE.CylinderGeometry(chestR * 1.06, waistR * 1.08, 0.44, 32)
    chestGeo.scale(1.15, 1, 0.85)
    const kChest = new THREE.Mesh(chestGeo, materials.garmentMat)
    kChest.position.set(0, 1.25, 0)
    kChest.castShadow = true
    kurta.add(kChest)

    // 3. Embroidered Front Placket with Gold / Brass Buttons
    const placketGeo = new THREE.BoxGeometry(0.026, 0.32, 0.008)
    const placket = new THREE.Mesh(placketGeo, materials.garmentMat)
    placket.position.set(0, 1.32, chestR * 0.85 + 0.005)
    kurta.add(placket)

    const goldBtnGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16)
    goldBtnGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 4; i++) {
      const gBtn = new THREE.Mesh(goldBtnGeo, materials.metalMat)
      gBtn.position.set(0, 1.44 - i * 0.07, chestR * 0.85 + 0.01)
      kurta.add(gBtn)
    }

    // 4. Long Tunic Skirt with Side Slits (Chaks)
    const skirtGeo = new THREE.CylinderGeometry(waistR * 1.08, hipR * 1.25, 0.72, 36)
    skirtGeo.scale(1.18, 1, 0.88)
    const skirt = new THREE.Mesh(skirtGeo, materials.garmentMat)
    skirt.position.set(0, 0.7, 0)
    skirt.castShadow = true
    kurta.add(skirt)

    // 5. Kurta Straight Sleeves
    const armSpan = isWomen ? 0.22 : 0.255
    const sleeveGeo = new THREE.CylinderGeometry(0.058, 0.046, 0.54, 24)
    const sleeveL = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveL.position.set(-armSpan, 1.1, 0)
    kurta.add(sleeveL)

    const sleeveR = new THREE.Mesh(sleeveGeo, materials.garmentMat)
    sleeveR.position.set(armSpan, 1.1, 0)
    kurta.add(sleeveR)

    // 6. Pyjama / Churidar Lower Garment
    const pyjamaGroup = buildChuridarPyjama(hipR, materials)
    kurta.add(pyjamaGroup)

    clothesGroup.add(kurta)
  }

  // ===========================================================
  // D. TAILORED TROUSERS / PANTS / JEANS
  // ===========================================================
  else if (
    cleanType.includes("pant") ||
    cleanType.includes("trouser") ||
    cleanType.includes("jeans") ||
    cleanType.includes("salwar") ||
    cleanType.includes("palazzo")
  ) {
    const pants = buildTailoredTrousers(waistR, hipR, materials)
    clothesGroup.add(pants)
  }

  // ===========================================================
  // E. DRESS / GOWN / ANARKALI / LEHENGA
  // ===========================================================
  else if (
    cleanType.includes("dress") ||
    cleanType.includes("gown") ||
    cleanType.includes("anarkali") ||
    cleanType.includes("lehenga")
  ) {
    const dress = new THREE.Group()
    dress.name = "FeminineFlaredDress"

    // 1. Contoured Fitted Bodice
    const bodiceGeo = new THREE.CylinderGeometry(chestR * 1.04, waistR * 1.05, 0.42, 32)
    bodiceGeo.scale(1.15, 1, 0.88)
    const bodice = new THREE.Mesh(bodiceGeo, materials.garmentMat)
    bodice.position.set(0, 1.25, 0)
    bodice.castShadow = true
    dress.add(bodice)

    // 2. Sweetheart Neckline Trim
    const trimGeo = new THREE.TorusGeometry(0.068, 0.012, 12, 28)
    trimGeo.rotateX(Math.PI / 2.2)
    const trim = new THREE.Mesh(trimGeo, materials.garmentMat)
    trim.position.set(0, 1.42, 0.02)
    dress.add(trim)

    // 3. Flowing Pleated Flare Skirt / Ghera (Drapes down to ankles)
    const skirtGeo = new THREE.ConeGeometry(0.56, 1.12, 48, 4, true)
    const skirt = new THREE.Mesh(skirtGeo, materials.garmentMat)
    skirt.position.set(0, 0.52, 0)
    skirt.castShadow = true
    dress.add(skirt)

    // Skirt Pleats definition
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2
      const pleatGeo = new THREE.CylinderGeometry(0.008, 0.025, 1.1, 8)
      const pleat = new THREE.Mesh(pleatGeo, materials.garmentMat)
      pleat.position.set(Math.cos(angle) * 0.28, 0.52, Math.sin(angle) * 0.28)
      dress.add(pleat)
    }

    clothesGroup.add(dress)
  }

  return clothesGroup
}

// -------------------------------------------------------------
// Helper: Detailed Pressed Tailored Trousers
// -------------------------------------------------------------
function buildTailoredTrousers(
  waistR: number,
  hipR: number,
  materials: RealisticAvatarHierarchy["materials"]
): THREE.Group {
  const pantGroup = new THREE.Group()
  pantGroup.name = "TailoredTrousers"

  // 1. Waistband with Belt Loops
  const bandGeo = new THREE.CylinderGeometry(waistR * 1.05, hipR * 1.04, 0.12, 32)
  bandGeo.scale(1.16, 1, 0.84)
  const band = new THREE.Mesh(bandGeo, materials.garmentMat)
  band.position.set(0, 0.94, 0)
  pantGroup.add(band)

  // Belt Buckle
  const buckleGeo = new THREE.BoxGeometry(0.028, 0.022, 0.008)
  const buckle = new THREE.Mesh(buckleGeo, materials.metalMat)
  buckle.position.set(0, 0.96, waistR * 0.84 + 0.005)
  pantGroup.add(buckle)

  // 2. Left and Right Legs with Center Crease
  const legOffsetX = 0.102
  const legR = 0.096

  // Left Leg
  const legLGeo = new THREE.CylinderGeometry(legR * 1.08, legR * 0.78, 0.88, 24)
  legLGeo.scale(1, 1, 1.05)
  const legL = new THREE.Mesh(legLGeo, materials.garmentMat)
  legL.position.set(-legOffsetX, 0.44, 0)
  legL.castShadow = true
  pantGroup.add(legL)

  // Left Crease Ridge (Tailored ironed crease line)
  const creaseGeo = new THREE.BoxGeometry(0.006, 0.86, 0.008)
  const creaseL = new THREE.Mesh(creaseGeo, materials.garmentMat)
  creaseL.position.set(-legOffsetX, 0.44, legR * 1.04)
  pantGroup.add(creaseL)

  // Right Leg
  const legRMesh = new THREE.Mesh(legLGeo, materials.garmentMat)
  legRMesh.position.set(legOffsetX, 0.44, 0)
  legRMesh.castShadow = true
  pantGroup.add(legRMesh)

  const creaseR = new THREE.Mesh(creaseGeo, materials.garmentMat)
  creaseR.position.set(legOffsetX, 0.44, legR * 1.04)
  pantGroup.add(creaseR)

  return pantGroup
}

// -------------------------------------------------------------
// Helper: Churidar / Pyjama Lower Garment
// -------------------------------------------------------------
function buildChuridarPyjama(
  hipR: number,
  materials: RealisticAvatarHierarchy["materials"]
): THREE.Group {
  const pyjama = new THREE.Group()
  const legOffsetX = 0.102
  const legR = 0.09

  // Thigh & Knee taper
  const pyjamaGeo = new THREE.CylinderGeometry(legR * 1.05, legR * 0.65, 0.88, 24)
  
  const pyjamaL = new THREE.Mesh(pyjamaGeo, materials.garmentMat)
  pyjamaL.position.set(-legOffsetX, 0.44, 0)
  pyjama.add(pyjamaL)

  const pyjamaR = new THREE.Mesh(pyjamaGeo, materials.garmentMat)
  pyjamaR.position.set(legOffsetX, 0.44, 0)
  pyjama.add(pyjamaR)

  // Lower Leg Gathers / Churis (Pleat rings around ankles)
  const gatherGeo = new THREE.TorusGeometry(legR * 0.66, 0.012, 8, 20)
  gatherGeo.rotateX(Math.PI / 2)
  for (let g = 0; g < 4; g++) {
    const gatherL = new THREE.Mesh(gatherGeo, materials.garmentMat)
    gatherL.position.set(-legOffsetX, 0.12 + g * 0.035, 0)
    pyjama.add(gatherL)

    const gatherR = new THREE.Mesh(gatherGeo, materials.garmentMat)
    gatherR.position.set(legOffsetX, 0.12 + g * 0.035, 0)
    pyjama.add(gatherR)
  }

  return pyjama
}
