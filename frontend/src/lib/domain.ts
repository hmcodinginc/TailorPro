export const ORDER_STATUSES = ["Pending", "Stitching", "Ready", "Delivered"] as const

export const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "In Progress": {
    label: "Stitching",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  Stitching: {
    label: "Stitching",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  Ready: {
    label: "Ready",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Delivered: {
    label: "Delivered",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
}

export const INVOICE_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  unpaid: {
    label: "Unpaid",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
}

export function getOrderStatusMeta(status?: string) {
  return ORDER_STATUS_META[status || ""] ?? ORDER_STATUS_META.Pending
}

export function getInvoiceStatusMeta(status?: string) {
  return INVOICE_STATUS_META[(status || "").toLowerCase()] ?? INVOICE_STATUS_META.pending
}
