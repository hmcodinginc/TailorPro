export type UnitType = "inches" | "cm"

export interface MeasurementFieldDef {
  key: string
  label: string
  category: "upper" | "lower" | "overall" | "detail"
  description: string
  defaultMenInches: number
  defaultWomenInches: number
  minInches: number
  maxInches: number
  stepInches: number
}

export const MEASUREMENT_FIELDS: MeasurementFieldDef[] = [
  {
    key: "neck",
    label: "Neck / Collar",
    category: "upper",
    description: "Circumference around the base of the neck",
    defaultMenInches: 15.5,
    defaultWomenInches: 14.0,
    minInches: 11,
    maxInches: 22,
    stepInches: 0.25,
  },
  {
    key: "shoulder",
    label: "Shoulder Span",
    category: "upper",
    description: "Across the back from shoulder bone to shoulder bone",
    defaultMenInches: 18.0,
    defaultWomenInches: 15.5,
    minInches: 12,
    maxInches: 26,
    stepInches: 0.25,
  },
  {
    key: "chest",
    label: "Chest / Bust",
    category: "upper",
    description: "Fullest circumference around the chest/bust",
    defaultMenInches: 40.0,
    defaultWomenInches: 36.0,
    minInches: 28,
    maxInches: 60,
    stepInches: 0.25,
  },
  {
    key: "armhole",
    label: "Armhole Round",
    category: "upper",
    description: "Circumference around the shoulder socket & underarm",
    defaultMenInches: 19.0,
    defaultWomenInches: 16.5,
    minInches: 13,
    maxInches: 26,
    stepInches: 0.25,
  },
  {
    key: "sleeve_length",
    label: "Sleeve Length",
    category: "upper",
    description: "From shoulder tip down along arm to wrist bone",
    defaultMenInches: 25.0,
    defaultWomenInches: 23.0,
    minInches: 16,
    maxInches: 34,
    stepInches: 0.25,
  },
  {
    key: "bicep",
    label: "Bicep Round",
    category: "upper",
    description: "Circumference around the fullest part of the upper arm",
    defaultMenInches: 13.5,
    defaultWomenInches: 11.5,
    minInches: 8,
    maxInches: 24,
    stepInches: 0.25,
  },
  {
    key: "wrist",
    label: "Wrist / Cuff",
    category: "upper",
    description: "Circumference around the wrist bone",
    defaultMenInches: 7.5,
    defaultWomenInches: 6.5,
    minInches: 5,
    maxInches: 12,
    stepInches: 0.25,
  },
  {
    key: "waist",
    label: "Waist Round",
    category: "lower",
    description: "Circumference around the natural waistline",
    defaultMenInches: 34.0,
    defaultWomenInches: 28.0,
    minInches: 22,
    maxInches: 56,
    stepInches: 0.25,
  },
  {
    key: "hip",
    label: "Hip Round",
    category: "lower",
    description: "Circumference around the widest part of the hips/seat",
    defaultMenInches: 40.0,
    defaultWomenInches: 38.0,
    minInches: 28,
    maxInches: 62,
    stepInches: 0.25,
  },
  {
    key: "thigh",
    label: "Thigh Round",
    category: "lower",
    description: "Circumference around the fullest part of the upper thigh",
    defaultMenInches: 23.0,
    defaultWomenInches: 21.0,
    minInches: 15,
    maxInches: 36,
    stepInches: 0.25,
  },
  {
    key: "knee",
    label: "Knee Round",
    category: "lower",
    description: "Circumference around the center of the knee",
    defaultMenInches: 16.0,
    defaultWomenInches: 14.5,
    minInches: 10,
    maxInches: 24,
    stepInches: 0.25,
  },
  {
    key: "calf",
    label: "Calf Round",
    category: "lower",
    description: "Circumference around the widest part of the calf muscle",
    defaultMenInches: 15.0,
    defaultWomenInches: 13.5,
    minInches: 9,
    maxInches: 24,
    stepInches: 0.25,
  },
  {
    key: "inseam",
    label: "Inseam Length",
    category: "lower",
    description: "From the inner crotch down to the ankle / shoe top",
    defaultMenInches: 31.0,
    defaultWomenInches: 29.0,
    minInches: 20,
    maxInches: 40,
    stepInches: 0.25,
  },
  {
    key: "rise",
    label: "Rise (Crotch Depth)",
    category: "lower",
    description: "From waistband down to the crotch level",
    defaultMenInches: 10.5,
    defaultWomenInches: 10.0,
    minInches: 7,
    maxInches: 16,
    stepInches: 0.25,
  },
  {
    key: "height",
    label: "Total Height",
    category: "overall",
    description: "Total standing height from head to floor",
    defaultMenInches: 70.0, // 5'10"
    defaultWomenInches: 65.0, // 5'5"
    minInches: 48,
    maxInches: 84,
    stepInches: 0.5,
  },
  {
    key: "length",
    label: "Garment Length",
    category: "overall",
    description: "Total length of the garment from high point shoulder/waist",
    defaultMenInches: 30.0,
    defaultWomenInches: 28.0,
    minInches: 15,
    maxInches: 60,
    stepInches: 0.25,
  },
]

// Conversion Helpers
export function inchesToCm(val: number): number {
  return Number((val * 2.54).toFixed(1))
}

export function cmToInches(val: number): number {
  return Number((val / 2.54).toFixed(2))
}

export function formatMeasurementValue(valInInches: number | undefined | null, unit: UnitType): string {
  if (valInInches === undefined || valInInches === null || isNaN(valInInches)) return "—"
  if (unit === "cm") {
    return `${inchesToCm(valInInches)} cm`
  }
  return `${valInInches}"`
}

export function formatDualMeasurement(valInInches: number | undefined | null): string {
  if (valInInches === undefined || valInInches === null || isNaN(valInInches)) return "—"
  const cm = inchesToCm(valInInches)
  return `${valInInches}" (${cm} cm)`
}

// Sizing standard templates (in inches)
export const STANDARD_SIZES: Record<"Men" | "Women", Record<string, Record<string, number>>> = {
  Men: {
    XS: { neck: 14.5, shoulder: 16.5, chest: 36, waist: 30, hip: 36, armhole: 17.5, sleeve_length: 24, bicep: 12, wrist: 7, thigh: 21, knee: 14.5, calf: 13.5, inseam: 29.5, rise: 9.5, height: 67, length: 28 },
    S:  { neck: 15.0, shoulder: 17.2, chest: 38, waist: 32, hip: 38, armhole: 18.2, sleeve_length: 24.5, bicep: 12.8, wrist: 7.2, thigh: 22, knee: 15.2, calf: 14.2, inseam: 30.0, rise: 10.0, height: 68.5, length: 29 },
    M:  { neck: 15.5, shoulder: 18.0, chest: 40, waist: 34, hip: 40, armhole: 19.0, sleeve_length: 25.0, bicep: 13.5, wrist: 7.5, thigh: 23, knee: 16.0, calf: 15.0, inseam: 31.0, rise: 10.5, height: 70.0, length: 30 },
    L:  { neck: 16.2, shoulder: 18.8, chest: 42, waist: 36, hip: 42, armhole: 19.8, sleeve_length: 25.5, bicep: 14.3, wrist: 7.8, thigh: 24.2, knee: 16.8, calf: 15.8, inseam: 31.5, rise: 11.0, height: 71.5, length: 30.5 },
    XL: { neck: 17.0, shoulder: 19.6, chest: 44, waist: 38, hip: 44, armhole: 20.6, sleeve_length: 26.0, bicep: 15.2, wrist: 8.2, thigh: 25.5, knee: 17.5, calf: 16.5, inseam: 32.0, rise: 11.5, height: 72.5, length: 31 },
    XXL:{ neck: 17.8, shoulder: 20.5, chest: 47, waist: 42, hip: 47, armhole: 21.5, sleeve_length: 26.5, bicep: 16.2, wrist: 8.5, thigh: 27.0, knee: 18.5, calf: 17.5, inseam: 32.5, rise: 12.0, height: 73.0, length: 32 },
  },
  Women: {
    XS: { neck: 13.0, shoulder: 14.5, chest: 32, waist: 25, hip: 35, armhole: 15.0, sleeve_length: 22.0, bicep: 10.2, wrist: 6.0, thigh: 19.5, knee: 13.0, calf: 12.2, inseam: 28.0, rise: 9.0, height: 62.0, length: 26 },
    S:  { neck: 13.5, shoulder: 15.0, chest: 34, waist: 26.5, hip: 36.5, armhole: 15.8, sleeve_length: 22.5, bicep: 10.8, wrist: 6.2, thigh: 20.2, knee: 13.8, calf: 12.8, inseam: 28.5, rise: 9.5, height: 63.5, length: 27 },
    M:  { neck: 14.0, shoulder: 15.5, chest: 36, waist: 28.0, hip: 38.0, armhole: 16.5, sleeve_length: 23.0, bicep: 11.5, wrist: 6.5, thigh: 21.0, knee: 14.5, calf: 13.5, inseam: 29.0, rise: 10.0, height: 65.0, length: 28 },
    L:  { neck: 14.5, shoulder: 16.2, chest: 39, waist: 30.5, hip: 40.5, armhole: 17.3, sleeve_length: 23.5, bicep: 12.3, wrist: 6.8, thigh: 22.2, knee: 15.3, calf: 14.2, inseam: 29.5, rise: 10.5, height: 66.5, length: 29 },
    XL: { neck: 15.2, shoulder: 17.0, chest: 42, waist: 33.5, hip: 43.5, armhole: 18.2, sleeve_length: 24.0, bicep: 13.2, wrist: 7.2, thigh: 23.8, knee: 16.2, calf: 15.0, inseam: 30.0, rise: 11.0, height: 67.5, length: 30 },
    XXL:{ neck: 16.0, shoulder: 17.8, chest: 45, waist: 37.0, hip: 47.0, armhole: 19.2, sleeve_length: 24.5, bicep: 14.2, wrist: 7.5, thigh: 25.5, knee: 17.2, calf: 16.0, inseam: 30.5, rise: 11.5, height: 68.0, length: 31 },
  },
}

export type FitType = "slim" | "regular" | "loose"

export const FIT_ALLOWANCE: Record<FitType, { label: string; chestEase: number; waistEase: number; sleeveEase: number; hipEase: number }> = {
  slim:    { label: "Slim Fit (Snug)",       chestEase: -0.5, waistEase: -0.5, sleeveEase: -0.25, hipEase: -0.5 },
  regular: { label: "Regular Fit (Standard)", chestEase: 0.0,  waistEase: 0.0,  sleeveEase: 0.0,   hipEase: 0.0  },
  loose:   { label: "Comfort / Relaxed Fit",  chestEase: +1.5, waistEase: +1.5, sleeveEase: +0.75, hipEase: +1.2 },
}

// Popular tailoring garment presets
export interface GarmentPresetDef {
  key: string
  label: string
  emoji: string
  gender: "Men" | "Women" | "Both"
  recommendedGarmentLength: number
  primaryFields: string[]
}

export const GARMENT_3D_PRESETS: GarmentPresetDef[] = [
  {
    key: "Shirt",
    label: "Shirt / Button-Down",
    emoji: "👔",
    gender: "Both",
    recommendedGarmentLength: 29.5,
    primaryFields: ["chest", "waist", "shoulder", "sleeve_length", "collar", "neck", "bicep", "wrist", "length"],
  },
  {
    key: "Kurta",
    label: "Kurta / Kurti",
    emoji: "🥻",
    gender: "Both",
    recommendedGarmentLength: 42.0,
    primaryFields: ["chest", "waist", "hip", "shoulder", "armhole", "sleeve_length", "bicep", "collar", "length"],
  },
  {
    key: "Blazer",
    label: "Blazer / Sport Coat",
    emoji: "🧥",
    gender: "Both",
    recommendedGarmentLength: 30.0,
    primaryFields: ["chest", "waist", "hip", "shoulder", "sleeve_length", "armhole", "bicep", "length"],
  },
  {
    key: "Suit",
    label: "2-Piece / 3-Piece Suit",
    emoji: "🤵",
    gender: "Both",
    recommendedGarmentLength: 30.0,
    primaryFields: ["chest", "waist", "hip", "shoulder", "sleeve_length", "inseam", "thigh", "knee", "calf", "rise", "length"],
  },
  {
    key: "Pant",
    label: "Pant / Trouser",
    emoji: "👖",
    gender: "Both",
    recommendedGarmentLength: 40.0,
    primaryFields: ["waist", "hip", "thigh", "knee", "calf", "ankle", "inseam", "rise", "length"],
  },
  {
    key: "Waistcoat",
    label: "Nehru Jacket / Waistcoat",
    emoji: "🦺",
    gender: "Both",
    recommendedGarmentLength: 26.5,
    primaryFields: ["chest", "waist", "hip", "shoulder", "armhole", "collar", "length"],
  },
  {
    key: "Top",
    label: "Top / Blouse",
    emoji: "👚",
    gender: "Women",
    recommendedGarmentLength: 24.0,
    primaryFields: ["chest", "waist", "shoulder", "armhole", "sleeve_length", "length"],
  },
  {
    key: "Dress",
    label: "Dress / Gown",
    emoji: "👗",
    gender: "Women",
    recommendedGarmentLength: 52.0,
    primaryFields: ["chest", "waist", "hip", "shoulder", "sleeve_length", "flare", "length"],
  },
  {
    key: "Salwar",
    label: "Salwar / Chudidhar",
    emoji: "👖",
    gender: "Women",
    recommendedGarmentLength: 39.0,
    primaryFields: ["waist", "hip", "thigh", "knee", "calf", "ankle", "rise", "length"],
  },
]
