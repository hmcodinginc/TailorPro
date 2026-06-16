const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

type RequestOptions = RequestInit & {
  rawBody?: boolean
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("token")
  const isFormData = options.body instanceof FormData

  const headers = new Headers(options.headers)
  if (!isFormData && !options.rawBody) headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.message || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

const jsonBody = (data: unknown) => JSON.stringify(data)

// LOGIN
export const loginUser = (data: any) =>
  request("/auth/login", { method: "POST", body: jsonBody(data) })

// SIGNUP
export const signupUser = (data: any) =>
  request("/auth/signup", { method: "POST", body: jsonBody(data) })

// CUSTOMERS
export const getCustomers = () => request("/customers/")

export const addCustomer = (data: any) =>
  request("/customers/", { method: "POST", body: jsonBody(data) })

export const updateCustomer = (id: number, data: any) =>
  request(`/customers/${id}`, { method: "PUT", body: jsonBody(data) })

export const deleteCustomer = (id: number) =>
  request(`/customers/${id}`, { method: "DELETE" })

// ORDERS
export const getOrders = () => request("/orders/")

export const addOrder = (data: any) =>
  request("/orders/", { method: "POST", body: jsonBody(data) })

export const updateOrder = (id: number, data: any) =>
  request(`/orders/${id}`, { method: "PUT", body: jsonBody(data) })

export const deleteOrder = (id: number) =>
  request(`/orders/${id}`, { method: "DELETE" })

export const getOrderReminders = () => request("/orders/reminders")

// MEASUREMENTS
export const getMeasurements = () => request("/measurements/")

export const addMeasurement = (data: FormData) =>
  request("/measurements/", { method: "POST", body: data, rawBody: true })

export const updateMeasurement = (id: number, data: FormData) =>
  request(`/measurements/${id}`, { method: "PUT", body: data, rawBody: true })

export const deleteMeasurement = (id: number) =>
  request(`/measurements/${id}`, { method: "DELETE" })

// INVOICES
export const getInvoices = () => request("/invoices/")

export const addInvoice = (data: any) =>
  request("/invoices/", { method: "POST", body: jsonBody(data) })

export const createInvoice = addInvoice

export const updateInvoice = (id: number, data: any) =>
  request(`/invoices/${id}`, { method: "PUT", body: jsonBody(data) })

export const deleteInvoice = (id: number) =>
  request(`/invoices/${id}`, { method: "DELETE" })
