import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Scissors, ArrowRight, Check, Users, ShoppingBag,
  Ruler, FileText, Package, BarChart3, Menu, X,
  TrendingUp, Star, ChevronRight, Shield, Zap, Clock, Sparkles, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Animation variants ─────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function FadeInWhenVisible({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Floating background orb ─────────────────────────────────────────── */
function AnimatedOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [-16, 16, -16],
        x: [-10, 10, -10],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      }}
      className={className}
    />
  );
}

/* ── Stat card in browser mockup ──────────────────────────────────────── */
function MockStatCard({
  label, value, change, changeType = "up", active = false, onClick,
}: {
  label: string; value: string; change: string; changeType?: "up" | "warn"; active?: boolean; onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl border p-3.5 shadow-sm cursor-pointer transition-all duration-200 ${
        active
          ? "bg-sky-50/80 border-sky-300 ring-2 ring-sky-400/20"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className={`text-[11px] mt-1 font-semibold flex items-center gap-0.5 ${changeType === "up" ? "text-emerald-500" : "text-amber-500"}`}>
        {changeType === "up" ? "↑" : "!"} {change}
      </p>
    </motion.div>
  );
}

/* ── Feature data ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: "Client Profiles",
    desc: "Store complete customer history, contact info, and all measurements in one place.",
    color: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    icon: ShoppingBag,
    title: "Order Tracking",
    desc: "Follow every garment from first stitch to final delivery with live status updates.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    icon: Ruler,
    title: "Measurements",
    desc: "Record and retrieve precise measurements for every garment type with smart templates.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: FileText,
    title: "Billing & Invoices",
    desc: "Generate professional invoices, track payments, and monitor outstanding balances.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: Package,
    title: "Fabric Inventory",
    desc: "Keep tabs on fabric stock levels, get low-stock alerts before you run out.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Visual revenue charts and business insights to help you grow confidently.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
];

const PRICING = [
  {
    name: "Free Trial",
    price: "₹0",
    period: "for 7 days",
    desc: "7 days free access to test TailorPro in your atelier.",
    features: ["Up to 10 client records", "Complete order workflow", "Garment measurement templates", "Invoices & billing", "No credit card needed"],
    cta: "Start 7-Day Free Trial",
    highlight: false,
    badge: "7 Days Free",
  },

  {
    name: "Monthly Plan",
    price: "₹5,000",
    period: "/month",
    desc: "Full unlimited access to grow your tailor business.",
    features: ["Unlimited client records", "Unlimited orders & invoices", "Measurements & fabric inventory", "Priority support", "Cancel anytime"],
    cta: "Subscribe Monthly",
    highlight: true,
    badge: "Most Flexible",
  },
  {
    name: "Yearly Plan",
    price: "₹50,000",
    period: "/year",
    desc: "Commit annually and save 2 months free equivalent.",
    features: ["Everything in Monthly", "Unlimited client records", "Equivalent to ₹4,167/month", "Save ₹10,000 every year", "Dedicated support"],
    cta: "Subscribe Yearly",
    highlight: false,
    badge: "Save ₹10,000/yr",
  },
];


const TESTIMONIALS = [
  { name: "Meera Patel", role: "Boutique owner, Ahmedabad", text: "TailorPro completely replaced my notebook. I can now check any measurement or order from my phone in seconds.", stars: 5 },
  { name: "Rajan Khanna", role: "Master tailor, Mumbai", text: "The billing feature alone saved me hours every week. My clients love receiving professional WhatsApp invoices.", stars: 5 },
  { name: "Sunita Devi", role: "Bridal studio, Delhi", text: "Managing 200+ bridal orders used to be chaos. Now everything is organized and I never miss a delivery date.", stars: 5 },
];

/* ── Main component ───────────────────────────────────────────────────── */
export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"revenue" | "orders" | "clients">("revenue");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("darkMode");
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing & Plans" },
    { href: "#customers", label: "Testimonials" },
    { href: "#contact", label: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden relative selection:bg-sky-500 selection:text-white">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm"
            >
              <Scissors className="h-4 w-4 text-white" />
            </motion.div>
            <span className="font-bold text-gray-900 text-lg tracking-tight group-hover:text-sky-600 transition-colors">
              TailorPro
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-600 hover:text-sky-600 transition-colors font-medium relative group py-1"
              >
                {l.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-9 px-4 text-sm gradient-brand text-white rounded-xl shadow-brand-sm hover:opacity-95 font-semibold hidden sm:flex items-center gap-1.5">
                  Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </Link>

            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-3">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-sky-600 py-2.5 px-3 rounded-lg hover:bg-sky-50 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Link to="/auth" className="block w-full">
                    <Button className="w-full h-9 gradient-brand text-white text-sm rounded-xl font-semibold">
                      Start 7-Day Trial <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative hero-bg pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Orbs */}
        <AnimatedOrb className="absolute -top-20 -right-20 h-96 w-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" delay={0} />
        <AnimatedOrb className="absolute top-1/2 -left-20 h-96 w-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" delay={2} />
        <AnimatedOrb className="absolute -bottom-20 right-1/3 h-80 w-80 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" delay={4} />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Animated Badge */}
          <motion.div {...fadeUp(0)} className="flex justify-center mb-6">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-200 text-xs font-semibold text-sky-700 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
              <span>7-Day Free Trial • No Credit Card Required</span>
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.08)} className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.1] text-gray-900 mb-6 text-balance">
            Run your atelier with{" "}
            <span className="gradient-brand-text">effortless elegance</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.16)} className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Client profiles, bespoke measurements, order tracking, billing & analytics — tailored specifically for modern studios.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="h-12 px-8 text-base gradient-brand text-white rounded-xl shadow-brand hover:opacity-95 font-semibold group flex items-center gap-2">
                  <span>Start 7-Day Free Trial</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </Link>


            <a href="#pricing">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" className="h-12 px-7 text-base rounded-xl border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all">
                  View Plans & Pricing
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
            {["7 Days Free Trial", "Max 10 Clients on Free Tier", "Instant Setup"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-100 shadow-2xs">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── BROWSER MOCKUP WITH INTERACTIVE ANIMATION ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-14 max-w-5xl mx-auto relative z-10"
        >
          {/* Floating badge top right */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="absolute -top-5 -right-3 z-20 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gray-200/80 shadow-lg text-xs font-semibold text-gray-800"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>⚡ 7-Day Trial Active</span>
          </motion.div>


          {/* Floating badge bottom left */}
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="absolute -bottom-4 -left-3 z-20 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gray-200/80 shadow-lg text-xs font-semibold text-gray-800"
          >
            <Shield className="h-4 w-4 text-sky-500" />
            <span>10 Client Records Quota (Free)</span>
          </motion.div>

          {/* Browser Chrome Container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden">
            {/* Title Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/90">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 flex items-center gap-2 max-w-sm mx-auto shadow-2xs">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-gray-500 font-mono">tailorpro.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-5 sm:p-6 bg-slate-50/70">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <MockStatCard
                  label="Monthly Revenue"
                  value="₹1,48,500"
                  change="+18%"
                  active={activeTab === "revenue"}
                  onClick={() => setActiveTab("revenue")}
                />
                <MockStatCard
                  label="Active Orders"
                  value="42 Bespoke"
                  change="+6 new"
                  active={activeTab === "orders"}
                  onClick={() => setActiveTab("orders")}
                />
                <MockStatCard
                  label="Client Profiles"
                  value="7 / 10 used"
                  change="Trial Tier"
                  changeType="warn"
                  active={activeTab === "clients"}
                  onClick={() => setActiveTab("clients")}
                />
                <MockStatCard
                  label="Fabrics Stock"
                  value="84 Meters"
                  change="Healthy"
                />
              </div>

              {/* Chart + List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Interactive Chart View */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Studio Performance</p>
                      <h4 className="text-base font-bold text-gray-900">
                        {activeTab === "revenue" && "Revenue Trends (₹)"}
                        {activeTab === "orders" && "Monthly Bespoke Orders"}
                        {activeTab === "clients" && "Client Growth & Trial Quota"}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                      Live Preview
                    </span>
                  </div>

                  {/* Animated Bar Chart */}
                  <div className="flex items-end gap-2 h-32 pt-4 border-b border-gray-100 pb-2">
                    {[45, 62, 54, 78, 68, 88, 72, 95, 82, 98, 86, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        className="flex-1 origin-bottom rounded-t-md gradient-brand relative group"
                        style={{ height: `${h}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded transition-opacity pointer-events-none whitespace-nowrap">
                          ₹{(h * 1500).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Live Activity Column */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Atelier Orders</p>
                    <div className="space-y-3">
                      {[
                        { name: "Ananya Sharma", item: "Silk Lehenga", status: "Stitching", color: "bg-sky-100 text-sky-800" },
                        { name: "Vikram Malhotra", item: "3-Pce Tuxedo", status: "Fitting", color: "bg-amber-100 text-amber-800" },
                        { name: "Priya Nair", item: "Designer Anarkali", status: "Ready", color: "bg-emerald-100 text-emerald-800" },
                        { name: "Rahul Verma", item: "Kurta Pajama", status: "Pending", color: "bg-violet-100 text-violet-800" },
                      ].map((order, idx) => (
                        <motion.div
                          key={order.name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900">{order.name}</p>
                            <p className="text-[10px] text-gray-400">{order.item}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${order.color}`}>
                            {order.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link to="/auth">
                      <button className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1">
                        <span>Open Dashboard</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS COUNTER BAR ────────────────────────────────────── */}
      <section className="py-12 border-y border-gray-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { num: "7", label: "Days Free Trial", sub: "Calculated automatically" },
              { num: "10", label: "Client Quota (Free)", sub: "Unlimited on paid" },
              { num: "₹1,500", label: "Monthly Plan", sub: "Cancel anytime" },
              { num: "₹15,000", label: "Yearly Plan", sub: "Save ₹3,000/yr" },
            ].map((s) => (
              <motion.div key={s.label} variants={staggerItem} className="space-y-1">
                <p className="text-3xl font-extrabold gradient-brand-text">{s.num}</p>
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1 rounded-full mb-4 border border-sky-100">
              Features & Tools
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Everything your atelier needs to thrive
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built specifically for tailors, boutiques, and custom clothing studios.
            </p>
          </FadeInWhenVisible>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <FadeInWhenVisible key={title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-200 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-12 w-12 rounded-2xl ${color} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/60 relative">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1 rounded-full mb-4 border border-sky-100">
              Commercial Pricing
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Transparent, Locked Commercial Pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Start with a 7-day free trial. Upgrade anytime to unlock unlimited customer records.
            </p>

          </FadeInWhenVisible>

          <div className="grid sm:grid-cols-3 gap-6 items-stretch">
            {PRICING.map((plan, i) => (
              <FadeInWhenVisible key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  className={`relative rounded-3xl border p-7 h-full flex flex-col justify-between ${
                    plan.highlight
                      ? "gradient-brand text-white shadow-brand-md border-transparent"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                      plan.highlight ? "bg-amber-400 text-amber-950" : "bg-sky-100 text-sky-800 border border-sky-200"
                    }`}>
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <p className={`font-bold text-sm mb-2 ${plan.highlight ? "text-sky-100" : "text-gray-500"}`}>
                      {plan.name}
                    </p>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-xs ${plan.highlight ? "text-sky-100" : "text-gray-500"}`}>
                        {plan.period}
                      </span>
                    </div>

                    <p className={`text-xs mb-6 leading-relaxed ${plan.highlight ? "text-sky-100" : "text-gray-500"}`}>
                      {plan.desc}
                    </p>

                    <ul className="space-y-3 mb-8 border-t pt-5 border-gray-100/20">
                      {plan.features.map((f) => (
                        <li key={f} className={`text-xs flex items-start gap-2.5 font-medium ${plan.highlight ? "text-white" : "text-gray-700"}`}>
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/auth">
                    <Button className={`w-full h-11 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm ${
                      plan.highlight
                        ? "bg-white text-sky-700 hover:bg-sky-50 hover:shadow-md"
                        : "gradient-brand text-white hover:opacity-90"
                    }`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ───────────────────────────────── */}
      <section id="customers" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1 rounded-full mb-4 border border-sky-100">
              Customer Feedback
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Trusted by Tailors & Boutiques Across India
            </h2>
          </FadeInWhenVisible>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeInWhenVisible key={t.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                  </div>
                  <div className="border-t pt-3 border-gray-50 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER (MATCHED TO LOGO BRAND GRADIENT) ─────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sky-200/50 bg-gradient-to-br from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6] p-8 sm:p-14 lg:p-16 text-white text-center">
              
              {/* Background ambient glowing orbs & brand watermarks */}
              <AnimatedOrb className="absolute -top-24 -right-24 h-96 w-96 bg-white/20 rounded-full blur-3xl pointer-events-none" delay={0} />
              <AnimatedOrb className="absolute -bottom-24 -left-24 h-96 w-96 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none" delay={3} />
              
              {/* Subtle background floating scissor icon matching LOGO */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
                <Scissors className="h-72 w-72 text-white -rotate-12" />
              </div>
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                
                {/* Floating Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  <span>7-Day Free Trial • Instant Activation</span>
                </div>

                {/* Headline */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                  Start your 7-day free trial today
                </h2>


                {/* Description */}
                <p className="text-base sm:text-lg text-sky-50 max-w-xl mx-auto leading-relaxed font-medium">
                  Get instant access to client management, orders, measurements, and billing. No credit card required.
                </p>

                {/* Interactive High-Conversion Button */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/auth">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="relative group"
                    >
                      <Button
                        size="lg"
                        className="h-14 px-10 text-base bg-white text-sky-700 hover:bg-sky-50 rounded-2xl font-extrabold shadow-[0_10px_35px_rgba(0,0,0,0.2)] group-hover:shadow-[0_15px_45px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center gap-3 border-2 border-white"
                      >
                        <span className="gradient-brand-text text-lg">Create Free Account Now</span>
                        <ArrowRight className="h-5 w-5 text-sky-600 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                {/* Feature Checkmarks */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-sky-100">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
                    <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                    7 days completely free
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
                    <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                    Max 10 clients on trial
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
                    <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                    Data remains 100% safe
                  </span>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ── CONTACT FORM FOR INQUIRIES ───────────────────────────── */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <FadeInWhenVisible className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1 rounded-full mb-4 border border-sky-100">
              Get in Touch
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Have questions? Let's talk.
            </h2>
            <p className="text-lg text-gray-500">
              Send us an inquiry and our team will get back to you shortly.
            </p>
          </FadeInWhenVisible>

          <form 
            className="bg-slate-50 p-8 rounded-3xl border border-gray-100 shadow-sm"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = {
                name: (form.elements.namedItem('name') as HTMLInputElement).value,
                email: (form.elements.namedItem('email') as HTMLInputElement).value,
                subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
                message: (form.elements.namedItem('message') as HTMLTextAreaElement).value
              };
              try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
                const res = await fetch(`${backendUrl}/api/admin/inquiries/public`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                if (res.ok) {
                  alert('Thank you! Your inquiry has been sent successfully.');
                  form.reset();
                } else {
                  const errData = await res.json().catch(() => null);
                  let errMsg = 'Failed to send inquiry. Please try again later.';
                  if (errData && errData.detail) {
                    if (Array.isArray(errData.detail)) {
                      errMsg = errData.detail.map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join('\n');
                    } else if (typeof errData.detail === 'string') {
                      errMsg = errData.detail;
                    }
                  }
                  alert(`Error:\n${errMsg}`);
                }
              } catch (err) {
                alert('Network error. Please try again later.');
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input required name="subject" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" placeholder="How can we help?" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea required name="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all" placeholder="Tell us more about your needs..."></textarea>
            </div>
            <Button type="submit" className="w-full h-12 text-base gradient-brand text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              Send Inquiry
            </Button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
              <Scissors className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">TailorPro</span>
          </Link>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
            {["Features", "Pricing", "Testimonials"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(" & plans", "")}`} className="hover:text-sky-600 transition-colors">
                {l}
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-400">© 2026 TailorPro Studio Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
