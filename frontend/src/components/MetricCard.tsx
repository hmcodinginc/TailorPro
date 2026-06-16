import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
}: {
  title: string
  value: string | number
  detail?: string
  icon: LucideIcon
  tone?: "emerald" | "blue" | "amber" | "rose" | "slate"
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
            {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
          </div>
          <div className={cn("rounded-md p-2.5", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
