import React from "react"

// Common styling constants
const MENS_BASE_STYLE = {
  fill: "#f8fafc",
  stroke: "#334155",
  strokeWidth: "2.5",
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
}

const WOMENS_BASE_STYLE = {
  fill: "#fffdfa",
  stroke: "#475569",
  strokeWidth: "2.5",
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
}

const MENS_ACCENT = {
  stroke: "#94a3b8",
  strokeWidth: "1.5",
  strokeDasharray: "3 3",
  fill: "none",
}

const WOMENS_ACCENT = {
  stroke: "#cbd5e1",
  strokeWidth: "1.5",
  strokeDasharray: "3 3",
  fill: "none",
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Men's Shirt (Formal / Casual Men's Collared Dress Shirt)
// ─────────────────────────────────────────────────────────────────────────────
export function MensShirtSVG() {
  return (
    <g>
      {/* Shirt Body & Sleeves */}
      <path
        d="
          M 160 70
          L 110 90
          L 35 270
          L 70 285
          L 125 160
          L 125 450
          L 275 450
          L 275 160
          L 330 285
          L 365 270
          L 290 90
          L 240 70
          Z
        "
        {...MENS_BASE_STYLE}
      />

      {/* Shoulder Yoke Line */}
      <line x1="110" y1="90" x2="290" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Men's Stiff Dress Collar */}
      <polygon points="160,70 200,115 180,122 145,85" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <polygon points="240,70 200,115 220,122 255,85" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <circle cx="200" cy="100" r="2.5" fill="#1e293b" />

      {/* Front Button Placket */}
      <rect x="193" y="115" width="14" height="335" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="200" cy="150" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="200" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="250" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="300" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="350" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="400" r="2.5" fill="#1e293b" />

      {/* Left Chest Pocket with pointed bottom */}
      <path d="M 140 180 L 175 180 L 175 215 L 157 225 L 140 215 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
      <line x1="140" y1="188" x2="175" y2="188" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

      {/* Cuffs with Button */}
      <polygon points="35,270 70,285 65,300 30,285" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <circle cx="50" cy="285" r="2" fill="#1e293b" />
      <polygon points="365,270 330,285 335,300 370,285" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <circle cx="350" cy="285" r="2" fill="#1e293b" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Men's Pant / Trouser (Formal Straight-Leg Men's Trousers)
// ─────────────────────────────────────────────────────────────────────────────
export function MensPantSVG() {
  return (
    <g>
      {/* Men's Straight-Cut Tailored Trouser Silhouette */}
      <path
        d="
          M 125 90
          L 125 150
          L 135 520
          L 185 520
          L 200 220
          L 215 520
          L 265 520
          L 275 150
          L 275 90
          Z
        "
        {...MENS_BASE_STYLE}
      />

      {/* Structured Men's Waistband */}
      <rect x="125" y="90" width="150" height="28" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />

      {/* Waistband Hook / Button Closure */}
      <circle cx="190" cy="104" r="3" fill="#1e293b" />

      {/* 5 Prominent Men's Belt Loops */}
      <rect x="135" y="87" width="5" height="34" rx="1" fill="#475569" />
      <rect x="165" y="87" width="5" height="34" rx="1" fill="#475569" />
      <rect x="200" y="87" width="5" height="34" rx="1" fill="#475569" />
      <rect x="235" y="87" width="5" height="34" rx="1" fill="#475569" />
      <rect x="265" y="87" width="5" height="34" rx="1" fill="#475569" />

      {/* Fly Front Curve (J-Stitch) */}
      <path d="M 200 118 L 200 185 Q 200 205 185 205" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />

      {/* Slanted Side Slash Pockets */}
      <line x1="130" y1="118" x2="160" y2="175" stroke="#334155" strokeWidth="2" />
      <line x1="270" y1="118" x2="240" y2="175" stroke="#334155" strokeWidth="2" />

      {/* Sharp Men's Trouser Center Press Crease (Iron Crease Lines) */}
      <line x1="160" y1="150" x2="160" y2="505" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 3" />
      <line x1="240" y1="150" x2="240" y2="505" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 3" />

      {/* Bottom Hemline Cuffs */}
      <line x1="135" y1="505" x2="185" y2="505" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="215" y1="505" x2="265" y2="505" stroke="#94a3b8" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Men's Kurta (Mandarin Band Collar, Straight Cut & Side Slits)
// ─────────────────────────────────────────────────────────────────────────────
export function MensKurtaSVG() {
  return (
    <g>
      {/* Straight long kurta body */}
      <path
        d="
          M 165 70
          L 115 90
          L 45 270
          L 75 285
          L 130 160
          L 130 330
          L 125 525
          L 275 525
          L 270 330
          L 270 160
          L 325 285
          L 355 270
          L 285 90
          L 235 70
          Z
        "
        {...MENS_BASE_STYLE}
      />

      {/* Mandarin / Nehru Stand Collar */}
      <path d="M 165 70 Q 200 58 235 70 L 230 85 Q 200 75 170 85 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />

      {/* Long Front Buttoned Placket */}
      <rect x="194" y="85" width="12" height="170" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="200" cy="110" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="140" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="170" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="200" r="2.5" fill="#1e293b" />
      <circle cx="200" cy="230" r="2.5" fill="#1e293b" />

      {/* Deep Side Slits (Chak) */}
      <line x1="130" y1="330" x2="130" y2="355" stroke="#2563eb" strokeWidth="3.5" />
      <line x1="270" y1="330" x2="270" y2="355" stroke="#2563eb" strokeWidth="3.5" />
      <circle cx="130" cy="330" r="3" fill="#2563eb" />
      <circle cx="270" cy="330" r="3" fill="#2563eb" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Men's Blazer (Structured Notch Lapel Suit Jacket)
// ─────────────────────────────────────────────────────────────────────────────
export function MensBlazerSVG() {
  return (
    <g>
      {/* Broad masculine shoulder coat */}
      <path
        d="
          M 155 70
          L 105 90
          L 35 280
          L 70 295
          L 125 160
          L 125 460
          L 275 460
          L 275 160
          L 330 295
          L 365 280
          L 295 90
          L 245 70
          Z
        "
        {...MENS_BASE_STYLE}
      />

      {/* Men's Classic Notch Lapels */}
      <polygon points="155,70 190,145 170,155 135,105" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <polygon points="245,70 210,145 230,155 265,105" fill="#334155" stroke="#1e293b" strokeWidth="2" />

      {/* Lapel Boutonniere / Buttonhole */}
      <line x1="160" y1="110" x2="168" y2="118" stroke="#f8fafc" strokeWidth="1.5" />

      {/* Left Chest Welt Pocket with Pocket Square */}
      <rect x="140" y="190" width="35" height="6" fill="#1e293b" />
      <polygon points="148,190 157,175 166,190" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

      {/* 2-Button Single Breasted Fastening */}
      <circle cx="195" cy="245" r="4" fill="#0f172a" />
      <circle cx="195" cy="295" r="4" fill="#0f172a" />

      {/* Flap Pockets */}
      <rect x="135" y="330" width="42" height="15" rx="2" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
      <rect x="223" y="330" width="42" height="15" rx="2" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Men's Suit (2-Piece Suit: Blazer + Trouser + Necktie)
// ─────────────────────────────────────────────────────────────────────────────
export function MensSuitSVG() {
  return (
    <g>
      {/* Straight Trousers behind */}
      <path
        d="
          M 150 350
          L 145 545
          L 180 545
          L 200 380
          L 220 545
          L 255 545
          L 250 350
          Z
        "
        fill="#e2e8f0"
        stroke="#334155"
        strokeWidth="2"
      />
      {/* Trouser Creases */}
      <line x1="162" y1="360" x2="162" y2="535" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
      <line x1="238" y1="360" x2="238" y2="535" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Structured Jacket Top */}
      <path
        d="
          M 155 70
          L 105 90
          L 40 260
          L 75 275
          L 125 160
          L 125 375
          L 275 375
          L 275 160
          L 325 275
          L 360 260
          L 295 90
          L 245 70
          Z
        "
        {...MENS_BASE_STYLE}
      />

      {/* Lapels */}
      <polygon points="155,70 190,145 170,155 135,105" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <polygon points="245,70 210,145 230,155 265,105" fill="#334155" stroke="#1e293b" strokeWidth="2" />

      {/* Shirt Collar & Necktie */}
      <polygon points="190,90 200,90 205,170 200,185 195,170" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
      <polygon points="193,88 207,88 203,100 197,100" fill="#1d4ed8" />

      {/* Buttons */}
      <circle cx="195" cy="230" r="3.5" fill="#0f172a" />
      <circle cx="195" cy="275" r="3.5" fill="#0f172a" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Men's T-Shirt (Crew Neck, Relaxed Fit)
// ─────────────────────────────────────────────────────────────────────────────
export function MensTShirtSVG() {
  return (
    <g>
      <path
        d="
          M 160 75
          L 105 95
          L 60 190
          L 105 210
          L 130 160
          L 130 435
          L 270 435
          L 270 160
          L 295 210
          L 340 190
          L 295 95
          L 240 75
          Z
        "
        {...MENS_BASE_STYLE}
      />
      {/* Men's Ribbed Crew Neck */}
      <path d="M 160 75 Q 200 110 240 75" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" />
      <path d="M 165 75 Q 200 118 235 75" fill="none" stroke="#64748b" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Women's Shirt / Button-Down
// ─────────────────────────────────────────────────────────────────────────────
export function WomensShirtSVG() {
  return (
    <g>
      {/* Feminine tailored shirt with shaped waist */}
      <path
        d="
          M 165 75
          L 120 95
          L 45 260
          L 80 275
          L 135 155
          Q 146 225 142 255
          Q 138 330 130 430
          Q 200 445 270 430
          Q 262 330 258 255
          Q 254 225 265 155
          L 320 275
          L 355 260
          L 280 95
          L 235 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      {/* Women's Open V-Collar */}
      <polygon points="165,75 200,135 185,138 145,95" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5" />
      <polygon points="235,75 200,135 215,138 255,95" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5" />
      {/* Waist Darts */}
      <path d="M 165 210 Q 162 255 165 300" {...WOMENS_ACCENT} />
      <path d="M 235 210 Q 238 255 235 300" {...WOMENS_ACCENT} />
      {/* Center Placket */}
      <line x1="200" y1="135" x2="200" y2="435" stroke="#db2777" strokeWidth="1.5" strokeDasharray="5 3" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Women's Pant / Trousers
// ─────────────────────────────────────────────────────────────────────────────
export function WomensPantSVG() {
  return (
    <g>
      {/* High-waisted Women's Tapered Trouser */}
      <path
        d="
          M 145 90
          Q 133 145 130 170
          L 150 515
          L 175 515
          L 200 220
          L 225 515
          L 250 515
          Q 267 145 255 90
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      {/* High Waistband */}
      <path d="M 145 90 Q 200 95 255 90" stroke="#db2777" strokeWidth="2" fill="none" />
      <path d="M 143 115 Q 200 120 257 115" stroke="#db2777" strokeWidth="2" fill="none" />
      {/* Front Pleats */}
      <line x1="170" y1="115" x2="165" y2="230" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="230" y1="115" x2="235" y2="230" stroke="#cbd5e1" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Women's Salwar / Patiala
// ─────────────────────────────────────────────────────────────────────────────
export function WomensSalwarSVG() {
  return (
    <g>
      {/* Voluminous gathered Salwar/Patiala */}
      <path
        d="
          M 145 85
          L 255 85
          L 255 115
          Q 320 240 280 430
          L 245 520
          L 215 520
          L 200 240
          L 185 520
          L 155 520
          Q 120 430 80 240
          Q 115 130 145 115
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      {/* Waist belt (Nefa) */}
      <rect x="145" y="85" width="110" height="30" fill="#fdf2f8" stroke="#db2777" strokeWidth="2" />
      {/* Pleat lines */}
      <path d="M 145 115 Q 120 250 160 380" {...WOMENS_ACCENT} />
      <path d="M 170 115 Q 150 260 175 390" {...WOMENS_ACCENT} />
      <path d="M 255 115 Q 280 250 240 380" {...WOMENS_ACCENT} />
      <path d="M 230 115 Q 250 260 225 390" {...WOMENS_ACCENT} />
      {/* Mohri (Ankle cuffs) */}
      <rect x="155" y="505" width="30" height="15" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
      <rect x="215" y="505" width="30" height="15" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Women's Kurti
// ─────────────────────────────────────────────────────────────────────────────
export function WomensKurtiSVG() {
  return (
    <g>
      <path
        d="
          M 165 75
          L 120 95
          L 55 260
          L 85 275
          L 135 155
          Q 145 220 142 250
          Q 135 300 130 330
          L 125 520
          L 275 520
          L 270 330
          Q 265 300 258 250
          Q 255 220 265 155
          L 315 275
          L 345 260
          L 280 95
          L 235 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      {/* Keyhole / V-Neckline */}
      <path d="M 165 75 Q 200 115 200 145 Q 200 115 235 75" fill="#fce7f3" stroke="#db2777" strokeWidth="2" />
      {/* Side Slits with accent */}
      <line x1="130" y1="330" x2="130" y2="350" stroke="#ec4899" strokeWidth="3" />
      <line x1="270" y1="330" x2="270" y2="350" stroke="#ec4899" strokeWidth="3" />
      {/* Front yoke embroidery line */}
      <path d="M 160 160 Q 200 180 240 160" {...WOMENS_ACCENT} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Women's Blazer
// ─────────────────────────────────────────────────────────────────────────────
export function WomensBlazerSVG() {
  return (
    <g>
      <path
        d="
          M 160 75
          L 115 95
          L 45 270
          L 80 285
          L 135 155
          Q 146 230 140 260
          Q 134 330 128 445
          Q 200 460 272 445
          Q 266 330 260 260
          Q 254 230 265 155
          L 320 285
          L 355 270
          L 285 95
          L 240 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <polygon points="160,75 190,165 175,175 145,110" fill="#f1f5f9" stroke="#be185d" strokeWidth="1.5" />
      <polygon points="240,75 210,165 225,175 255,110" fill="#f1f5f9" stroke="#be185d" strokeWidth="1.5" />
      <circle cx="200" cy="250" r="3.5" fill="#be185d" />
      <rect x="142" y="320" width="32" height="12" rx="2" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
      <rect x="226" y="320" width="32" height="12" rx="2" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Women's Suit
// ─────────────────────────────────────────────────────────────────────────────
export function WomensSuitSVG() {
  return (
    <g>
      <path
        d="
          M 155 340
          L 150 535
          L 175 535
          L 200 360
          L 225 535
          L 250 535
          L 245 340
          Z
        "
        fill="#fce7f3"
        stroke="#db2777"
        strokeWidth="2"
      />
      <path
        d="
          M 160 75
          L 115 95
          L 50 250
          L 85 265
          L 135 155
          Q 145 225 140 250
          L 132 355
          L 268 355
          L 260 250
          Q 255 225 265 155
          L 315 265
          L 350 250
          L 285 95
          L 240 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <polygon points="160,75 190,150 175,160 145,110" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
      <polygon points="240,75 210,150 225,160 255,110" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.5" />
      <circle cx="200" cy="225" r="3" fill="#be185d" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Women's T-Shirt
// ─────────────────────────────────────────────────────────────────────────────
export function WomensTShirtSVG() {
  return (
    <g>
      <path
        d="
          M 160 80
          L 115 98
          L 70 175
          L 110 192
          L 135 150
          Q 145 225 140 250
          Q 136 315 132 410
          Q 200 425 268 410
          Q 264 315 260 250
          Q 255 225 265 150
          L 290 192
          L 330 175
          L 285 98
          L 240 80
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <path d="M 160 80 Q 200 135 240 80" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Dress / One-Piece
// ─────────────────────────────────────────────────────────────────────────────
export function DressVisualSVG() {
  return (
    <g>
      <path
        d="
          M 170 80
          L 130 100
          L 70 240
          L 95 250
          L 140 160
          Q 145 190 150 220
          Q 115 385 80 540
          L 320 540
          Q 285 385 250 220
          Q 255 190 260 160
          L 305 250
          L 330 240
          L 270 100
          L 230 80
          A 30 40 0 0 0 170 80
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <path d="M 150 220 Q 200 230 250 220" stroke="#db2777" strokeWidth="3" fill="none" />
      <path d="M 180 230 Q 150 390 140 540" {...WOMENS_ACCENT} />
      <path d="M 220 230 Q 250 390 260 540" {...WOMENS_ACCENT} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Gown
// ─────────────────────────────────────────────────────────────────────────────
export function GownVisualSVG() {
  return (
    <g>
      <path
        d="
          M 170 75
          L 130 95
          L 60 250
          L 90 265
          L 140 155
          Q 146 195 148 220
          Q 105 380 60 550
          L 340 550
          Q 295 380 252 220
          Q 254 195 260 155
          L 310 265
          L 340 250
          L 270 95
          L 230 75
          A 30 35 0 0 0 170 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <path d="M 148 220 Q 200 228 252 220" stroke="#db2777" strokeWidth="2.5" fill="none" />
      <path d="M 165 225 Q 120 400 110 550" {...WOMENS_ACCENT} />
      <path d="M 200 228 L 200 550" {...WOMENS_ACCENT} />
      <path d="M 235 225 Q 280 400 290 550" {...WOMENS_ACCENT} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Anarkali
// ─────────────────────────────────────────────────────────────────────────────
export function AnarkaliVisualSVG() {
  return (
    <g>
      <path
        d="
          M 170 75
          L 125 95
          L 60 260
          L 90 275
          L 140 160
          L 145 200
          Q 105 380 70 545
          L 330 545
          Q 295 380 255 200
          L 260 160
          L 310 275
          L 340 260
          L 275 95
          L 230 75
          A 30 35 0 0 0 170 75
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <line x1="145" y1="200" x2="255" y2="200" stroke="#db2777" strokeWidth="2.5" />
      <line x1="170" y1="200" x2="135" y2="545" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="200" y1="200" x2="200" y2="545" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="230" y1="200" x2="265" y2="545" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M 70 530 L 330 530" stroke="#db2777" strokeWidth="2" strokeDasharray="4 2" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Lehenga / Skirt
// ─────────────────────────────────────────────────────────────────────────────
export function SkirtVisualSVG() {
  return (
    <g>
      <path
        d="
          M 150 140
          L 130 210
          Q 100 380 70 545
          L 330 545
          Q 300 380 270 210
          L 250 140
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <rect x="150" y="140" width="100" height="20" rx="2" fill="#fdf2f8" stroke="#db2777" strokeWidth="2" />
      <path d="M 165 160 Q 130 360 120 545" {...WOMENS_ACCENT} />
      <path d="M 200 160 L 200 545" {...WOMENS_ACCENT} />
      <path d="M 235 160 Q 270 360 280 545" {...WOMENS_ACCENT} />
      <path d="M 70 525 L 330 525" stroke="#db2777" strokeWidth="2" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Saree Blouse
// ─────────────────────────────────────────────────────────────────────────────
export function BlouseVisualSVG() {
  return (
    <g>
      <path
        d="
          M 160 80
          L 120 100
          L 70 190
          L 95 210
          L 135 170
          L 140 230
          L 260 230
          L 265 170
          L 305 210
          L 330 190
          L 280 100
          L 240 80
          A 40 45 0 0 0 160 80
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <path d="M 165 150 Q 185 190 185 230" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 235 150 Q 215 190 215 230" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="140" y="215" width="120" height="15" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. Palazzo
// ─────────────────────────────────────────────────────────────────────────────
export function PalazzoVisualSVG() {
  return (
    <g>
      <path
        d="
          M 145 95
          L 140 160
          L 100 520
          L 185 520
          L 200 230
          L 215 520
          L 300 520
          L 260 160
          L 255 95
          Z
        "
        {...WOMENS_BASE_STYLE}
      />
      <line x1="145" y1="120" x2="255" y2="120" stroke="#db2777" strokeWidth="2" />
      <line x1="142" y1="160" x2="142" y2="520" {...WOMENS_ACCENT} />
      <line x1="258" y1="160" x2="258" y2="520" {...WOMENS_ACCENT} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. Graceful Fallback Mannequin
// ─────────────────────────────────────────────────────────────────────────────
export function DefaultGarmentSVG() {
  return (
    <g>
      <path
        d="
          M 165 80
          L 120 100
          L 135 170
          Q 145 230 142 260
          L 135 380
          L 265 380
          L 258 260
          Q 255 230 265 170
          L 280 100
          L 235 80
          A 35 30 0 0 0 165 80
          Z
        "
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <line x1="200" y1="380" x2="200" y2="540" stroke="#475569" strokeWidth="4" />
      <ellipse cx="200" cy="540" rx="55" ry="12" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
      <path d="M 140 240 Q 200 255 260 240" stroke="#eab308" strokeWidth="4" fill="none" />
      <path d="M 140 240 Q 200 255 260 240" stroke="#854d0e" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <circle cx="200" cy="65" r="10" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    </g>
  )
}
