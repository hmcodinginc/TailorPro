export function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function isOverdue(value?: string | null) {
  if (!value) return false
  const due = new Date(value)
  due.setHours(23, 59, 59, 999)
  return due.getTime() < Date.now()
}
