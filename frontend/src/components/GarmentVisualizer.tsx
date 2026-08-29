import { getGarmentMeasurementMap, MeasurementLine } from "../config/garmentMeasurementMap"
import { KurtaVisualSVG } from "../garments/KurtaVisual"
import { TopVisualSVG, BottomVisualSVG, DressVisualSVG, SkirtVisualSVG, BlouseVisualSVG } from "../garments/OtherVisuals"

interface GarmentVisualizerProps {
  garmentType: string
  activeField: string | null
  fieldValues: Record<string, string>
}

export function GarmentVisualizer({ garmentType, activeField, fieldValues }: GarmentVisualizerProps) {
  const measurementMap = getGarmentMeasurementMap(garmentType)
  
  if (!measurementMap) {
    return null
  }

  // Render specific garment SVG base
  const renderGarmentBase = () => {
    switch (garmentType) {
      case "Kurta": return <KurtaVisualSVG />
      case "Shirt":
      case "Top":
      case "Blazer":
      case "NehruJacket":
      case "Sherwani":
      case "IndoWestern":
      case "Suit":
        return <TopVisualSVG />
      case "Pant":
      case "Pyjama":
      case "Palazzo":
      case "Salwar":
      case "Chudidhar":
      case "Leggings":
      case "Dhoti":
        return <BottomVisualSVG />
      case "Gown":
      case "Anarkali":
        return <DressVisualSVG />
      case "Lehenga":
        return <SkirtVisualSVG />
      case "SareeBlouse":
        return <BlouseVisualSVG />
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/10 rounded-xl border">
      <svg
        viewBox="0 0 400 600"
        className="w-full max-w-[300px] h-auto drop-shadow-sm"
      >
        {/* Base Garment */}
        {renderGarmentBase()}

        {/* Measurement Lines and Labels */}
        {Object.entries(measurementMap).map(([fieldKey, line]) => {
          const value = fieldValues[fieldKey]
          const isActive = activeField === fieldKey
          const hasValue = value !== undefined && value !== null && String(value).trim() !== ""

          // Only show if active OR if it has a value
          if (!isActive && !hasValue) return null

          const strokeColor = isActive ? "#ef4444" : "#94a3b8"
          const strokeWidth = isActive ? 3 : 2
          const textColor = isActive ? "#ef4444" : "#64748b"
          const fontWeight = isActive ? "bold" : "normal"
          const displayValue = value ? `${value}"` : "?"

          return (
            <g key={fieldKey} className="transition-all duration-300">
              {/* The Line */}
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4 2"
              />
              
              {/* Optional End Caps */}
              <circle cx={line.x1} cy={line.y1} r="3" fill={strokeColor} />
              <circle cx={line.x2} cy={line.y2} r="3" fill={strokeColor} />

              {/* The Label/Value Container */}
              <text
                x={line.labelX}
                y={line.labelY}
                textAnchor={line.align === "left" ? "start" : line.align === "right" ? "end" : "middle"}
                fill={textColor}
                fontSize={isActive ? "18" : "14"}
                fontWeight={fontWeight}
                className="select-none"
              >
                {displayValue}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          {activeField ? (
            <>
              Enter <strong className="text-foreground">{measurementMap[activeField]?.label || activeField}</strong>
            </>
          ) : (
            "Select a measurement field"
          )}
        </p>
      </div>
    </div>
  )
}
