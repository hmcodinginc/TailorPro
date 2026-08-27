import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Scissors, ArrowRight, Check, Users, ShoppingBag,
  Ruler, FileText, Package, BarChart3, Sun, Moon, Menu, X,
  TrendingUp, Star, ChevronRight, Shield, Zap, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Animation helpers ─────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function FadeInWhenVisible({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Stat card in browser mockup ──────────────────────────────────────── */
function MockStatCard({
  label, value, change, changeType = "up",
}: { label: string; value: string; change: string; changeType?: "up" | "warn" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-1 font-medium ${changeType === "up" ? "text-emerald-500" : "text-amber-500"}`}>
        {change}
      </p>
    </div>
  );
}

/* ── Feature card ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: "Client Profiles",
    desc: "Store complete customer history, contact info, and all measurements in one place.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: ShoppingBag,
    title: "Order Tracking",
    desc: "Follow every garment from first stitch to final delivery with live status updates.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Ruler,
    title: "Measurements",
    desc: "Record and retrieve precise measurements for every garment type with smart templates.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: FileText,
    title: "Billing & Invoices",
    desc: "Generate professional invoices, track payments, and monitor outstanding balances.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Package,
    title: "Fabric Inventory",
    desc: "Keep tabs on fabric stock levels, get low-stock alerts before you run out.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Visual revenue charts and business insights to help you grow confidently.",
    color: "bg-rose-50 text-rose-600",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for solo tailors getting started.",
    features: ["Up to 50 clients", "Order tracking", "Basic measurements", "1 user"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹1500",
    period: "/mo",
    desc: "Everything you need to run a thriving atelier.",
    features: [ "Full billing suite", "Inventory management", "Analytics & reports", "Up to 10 users", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Studio",
    price: "₹15,000",
    period: "/mo",
    desc: "Multi-branch studios & large teams.",
    features: ["Everything in Pro", "Unlimited users", "Multi-branch support", "Custom branding",  "Dedicated support"],
    cta: "Contact sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Meera Patel", role: "Boutique owner, Ahmedabad", text: "TailorPro completely replaced my notebook. I can now check any measurement or order from my phone in seconds.", stars: 5 },
  { name: "Rajan Khanna", role: "Master tailor, Mumbai", text: "The billing feature alone saved me hours every week. My clients love the professional invoices.", stars: 5 },
  { name: "Sunita Devi", role: "Bridal studio, Delhi", text: "Managing 200+ bridal orders used to be chaos. Now everything is organised and I never miss a due date.", stars: 5 },
];

/* ── Main component ───────────────────────────────────────────────────── */
export default function Landing() {

  // Read dark preference from localStorage (synced with AppLayout)
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    dark ? el.classList.add("dark") : el.classList.remove("dark");
    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#customers", label: "Customers" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">TailorPro</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="h-9 w-9 hidden md:flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Launch app button */}
            <Link to="/auth">
              <Button className="h-9 px-4 text-sm gradient-brand text-white rounded-xl shadow-brand-sm hover:opacity-90 hover:-translate-y-px transition-all font-semibold hidden sm:flex items-center gap-1.5">
                Launch app <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white px-4 pb-4"
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
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <button onClick={() => setDark(!dark)} className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link to="/auth" className="flex-1">
                  <Button className="w-full h-9 gradient-brand text-white text-sm rounded-xl font-semibold">
                    Launch app <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="hero-bg pt-28 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div {...fadeUp(0)} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-200 text-xs font-semibold text-sky-700 shadow-sm">
              <Zap className="h-3 w-3 text-sky-500" />
              The modern tailor management platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.08)} className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.1] text-gray-900 mb-6 text-balance">
            Run your atelier with{" "}
            <span className="gradient-brand-text">effortless elegance</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.16)} className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Orders, measurements, inventory, billing and analytics — designed for bespoke tailors who care about every stitch and every detail.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-7 text-base gradient-brand text-white rounded-xl shadow-brand hover:opacity-90 hover:-translate-y-0.5 transition-all font-semibold group">
                Try the dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base rounded-xl border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all">
                See features
              </Button>
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
            {["No credit card required", "Free plan forever", "Setup in 2 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Browser mockup ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 max-w-4xl mx-auto"
        >
          {/* Browser chrome */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <div className="flex-1 mx-4">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-1 flex items-center gap-2 max-w-xs mx-auto">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-gray-400 font-mono">tailorpro.app / dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard preview content */}
            <div className="p-5 bg-gray-50/60">
              {/* Stat cards row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <MockStatCard label="Revenue" value="$28.4k" change="+12%" />
                <MockStatCard label="Orders" value="142" change="+8" />
                <MockStatCard label="Clients" value="512" change="+24" />
                <MockStatCard label="Fabrics" value="68" change="5 low" changeType="warn" />
              </div>

              {/* Chart + list row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Mini bar chart */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Monthly Revenue</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 52, 44, 68, 58, 75, 62, 80, 70, 88, 76, 92].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t gradient-brand opacity-80 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Jan","Mar","May","Jul","Sep","Nov"].map(m => (
                      <span key={m} className="text-[9px] text-gray-300">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Recent orders mini list */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Recent Orders</p>
                  <div className="space-y-2">
                    {[
                      { name: "Meera P.", status: "Ready", color: "bg-emerald-100 text-emerald-700" },
                      { name: "Raj K.", status: "Stitching", color: "bg-sky-100 text-sky-700" },
                      { name: "Sunita D.", status: "Pending", color: "bg-amber-100 text-amber-700" },
                      { name: "Amit S.", status: "Delivered", color: "bg-gray-100 text-gray-600" },
                    ].map((o) => (
                      <div key={o.name} className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-600 font-medium">{o.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${o.color}`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── LOGOS / SOCIAL PROOF ───────────────────────────────── */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Trusted by tailors across India
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {["500+ Studios", "50K+ Orders", "4.9 ★ Rating", "99.9% Uptime"].map((s) => (
              <div key={s} className="text-center">
                <p className="text-2xl font-extrabold gradient-brand-text">{s.split(" ")[0]}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.split(" ").slice(1).join(" ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight text-balance">
              Everything your studio needs
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From your first customer to your thousandth order — TailorPro grows with your business.
            </p>
          </FadeInWhenVisible>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <FadeInWhenVisible key={title} delay={i * 0.06}>
                <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-100 hover:-translate-y-0.5 transition-all duration-200 cursor-default h-full">
                  <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Up and running in minutes</h2>
            <p className="text-gray-500">No complicated setup. Just sign up and start managing.</p>
          </FadeInWhenVisible>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Create your account", desc: "Sign up free — no credit card needed. Your data lives securely in the cloud." },
              { step: "02", title: "Add your customers", desc: "Import existing contacts or start fresh. Store measurements, notes, and history." },
              { step: "03", title: "Manage everything", desc: "Track orders, send invoices, monitor inventory — all from one elegant dashboard." },
            ].map((s, i) => (
              <FadeInWhenVisible key={s.step} delay={i * 0.1}>
                <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <span className="text-5xl font-extrabold text-gray-100 leading-none block mb-3">{s.step}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  {i < 2 && (
                    <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200 hidden sm:block" />
                  )}
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full mb-4">
              Pricing
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when you're ready.</p>
          </FadeInWhenVisible>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {PRICING.map((plan, i) => (
              <FadeInWhenVisible key={plan.name} delay={i * 0.08}>
                <div className={`relative rounded-2xl border p-7 ${
                  plan.highlight
                    ? "gradient-brand text-white shadow-brand border-transparent"
                    : "bg-white border-gray-200 shadow-sm"
                }`}>
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Most popular
                    </span>
                  )}
                  <p className={`font-semibold text-sm mb-2 ${plan.highlight ? "text-sky-100" : "text-gray-500"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlight ? "text-sky-100" : "text-gray-400"}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-5 ${plan.highlight ? "text-sky-100" : "text-gray-500"}`}>{plan.desc}</p>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-sky-50" : "text-gray-600"}`}>
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? "text-white" : "text-sky-500"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className={`w-full h-10 rounded-xl font-semibold text-sm transition-all ${
                      plan.highlight
                        ? "bg-white text-sky-600 hover:bg-sky-50"
                        : "gradient-brand text-white shadow-brand-sm hover:opacity-90"
                    }`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="customers" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full mb-4">
              Customers
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Loved by tailors across India
            </h2>
          </FadeInWhenVisible>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeInWhenVisible key={t.name} delay={i * 0.1}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <FadeInWhenVisible>
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight text-balance">
              Ready to transform your studio?
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Join hundreds of tailors who have already modernised their operations with TailorPro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base gradient-brand text-white rounded-xl shadow-brand hover:opacity-90 hover:-translate-y-0.5 transition-all font-semibold group">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-700 font-medium transition-all">
                  View demo
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            </p>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
                <Scissors className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">TailorPro</span>
            </Link>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              {["Features", "Pricing", "Customers"].map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-gray-900 transition-colors">
                  {l}
                </a>
              ))}
            </div>

            <p className="text-xs text-gray-400">© 2025 TailorPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
