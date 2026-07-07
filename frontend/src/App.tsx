import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import CustomerDetail from "./pages/CustomerDetail"
import Measurements from "./pages/Measurements"
import Orders from "./pages/Orders"
import Auth from "./pages/Auth"
import Invoices from "./pages/Invoices"
import Inventory from "./pages/Inventory"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"

import AppLayout from "./components/AppLayout"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
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

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Inventory />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

