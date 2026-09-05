const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

type RequestOptions = RequestInit & {
  rawBody?: boolean
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
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
    if (res.status === 401) {
      localStorage.removeItem("token")
      if (typeof window !== "undefined" && window.location.pathname !== "/auth" && window.location.pathname !== "/") {
        window.location.href = "/auth"
      }
    }
    const errorData = await res.json().catch(() => ({}))
    // FastAPI returns detail as array for 422 validation errors
    let message = `Request failed: ${res.status}`
    if (typeof errorData.detail === "string") {
      message = errorData.detail
    } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
      // e.g. [{ loc: [...], msg: "field required", type: "..." }]
      message = errorData.detail.map((e: Record<string, unknown>) => `${(e.loc as string[])?.slice(-1)[0] ?? ""}: ${e.msg}`).join(", ")
    } else if (errorData.message) {
      message = errorData.message
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

const jsonBody = (data: unknown) => JSON.stringify(data)

// LOGIN
export const loginUser = (data: unknown) =>
  request("/auth/login", { method: "POST", body: jsonBody(data) })

// SIGNUP
export const signupUser = (data: unknown) =>
  request("/auth/signup", { method: "POST", body: jsonBody(data) })

// CHANGE PASSWORD
export const changePassword = (data: unknown) =>
  request("/auth/change-password", { method: "POST", body: jsonBody(data) })

// FORGOT PASSWORD
export const forgotPassword = (data: { email: string }) =>
  request("/auth/forgot-password", { method: "POST", body: jsonBody(data) })

// RESET PASSWORD
export const resetPassword = (data: { token: string; new_password: string }) =>
  request("/auth/reset-password", { method: "POST", body: jsonBody(data) })

// VERIFY EMAIL
export const verifyEmail = (data: { token: string }) =>
  request("/auth/verify-email", { method: "POST", body: jsonBody(data) })

import type {
  Customer,
  CustomerCreateInput,
  Order,
  OrderCreateInput,
  Measurement,
  Invoice,
  InventoryItem,
  BusinessProfile,
  UserProfile,
  PaymentRecord,
} from "./types"

// BUSINESS PROFILE
export const getBusinessProfile = () => request<BusinessProfile>("/business/profile")
export const updateBusinessProfile = (data: Partial<BusinessProfile>) =>
  request<BusinessProfile>("/business/profile", { method: "PUT", body: jsonBody(data) })

// CUSTOMERS
export const getCustomers = () => request<Customer[]>("/customers/")

export const addCustomer = (data: CustomerCreateInput | Partial<Customer>) =>
  request<Customer>("/customers/", { method: "POST", body: jsonBody(data) })

export const updateCustomer = (id: number, data: Partial<Customer>) =>
  request<Customer>(`/customers/${id}`, { method: "PUT", body: jsonBody(data) })

export const deleteCustomer = (id: number) =>
  request<{ message: string }>(`/customers/${id}`, { method: "DELETE" })

// ORDERS
export const getOrders = () => request<Order[]>("/orders/")

export const addOrder = (data: OrderCreateInput | Record<string, unknown>) =>
  request<Order>("/orders/", { method: "POST", body: jsonBody(data) })

export const updateOrder = (id: number, data: Partial<Order> | Record<string, unknown>) =>
  request<Order>(`/orders/${id}`, { method: "PUT", body: jsonBody(data) })

export const deleteOrder = (id: number) =>
  request<{ message: string }>(`/orders/${id}`, { method: "DELETE" })

export const getOrderReminders = () => request<Order[]>("/orders/reminders")

// MEASUREMENTS
export const getMeasurements = () => request<Measurement[]>("/measurements/")

export const addMeasurement = (data: FormData) =>
  request<Measurement>("/measurements/", { method: "POST", body: data, rawBody: true })

export const updateMeasurement = (id: number, data: FormData) =>
  request<Measurement>(`/measurements/${id}`, { method: "PUT", body: data, rawBody: true })

export const deleteMeasurement = (id: number) =>
  request<{ message: string }>(`/measurements/${id}`, { method: "DELETE" })

// INVOICES
export const getInvoices = () => request<Invoice[]>("/invoices/")

export const addInvoice = (data: unknown) =>
  request<Invoice>("/invoices/", { method: "POST", body: jsonBody(data) })

export const createInvoice = addInvoice

export const updateInvoice = (id: number, data: unknown) =>
  request<Invoice>(`/invoices/${id}`, { method: "PUT", body: jsonBody(data) })

// USER PROFILE
export const getUserProfile = () => request<UserProfile>("/auth/me")
export const updateUserProfile = (data: { name?: string; phone?: string }) =>
  request<UserProfile>("/auth/me", { method: "PUT", body: jsonBody(data) })

// INVENTORY
export const getInventoryItems = () => request<InventoryItem[]>("/inventory/")
export const addInventoryItem = (data: unknown) =>
  request<InventoryItem>("/inventory/", { method: "POST", body: jsonBody(data) })
export const updateInventoryItem = (id: number, data: unknown) =>
  request<InventoryItem>(`/inventory/${id}`, { method: "PUT", body: jsonBody(data) })
export const deleteInventoryItem = (id: number) =>
  request<{ message: string }>(`/inventory/${id}`, { method: "DELETE" })

export const deleteInvoice = (id: number) =>
  request<{ message: string }>(`/invoices/${id}`, { method: "DELETE" })

export const recordInvoicePayment = (invoiceId: number, data: unknown) =>
  request<PaymentRecord>(`/invoices/${invoiceId}/payments`, { method: "POST", body: jsonBody(data) })

export const deleteInvoicePayment = (invoiceId: number, paymentId: number) =>
  request<{ message: string }>(`/invoices/${invoiceId}/payments/${paymentId}`, { method: "DELETE" })


