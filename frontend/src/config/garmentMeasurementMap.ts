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

// Reusable coordinate sets
const topCoords: Record<string, MeasurementLine> = {
  shoulder: { key: "shoulder", label: "Shoulder", x1: 120, y1: 100, x2: 280, y2: 100, labelX: 200, labelY: 90, align: "center" },
  chest: { key: "chest", label: "Chest", x1: 135, y1: 170, x2: 265, y2: 170, labelX: 200, labelY: 160, align: "center" },
  bust: { key: "bust", label: "Bust", x1: 135, y1: 170, x2: 265, y2: 170, labelX: 200, labelY: 160, align: "center" },
  upper_chest: { key: "upper_chest", label: "Upper Chest", x1: 130, y1: 140, x2: 270, y2: 140, labelX: 200, labelY: 130, align: "center" },
  waist: { key: "waist", label: "Waist", x1: 145, y1: 250, x2: 255, y2: 250, labelX: 200, labelY: 240, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 320, x2: 270, y2: 320, labelX: 200, labelY: 310, align: "center" },
  length: { key: "length", label: "Length", x1: 300, y1: 100, x2: 300, y2: 450, labelX: 310, labelY: 275, align: "left" },
  sleeve_length: { key: "sleeve_length", label: "Sleeve", x1: 120, y1: 100, x2: 50, y2: 280, labelX: 75, labelY: 180, align: "right" },
  sleeve_round: { key: "sleeve_round", label: "Sleeve Round", x1: 50, y1: 280, x2: 80, y2: 295, labelX: 45, labelY: 305, align: "center" },
  armhole: { key: "armhole", label: "Armhole", x1: 120, y1: 100, x2: 135, y2: 170, labelX: 110, labelY: 135, align: "right" },
  neck_depth: { key: "neck_depth", label: "Neck Depth", x1: 200, y1: 80, x2: 200, y2: 120, labelX: 205, labelY: 100, align: "left" },
  neck_width: { key: "neck_width", label: "Neck Width", x1: 170, y1: 80, x2: 230, y2: 80, labelX: 200, labelY: 70, align: "center" },
  collar: { key: "collar", label: "Collar", x1: 170, y1: 80, x2: 230, y2: 80, labelX: 200, labelY: 70, align: "center" },
}

const bottomCoords: Record<string, MeasurementLine> = {
  waist: { key: "waist", label: "Waist", x1: 140, y1: 100, x2: 260, y2: 100, labelX: 200, labelY: 90, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 160, x2: 270, y2: 160, labelX: 200, labelY: 150, align: "center" },
  thigh: { key: "thigh", label: "Thigh", x1: 130, y1: 230, x2: 195, y2: 230, labelX: 110, labelY: 225, align: "right" },
  knee: { key: "knee", label: "Knee", x1: 140, y1: 350, x2: 185, y2: 350, labelX: 120, labelY: 345, align: "right" },
  calf: { key: "calf", label: "Calf", x1: 145, y1: 430, x2: 180, y2: 430, labelX: 125, labelY: 425, align: "right" },
  ankle: { key: "ankle", label: "Ankle", x1: 150, y1: 520, x2: 175, y2: 520, labelX: 130, labelY: 530, align: "right" },
  bottom_width: { key: "bottom_width", label: "Bottom Width", x1: 150, y1: 520, x2: 175, y2: 520, labelX: 130, labelY: 530, align: "right" },
  length: { key: "length", label: "Length", x1: 300, y1: 100, x2: 300, y2: 520, labelX: 310, labelY: 310, align: "left" },
  inseam: { key: "inseam", label: "Inseam", x1: 210, y1: 230, x2: 210, y2: 520, labelX: 220, labelY: 370, align: "left" },
  rise: { key: "rise", label: "Rise", x1: 200, y1: 100, x2: 200, y2: 230, labelX: 210, labelY: 160, align: "left" },
}

const dressCoords: Record<string, MeasurementLine> = {
  ...topCoords,
  length: { key: "length", label: "Length", x1: 340, y1: 100, x2: 340, y2: 550, labelX: 350, labelY: 325, align: "left" },
  flare: { key: "flare", label: "Flare", x1: 80, y1: 550, x2: 320, y2: 550, labelX: 200, labelY: 540, align: "center" },
}

const skirtCoords: Record<string, MeasurementLine> = {
  waist: { key: "waist", label: "Waist", x1: 150, y1: 150, x2: 250, y2: 150, labelX: 200, labelY: 140, align: "center" },
  hip: { key: "hip", label: "Hip", x1: 130, y1: 220, x2: 270, y2: 220, labelX: 200, labelY: 210, align: "center" },
  thigh: { key: "thigh", label: "Thigh", x1: 110, y1: 300, x2: 290, y2: 300, labelX: 200, labelY: 290, align: "center" },
  length: { key: "length", label: "Length", x1: 340, y1: 150, x2: 340, y2: 550, labelX: 350, labelY: 350, align: "left" },
  flare: { key: "flare", label: "Flare", x1: 80, y1: 550, x2: 320, y2: 550, labelX: 200, labelY: 540, align: "center" },
}

const blouseCoords: Record<string, MeasurementLine> = {
  ...topCoords,
  under_bust: { key: "under_bust", label: "Under Bust", x1: 140, y1: 220, x2: 260, y2: 220, labelX: 200, labelY: 210, align: "center" },
  length: { key: "length", label: "Length", x1: 300, y1: 100, x2: 300, y2: 220, labelX: 310, labelY: 160, align: "left" },
}

// ---------------------------------------------------------
// Maps for specific garments by composing from above sets
// ---------------------------------------------------------

const KurtaMap = {
  shoulder: topCoords.shoulder, bust: topCoords.bust, chest: topCoords.chest, upper_chest: topCoords.upper_chest,
  waist: topCoords.waist, hip: topCoords.hip, armhole: topCoords.armhole, sleeve_length: topCoords.sleeve_length,
  sleeve_round: topCoords.sleeve_round, neck_depth: topCoords.neck_depth, neck_width: topCoords.neck_width, collar: topCoords.collar,
  length: { ...topCoords.length, y2: 520, labelY: 310 } // Kurta length goes to 520
}

const ShirtMap = {
  shoulder: topCoords.shoulder, chest: topCoords.chest, waist: topCoords.waist, hip: topCoords.hip,
  armhole: topCoords.armhole, sleeve_length: topCoords.sleeve_length, sleeve_round: topCoords.sleeve_round,
  collar: topCoords.collar, length: topCoords.length
}

const BottomMap = {
  waist: bottomCoords.waist, hip: bottomCoords.hip, thigh: bottomCoords.thigh, knee: bottomCoords.knee,
  calf: bottomCoords.calf, ankle: bottomCoords.ankle, length: bottomCoords.length, inseam: bottomCoords.inseam,
  rise: bottomCoords.rise, bottom_width: bottomCoords.bottom_width
}

const DressMap = {
  shoulder: dressCoords.shoulder, bust: dressCoords.bust, waist: dressCoords.waist, hip: dressCoords.hip,
  armhole: dressCoords.armhole, sleeve_length: dressCoords.sleeve_length, flare: dressCoords.flare,
  length: dressCoords.length, neck_depth: dressCoords.neck_depth
}

// ---------------------------------------------------------
// Main Registry
// ---------------------------------------------------------
export const GarmentRegistry: Record<string, Record<string, MeasurementLine>> = {
  Kurta: KurtaMap,
  Shirt: ShirtMap,
  Top: ShirtMap,
  Blazer: ShirtMap,
  NehruJacket: ShirtMap,
  Sherwani: { ...ShirtMap, length: { ...topCoords.length, y2: 520, labelY: 310 } },
  IndoWestern: { ...ShirtMap, length: { ...topCoords.length, y2: 520, labelY: 310 } },
  Suit: { ...ShirtMap, thigh: bottomCoords.thigh, ankle: bottomCoords.ankle, inseam: bottomCoords.inseam, rise: bottomCoords.rise }, // Combined top+bottom fields
  
  Pant: BottomMap,
  Pyjama: BottomMap,
  Palazzo: BottomMap,
  Salwar: BottomMap,
  Chudidhar: BottomMap,
  Leggings: BottomMap,
  Dhoti: BottomMap,

  Gown: DressMap,
  Anarkali: DressMap,
  
  Lehenga: skirtCoords,
  
  SareeBlouse: blouseCoords,
}

export function getGarmentMeasurementMap(garmentType: string): Record<string, MeasurementLine> | null {
  return GarmentRegistry[garmentType] || null
}
