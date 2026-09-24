export interface GarmentColorOption {
  name: string
  hex: string
  colorNum: number
  category: "Neutrals" | "Blues" | "Darks" | "Reds & Warm" | "Greens" | "Earth & Gold" | "Purples"
  border?: string
}

export const GARMENT_COLOR_OPTIONS: GarmentColorOption[] = [
  // Neutrals
  { name: "Crisp Oxford White", hex: "#f8fafc", colorNum: 0xf8fafc, category: "Neutrals", border: "#cbd5e1" },
  { name: "Pure Ivory Silk", hex: "#fffdf0", colorNum: 0xfffdf0, category: "Neutrals", border: "#e2e8f0" },
  { name: "Warm Cream", hex: "#fef3c7", colorNum: 0xfef3c7, category: "Neutrals", border: "#fde68a" },
  { name: "Soft Grey", hex: "#e2e8f0", colorNum: 0xe2e8f0, category: "Neutrals", border: "#cbd5e1" },
  
  // Blues
  { name: "Savile Row Navy", hex: "#1e3a8a", colorNum: 0x1e3a8a, category: "Blues", border: "#172554" },
  { name: "Royal Blue", hex: "#2563eb", colorNum: 0x2563eb, category: "Blues", border: "#1d4ed8" },
  { name: "Tailored Sky Blue", hex: "#7dd3fc", colorNum: 0x7dd3fc, category: "Blues", border: "#38bdf8" },
  { name: "Midnight Indigo", hex: "#312e81", colorNum: 0x312e81, category: "Blues", border: "#1e1b4b" },
  { name: "Teal Blue", hex: "#0d9488", colorNum: 0x0d9488, category: "Blues", border: "#0f766e" },

  // Darks
  { name: "Midnight Black", hex: "#0f172a", colorNum: 0x0f172a, category: "Darks", border: "#020617" },
  { name: "Charcoal Melange", hex: "#374151", colorNum: 0x374151, category: "Darks", border: "#1f2937" },
  { name: "Slate Grey", hex: "#64748b", colorNum: 0x64748b, category: "Darks", border: "#475569" },

  // Reds & Warm
  { name: "Burgundy Wine", hex: "#881337", colorNum: 0x881337, category: "Reds & Warm", border: "#4c0519" },
  { name: "Crimson Red", hex: "#dc2626", colorNum: 0xdc2626, category: "Reds & Warm", border: "#b91c1c" },
  { name: "Maroon Classic", hex: "#7f1d1d", colorNum: 0x7f1d1d, category: "Reds & Warm", border: "#450a0a" },
  { name: "Dusty Rose Pink", hex: "#f43f5e", colorNum: 0xf43f5e, category: "Reds & Warm", border: "#e11d48" },
  { name: "Blush Pink", hex: "#fbcfe8", colorNum: 0xfbcfe8, category: "Reds & Warm", border: "#f472b6" },
  { name: "Coral Peach", hex: "#fb923c", colorNum: 0xfb923c, category: "Reds & Warm", border: "#ea580c" },

  // Greens
  { name: "Emerald Green", hex: "#047857", colorNum: 0x047857, category: "Greens", border: "#065f46" },
  { name: "Forest Green", hex: "#14532d", colorNum: 0x14532d, category: "Greens", border: "#052e16" },
  { name: "Sage Olive", hex: "#65a30d", colorNum: 0x65a30d, category: "Greens", border: "#4d7c0f" },
  { name: "Mint Pastel", hex: "#a7f3d0", colorNum: 0xa7f3d0, category: "Greens", border: "#6ee7b7" },

  // Earth & Gold
  { name: "Camel Khaki", hex: "#d97706", colorNum: 0xd97706, category: "Earth & Gold", border: "#b45309" },
  { name: "Champagne Gold", hex: "#eab308", colorNum: 0xeab308, category: "Earth & Gold", border: "#ca8a04" },
  { name: "Warm Beige", hex: "#d4b996", colorNum: 0xd4b996, category: "Earth & Gold", border: "#b89770" },
  { name: "Rustic Terracotta", hex: "#c2410c", colorNum: 0xc2410c, category: "Earth & Gold", border: "#9a3412" },

  // Purples
  { name: "Regal Royal Purple", hex: "#7e22ce", colorNum: 0x7e22ce, category: "Purples", border: "#6b21a8" },
  { name: "Lavender Mist", hex: "#c084fc", colorNum: 0xc084fc, category: "Purples", border: "#a855f7" },
  { name: "Deep Plum", hex: "#581c87", colorNum: 0x581c87, category: "Purples", border: "#3b0764" },
]

export function colorToHexStr(color: number | string | undefined | null): string {
  if (!color) return "#1e3a8a"
  if (typeof color === "string") {
    if (color.startsWith("#")) return color
    if (color.startsWith("0x")) return "#" + color.slice(2)
    const num = parseInt(color, 16)
    if (!isNaN(num)) return "#" + num.toString(16).padStart(6, "0")
    return color
  }
  return "#" + color.toString(16).padStart(6, "0")
}

export function colorToNumber(color: number | string | undefined | null): number {
  if (typeof color === "number") return color
  if (!color) return 0x1e3a8a
  const clean = String(color).replace(/^#/, "").replace(/^0x/, "")
  const parsed = parseInt(clean, 16)
  return isNaN(parsed) ? 0x1e3a8a : parsed
}

export function findColorOption(color: number | string | undefined | null): GarmentColorOption | undefined {
  const hex = colorToHexStr(color).toLowerCase()
  return GARMENT_COLOR_OPTIONS.find((c) => c.hex.toLowerCase() === hex)
}
