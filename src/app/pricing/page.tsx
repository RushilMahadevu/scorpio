"use client";


import { motion } from "framer-motion";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Sparkles,
  Info, BookOpen, Mail, Shield, FileText,
  CheckCircle2, XCircle, Zap, KeyRound, Github,
  ShieldCheck, Globe, Lock
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import dynamic from "next/dynamic";
import { LandingFAQ } from "@/components/landing-faq";


const CostComparisonChart = dynamic(() => import("@/components/admin/cost-comparison-chart"), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse" />,
});

export default function PricingPage() {

  return (
    <>
      {/* ── Page-reveal wipe: sweeps out from top-right → bottom-left ────── */}
      <motion.div
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: "hsl(var(--background))" }}
        initial={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 0%)" }}
        animate={{ clipPath: "polygon(-50% 0%, 100% 0%, 100% 200%)" }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.08)" }}
        initial={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 0%)" }}
        animate={{ clipPath: "polygon(-50% 0%, 100% 0%, 100% 200%)" }}
        transition={{ duration: 0.65, delay: 0.06, ease: [0.76, 0, 0.24, 1] }}
      />

      <div className="min-h-screen relative font-medium">
        <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_10rem,black_calc(100%-10rem),transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        {/* Global Site Header */}
        <SiteHeader activeSection="pricing" />

        <main className="relative z-10 pt-16">

          {/* Hero */}
          <section className="container mx-auto px-6 pt-24 pb-16 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <motion.div
              className="max-w-3xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transparent Pricing</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                AI-powered physics<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 italic">
                  for less than a textbook.
                </span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                One flat subscription. Unlimited students. Zero markup on AI. While competitors charge{" "}
                <span className="text-foreground font-bold">$5–$12 per student per month</span>, Scorpio charges{" "}
                <span className="text-emerald-500 font-bold">$4.99 total</span>.
              </p>

              {/* Activate billing callout */}
              <div className="inline-flex items-start gap-3 px-5 py-4 rounded-2xl border border-primary/20 bg-primary/5 text-left max-w-xl mx-auto">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80 leading-relaxed">
                  <span className="font-bold text-foreground">To activate billing:</span> Sign up as a teacher → create a network in your portal → billing appears under{" "}
                  <span className="font-semibold text-foreground">Network → Settings → Billing</span>.
                </span>
              </div>
            </motion.div>
          </section>

          {/* Stats Strip */}
          <section className="container mx-auto px-6 pb-16">
            <motion.div
              className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6 px-8 py-5 rounded-2xl border border-border/40 bg-muted/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {[
                { value: "98%", label: "cheaper than industry average at scale" },
                { value: "$0.08", label: "effective per-student cost at 250 students" },
                { value: "∞", label: "students on one flat subscription" },
                { value: "0×", label: "markup on Google DeepMind AI costs" },
              ].map((stat, i) => (
                <div key={i} className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground max-w-[140px] leading-tight">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </section>

          {/* Main Pricing Section */}
          <section className="container mx-auto px-6 pb-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="max-w-6xl mx-auto space-y-12">

              {/* 3-Card Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {/* Free */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="relative p-8 border border-border bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-5 hover:border-primary/20 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">
                      Free
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter">$0</span>
                      <span className="text-muted-foreground text-base font-medium">/mo</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      Get started with core tools. No credit card required.
                    </p>
                  </div>
                  <ul className="space-y-2.5 flex-1 text-sm">
                    {["Teacher & Student Accounts", "Basic Course Management", "1 Network Waypoint"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-foreground/70 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />{f}
                      </li>
                    ))}
                    {["Crux AI Tutor", "AI Grading", "Analytics"].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-muted-foreground/40 font-medium line-through">
                        <XCircle className="h-4 w-4 text-muted-foreground/20 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant="outline" className="cursor-pointer w-full font-black py-6 text-base rounded-xl">
                      Start Free <ArrowRight className="h-4 w-4 ml-2 opacity-50 inline" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Monthly */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="relative p-8 border border-border bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-5 hover:border-primary/30 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">
                      Monthly
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter">$4.99</span>
                      <span className="text-muted-foreground text-base font-medium">/mo</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      Full access, cancel anytime.
                    </p>
                  </div>
                  <ul className="space-y-2.5 flex-1 text-sm">
                    {[
                      "Everything in Free",
                      "Unlimited Waypoints",
                      "Crux AI Tutor",
                      "AI Grading & Feedback",
                      "Portfolio Analysis per Student",
                      "Mastery Analytics",
                      "Spend Caps & Controls",
                      "Priority Support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-foreground/80 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="cursor-pointer w-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 font-black py-6 text-base rounded-xl shadow-md">
                      Get Started <ArrowRight className="h-4 w-4 ml-2 opacity-50 inline" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Annual — highlighted */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="relative p-8 border-2 border-primary bg-primary/[0.02] rounded-2xl flex flex-col gap-5 overflow-hidden transition-all hover:scale-[1.01] duration-300 shadow-lg shadow-primary/5"
                >
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-4 py-1.5 font-black uppercase tracking-widest rounded-bl-xl">
                    Best Value
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-0.5 mb-4">
                      Annual
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">$29.88</span>
                      <span className="text-muted-foreground text-base font-medium">/yr</span>
                    </div>
                    <p className="text-sm text-primary font-bold mt-2 flex items-center gap-1.5">
                      <Zap className="h-4 w-4" /> $2.49/mo — save $30 a year
                    </p>
                  </div>
                  <ul className="space-y-2.5 flex-1 text-sm">
                    {[
                      "Everything in Monthly",
                      "Unlimited Waypoints",
                      "Crux AI Tutor",
                      "AI Grading & Feedback",
                      "Portfolio Analysis per Student",
                      "Mastery Analytics",
                      "Spend Caps & Controls",
                      "Priority Support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-foreground font-bold">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 text-base rounded-xl shadow-xl shadow-primary/20">
                      Claim Annual Plan <ArrowRight className="h-4 w-4 ml-2 inline" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Free vs Standard Comparison Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/50 overflow-hidden bg-card/20 backdrop-blur-sm"
              >
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-0 border-b border-border/50 bg-muted/10">
                  <div className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Feature
                  </div>
                  <div className="w-28 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground border-l border-border/30">
                    Free
                  </div>
                  <div className="w-32 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-primary border-l border-border/30 bg-primary/5">
                    Standard
                  </div>
                </div>

                {/* Rows */}
                {([
                  { label: "Teacher & Student Accounts", free: true, standard: true, category: "Core" },
                  { label: "Basic Course Management", free: true, standard: true },
                  { label: "Limited Network (1 Waypoint)", free: true, standard: true },
                  { label: "Crux AI Tutor", free: false, standard: true, category: "AI & Intelligence" },
                  { label: "AI Assignment Help & Feedback", free: false, standard: true },
                  { label: "AI-Assisted Grading", free: false, standard: true },
                  { label: "In-depth Portfolio Analysis per Student", free: false, standard: true },
                  { label: "Unlimited Waypoints", free: false, standard: true, category: "Network & Analytics" },
                  { label: "Mastery Analytics Dashboard", free: false, standard: true },
                  { label: "Hard Spend Caps & Budget Controls", free: false, standard: true },
                  { label: "Priority Support", free: false, standard: true, category: "Support" },
                ] as { label: string; free: boolean; standard: boolean; category?: string }[]).map((feat, i) => (
                  <div key={i}>
                    {feat.category && (
                      <div className="px-6 py-2 bg-muted/20 border-b border-border/30">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {feat.category}
                        </span>
                      </div>
                    )}
                    <div className={`grid grid-cols-[1fr_auto_auto] gap-0 border-b border-border/20 last:border-0 transition-colors ${i % 2 === 0 ? "bg-transparent" : "bg-muted/5"}`}>
                      <div className="px-6 py-3.5 text-sm font-medium text-foreground/80">{feat.label}</div>
                      <div className="w-28 px-4 py-3.5 flex items-center justify-center border-l border-border/30">
                        {feat.free
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                      </div>
                      <div className="w-32 px-4 py-3.5 flex items-center justify-center border-l border-border/30 bg-primary/[0.02]">
                        {feat.standard
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                      </div>
                    </div>
                  </div>
                ))}

                {/* CTA row */}
                <div className="grid grid-cols-[1fr_auto_auto] border-t border-border/40 bg-muted/10">
                  <div className="px-6 py-5" />
                  <div className="w-28 px-4 py-5 flex items-center justify-center border-l border-border/30">
                    <Link href="/signup">
                      <Button variant="outline" size="sm" className="cursor-pointer font-black text-xs rounded-xl px-4">Free</Button>
                    </Link>
                  </div>
                  <div className="w-32 px-4 py-5 flex items-center justify-center border-l border-border/30 bg-primary/[0.02]">
                    <Link href="/signup">
                      <Button size="sm" className="cursor-pointer font-black text-xs rounded-xl bg-primary text-primary-foreground px-4">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </section>


          {/* Zero Markup Deep-Dive */}
          <section className="container mx-auto px-6 pb-24">
            <motion.div
              className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-muted/20 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                  <Zap className="h-4 w-4" />
                  Zero Markup Pass-Through
                </div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">One Platform. Zero EdTech Bloat.</h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  Most platforms markup AI costs 500%. We charge a flat fee for the infrastructure and pass raw compute costs directly to you. Every dollar goes into student mastery, not platform margins.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Google Gemini-Flash Rates",
                    "FERPA & GDPR Infrastructure",
                    "Department-Wide Syncing",
                    "Priority Inference Tunnels",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-3xl bg-background/50 border border-border/50 text-center shadow-sm">
                  <p className="text-3xl font-black text-primary mb-1">$0.15</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1M Tokens Input</p>
                </div>
                <div className="p-8 rounded-3xl bg-background/50 border border-border/50 text-center shadow-sm">
                  <p className="text-3xl font-black text-primary mb-1">$0.60</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1M Tokens Output</p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Cost Comparison Chart */}
          <section className="container mx-auto px-6 pb-24">
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2 text-foreground italic">The scale difference.</h2>
                <p className="text-muted-foreground text-sm font-medium">See how Scorpio compares to per-seat EdTech pricing at real class sizes.</p>
              </div>
              <div className="bg-card/40 backdrop-blur-xl border border-border shadow-2xl rounded-[3rem] p-4 md:p-8">
                <CostComparisonChart />
              </div>
            </motion.div>
          </section>

          {/* What You Unlock strip */}
          <section className="container mx-auto px-6 pb-24">
            <motion.div
              className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6 rounded-2xl border border-border/50 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <h4 className="font-black text-sm">What You Unlock</h4>
                </div>
                {[
                  { title: "Always-on Crux AI", desc: "No throttling during finals, midterms, or late-night study sessions." },
                  { title: "Department Waypoints", desc: "One curriculum, synchronized instantly across every teacher in your network." },
                  { title: "Mastery Analytics", desc: "See exactly who's falling behind before it becomes a grade problem." },
                  { title: "Hard Spend Caps", desc: "Set monthly AI cost ceilings so you never get a surprise bill." },
                ].map((item, i) => (
                  <div key={i} className="space-y-0.5">
                    <h5 className="font-bold text-xs text-foreground">{item.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl border border-border/50 bg-zinc-100/50 dark:bg-zinc-900/50 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <h4 className="font-black text-sm">Zero Markup. Seriously.</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Most EdTech companies mark up API costs 300–500%. We charge you exactly what Google charges us — every dollar goes directly to your students' learning.
                </p>
                <div className="flex gap-6 pt-1">
                  <div>
                    <p className="text-2xl font-black font-mono tracking-tighter text-primary">$0.15</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-widest">1M Input</p>
                  </div>
                  <div className="w-px bg-border self-stretch" />
                  <div>
                    <p className="text-2xl font-black font-mono tracking-tighter text-primary">$0.60</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-widest">1M Output</p>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Google DeepMind Gemini 2.5 Flash rates</p>
              </div>

              <div className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl space-y-4 overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <h4 className="font-black text-foreground text-sm">Scaling Beyond One School?</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">District-wide deployment, custom SSO, dedicated infrastructure, and volume pricing for 10+ networks.</p>
                  <Link href="/contact">
                    <Button variant="outline" className="cursor-pointer w-full font-black uppercase tracking-widest text-[10px] py-5 rounded-xl mt-2">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FAQ */}
          <LandingFAQ />

          {/* CTA */}
          <section className="container mx-auto px-6 py-24">
            <motion.div
              className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Ready to get started?</h2>
                <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto leading-relaxed">No LMS integration required. Deploy in one afternoon.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="h-14 px-10 rounded-full text-lg font-black cursor-pointer">
                      Get Faculty Access <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg cursor-pointer font-black border-2 bg-background/50">
                      Request Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <div className="container mx-auto px-6 py-12">
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
                <Logo size={24} className="text-foreground" />
                <span className="text-md font-black tracking-tighter">Scorpio</span>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
                {[
                  { href: "https://github.com/RushilMahadevu/scorpio", icon: Github, label: "GitHub", external: true },
                  { href: "/about", icon: Info, label: "About" },
                  { href: "/research", icon: BookOpen, label: "Research" },
                  { href: "/request-access", icon: KeyRound, label: "Request Access" },
                  { href: "/privacy", icon: Shield, label: "Privacy" },
                  { href: "/terms", icon: FileText, label: "Terms" },
                  { href: "/contact", icon: Mail, label: "Contact" },
                ].map(({ href, icon: Icon, label, external }) => (
                  <Link key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Icon className="h-5 w-5" /><span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>
              <div className="text-center md:text-right space-y-2">
                <div className="text-sm text-muted-foreground font-medium">Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span></div>
                <div className="text-xs text-muted-foreground">{`© ${new Date().getFullYear()} Scorpio. All rights reserved.`}</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
