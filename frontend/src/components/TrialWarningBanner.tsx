import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export interface SubscriptionStatusData {
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
}

export default function TrialWarningBanner() {
  const [subData, setSubData] = useState<SubscriptionStatusData | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/subscriptions/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSubData(data);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err);
      }
    };

    fetchStatus();
    // Refresh status every 60s
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!subData || !subData.warning_message) return null;

  const isExpired = subData.status === "TRIAL_EXPIRED" || !subData.is_allowed;
  const isUrgent = isExpired || subData.remaining_trial_days <= 3;

  return (
    <div
      className={`px-4 py-2.5 text-sm font-medium flex items-center justify-between gap-3 border-b transition-all ${
        isExpired
          ? "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-300"
          : isUrgent
          ? "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300"
          : "bg-sky-500/10 border-sky-500/20 text-sky-800 dark:text-sky-300"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isExpired ? (
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        ) : (
          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <span className="truncate">{subData.warning_message}</span>
        {subData.status === "TRIAL" && subData.client_limit > 0 && (
          <span className="hidden md:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-background/60 border font-mono">
            <ShieldCheck className="h-3 w-3" />
            {subData.client_count}/{subData.client_limit} clients used
          </span>
        )}
      </div>

      <Link
        to="/subscription"
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-all shadow-sm ${
          isExpired
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        <span>{isExpired ? "Subscribe Now" : "Upgrade Plan"}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
