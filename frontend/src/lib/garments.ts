export interface GarmentField {
  key: string
  label: string
}

export interface GarmentTemplate {
  key: string
  label: string
  emoji: string
  gender: "Men" | "Women"
  fields: GarmentField[]
}

export const MEN_GARMENTS: Record<string, GarmentTemplate> = {
  Pant: {
    key: "Pant",
    label: "Pant / Trouser",
    emoji: "👖",
    gender: "Men",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "knee", label: "Knee Round" },
      { key: "calf", label: "Calf Round" },
      { key: "ankle", label: "Bottom / Ankle Round" },
      { key: "length", label: "Total Length (Outseam)" },
      { key: "inseam", label: "Inseam Length" },
      { key: "rise", label: "Rise (Crotch Depth)" },
    ],
  },
  Shirt: {
    key: "Shirt",
    label: "Shirt",
    emoji: "👔",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round / Cuff" },
      { key: "collar", label: "Collar / Neck Size" },
      { key: "length", label: "Shirt Length" },
    ],
  },
  Kurta: {
    key: "Kurta",
    label: "Kurta / Kurta-Pyjama",
    emoji: "🥻",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round" },
      { key: "collar", label: "Collar / Neck Size" },
      { key: "length", label: "Kurta Length" },
      { key: "neck_depth", label: "Front Neck Depth" },
    ],
  },
  Blazer: {
    key: "Blazer",
    label: "Blazer / Coat",
    emoji: "🧥",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round" },
      { key: "length", label: "Coat Length" },
      { key: "collar", label: "Neck / Lapel Size" },
    ],
  },
  Suit: {
    key: "Suit",
    label: "2-Piece / 3-Piece Suit",
    emoji: "🤵",
    gender: "Men",
    fields: [
      { key: "chest", label: "Coat Chest" },
      { key: "waist", label: "Coat Waist" },
      { key: "hip", label: "Coat Hip" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length", label: "Coat Length" },
      { key: "thigh", label: "Trouser Thigh" },
      { key: "ankle", label: "Trouser Bottom Round" },
      { key: "inseam", label: "Trouser Inseam" },
      { key: "rise", label: "Trouser Rise" },
    ],
  },
  IndoWestern: {
    key: "IndoWestern",
    label: "Indo-Western",
    emoji: "👘",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length", label: "Jacket / Top Length" },
      { key: "ankle", label: "Bottom Round" },
      { key: "rise", label: "Bottom Rise" },
    ],
  },
  Sherwani: {
    key: "Sherwani",
    label: "Sherwani",
    emoji: "🧥",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round" },
      { key: "collar", label: "Collar / Neck Size" },
      { key: "length", label: "Sherwani Length" },
    ],
  },
  Dhoti: {
    key: "Dhoti",
    label: "Dhoti / Dhoti Pant",
    emoji: "🩳",
    gender: "Men",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "length", label: "Dhoti Length" },
      { key: "ankle", label: "Ankle Round" },
      { key: "rise", label: "Rise / Crotch Depth" },
    ],
  },
  NehruJacket: {
    key: "NehruJacket",
    label: "Nehru Jacket / Waistcoat",
    emoji: "🦺",
    gender: "Men",
    fields: [
      { key: "chest", label: "Chest Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "collar", label: "Collar Size" },
      { key: "length", label: "Jacket Length" },
    ],
  },
  Pyjama: {
    key: "Pyjama",
    label: "Pyjama / Churidar Pyjama",
    emoji: "👖",
    gender: "Men",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "knee", label: "Knee Round" },
      { key: "ankle", label: "Bottom / Ankle Round" },
      { key: "length", label: "Total Length" },
    ],
  },
}

export const WOMEN_GARMENTS: Record<string, GarmentTemplate> = {
  Kurta: {
    key: "Kurta",
    label: "Kurta / Kurti",
    emoji: "👗",
    gender: "Women",
    fields: [
      { key: "bust", label: "Bust / Chest" },
      { key: "upper_chest", label: "Upper Chest" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round" },
      { key: "length", label: "Kurta Length" },
      { key: "neck_depth", label: "Front Neck Depth" },
      { key: "neck_width", label: "Neck Width / Back Depth" },
    ],
  },
  Pant: {
    key: "Pant",
    label: "Pant / Trousers",
    emoji: "👖",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "knee", label: "Knee Round" },
      { key: "ankle", label: "Bottom / Ankle Round" },
      { key: "length", label: "Length (Waist to Ankle)" },
      { key: "rise", label: "Rise (Crotch Depth)" },
    ],
  },
  Palazzo: {
    key: "Palazzo",
    label: "Palazzo / Plazo",
    emoji: "👖",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "length", label: "Palazzo Length" },
      { key: "bottom_width", label: "Bottom Flare Width" },
      { key: "rise", label: "Rise" },
    ],
  },
  Gown: {
    key: "Gown",
    label: "Gown / Indo-Western Dress",
    emoji: "👗",
    gender: "Women",
    fields: [
      { key: "bust", label: "Bust Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length", label: "Length (Shoulder to Floor)" },
      { key: "flare", label: "Flare / Ghera" },
      { key: "neck_depth", label: "Front Neck Depth" },
    ],
  },
  Anarkali: {
    key: "Anarkali",
    label: "Anarkali Suit / Kurti",
    emoji: "👗",
    gender: "Women",
    fields: [
      { key: "bust", label: "Bust Round" },
      { key: "waist", label: "Upper Waist" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length", label: "Total Length" },
      { key: "flare", label: "Flare (Ghera)" },
      { key: "neck_depth", label: "Neck Depth" },
    ],
  },
  Lehenga: {
    key: "Lehenga",
    label: "Lehenga / Skirt",
    emoji: "👗",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "length", label: "Lehenga Length (Waist to Floor)" },
      { key: "flare", label: "Bottom Flare / Ghera" },
    ],
  },
  SareeBlouse: {
    key: "SareeBlouse",
    label: "Saree Blouse",
    emoji: "👚",
    gender: "Women",
    fields: [
      { key: "bust", label: "Bust Round" },
      { key: "upper_chest", label: "Upper Chest" },
      { key: "under_bust", label: "Under Bust / Waist" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "armhole", label: "Armhole Round" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "sleeve_round", label: "Sleeve Round" },
      { key: "length", label: "Blouse Length" },
      { key: "neck_depth", label: "Front Neck Depth" },
      { key: "neck_width", label: "Back Neck Depth" },
    ],
  },
  Salwar: {
    key: "Salwar",
    label: "Salwar / Patiala",
    emoji: "👖",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "length", label: "Salwar Length" },
      { key: "ankle", label: "Bottom Mohri Round" },
      { key: "rise", label: "Rise / Crotch Depth" },
    ],
  },
  Chudidhar: {
    key: "Chudidhar",
    label: "Chudidhar",
    emoji: "👖",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "knee", label: "Knee Round" },
      { key: "calf", label: "Calf Round" },
      { key: "ankle", label: "Ankle Round" },
      { key: "length", label: "Chudidhar Length (with gathers)" },
    ],
  },
  Leggings: {
    key: "Leggings",
    label: "Leggings",
    emoji: "👖",
    gender: "Women",
    fields: [
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "thigh", label: "Thigh Round" },
      { key: "length", label: "Length" },
      { key: "ankle", label: "Ankle Round" },
    ],
  },
  Top: {
    key: "Top",
    label: "Top / Western Shirt",
    emoji: "👔",
    gender: "Women",
    fields: [
      { key: "bust", label: "Bust Round" },
      { key: "waist", label: "Waist Round" },
      { key: "hip", label: "Hip Round" },
      { key: "shoulder", label: "Shoulder Width" },
      { key: "sleeve_length", label: "Sleeve Length" },
      { key: "length", label: "Top Length" },
    ],
  },
}

export const ALL_GARMENTS: Record<string, GarmentTemplate> = {
  ...MEN_GARMENTS,
  ...WOMEN_GARMENTS,
  // Legacy mapping fallbacks:
  Plazo: WOMEN_GARMENTS.Palazzo,
  Pants: MEN_GARMENTS.Pant,
  Trouser: MEN_GARMENTS.Pant,
  Trousers: MEN_GARMENTS.Pant,
}

export function normalizeGarmentKey(name: string | null | undefined): string {
  if (!name) return ""
  const lower = name.trim().toLowerCase()
  if (lower === "pant" || lower === "pants" || lower === "trouser" || lower === "trousers" || lower.includes("pant") || lower.includes("trouser")) {
    return "Pant"
  }
  if (lower === "pyjama" || lower === "pajama") {
    return "Pyjama"
  }
  if (lower === "chudidhar" || lower === "churidar") {
    return "Chudidhar"
  }
  if (lower === "plazo" || lower === "palazzo") {
    return "Palazzo"
  }
  if (lower === "salwar" || lower === "shalwar") {
    return "Salwar"
  }
  if (lower === "kurta" || lower.includes("kurta")) {
    return "Kurta"
  }
  if (lower === "shirt" || lower.includes("shirt")) {
    return "Shirt"
  }
  const tmpl = findGarmentTemplate(name)
  return tmpl?.key || name
}

export function garmentsMatch(g1: string | null | undefined, g2: string | null | undefined): boolean {
  if (!g1 || !g2) return false
  if (g1 === g2) return true
  return normalizeGarmentKey(g1) === normalizeGarmentKey(g2)
}

export function getGarmentsByGender(gender: "Men" | "Women"): Record<string, GarmentTemplate> {
  return gender === "Men" ? MEN_GARMENTS : WOMEN_GARMENTS
}

export function findGarmentTemplate(garmentKey: string, genderHint?: string): GarmentTemplate | null {
  if (!garmentKey) return null
  if (ALL_GARMENTS[garmentKey]) return ALL_GARMENTS[garmentKey]

  const keyLower = garmentKey.toLowerCase()
  const foundKey = Object.keys(ALL_GARMENTS).find(
    (k) => k.toLowerCase() === keyLower || ALL_GARMENTS[k].label.toLowerCase().includes(keyLower)
  )
  return foundKey ? ALL_GARMENTS[foundKey] : null
}

