"use client";


import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Sparkles,
  Info, BookOpen, Mail, Shield, FileText,
  CheckCircle2, Zap, ShieldCheck, Globe, Lock, Building2, Users, KeyRound, Github
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useMotionValue, useTransform, animate, motion as m } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LandingFAQ } from "@/components/landing-faq";


const CostComparisonChart = dynamic(() => import("@/components/admin/cost-comparison-chart"), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse" />,
});

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <m.span>{rounded}</m.span>;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "enterprise">("yearly");

  return (
    <>
      <div className="min-h-screen relative font-medium">
        <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_10rem,black_calc(100%-10rem),transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        {/* Minimal Header */}
        <motion.header
          className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto w-full">
            <Link href="/">
              <Button variant="ghost" className="cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm h-9 px-3 rounded-full group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </Button>
            </Link>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hover:opacity-70 transition-opacity">
              <Logo size={18} className="text-foreground" />
              <span className="text-lg font-black tracking-tighter">Explore our Pricing</span>
            </Link>

            <ModeToggle />
          </div>
        </motion.header>

        <main className="relative z-10">

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
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* Left Column: Context */}
              <div className="lg:col-span-6 space-y-8">
                <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl group bg-muted/40 pb-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                  <Image
                    src="/plan.jpg"
                    alt="Platform Preview"
                    width={800}
                    height={600}
                    className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out border-b border-border"
                    loading="eager"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-background/95 backdrop-blur-md p-5 rounded-2xl border border-border shadow-lg">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">One Network. Infinite Seats.</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Every student and teacher included.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Zero Markup Guarantee", desc: "Pay exactly what Google charges for AI, roughly $0.08 per 250 students." },
                    { title: "Real-time Mastery Tracking", desc: "Pinpoint struggling concepts instantly across your entire cohort." },
                    { title: "Automated Workflows", desc: "Free up hours of grading and curriculum alignment every single week." },
                    { title: "Hard Spend Caps", desc: "Set definitive budget ceilings so you never encounter surprise billing." },
                  ].map((feature, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm hover:bg-muted/40 transition-colors shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-4" />
                      <h4 className="text-base font-bold mb-2 text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Billing Widget */}
              <div className="lg:col-span-6 sticky top-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 md:p-10 rounded-[2.5rem] border border-border bg-card shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 p-6 pointer-events-none opacity-[0.03] dark:opacity-10">
                    <ShieldCheck className="w-64 h-64 text-foreground" />
                  </div>

                  <h2 className="text-3xl font-extrabold mb-3 relative z-10 tracking-tight text-foreground">Global License</h2>
                  <p className="text-muted-foreground text-base mb-10 relative z-10">
                    Unlock the full power of Scorpio for your entire department.
                  </p>

                  {/* Billing Cycle Toggle */}
                  <div className="flex p-1.5 bg-muted rounded-3xl mb-10 relative z-10 overflow-x-auto">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={cn(
                        "cursor-pointer flex-1 text-sm font-semibold py-3 px-2 rounded-xl transition-all",
                        billingCycle === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={cn(
                        "cursor-pointer flex-1 text-sm font-semibold py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5",
                        billingCycle === "yearly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Annual <Badge variant="secondary" className="dark:bg-green-700 bg-green-500 text-white text-[10px]">Save 50%</Badge>
                    </button>
                    <button
                      onClick={() => setBillingCycle("enterprise")}
                      className={cn(
                        "cursor-pointer flex-1 text-sm font-semibold py-3 px-2 rounded-xl transition-all",
                        billingCycle === "enterprise" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Enterprise
                    </button>
                  </div>

                  {billingCycle === "enterprise" ? (
                    <div className="relative z-10 h-full flex flex-col pt-2 pb-6">
                      <div className="mb-8 text-center flex-1">
                        <h3 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 tracking-tight">Custom Scale</h3>
                        <p className="text-muted-foreground text-[15px] leading-relaxed mx-auto">
                          For deployments across multiple networks, we offer custom authentication integrations, dedicated infrastructure SLAs, and volume discounts.
                        </p>
                      </div>

                      <ul className="space-y-4 mb-10 bg-background/50 p-6 rounded-2xl border border-border/50">
                        {[
                          "Custom SSO Integrations",
                          "Dedicated Infrastructure",
                          "Volume Pricing Tiers",
                          "10+ Network Scale",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <Button asChild className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground mt-auto">
                        <a href="mailto:rushil@scorpioedu.org">
                          <div className="flex items-center justify-center gap-2">
                            <span>Contact Sales via Email</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-10 relative z-10">
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-7xl font-black tracking-tighter text-foreground">
                            $<AnimatedNumber value={billingCycle === "yearly" ? 2.49 : 4.99} />
                          </span>
                          <span className="text-muted-foreground font-medium pb-3 text-lg">/mo</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Billed {billingCycle === "yearly" ? "annually — Save 50% ($29.88/yr)" : "monthly"} as one subscription.
                        </p>
                      </div>

                      <ul className="space-y-4 mb-10 relative z-10">
                        {[
                          "Everything in Free",
                          "Unlimited Students & Courses",
                          "All Integrations with Crux AI",
                          "Teacher AI Dashboards",
                          "Network Waypoint Syncing",
                          "Comprehensive Control of Capacities & Limits",
                          "Cancel Anytime",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            <span className="text-base font-medium text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href="/signup">
                        <Button className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground relative z-10">
                          <div className="flex items-center gap-2">
                            <span>{billingCycle === "yearly" ? "Claim Annual Plan" : "Start Monthly Plan"}</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </Button>
                      </Link>

                      <p className="text-xs text-center text-muted-foreground/70 mt-8 relative z-10 leading-relaxed px-4">
                        Payments are secure and encrypted. Institutions can cancel subscription at any time.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
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
