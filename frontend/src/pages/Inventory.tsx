import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function Inventory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage your stock, fabrics, and materials.</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Inventory Module</h3>
        <p className="text-muted-foreground max-w-md">
          Track your fabrics, threads, buttons, and other materials here. Low stock alerts will be displayed on the dashboard.
        </p>
      </div>
    </motion.div>
  );
}
