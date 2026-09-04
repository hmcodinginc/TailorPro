import React, { useState } from "react"
import {
  getGarmentVisualConfig,
  normalizeGender,
  getMeasurementImageUrl,
  GarmentVisualConfig,
} from "../config/garmentMeasurementMap"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Info } from "lucide-react"

export interface GarmentVisualizerProps {
  gender?: string
  garmentType: string
  activeField: string | null
  fieldValues: Record<string, string>
  customImageSrc?: string
}

export function GarmentVisualizer({
  gender = "Men",
  garmentType,
  activeField,
  fieldValues,
  customImageSrc,
}: GarmentVisualizerProps) {
  const [imageError, setImageError] = useState(false)
  const normalizedGender = normalizeGender(gender)
  const config: GarmentVisualConfig = getGarmentVisualConfig(normalizedGender, garmentType)
  const measurementMap = config.lines

  const expectedImageUrl = customImageSrc || config.imageSrc || getMeasurementImageUrl(normalizedGender, garmentType)

  return (
    <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-between p-4 bg-muted/15 rounded-xl border border-border shadow-xs transition-all">
      {/* Header Info: Gender & Garment Spec Title */}
      <div className="w-full flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">
            {config.title || `${normalizedGender} ${garmentType}`}
          </span>
        </div>
        <Badge
          variant="outline"
          className={
            normalizedGender === "Women"
              ? "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800 text-[10px] py-0 px-2 shrink-0"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 text-[10px] py-0 px-2 shrink-0"
          }
        >
          {normalizedGender === "Women" ? "Women 👩" : "Men 👨"}
        </Badge>
      </div>

      {/* Center Visual Diagram (SVG with Live Measurement Overlays) */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[260px] py-1">
        {/* Optional Custom Image if available and not errored */}
        {customImageSrc && !imageError ? (
          <div className="relative max-h-[300px] flex items-center justify-center">
            <img
              src={expectedImageUrl}
              alt={`${normalizedGender} ${garmentType} Measurement Diagram`}
              onError={() => setImageError(true)}
              className="max-h-[280px] w-auto object-contain rounded-lg drop-shadow-sm"
            />
          </div>
        ) : (
          <svg
            viewBox="0 0 400 600"
            className="w-full max-w-[280px] h-auto max-h-[340px] drop-shadow-xs select-none transition-all duration-300"
          >
            {/* Dynamic Gender & Garment Vector Base */}
            {config.renderSVG ? config.renderSVG() : null}

            {/* Measurement Lines and Live Value Badges */}
            {Object.entries(measurementMap).map(([fieldKey, line]) => {
              const value = fieldValues ? fieldValues[fieldKey] : undefined
              const isActive = activeField === fieldKey
              const hasValue = value !== undefined && value !== null && String(value).trim() !== ""

              // Highlight line when actively being focused or when user entered a value
              if (!isActive && !hasValue) return null

              const strokeColor = isActive ? "#ef4444" : "#4f46e5"
              const strokeWidth = isActive ? 3 : 2
              const textColor = isActive ? "#b91c1c" : "#3730a3"
              const bgColor = isActive ? "#fee2e2" : "#e0e7ff"
              const fontWeight = isActive ? "bold" : "600"
              const displayValue = hasValue ? `${value}"` : "?"

              return (
                <g key={fieldKey} className="transition-all duration-300">
                  {/* Guideline connecting points */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isActive ? "none" : "4 2"}
                  />

                  {/* Endcap Dots */}
                  <circle cx={line.x1} cy={line.y1} r={isActive ? 4 : 3} fill={strokeColor} />
                  <circle cx={line.x2} cy={line.y2} r={isActive ? 4 : 3} fill={strokeColor} />

                  {/* Value callout pill container */}
                  <rect
                    x={line.labelX - (displayValue.length > 3 ? 24 : 18)}
                    y={line.labelY - 14}
                    width={displayValue.length > 3 ? 48 : 36}
                    height={20}
                    rx={10}
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    className="drop-shadow-xs"
                  />

                  {/* Value Text */}
                  <text
                    x={line.labelX}
                    y={line.labelY + 1}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={isActive ? "13" : "11"}
                    fontWeight={fontWeight}
                    className="select-none font-mono"
                  >
                    {displayValue}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {/* Footer Helper Note */}
      <div className="text-center mt-2 pt-2 border-t border-border/40 w-full">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          {activeField ? (
            <>
              <Sparkles className="h-3 w-3 text-red-500 animate-pulse shrink-0" />
              <span>
                Enter <strong className="text-foreground">{measurementMap[activeField]?.label || activeField}</strong>
              </span>
            </>
          ) : (
            <>
              <Info className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>Select or type in any measurement field to highlight</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
