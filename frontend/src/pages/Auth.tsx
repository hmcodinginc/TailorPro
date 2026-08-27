import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, signupUser, forgotPassword, resetPassword, verifyEmail } from "@/lib/api";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token");
  const urlAction = searchParams.get("action");

  // Determine initial mode based on url search params
  const initialMode = (urlToken && urlAction === "reset") ? "reset" : "login";
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(initialMode);
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [form, setForm] = useState({ name: "", business_name: "", phone: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    if (urlToken && urlAction === "verify") {
      setLoading(true);
      verifyEmail({ token: urlToken })
        .then((res: any) => {
          setSuccessMsg(res.message || "Email verified successfully! You can now log in.");
        })
        .catch((err: any) => {
          setError(err.message || "Invalid or expired verification link.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [urlToken, urlAction]);

  const clearMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    clearMessages();
    setForm({ name: "", business_name: "", phone: "", email: "", password: "", confirm: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    // VALIDATIONS
    if ((mode === "signup" || mode === "reset") && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const res: any = await signupUser({
          name: form.name,
          business_name: form.business_name,
          phone: form.phone,
          email: form.email,
          password: form.password
        });
        setSuccessMsg(res.message || "Account created! 30-day free trial activated.");
        setForm({ name: "", business_name: "", phone: "", email: "", password: "", confirm: "" });
      } else if (mode === "login") {
        const data: any = await loginUser({ email: form.email, password: form.password });
        if (data?.access_token) {
          localStorage.setItem("token", data.access_token);
          navigate("/dashboard");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else if (mode === "forgot") {
        const res: any = await forgotPassword({ email: form.email });
        setSuccessMsg(res.message || "If the email is registered, a password reset link has been sent.");
      } else if (mode === "reset" && urlToken) {
        const res: any = await resetPassword({ token: urlToken, new_password: form.password });
        setSuccessMsg(res.message || "Password reset successfully. You can now log in.");
        setTimeout(() => {
          navigate("/auth");
          switchMode("login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen hero-bg flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="h-10 w-10 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">TailorPro</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 text-center">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
              {mode === "reset" && "Set new password"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {mode === "login" && "Sign in to your TailorPro dashboard"}
              {mode === "signup" && "Start managing your studio for free"}
              {mode === "forgot" && "Enter your email to receive a reset link"}
              {mode === "reset" && "Create a secure new password"}
            </p>
          </div>

          {(mode === "login" || mode === "signup") && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
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
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* SIGNUP FIELDS */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-sm font-medium text-gray-700">Your Name</Label>
                    <Input
                      type="text"
                      className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required={mode === "signup"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 font-sans">Studio / Business Name</Label>
                    <Input
                      type="text"
                      className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                      placeholder="John's Tailor Shop"
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      required={mode === "signup"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 font-sans">Phone Number (Required for 30-Day Trial)</Label>
                    <Input
                      type="tel"
                      className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required={mode === "signup"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL FIELD - Used in Login, Signup, and Forgot Password */}
            {mode !== "reset" && (
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
            )}

            {/* PASSWORD FIELD - Used in Login, Signup, and Reset Password */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    {mode === "reset" ? "New Password" : "Password"}
                  </Label>
                  {mode === "login" && (
                    <button 
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs text-sky-600 font-medium hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
            )}

            {/* CONFIRM PASSWORD FIELD - Used in Signup and Reset Password */}
            <AnimatePresence>
              {(mode === "signup" || mode === "reset") && (
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

            {/* MESSAGES */}
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
            
            <AnimatePresence>
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5"
                >
                  {successMsg}
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
                  {mode === "login" && "Signing in…"}
                  {mode === "signup" && "Creating account…"}
                  {mode === "forgot" && "Sending link…"}
                  {mode === "reset" && "Resetting…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Link"}
                  {mode === "reset" && "Update Password"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
            
            {mode === "forgot" && (
              <button 
                type="button" 
                onClick={() => switchMode("login")}
                className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors mt-2"
              >
                Back to Sign In
              </button>
            )}
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

        {(mode === "login" || mode === "signup") && (
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{" "}
            <span className="text-sky-600 cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-sky-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        )}
      </motion.div>
    </div>
  );
}