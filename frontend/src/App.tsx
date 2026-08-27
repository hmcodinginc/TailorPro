import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import Landing      from "./pages/Landing"
import Dashboard    from "./pages/Dashboard"
import Customers    from "./pages/Customers"
import CustomerDetail from "./pages/CustomerDetail"
import Measurements from "./pages/Measurements"
import Orders       from "./pages/Orders"
import Auth         from "./pages/Auth"
import Invoices     from "./pages/Invoices"
import Inventory    from "./pages/Inventory"
import Reports      from "./pages/Reports"
import Settings     from "./pages/Settings"
import Subscription from "./pages/Subscription"
import AppLayout    from "./components/AppLayout"

/* ── Auth guards ────────────────────────────────────────────────────── */

/** Only allow access when a token exists; otherwise redirect to /auth */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}

/** Only allow access when NOT logged in; otherwise redirect to /dashboard */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

/* ── Page transition wrapper ────────────────────────────────────────── */
/**
 * Wrap each page in a motion.div that fades in/out.
 * Key insight: we use opacity-only (no layout shift) and keep the
 * background on <html>/<body> (in index.css) so the transition frame
 * never shows a transparent/black gap.
 */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  )
}

/* ── Route tree ─────────────────────────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>

        {/* Public */}
        <Route path="/" element={
          <PageWrapper><Landing /></PageWrapper>
        } />

        {/* Auth — redirect to dashboard if already logged in */}
        <Route path="/auth" element={
          <GuestRoute>
            <PageWrapper><Auth /></PageWrapper>
          </GuestRoute>
        } />

        {/* Protected — redirect to /auth if not logged in */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute>
            <AppLayout><Customers /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/customers/:id" element={
          <ProtectedRoute>
            <AppLayout><CustomerDetail /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/measurements" element={
          <ProtectedRoute>
            <AppLayout><Measurements /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <AppLayout><Orders /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/invoices" element={
          <ProtectedRoute>
            <AppLayout><Invoices /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <AppLayout><Inventory /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout><Reports /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout><Settings /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/subscription" element={
          <ProtectedRoute>
            <AppLayout><Subscription /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
