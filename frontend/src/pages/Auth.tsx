import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, signupUser } from "@/lib/api";

export default function Auth() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        // Create the account first
        await signupUser({ email: form.email, password: form.password });
        // Then auto-login to get the token
        const loginData: any = await loginUser({ email: form.email, password: form.password });
        if (loginData?.access_token) {
          localStorage.setItem("token", loginData.access_token);
          navigate("/dashboard");
        }
      } else {
        const data: any = await loginUser({ email: form.email, password: form.password });
        if (data?.access_token) {
          localStorage.setItem("token", data.access_token);
          navigate("/dashboard");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-12">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-10 w-10 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">TailorPro</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 text-center">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {mode === "login"
                ? "Sign in to your TailorPro dashboard"
                : "Start managing your studio for free"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setForm({ email: "", password: "", confirm: "" }); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                type="email"
                className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <Input
                    type={showPw ? "text" : "password"}
                    className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 gradient-brand text-white rounded-xl shadow-brand-sm hover:opacity-90 transition-opacity font-semibold group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          {mode === "signup" && (
            <div className="mt-4 space-y-1.5">
              {["No credit card required", "Free plan available", "Setup in minutes"].map((t) => (
                <p key={t} className="flex items-center gap-2 text-xs text-gray-400">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {t}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our{" "}
          <span className="text-sky-600 cursor-pointer hover:underline">Terms of Service</span>
          {" "}and{" "}
          <span className="text-sky-600 cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}