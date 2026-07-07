import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { Scissors, ArrowRight, CheckCircle2, BarChart3, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                TailorPro
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/auth">
                <Button className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Tailor Management System v2.0
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
              Manage your tailor shop with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">precision</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform for modern tailors. Track measurements, manage orders, handle billing, and delight your customers.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/25 transition-all hover:-translate-y-1">
                  Start for free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:-translate-y-1">
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Abstract UI Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 bottom-0 h-1/2 mt-auto" />
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-2">
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 aspect-video relative flex items-center justify-center">
               <div className="grid grid-cols-3 gap-6 p-8 w-full h-full opacity-50">
                  <div className="col-span-2 space-y-4">
                    <div className="h-32 rounded-xl bg-white dark:bg-slate-800 shadow-sm" />
                    <div className="h-64 rounded-xl bg-white dark:bg-slate-800 shadow-sm" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-48 rounded-xl bg-white dark:bg-slate-800 shadow-sm" />
                    <div className="h-48 rounded-xl bg-white dark:bg-slate-800 shadow-sm" />
                  </div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white/90 dark:bg-slate-900/90 p-4 px-6 rounded-full shadow-lg flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary animate-spin-slow" />
                    <span className="font-medium">Coming to life...</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to scale</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Replace your messy notebooks and scattered spreadsheets with a single, elegant solution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Customer Profiles", desc: "Keep detailed records of every client, their preferences, and past orders.", icon: Users },
              { title: "Digital Measurements", desc: "Store exact measurements securely so you never have to re-measure.", icon: CheckCircle2 },
              { title: "Business Analytics", desc: "Track your revenue, popular styles, and busy seasons with beautiful charts.", icon: BarChart3 },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
