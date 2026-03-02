"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Globe,
  Lock,
  ArrowRight,
  Calculator,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Organization } from "@/lib/types";
import CostComparisonChart from "@/components/admin/cost-comparison-chart";

export default function BillingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user && profile?.organizationId) {
      fetchOrg();
    } else {
      setLoading(false);
    }
  }, [user, profile, authLoading]);

  async function fetchOrg() {
    try {
      const orgRef = doc(db, "organizations", profile!.organizationId!);
      const orgSnap = await getDoc(orgRef);
      if (orgSnap.exists()) {
        setOrganization({ id: orgSnap.id, ...orgSnap.data() } as Organization);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load billing info.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user || !organization) return;
    
    setUpgrading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          organizationId: organization.id,
          planId: planId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to start checkout.");
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to start upgrade process.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Billing Records...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Network Found</h2>
        <p className="text-muted-foreground mb-6">You need to be part of a network to manage billing.</p>
        <Link href="/teacher/network">
          <Button variant="outline">Return to Network</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.uid === organization.ownerId;

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative">
      {/* Space Aesthetic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-12 relative z-10">
        <Link href="/teacher/network" className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 uppercase tracking-widest font-black">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Network
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.25em]">
              <Sparkles className="h-3 w-3" /> Unlock Your Department's Full Potential
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight text-foreground">
              AI-powered physics<br />
              <span className="text-primary italic">for less than a textbook.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              One flat subscription. Unlimited students. Zero markup on AI. 
              While competitors charge <span className="text-foreground font-bold">$5–$12 per student per month</span>, 
              Scorpio charges <span className="text-emerald-500 font-bold">$4.99 total</span>.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No per-student fees
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cancel anytime
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Zero AI markup
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/50 bg-muted/10 backdrop-blur-sm shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current License</p>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-3 w-3 rounded-full shrink-0",
                organization.planId === "free" ? "bg-muted-foreground/30" : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"
              )} />
              <p className="text-2xl font-black">
                {organization.planId === "free" ? "Free Tier" : "Standard Plan"}
              </p>
              {organization.planId !== "free" && (
                <Badge variant="outline" className="text-[10px] font-mono py-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                  {organization.planId.includes("yearly") ? "ANNUAL" : "MONTHLY"}
                </Badge>
              )}
            </div>
            {organization.planId === "free" && (
              <p className="text-xs text-muted-foreground">Upgrade below to unlock all features →</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 1: Plans ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        {organization.planId === "free" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Monthly */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-8 border border-border bg-card rounded-2xl flex flex-col gap-6 hover:border-primary/40 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-border/50 px-2.5 py-0.5 mb-4">Monthly</Badge>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">$4.99</span>
                  <span className="text-muted-foreground text-base font-medium">/mo</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Flexible access, cancel anytime.</p>
              </div>
              <ul className="space-y-3">
                {["Teacher AI Dashboard", "Network Waypoints", "Real-time Mastery Views", "Priority Support"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button
                className="cursor-pointer w-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 font-black py-6 text-base rounded-xl shadow-md"
                onClick={() => handleUpgrade("standard_monthly")}
                disabled={upgrading || !isOwner}
              >
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Start Monthly <ArrowRight className="h-4 w-4 ml-2 opacity-50 inline" /></>}
              </Button>
              {!isOwner && <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest italic">Only owners can manage billing</p>}
            </motion.div>

            {/* Yearly */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative p-8 border-2 border-primary bg-primary/[0.02] rounded-2xl flex flex-col gap-6 overflow-hidden transition-all hover:scale-[1.01] duration-300 shadow-lg shadow-primary/5"
            >
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-4 py-1.5 font-black uppercase tracking-widest rounded-bl-xl">
                Best Value
              </div>
              <div>
                <Badge className="bg-primary hover:bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest border-none px-2.5 py-0.5 mb-4">Yearly</Badge>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">$29.88</span>
                  <span className="text-muted-foreground text-base font-medium">/yr</span>
                </div>
                <p className="text-sm text-primary font-bold mt-2 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> $2.49/mo — save $30 a year
                </p>
              </div>
              <ul className="space-y-3">
                {["Everything in Monthly", "Priority AI Processing", "Extended Usage History", "Dept-wide Discount"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button
                className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 text-base rounded-xl shadow-xl shadow-primary/20"
                onClick={() => handleUpgrade("standard_yearly")}
                disabled={upgrading || !isOwner}
              >
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Claim Annual Plan <ArrowRight className="h-4 w-4 ml-2 inline" /></>}
              </Button>
              {!isOwner && <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest italic">Only owners can manage billing</p>}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-black tracking-tight">Subscription Active</h4>
                <p className="text-muted-foreground text-sm mt-0.5">All network features are unlocked for your department.</p>
              </div>
              <Link href="https://polar.sh/scorpio/portal" target="_blank" className="w-full sm:w-auto shrink-0">
                <Button className="w-full sm:w-auto px-6 py-5 rounded-xl bg-zinc-900 text-white hover:bg-black font-bold shadow-lg text-sm">
                  Polar Portal
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5">
                <h5 className="font-black text-xs uppercase tracking-widest opacity-40">Invoice History</h5>
                <p className="text-sm text-muted-foreground">Available in the Polar portal.</p>
              </div>
              <div className="p-5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5">
                <h5 className="font-black text-xs uppercase tracking-widest opacity-40">License Seats</h5>
                <p className="text-sm text-muted-foreground">Covers all current and future network members.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Social proof bar ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-border/40 bg-muted/10">
          {[
            { value: "98%",    label: "cheaper than industry average at scale" },
            { value: "$0.08",  label: "effective per-student cost at 250 students" },
            { value: "∞",      label: "students on one flat subscription" },
            { value: "0×",     label: "markup on Google DeepMind AI costs" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</span>
              <span className="text-xs text-muted-foreground max-w-[140px] leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Info strip ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Why Upgrade */}
          <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <h4 className="font-black text-sm">What You Unlock</h4>
            </div>
            {[
              { title: "Always-on AI Tutor",   desc: "No throttling during finals, midterms, or late-night study sessions." },
              { title: "Department Waypoints", desc: "One curriculum, synchronized instantly across every teacher in your network." },
              { title: "Mastery Analytics",    desc: "See exactly who's falling behind before it becomes a grade problem." },
              { title: "Hard Spend Caps",      desc: "Set monthly AI cost ceilings so you never get a surprise bill." },
            ].map((item, i) => (
              <div key={i} className="space-y-0.5">
                <h5 className="font-bold text-xs text-foreground">{item.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Zero Markup */}
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

          {/* Enterprise */}
          <div className="p-6 bg-zinc-900 rounded-2xl text-white space-y-4 overflow-hidden relative group">
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                <h4 className="font-black text-sm">Scaling Beyond One School?</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">District-wide deployment, custom SSO, dedicated infrastructure, and volume pricing for 10+ networks.</p>
              <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl">
                Talk to Education Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Cost Comparison ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pb-20">
        <CostComparisonChart />
      </div>
    </div>
  );
}
