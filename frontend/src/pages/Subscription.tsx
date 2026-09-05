import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, ShieldCheck, Zap, AlertCircle,
  CreditCard, Calendar, Users, Award, Sparkles, RefreshCw, UserCheck
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  formatted_price: string;
  effective_monthly?: string;
  features: string[];
}

interface SubscriptionStatus {
  status: string;
  is_allowed: boolean;
  allowed_message: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  warning_message: string | null;
  remaining_trial_days: number;
  client_count: number;
  client_limit: number;
  phone_verified: boolean;
  is_admin: boolean;
  razorpay_key_id?: string;
  plans: Plan[];
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Subscription() {
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [grantDays, setGrantDays] = useState(7);
  const [grantingTrial, setGrantingTrial] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchSubscription = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/subscriptions/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const resData = await res.json();
        setData(resData);
      }
    } catch (err) {
      console.error("Error loading subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubmittingPlan(planId);
    setMessage(null);
    const token = localStorage.getItem("token");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      // Step 1: Create Razorpay Subscription on Backend
      const createRes = await fetch(`${backendUrl}/api/subscriptions/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        setMessage({ text: createData.detail || "Failed to initiate subscription.", type: "error" });
        setSubmittingPlan(null);
        return;
      }

      const { subscription_id, key_id, is_mock } = createData;

      // Local mock testing mode fallback if Razorpay live credentials are not set
      if (is_mock) {
        const verifyRes = await fetch(`${backendUrl}/api/subscriptions/verify-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            razorpay_payment_id: "pay_mock_" + Date.now(),
            razorpay_subscription_id: subscription_id,
            razorpay_signature: "mock_signature",
            plan: planId,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          setMessage({ text: verifyData.message || "Subscription activated successfully!", type: "success" });
          await fetchSubscription();
        } else {
          setMessage({ text: verifyData.detail || "Payment verification failed.", type: "error" });
        }
        setSubmittingPlan(null);
        return;
      }

      // Step 2: Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage({ text: "Unable to load Razorpay SDK. Check your internet connection.", type: "error" });
        setSubmittingPlan(null);
        return;
      }

      // Step 3: Open Razorpay Checkout Modal
      const planTitle = planId === "TAILORPRO_YEARLY" ? "TailorPro Yearly" : "TailorPro Monthly";
      const options = {
        key: key_id || data?.razorpay_key_id,
        subscription_id: subscription_id,
        name: "TailorPro",
        description: `${planTitle} Subscription`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${backendUrl}/api/subscriptions/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setMessage({ text: verifyData.message || "Subscription activated successfully!", type: "success" });
              await fetchSubscription();
            } else {
              setMessage({ text: verifyData.detail || "Payment signature verification failed.", type: "error" });
            }
          } catch (err) {
            setMessage({ text: "Network error during signature verification.", type: "error" });
          } finally {
            setSubmittingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setMessage({ text: "Payment checkout cancelled.", type: "error" });
            setSubmittingPlan(null);
          },
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setMessage({
          text: `Payment failed: ${response.error?.description || "Transaction failed"}`,
          type: "error",
        });
        setSubmittingPlan(null);
      });
      rzp.open();
    } catch (err) {
      setMessage({ text: "Network error occurred during payment setup.", type: "error" });
      setSubmittingPlan(null);
    }
  };

  const handleGrantTrial = async () => {
    if (!data) return;
    setGrantingTrial(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/subscriptions/admin/grant-trial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ business_id: 1, days: Number(grantDays) }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ text: result.message, type: "success" });
        await fetchSubscription();
      } else {
        setMessage({ text: result.detail || "Failed to grant trial.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error.", type: "error" });
    } finally {
      setGrantingTrial(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE_MONTHLY":
      case "ACTIVE_YEARLY":
      case "CUSTOM":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "TRIAL":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
      case "TRIAL_EXPIRED":
      case "PAYMENT_FAILED":
        return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Billing"
        description="Manage your TailorPro subscription, free trial, and client capacity"
      />

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
              : "bg-red-500/15 text-red-800 dark:text-red-200 border border-red-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Expired Account Alert Banner */}
      {data && (!data.is_allowed || data.status === "TRIAL_EXPIRED" || data.status === "PAYMENT_FAILED") && (
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-900 dark:text-red-200 flex items-start gap-4 shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-red-700 dark:text-red-300">
              {data.status === "PAYMENT_FAILED" ? "Subscription Payment Required" : "Free Trial Has Expired"}
            </h3>
            <p className="text-sm text-red-800 dark:text-red-300">
              {data.allowed_message || "Choose a plan below to immediately reactivate full access to your studio records, invoices, and customer management."}
            </p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> All {data.client_count} customer records & orders are 100% safe.
            </p>
          </div>
        </div>
      )}

      {/* Trial Countdown Card */}
      {data && data.status === "TRIAL" && (
        <div className="bg-card border border-sky-500/30 rounded-2xl p-5 shadow-sm bg-gradient-to-r from-sky-500/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-500" />
                <h3 className="font-bold text-foreground">Free Trial Countdown</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {data.remaining_trial_days} {data.remaining_trial_days === 1 ? "day" : "days"} remaining
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Started {formatDate(data.trial_started_at)} • Ends on <strong className="text-foreground">{formatDate(data.trial_ends_at)}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Client Records Quota</span>
              <p className="text-sm font-bold text-foreground font-mono">
                {data.client_count} / {data.client_limit} clients
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: (() => {
                  const totalDays = (data.trial_started_at && data.trial_ends_at)
                    ? Math.max(1, Math.round((new Date(data.trial_ends_at).getTime() - new Date(data.trial_started_at).getTime()) / (1000 * 60 * 60 * 24)))
                    : 7;
                  const elapsedDays = Math.max(0, totalDays - data.remaining_trial_days);
                  return `${Math.max(5, Math.min(100, (elapsedDays / totalDays) * 100))}%`;
                })()
              }}
            />
          </div>
        </div>
      )}

      {/* Account Entitlement & Current Plan Summary Card */}
      {data && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Current Plan & Access Status</h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                    data.status
                  )}`}
                >
                  {data.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{data.allowed_message}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <p className={`text-sm font-bold ${data.is_allowed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {data.is_allowed ? "Active & Authorized" : "Payment Action Required"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Details Row: Current Plan, Renewal Date, Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Current Plan</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.status === "ACTIVE_MONTHLY"
                    ? "TailorPro Monthly (₹5,000/mo)"
                    : data.status === "ACTIVE_YEARLY"
                    ? "TailorPro Yearly (₹50,000/yr)"
                    : data.status === "TRIAL"
                    ? "7-Day Free Trial"
                    : "Plan Expired"}
                </p>

              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Renewal / Expiration Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.subscription_ends_at
                    ? formatDate(data.subscription_ends_at)
                    : data.trial_ends_at
                    ? formatDate(data.trial_ends_at)
                    : "No active renewal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Client Records Quota</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.client_count}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    / {data.client_limit > 0 ? `${data.client_limit} max` : "Unlimited"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 10 Client Limit Warning Callout for Trial */}
          {data.status === "TRIAL" && data.client_count >= 10 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">You've reached the 10-client limit for your free trial.</p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Subscribe to continue adding clients. Your existing customer data remains completely safe.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Plans Section */}
      <div className="space-y-4 pt-2">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-2xl font-bold text-foreground">Simple Commercial Plans</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade from trial to unlock unlimited customer records and full access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
          {/* Monthly Plan */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  TAILORPRO MONTHLY
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Monthly
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">₹5,000</span>
                  <span className="text-muted-foreground text-sm font-medium">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Flexible monthly billing. Cancel anytime.</p>
              </div>

              <div className="border-t pt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Unlimited</strong> client records</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Full orders & invoice management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Measurements & fabric inventory</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Safe stored data guarantee</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe("TAILORPRO_MONTHLY")}
              disabled={submittingPlan === "TAILORPRO_MONTHLY"}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submittingPlan === "TAILORPRO_MONTHLY" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Subscribe Monthly (₹5,000)</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-card border-2 border-primary rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent"
          >
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-3 w-3" /> Save ₹10,000/yr
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  TAILORPRO YEARLY
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">₹50,000</span>
                  <span className="text-muted-foreground text-sm font-medium">/ year</span>
                </div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Equivalent to ₹4,167/month
                </p>
              </div>

              <div className="border-t pt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Unlimited</strong> client records</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Full orders & invoice management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Measurements & fabric inventory</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span><strong>Best value:</strong> 2 months free savings</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe("TAILORPRO_YEARLY")}
              disabled={submittingPlan === "TAILORPRO_YEARLY"}
              className="mt-6 w-full py-2.5 px-4 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-brand-md disabled:opacity-50"
            >
              {submittingPlan === "TAILORPRO_YEARLY" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Subscribe Yearly (₹50,000)</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Admin Manual Trial Extension Panel — ONLY visible to system admins */}
      {data?.is_admin && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-8">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <h4 className="font-bold text-foreground">Admin Trial Management</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Manually grant or extend free trial period for testing or customer support.
          </p>

          <div className="flex items-center gap-3 max-w-md">
            <input
              type="number"
              min="1"
              max="365"
              value={grantDays}
              onChange={(e) => setGrantDays(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-muted border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">days</span>
            <button
              onClick={handleGrantTrial}
              disabled={grantingTrial}
              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-all flex items-center gap-1.5"
            >
              {grantingTrial ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Grant / Extend Trial"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

