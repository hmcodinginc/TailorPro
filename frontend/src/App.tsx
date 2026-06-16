import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import CustomerDetail from "./pages/CustomerDetail"
import Measurements from "./pages/Measurements"
import Orders from "./pages/Orders"
import Auth from "./pages/Auth"
import Invoices from "./pages/Invoices"

import AppLayout from "./components/AppLayout"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {

  return (


    <BrowserRouter>

      <Routes>

        <Route path="/auth" element={<Auth />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Customers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CustomerDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/measurements"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Measurements />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Orders />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Invoices />
              </AppLayout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  )

}
