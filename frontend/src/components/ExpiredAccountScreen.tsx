import { Link } from "react-router-dom";
import { Lock, ShieldAlert, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ExpiredAccountScreenProps {
  status: string;
  message: string;
  clientCount: number;
}

export default function ExpiredAccountScreen({ status, message, clientCount }: ExpiredAccountScreenProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-xl w-full bg-card border-2 border-red-500/20 rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

        <div className="h-16 w-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
            <ShieldAlert className="h-3.5 w-3.5" />
            {status === "PAYMENT_FAILED" ? "Payment Failure" : "Trial Expired"}
          </span>
          <h2 className="text-2xl font-bold text-foreground">TailorPro Account Access Suspended</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
        </div>

        <div className="bg-muted/50 border border-border rounded-2xl p-4 text-left space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Customer Data Guarantee</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All {clientCount} records safe
            </span>
          </div>
          <p>
            Your measurements, customer profiles, and invoice history are securely preserved. Subscribe to a commercial plan to restore instant access.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/subscription"
            className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-brand-md"
          >
            <span>Choose Plan & Subscribe Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
