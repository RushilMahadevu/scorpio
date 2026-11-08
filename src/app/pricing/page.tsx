"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { LandingFAQ } from "@/components/landing-faq";
import {
  Check,
  Minus,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  Sparkles,
  Github,
  Info,
  BookOpen,
  Leaf,
  KeyRound,
  FileText,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen relative font-medium scroll-smooth bg-background text-foreground">
      {/* Subtle atmospheric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/[0.07] rounded-full blur-[140px]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 pt-28 md:pt-36 pb-24">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span>Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Simple, flat pricing for <br className="hidden sm:inline" />
            <span className="text-primary italic">physics classrooms.</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            No per-student fees. No markup on AI compute. One flat subscription covers your entire classroom network.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-full border border-border bg-card/50 backdrop-blur-md shadow-sm">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer",
                  !isAnnual ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {!isAnnual && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/60"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Monthly billing</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5",
                  isAnnual ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isAnnual && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/60"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Annual billing</span>
                <span className="relative z-10 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Save 50%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 3 Core Pricing Cards ────────────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 max-w-6xl pt-14 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* 1. Starter */}
            <div className="p-7 sm:p-8 rounded-3xl border border-border/70 bg-card/30 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Starter</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Essential classroom tools for individual instructors evaluating Scorpio.
                  </p>
                </div>

                <div className="pt-2 pb-1 border-y border-border/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">$0</span>
                    <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Free forever. No card required.</p>
                </div>

                <ul className="space-y-3 text-xs sm:text-[13px]">
                  {[
                    "Teacher & student accounts",
                    "Course & roster management",
                    "1 active Waypoint curriculum module",
                    "LaTeX equation builder",
                    "Standard coursework submissions",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-foreground/80">
                      <Check className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full py-5 rounded-2xl font-semibold">
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>

            {/* 2. Classroom Pro (Featured) */}
            <div className="p-7 sm:p-8 rounded-3xl border-2 border-primary bg-gradient-to-b from-primary/[0.06] via-card/50 to-background backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-3.5 py-1 font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                Most Popular
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Classroom Pro</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Full Socratic AI scaffolding and analytics for your entire student cohort.
                  </p>
                </div>

                <div className="pt-2 pb-1 border-y border-primary/20">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                      {isAnnual ? "$2.49" : "$4.99"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-[11px] text-primary font-medium mt-1">
                    {isAnnual ? "Billed annually ($29.88/year) — covers all students" : "Billed monthly — cancel anytime"}
                  </p>
                </div>

                <ul className="space-y-3 text-xs sm:text-[13px]">
                  {[
                    "Everything in Starter",
                    "Unlimited student enrollments (no per-seat fees)",
                    "Unlimited physics Waypoints",
                    "Raise Socratic AI assistant for all students",
                    "AI-assisted grading & rubric synthesis",
                    "Student derivation tracking & portfolios",
                    "Hard monthly spend caps & controls",
                    "Direct raw compute pass-through ($0.15/1M tokens)",
                    "Priority faculty support",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-foreground font-medium">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild className="w-full py-5 rounded-2xl font-bold shadow-lg shadow-primary/20">
                <Link href="/signup" className="flex items-center justify-center gap-1.5">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* 3. Department / Institution */}
            <div className="p-7 sm:p-8 rounded-3xl border border-border/70 bg-card/30 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Department</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    For high school departments, universities, and multi-campus districts.
                  </p>
                </div>

                <div className="pt-2 pb-1 border-y border-border/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">Custom</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Site licensing & invoice billing.</p>
                </div>

                <ul className="space-y-3 text-xs sm:text-[13px]">
                  {[
                    "Everything in Classroom Pro",
                    "Canvas, Blackboard & Schoology LTI integration",
                    "Centralized multi-teacher administration",
                    "FERPA & COPPA compliance agreements",
                    "Custom school procurement (PO / Invoice / ACH)",
                    "Dedicated instructor onboarding & SLA",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-foreground/80">
                      <Check className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full py-5 rounded-2xl font-semibold">
                <Link href="/request-access">Request Institution License</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Why Flat Pricing Matters (Minimal 3-Pillar Breakdown) ───────── */}
        <section className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The Economics of Fair EdTech</h2>
            <p className="text-sm text-muted-foreground">How Scorpio is structured to protect departmental budgets.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Zero Per-Seat Penalties</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional tools charge $4–$12 per student per month. Scorpio never charges per seat—your flat fee covers 25 or 250 students equally.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Direct Compute Pass-Through</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raw Google DeepMind Gemini rates ($0.15 / 1M input tokens). We pass API costs through with zero middleman markup.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Hard Budget Caps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set monthly compute limits directly in your portal settings. You will never receive an unexpected billing overage.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table (Clean & Minimal) ──────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 max-w-5xl py-16">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Plan Comparison</h2>
            <p className="text-sm text-muted-foreground">Full breakdown of capabilities across all tiers.</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/20 backdrop-blur-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_100px_100px] sm:grid-cols-[1fr_120px_140px_140px] px-5 py-3.5 bg-muted/30 border-b border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div>Feature</div>
              <div className="text-center">Starter</div>
              <div className="text-center text-primary">Pro</div>
              <div className="text-center">Department</div>
            </div>

            {/* Rows */}
            {[
              { category: "Core Platform" },
              { name: "Student & Instructor Accounts", starter: true, pro: true, dept: true },
              { name: "Assignment Builder with LaTeX", starter: true, pro: true, dept: true },
              { name: "Student Derivation Portfolios", starter: false, pro: true, dept: true },
              { name: "Waypoints Curriculum Network", starter: "1 Module", pro: "Unlimited", dept: "Unlimited" },
              { category: "Socratic AI & Grading" },
              { name: "Raise 4-Layer Socratic Assistant", starter: false, pro: true, dept: true },
              { name: "Anti-Solver Derivation Enforcement", starter: false, pro: true, dept: true },
              { name: "AI-Assisted Grading & Rubrics", starter: false, pro: true, dept: true },
              { name: "Classroom Mastery Analytics", starter: false, pro: true, dept: true },
              { category: "Governance & Infrastructure" },
              { name: "Hard Monthly Spend Caps", starter: false, pro: true, dept: true },
              { name: "Google Gemini Compute at Raw Rates", starter: false, pro: true, dept: true },
              { name: "Canvas / Blackboard / Schoology LTI", starter: false, pro: false, dept: true },
              { name: "Central District Administration", starter: false, pro: false, dept: true },
              { name: "FERPA / COPPA Data Agreements", starter: false, pro: false, dept: true },
              { name: "Invoice & PO Payment Options", starter: false, pro: false, dept: true },
            ].map((row, i) => {
              if (row.category) {
                return (
                  <div
                    key={row.category}
                    className="px-5 py-2.5 bg-muted/15 border-b border-border/30 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
                  >
                    {row.category}
                  </div>
                );
              }

              const renderValue = (val: boolean | string | undefined) => {
                if (typeof val === "string") return <span className="font-semibold text-xs text-foreground">{val}</span>;
                if (val) return <Check className="h-4 w-4 text-emerald-500 mx-auto" />;
                return <Minus className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />;
              };

              return (
                <div
                  key={row.name}
                  className={`grid grid-cols-[1fr_80px_100px_100px] sm:grid-cols-[1fr_120px_140px_140px] px-5 py-3 border-b border-border/20 last:border-0 items-center text-xs sm:text-sm ${
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                  }`}
                >
                  <div className="font-medium text-foreground/90 pr-2">{row.name}</div>
                  <div className="text-center">{renderValue(row.starter)}</div>
                  <div className="text-center bg-primary/[0.02] py-1">{renderValue(row.pro)}</div>
                  <div className="text-center">{renderValue(row.dept)}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <LandingFAQ />

        {/* ── Direct Minimal Bottom CTA ───────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl py-16">
          <div className="p-8 sm:p-12 rounded-3xl border border-border/70 bg-card/30 backdrop-blur-xl text-center space-y-6 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to setup your physics classroom?</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Create your account in under a minute. No credit card required to start free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7 font-semibold">
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 font-semibold">
                <Link href="/request-access">Request Institutional Access</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Standard Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
              <Logo size={24} className="text-foreground" />
              <span className="text-md font-extrabold">Scorpio</span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
              <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Github className="h-5 w-5" />
                <span className="text-sm font-medium">GitHub</span>
              </Link>
              <Link href="/about" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Info className="h-5 w-5" />
                <span className="text-sm font-medium">About</span>
              </Link>
              <Link href="/research" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Research</span>
              </Link>
              <Link href="/sustainability" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">Sustainability</span>
              </Link>
              <Link href="/privacy" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Privacy</span>
              </Link>
              <Link href="/terms" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Terms</span>
              </Link>
              <Link href="/request-access" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <KeyRound className="h-5 w-5" />
                <span className="text-sm font-medium">Request Access</span>
              </Link>
              <Link href="/contact" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Contact</span>
              </Link>
            </div>

            <div className="text-center md:text-right space-y-2">
              <div className="text-sm text-muted-foreground font-medium">
                Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span>
              </div>
              <div className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Scorpio. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
