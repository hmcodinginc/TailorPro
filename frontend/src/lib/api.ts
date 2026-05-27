const API = "http://127.0.0.1:8000/api"

// LOGIN
export const loginUser = async (data: any) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }
  return res.json()
}

// SIGNUP
export const signupUser = async (data: any) => {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Signup failed");
  }
  return res.json()
}

// CUSTOMERS
export const getCustomers = async () => {

  const res = await fetch(`${API}/customers/`)

  if (!res.ok) {
    const error = await res.text()
    console.log("Get customers error:", error)
    throw new Error("Failed to fetch customers")
  }

  return res.json()
}


export const addCustomer = async (data: any) => {

  console.log("Sending customer:", data)

  const res = await fetch(`${API}/customers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Add customer error:", error)
    throw new Error("Failed to add customer")
  }

  return res.json()
}


export const updateCustomer = async (id: number, data: any) => {

  const res = await fetch(`${API}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Update customer error:", error)
    throw new Error("Failed to update customer")
  }

  return res.json()
}


export const deleteCustomer = async (id: number) => {

  const res = await fetch(`${API}/customers/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Delete customer error:", error)
    throw new Error("Failed to delete customer")
  }
}



// ORDERS
export const getOrders = async () => {

  const res = await fetch(`${API}/orders/`)

  if (!res.ok) {
    const error = await res.text()
    console.log("Get orders error:", error)
    throw new Error("Failed to fetch orders")
  }

  return res.json()
}


export const addOrder = async (data: any) => {

  const res = await fetch(`${API}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Add order error:", error)
    throw new Error("Failed to add order")
  }

  return res.json()
}


export const updateOrder = async (id: number, data: any) => {

  const res = await fetch(`${API}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Update order error:", error)
    throw new Error("Failed to update order")
  }

  return res.json()
}


export const deleteOrder = async (id: number) => {

  const res = await fetch(`${API}/orders/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Delete order error:", error)
    throw new Error("Failed to delete order")
  }
}



// MEASUREMENTS
export const getMeasurements = async () => {

  const res = await fetch(`${API}/measurements/`)

  if (!res.ok) {
    const error = await res.text()
    console.log("Get measurements error:", error)
    throw new Error("Failed to fetch measurements")
  }

  return res.json()
}
export const addMeasurement = async (data: FormData) => {

  const res = await fetch("http://127.0.0.1:8000/api/measurements/", {
      method: "POST",
      body: data
  })

  if (!res.ok) {
      throw new Error("Failed to add measurement")
  }

  return res.json()
}

export const updateMeasurement = async (id: number, data: FormData) => {
  const res = await fetch(`${API}/measurements/${id}`, {
    method: "PUT",
    body: data  
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Update measurement error:", error)
    throw new Error("Failed to update measurement")
  }

  return res.json()
}

export const deleteMeasurement = async (id: number) => {

  const res = await fetch(`${API}/measurements/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Delete measurement error:", error)
    throw new Error("Failed to delete measurement")
  }
}

//Invoices
export const getInvoices = async () => {
  const res = await fetch(`${API}/invoices/`)
  if (!res.ok) {
    const error = await res.text()
    console.log("Get invoices error:", error)
    throw new Error("Failed to fetch invoices")
  }
  return res.json()
}

export const addInvoice = async (data: any) => {
  const res = await fetch(`${API}/invoices/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.text()
    console.log("Add invoice error:", error)
    throw new Error("Failed to add invoice")
  }
  return res.json()
}
export const updateInvoice = async (id: number, data: any) => {

  const res = await fetch(`${API}/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const error = await res.text()
    console.log("Update invoice error:", error)
    throw new Error("Failed to update invoice")
  }

  return res.json()

}
export const getOrderReminders = async () => {

  const res = await fetch(`${API}/orders/reminders`)

  return res.json()

}
export const createInvoice = async (data:any) => {

  const res = await fetch(`${API}/invoices`,{
  
  method:"POST",
  
  headers:{
  "Content-Type":"application/json"
  },
  
  body:JSON.stringify(data)
  
  })
  
  if(!res.ok){
  throw new Error("Failed to create invoice")
  }
  
  return res.json()
  
  }
  export const deleteInvoice = async (id: number) => {

    const res = await fetch(`${API}/invoices/${id}`, {
      method: "DELETE",
    })
  
    if (!res.ok) {
      const error = await res.text()
      console.log("Delete invoice error:", error)
      throw new Error("Failed to delete invoice")
    }
  
    return res.json()
  }