import React from "react"
import {
  MensShirtSVG,
  WomensShirtSVG,
  MensTShirtSVG,
  WomensTShirtSVG,
  MensPantSVG,
  WomensPantSVG,
  WomensSalwarSVG,
  MensKurtaSVG,
  WomensKurtiSVG,
  MensBlazerSVG,
  WomensBlazerSVG,
  MensSuitSVG,
  WomensSuitSVG,
  DressVisualSVG,
  GownVisualSVG,
  AnarkaliVisualSVG,
  SkirtVisualSVG,
  BlouseVisualSVG,
  PalazzoVisualSVG,
  DefaultGarmentSVG,
} from "../garments/GenderGarmentVisuals"

export type MeasurementLine = {
  key: string
  label: string
  x1: number
  y1: number
  x2: number
  y2: number
  labelX: number
  labelY: number
  align?: "left" | "center" | "right"
}

export interface GarmentVisualConfig {
  key: string
  gender: "Men" | "Women"
  title: string
  renderSVG: () => React.ReactElement
  imageSrc?: string // e.g. /images/measurements/mens-shirt-measurement.png
  lines: Record<string, MeasurementLine>
}

// ---------------------------------------------------------
// Coordinate Sets
// ---------------------------------------------------------

// Standard Men's Top Coordinates
const mensTopCoords: Record<string, MeasurementLine> = {
  shoulder: { key: "shoulder", label: "Shoulder", x1: 115, y1: 95, x2: 285, y2: 95, labelX: 200, labelY: 82, align: "center" },
  chest: { key: "chest", label: "Chest", x1: 130, y1: 170, x2: 270, y2: 170, labelX: 200, labelY: 158, align: "center" },
  waist: { key: "waist", label: "Waist", x1: 130, y1: 260, x2: 270, y2: 260, labelX: 200, labelY: 248, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 340, x2: 270, y2: 340, labelX: 200, labelY: 328, align: "center" },
  length: { key: "length", label: "Length", x1: 300, y1: 95, x2: 300, y2: 450, labelX: 312, labelY: 270, align: "left" },
  sleeve_length: { key: "sleeve_length", label: "Sleeve", x1: 115, y1: 95, x2: 40, y2: 270, labelX: 68, labelY: 175, align: "right" },
  sleeve_round: { key: "sleeve_round", label: "Cuff Round", x1: 40, y1: 270, x2: 75, y2: 285, labelX: 35, labelY: 298, align: "center" },
  collar: { key: "collar", label: "Collar", x1: 165, y1: 75, x2: 235, y2: 75, labelX: 200, labelY: 62, align: "center" },
  armhole: { key: "armhole", label: "Armhole", x1: 115, y1: 95, x2: 130, y2: 160, labelX: 108, labelY: 130, align: "right" },
  neck_depth: { key: "neck_depth", label: "Neck Depth", x1: 200, y1: 75, x2: 200, y2: 130, labelX: 208, labelY: 105, align: "left" },
}

// Standard Women's Top Coordinates
const womensTopCoords: Record<string, MeasurementLine> = {
  shoulder: { key: "shoulder", label: "Shoulder", x1: 120, y1: 95, x2: 280, y2: 95, labelX: 200, labelY: 82, align: "center" },
  bust: { key: "bust", label: "Bust", x1: 135, y1: 165, x2: 265, y2: 165, labelX: 200, labelY: 153, align: "center" },
  upper_chest: { key: "upper_chest", label: "Upper Chest", x1: 130, y1: 135, x2: 270, y2: 135, labelX: 200, labelY: 123, align: "center" },
  waist: { key: "waist", label: "Waist", x1: 142, y1: 255, x2: 258, y2: 255, labelX: 200, labelY: 243, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 340, x2: 270, y2: 340, labelX: 200, labelY: 328, align: "center" },
  length: { key: "length", label: "Length", x1: 300, y1: 95, x2: 300, y2: 430, labelX: 312, labelY: 260, align: "left" },
  sleeve_length: { key: "sleeve_length", label: "Sleeve", x1: 120, y1: 95, x2: 45, y2: 260, labelX: 72, labelY: 170, align: "right" },
  sleeve_round: { key: "sleeve_round", label: "Cuff / Round", x1: 45, y1: 260, x2: 80, y2: 275, labelX: 40, labelY: 288, align: "center" },
  collar: { key: "collar", label: "Collar", x1: 165, y1: 75, x2: 235, y2: 75, labelX: 200, labelY: 62, align: "center" },
  armhole: { key: "armhole", label: "Armhole", x1: 120, y1: 95, x2: 135, y2: 155, labelX: 110, labelY: 125, align: "right" },
  neck_depth: { key: "neck_depth", label: "Front Neck Depth", x1: 200, y1: 75, x2: 200, y2: 145, labelX: 208, labelY: 115, align: "left" },
  neck_width: { key: "neck_width", label: "Neck Width", x1: 165, y1: 75, x2: 235, y2: 75, labelX: 200, labelY: 60, align: "center" },
}

// Men's Bottom Coordinates
const mensBottomCoords: Record<string, MeasurementLine> = {
  waist: { key: "waist", label: "Waist", x1: 125, y1: 90, x2: 275, y2: 90, labelX: 200, labelY: 75, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 125, y1: 160, x2: 275, y2: 160, labelX: 200, labelY: 148, align: "center" },
  thigh: { key: "thigh", label: "Thigh", x1: 128, y1: 230, x2: 198, y2: 230, labelX: 110, labelY: 225, align: "right" },
  knee: { key: "knee", label: "Knee", x1: 130, y1: 350, x2: 190, y2: 350, labelX: 112, labelY: 345, align: "right" },
  calf: { key: "calf", label: "Calf", x1: 132, y1: 430, x2: 188, y2: 430, labelX: 114, labelY: 425, align: "right" },
  ankle: { key: "ankle", label: "Ankle", x1: 135, y1: 520, x2: 185, y2: 520, labelX: 115, labelY: 530, align: "right" },
  length: { key: "length", label: "Length", x1: 290, y1: 90, x2: 290, y2: 520, labelX: 300, labelY: 300, align: "left" },
  inseam: { key: "inseam", label: "Inseam", x1: 200, y1: 220, x2: 200, y2: 520, labelX: 210, labelY: 370, align: "left" },
  rise: { key: "rise", label: "Rise", x1: 200, y1: 90, x2: 200, y2: 220, labelX: 210, labelY: 155, align: "left" },
}

// Women's Bottom Coordinates
const womensBottomCoords: Record<string, MeasurementLine> = {
  waist: { key: "waist", label: "Waist", x1: 145, y1: 90, x2: 255, y2: 90, labelX: 200, labelY: 78, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 170, x2: 270, y2: 170, labelX: 200, labelY: 158, align: "center" },
  thigh: { key: "thigh", label: "Thigh", x1: 132, y1: 230, x2: 195, y2: 230, labelX: 112, labelY: 225, align: "right" },
  knee: { key: "knee", label: "Knee", x1: 140, y1: 350, x2: 185, y2: 350, labelX: 120, labelY: 345, align: "right" },
  calf: { key: "calf", label: "Calf", x1: 145, y1: 430, x2: 180, y2: 430, labelX: 125, labelY: 425, align: "right" },
  ankle: { key: "ankle", label: "Ankle", x1: 150, y1: 515, x2: 175, y2: 515, labelX: 130, labelY: 525, align: "right" },
  bottom_width: { key: "bottom_width", label: "Flare Width", x1: 100, y1: 520, x2: 185, y2: 520, labelX: 85, labelY: 532, align: "right" },
  length: { key: "length", label: "Length", x1: 290, y1: 90, x2: 290, y2: 515, labelX: 300, labelY: 300, align: "left" },
  rise: { key: "rise", label: "Rise", x1: 200, y1: 90, x2: 200, y2: 220, labelX: 210, labelY: 155, align: "left" },
  inseam: { key: "inseam", label: "Inseam", x1: 200, y1: 220, x2: 200, y2: 515, labelX: 210, labelY: 365, align: "left" },
}

// Dress & Gown Coordinates
const dressCoords: Record<string, MeasurementLine> = {
  ...womensTopCoords,
  length: { key: "length", label: "Length", x1: 340, y1: 80, x2: 340, y2: 540, labelX: 350, labelY: 310, align: "left" },
  flare: { key: "flare", label: "Flare (Ghera)", x1: 80, y1: 540, x2: 320, y2: 540, labelX: 200, labelY: 530, align: "center" },
}

// Saree Blouse Coordinates
const blouseCoords: Record<string, MeasurementLine> = {
  ...womensTopCoords,
  under_bust: { key: "under_bust", label: "Under Bust", x1: 140, y1: 230, x2: 260, y2: 230, labelX: 200, labelY: 218, align: "center" },
  length: { key: "length", label: "Blouse Length", x1: 295, y1: 80, x2: 295, y2: 230, labelX: 305, labelY: 155, align: "left" },
}

// Lehenga Skirt Coordinates
const skirtCoords: Record<string, MeasurementLine> = {
  waist: { key: "waist", label: "Waist", x1: 150, y1: 140, x2: 250, y2: 140, labelX: 200, labelY: 128, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 210, x2: 270, y2: 210, labelX: 200, labelY: 198, align: "center" },
  length: { key: "length", label: "Lehenga Length", x1: 345, y1: 140, x2: 345, y2: 545, labelX: 355, labelY: 340, align: "left" },
  flare: { key: "flare", label: "Bottom Flare", x1: 70, y1: 545, x2: 330, y2: 545, labelX: 200, labelY: 532, align: "center" },
}

// ---------------------------------------------------------
// Scalable Gender + Garment Registry
// ---------------------------------------------------------

export const GARMENT_VISUAL_REGISTRY: Record<string, GarmentVisualConfig> = {
  // === MEN ===
  "men:shirt": {
    key: "Shirt",
    gender: "Men",
    title: "Men's Shirt",
    renderSVG: MensShirtSVG,
    imageSrc: "/images/measurements/mens-shirt-measurement.png",
    lines: {
      shoulder: mensTopCoords.shoulder,
      chest: mensTopCoords.chest,
      waist: mensTopCoords.waist,
      hip: mensTopCoords.hip,
      sleeve_length: mensTopCoords.sleeve_length,
      sleeve_round: mensTopCoords.sleeve_round,
      collar: mensTopCoords.collar,
      length: mensTopCoords.length,
    },
  },
  "men:tshirt": {
    key: "TShirt",
    gender: "Men",
    title: "Men's T-Shirt / Polo",
    renderSVG: MensTShirtSVG,
    imageSrc: "/images/measurements/mens-tshirt-measurement.png",
    lines: {
      chest: mensTopCoords.chest,
      waist: mensTopCoords.waist,
      shoulder: mensTopCoords.shoulder,
      sleeve_length: { ...mensTopCoords.sleeve_length, x2: 65, y2: 190, labelX: 85, labelY: 140 },
      collar: mensTopCoords.collar,
      length: { ...mensTopCoords.length, y2: 430, labelY: 260 },
    },
  },
  "men:pant": {
    key: "Pant",
    gender: "Men",
    title: "Men's Pant / Trouser",
    renderSVG: MensPantSVG,
    imageSrc: "/images/measurements/mens-pant-measurement.png",
    lines: mensBottomCoords,
  },
  "men:kurta": {
    key: "Kurta",
    gender: "Men",
    title: "Men's Kurta / Kurta-Pyjama",
    renderSVG: MensKurtaSVG,
    imageSrc: "/images/measurements/mens-kurta-measurement.png",
    lines: {
      ...mensTopCoords,
      length: { ...mensTopCoords.length, y2: 520, labelY: 310 },
    },
  },
  "men:blazer": {
    key: "Blazer",
    gender: "Men",
    title: "Men's Blazer / Coat",
    renderSVG: MensBlazerSVG,
    imageSrc: "/images/measurements/mens-blazer-measurement.png",
    lines: {
      ...mensTopCoords,
      length: { ...mensTopCoords.length, y2: 460, labelY: 275 },
    },
  },
  "men:suit": {
    key: "Suit",
    gender: "Men",
    title: "Men's 2-Piece / 3-Piece Suit",
    renderSVG: MensSuitSVG,
    imageSrc: "/images/measurements/mens-suit-measurement.png",
    lines: {
      chest: mensTopCoords.chest,
      waist: mensTopCoords.waist,
      hip: mensTopCoords.hip,
      shoulder: mensTopCoords.shoulder,
      sleeve_length: { ...mensTopCoords.sleeve_length, x2: 45, y2: 260 },
      length: { ...mensTopCoords.length, y2: 370, labelY: 230 },
      thigh: { ...mensBottomCoords.thigh, y1: 400, y2: 400, labelY: 395 },
      ankle: { ...mensBottomCoords.ankle, y1: 540, y2: 540, labelY: 550 },
      inseam: { ...mensBottomCoords.inseam, y1: 370, y2: 540, labelY: 455 },
      rise: { ...mensBottomCoords.rise, y1: 350, y2: 370, labelY: 360 },
    },
  },
  "men:indowestern": {
    key: "IndoWestern",
    gender: "Men",
    title: "Men's Indo-Western",
    renderSVG: MensKurtaSVG,
    imageSrc: "/images/measurements/mens-indowestern-measurement.png",
    lines: {
      ...mensTopCoords,
      length: { ...mensTopCoords.length, y2: 480, labelY: 285 },
      ankle: mensBottomCoords.ankle,
      rise: mensBottomCoords.rise,
    },
  },
  "men:sherwani": {
    key: "Sherwani",
    gender: "Men",
    title: "Men's Sherwani",
    renderSVG: MensKurtaSVG,
    imageSrc: "/images/measurements/mens-sherwani-measurement.png",
    lines: {
      ...mensTopCoords,
      length: { ...mensTopCoords.length, y2: 520, labelY: 310 },
    },
  },
  "men:dhoti": {
    key: "Dhoti",
    gender: "Men",
    title: "Men's Dhoti / Dhoti Pant",
    renderSVG: MensPantSVG,
    imageSrc: "/images/measurements/mens-dhoti-measurement.png",
    lines: mensBottomCoords,
  },
  "men:nehrujacket": {
    key: "NehruJacket",
    gender: "Men",
    title: "Men's Nehru Jacket / Waistcoat",
    renderSVG: MensBlazerSVG,
    imageSrc: "/images/measurements/mens-nehrujacket-measurement.png",
    lines: {
      chest: mensTopCoords.chest,
      waist: mensTopCoords.waist,
      hip: mensTopCoords.hip,
      shoulder: mensTopCoords.shoulder,
      armhole: mensTopCoords.armhole,
      collar: mensTopCoords.collar,
      length: { ...mensTopCoords.length, y2: 380, labelY: 235 },
    },
  },
  "men:pyjama": {
    key: "Pyjama",
    gender: "Men",
    title: "Men's Pyjama / Churidar",
    renderSVG: MensPantSVG,
    imageSrc: "/images/measurements/mens-pyjama-measurement.png",
    lines: mensBottomCoords,
  },

  // === WOMEN ===
  "women:shirt": {
    key: "Shirt",
    gender: "Women",
    title: "Women's Shirt / Button-Down",
    renderSVG: WomensShirtSVG,
    imageSrc: "/images/measurements/womens-shirt-measurement.png",
    lines: {
      bust: womensTopCoords.bust,
      waist: womensTopCoords.waist,
      hip: womensTopCoords.hip,
      shoulder: womensTopCoords.shoulder,
      sleeve_length: womensTopCoords.sleeve_length,
      sleeve_round: womensTopCoords.sleeve_round,
      collar: womensTopCoords.collar,
      length: womensTopCoords.length,
    },
  },
  "women:top": {
    key: "Top",
    gender: "Women",
    title: "Women's Top / Blouse",
    renderSVG: WomensShirtSVG,
    imageSrc: "/images/measurements/womens-top-measurement.png",
    lines: {
      bust: womensTopCoords.bust,
      waist: womensTopCoords.waist,
      hip: womensTopCoords.hip,
      shoulder: womensTopCoords.shoulder,
      sleeve_length: womensTopCoords.sleeve_length,
      length: womensTopCoords.length,
    },
  },
  "women:tshirt": {
    key: "TShirt",
    gender: "Women",
    title: "Women's T-Shirt / Tee",
    renderSVG: WomensTShirtSVG,
    imageSrc: "/images/measurements/womens-tshirt-measurement.png",
    lines: {
      bust: womensTopCoords.bust,
      waist: womensTopCoords.waist,
      shoulder: womensTopCoords.shoulder,
      sleeve_length: { ...womensTopCoords.sleeve_length, x2: 70, y2: 175, labelX: 90, labelY: 135 },
      length: { ...womensTopCoords.length, y2: 410, labelY: 250 },
    },
  },
  "women:kurta": {
    key: "Kurta",
    gender: "Women",
    title: "Women's Kurta / Kurti",
    renderSVG: WomensKurtiSVG,
    imageSrc: "/images/measurements/womens-kurta-measurement.png",
    lines: {
      ...womensTopCoords,
      length: { ...womensTopCoords.length, y2: 520, labelY: 310 },
    },
  },
  "women:pant": {
    key: "Pant",
    gender: "Women",
    title: "Women's Pant / Trousers",
    renderSVG: WomensPantSVG,
    imageSrc: "/images/measurements/womens-pant-measurement.png",
    lines: womensBottomCoords,
  },
  "women:salwar": {
    key: "Salwar",
    gender: "Women",
    title: "Women's Salwar / Patiala",
    renderSVG: WomensSalwarSVG,
    imageSrc: "/images/measurements/womens-salwar-measurement.png",
    lines: {
      waist: { key: "waist", label: "Waist Round", x1: 145, y1: 85, x2: 255, y2: 85, labelX: 200, labelY: 72, align: "center" },
      hip: { key: "hip", label: "Hip Round", x1: 95, y1: 240, x2: 305, y2: 240, labelX: 200, labelY: 228, align: "center" },
      length: { key: "length", label: "Salwar Length", x1: 325, y1: 85, x2: 325, y2: 520, labelX: 335, labelY: 300, align: "left" },
      ankle: { key: "ankle", label: "Mohri / Bottom Round", x1: 155, y1: 520, x2: 185, y2: 520, labelX: 135, labelY: 530, align: "right" },
      rise: { key: "rise", label: "Rise", x1: 200, y1: 85, x2: 200, y2: 240, labelX: 210, labelY: 160, align: "left" },
    },
  },
  "women:palazzo": {
    key: "Palazzo",
    gender: "Women",
    title: "Women's Palazzo / Plazo",
    renderSVG: PalazzoVisualSVG,
    imageSrc: "/images/measurements/womens-palazzo-measurement.png",
    lines: womensBottomCoords,
  },
  "women:blazer": {
    key: "Blazer",
    gender: "Women",
    title: "Women's Blazer / Coat",
    renderSVG: WomensBlazerSVG,
    imageSrc: "/images/measurements/womens-blazer-measurement.png",
    lines: {
      ...womensTopCoords,
      length: { ...womensTopCoords.length, y2: 445, labelY: 265 },
    },
  },
  "women:suit": {
    key: "Suit",
    gender: "Women",
    title: "Women's Pant Suit",
    renderSVG: WomensSuitSVG,
    imageSrc: "/images/measurements/womens-suit-measurement.png",
    lines: {
      bust: womensTopCoords.bust,
      waist: womensTopCoords.waist,
      hip: womensTopCoords.hip,
      shoulder: womensTopCoords.shoulder,
      sleeve_length: { ...womensTopCoords.sleeve_length, x2: 50, y2: 250 },
      length: { ...womensTopCoords.length, y2: 355, labelY: 225 },
      thigh: { ...womensBottomCoords.thigh, y1: 390, y2: 390, labelY: 385 },
      ankle: { ...womensBottomCoords.ankle, y1: 535, y2: 535, labelY: 545 },
      inseam: { ...womensBottomCoords.inseam, y1: 360, y2: 535, labelY: 450 },
      rise: { ...womensBottomCoords.rise, y1: 340, y2: 360, labelY: 350 },
    },
  },
  "women:dress": {
    key: "Dress",
    gender: "Women",
    title: "Women's Dress / One-Piece",
    renderSVG: DressVisualSVG,
    imageSrc: "/images/measurements/womens-dress-measurement.png",
    lines: dressCoords,
  },
  "women:gown": {
    key: "Gown",
    gender: "Women",
    title: "Women's Gown / Indo-Western",
    renderSVG: GownVisualSVG,
    imageSrc: "/images/measurements/womens-gown-measurement.png",
    lines: dressCoords,
  },
  "women:anarkali": {
    key: "Anarkali",
    gender: "Women",
    title: "Women's Anarkali Suit",
    renderSVG: AnarkaliVisualSVG,
    imageSrc: "/images/measurements/womens-anarkali-measurement.png",
    lines: dressCoords,
  },
  "women:lehenga": {
    key: "Lehenga",
    gender: "Women",
    title: "Women's Lehenga / Skirt",
    renderSVG: SkirtVisualSVG,
    imageSrc: "/images/measurements/womens-lehenga-measurement.png",
    lines: skirtCoords,
  },
  "women:sareeblouse": {
    key: "SareeBlouse",
    gender: "Women",
    title: "Women's Saree Blouse",
    renderSVG: BlouseVisualSVG,
    imageSrc: "/images/measurements/womens-sareeblouse-measurement.png",
    lines: blouseCoords,
  },
  "women:chudidhar": {
    key: "Chudidhar",
    gender: "Women",
    title: "Women's Chudidhar",
    renderSVG: WomensPantSVG,
    imageSrc: "/images/measurements/womens-chudidhar-measurement.png",
    lines: womensBottomCoords,
  },
  "women:leggings": {
    key: "Leggings",
    gender: "Women",
    title: "Women's Leggings",
    renderSVG: WomensPantSVG,
    imageSrc: "/images/measurements/womens-leggings-measurement.png",
    lines: womensBottomCoords,
  },
}

// ---------------------------------------------------------
// Graceful Default Visual Config
// ---------------------------------------------------------
export const DEFAULT_VISUAL_CONFIG: GarmentVisualConfig = {
  key: "Default",
  gender: "Men",
  title: "Standard Garment Measurement",
  renderSVG: DefaultGarmentSVG,
  imageSrc: "/placeholder.svg",
  lines: {
    chest: mensTopCoords.chest,
    waist: mensTopCoords.waist,
    hip: mensTopCoords.hip,
    shoulder: mensTopCoords.shoulder,
    length: mensTopCoords.length,
  },
}

// ---------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------

/**
 * Normalizes gender string to "Men" | "Women"
 */
export function normalizeGender(gender?: string): "Men" | "Women" {
  const norm = (gender || "").trim().toLowerCase()
  if (norm.includes("women") || norm === "female" || norm === "f") {
    return "Women"
  }
  return "Men"
}

/**
 * Generates the standardized measurement image filename/URL
 * e.g. "mens-shirt-measurement.png" or "womens-pant-measurement.png"
 */
export function getMeasurementImageUrl(gender: string, garmentType: string): string {
  const normalizedGender = normalizeGender(gender) === "Women" ? "womens" : "mens"
  const cleanType = (garmentType || "garment")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return `/images/measurements/${normalizedGender}-${cleanType}-measurement.png`
}

/**
 * Returns the complete visual configuration (SVG renderer, measurement lines, images, title)
 * based on both gender and garmentType. Falls back gracefully to default if not found.
 */
export function getGarmentVisualConfig(gender: string, garmentType: string): GarmentVisualConfig {
  if (!garmentType) return DEFAULT_VISUAL_CONFIG

  const normGender = normalizeGender(gender).toLowerCase()
  const cleanKey = garmentType.toLowerCase().replace(/[^a-z0-9]/g, "")
  const registryKey = `${normGender}:${cleanKey}`

  // 1. Direct registry hit (e.g. "men:shirt", "women:pant")
  if (GARMENT_VISUAL_REGISTRY[registryKey]) {
    return GARMENT_VISUAL_REGISTRY[registryKey]
  }

  // 2. Exact or prefix match in primary gender registry
  const primaryMatch = Object.entries(GARMENT_VISUAL_REGISTRY).find(([k, v]) => {
    if (!k.startsWith(normGender)) return false
    const vKeyLower = v.key.toLowerCase()
    const vTitleClean = v.title.toLowerCase().replace(/[^a-z0-9]/g, "")
    return (
      vKeyLower === cleanKey ||
      vTitleClean === cleanKey ||
      cleanKey.startsWith(vKeyLower) ||
      vTitleClean.includes(cleanKey)
    )
  })

  if (primaryMatch) {
    return primaryMatch[1]
  }

  // 3. Opposite gender fallback if garment is unisex (e.g. Kurta, Pant)
  const otherGender = normGender === "women" ? "men" : "women"
  const oppositeMatch = Object.entries(GARMENT_VISUAL_REGISTRY).find(([k, v]) => {
    if (!k.startsWith(otherGender)) return false
    const vKeyLower = v.key.toLowerCase()
    const vTitleClean = v.title.toLowerCase().replace(/[^a-z0-9]/g, "")
    return (
      vKeyLower === cleanKey ||
      vTitleClean === cleanKey ||
      cleanKey.startsWith(vKeyLower) ||
      vTitleClean.includes(cleanKey)
    )
  })

  if (oppositeMatch) {
    return oppositeMatch[1]
  }

  // 4. Return robust default visual config
  return DEFAULT_VISUAL_CONFIG
}

/**
 * Legacy backwards compatibility helper
 */
export function getGarmentMeasurementMap(garmentType: string, gender?: string): Record<string, MeasurementLine> {
  const config = getGarmentVisualConfig(gender || "Men", garmentType)
  return config.lines
}
