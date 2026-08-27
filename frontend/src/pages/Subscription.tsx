import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, ShieldCheck, Zap, AlertCircle,
  CreditCard, Calendar, Users, Award, Sparkles, RefreshCw, UserCheck
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

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
  plans: Plan[];
}

export default function Subscription() {
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [grantDays, setGrantDays] = useState(30);
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
      const res = await fetch(`${backendUrl}/api/subscriptions/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ text: result.message || "Subscription activated!", type: "success" });
        await fetchSubscription();
      } else {
        setMessage({ text: result.detail || "Failed to process subscription.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
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

      {/* Account Entitlement Summary Card */}
      {data && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Current Account Entitlement</h2>
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
                <p className="text-xs text-muted-foreground">Client Records Quota</p>
                <p className="text-lg font-bold text-foreground">
                  {data.client_count}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    / {data.client_limit > 0 ? `${data.client_limit} max` : "Unlimited"}
                  </span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Trial Started</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(data.trial_started_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Trial Ends</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(data.trial_ends_at)}{" "}
                  {data.status === "TRIAL" && (
                    <span className="text-xs text-amber-600 font-normal">
                      ({data.remaining_trial_days} days left)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Active Subscription</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.subscription_ends_at
                    ? `Valid until ${formatDate(data.subscription_ends_at)}`
                    : "No active plan"}
                </p>
              </div>
            </div>
          </div>

          {/* 10 Client Limit Warning Callout for Trial */}
          {data.status === "TRIAL" && data.client_count >= 10 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
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
                  <span className="text-4xl font-extrabold text-foreground">₹1,500</span>
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
                  <span>Subscribe Monthly (₹1,500)</span>
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
                <Sparkles className="h-3 w-3" /> Save ₹3,000/yr
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
                  <span className="text-4xl font-extrabold text-foreground">₹15,000</span>
                  <span className="text-muted-foreground text-sm font-medium">/ year</span>
                </div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Equivalent to ₹1,250/month
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
                  <span>Subscribe Yearly (₹15,000)</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Admin Manual Trial Extension Panel */}
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
    </div>
  );
}
