"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  ArrowRight,
  Building2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { Organization } from "@/lib/types";
import CostComparisonChart from "@/components/admin/cost-comparison-chart";
import Image from "next/image";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function BillingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "enterprise">("yearly");

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
      if (!response.ok) throw new Error(data.message || data.error || "Failed to start checkout.");

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

  const isOwner = user?.uid === organization.ownerId || (profile?.role as string) === "school_admin";

  const handleCheckout = () => {
    handleUpgrade(billingCycle === "yearly" ? "standard_yearly" : "standard_monthly");
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative font-sans">

      {/* SaaS Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_10rem,black_calc(100%-10rem),transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 relative z-10">
        <Link href="/teacher/network" className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 font-medium">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Network
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-medium tracking-wide">
            <Sparkles className="h-3.5 w-3.5 mr-2 inline" /> Empower Your Entire Department
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            Enterprise-grade AI, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              without the markup.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Unlimited student access. Powerful analytics. Curriculum synchronization.
            Give your physics department the tools they need for <span className="font-semibold text-foreground">$4.99 a month total</span>.
          </p>
        </div>

        {/* Current License Strip */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                organization.planId === "free" ? "bg-muted" : "bg-primary/20"
              )}>
                <Building2 className={cn("h-6 w-6", organization.planId === "free" ? "text-muted-foreground" : "text-primary")} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Current Network License</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">
                    {organization.planId === "free" ? "Free Tier" : "Pro Plan Active"}
                  </h3>
                  {organization.planId !== "free" && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
                      {organization.planId.includes("yearly") ? "ANNUAL" : "MONTHLY"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {organization.planId === "free" ? (
              <div className="mt-4 sm:mt-0 text-sm text-red-500 font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" /> Limited Features
              </div>
            ) : (
              <Button variant="outline" asChild className="mt-4 sm:mt-0 border-border">
                <Link href="https://polar.sh/scorpio/portal" target="_blank">
                  Manage Billing Portal
                </Link>
              </Button>
            )}

          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">

          {/* Left Column: Context / Image */}
          <div className="lg:col-span-6 space-y-8">
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl group bg-muted/40 pb-0">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              {/* Using the plan.jpg image here */}
              <Image
                src="/plan.jpg"
                alt="Platform Preview"
                width={800}
                height={600}
                className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out border-b border-border"
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
                { title: "Hard Spend Caps", desc: "Set definitive budget ceilings so you never encounter surprise billing." }
              ].map((feature, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-4" />
                  <h4 className="text-base font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing Switcher / Form */}
          <div className="lg:col-span-6 sticky top-24">
            {organization.planId === "free" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-10 rounded-[2.5rem] border border-border bg-card shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 p-6 pointer-events-none opacity-[0.03] dark:opacity-10">
                  <ShieldCheck className="w-64 h-64 text-foreground" />
                </div>

                <h3 className="text-3xl font-extrabold mb-3 relative z-10 tracking-tight">Upgrade Network</h3>
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
                    Annual <Badge variant="secondary" className="dark:bg-green-700 bg-green-500 text-white">Save 50%</Badge>
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
                      <h4 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 tracking-tight">Custom Scale</h4>
                      <p className="text-muted-foreground text-[15px] leading-relaxed mx-auto">
                        For deployments across multiple networks, we offer custom authentication integrations, dedicated infrastructure SLAs, and volume discounts.
                      </p>
                    </div>

                    <ul className="space-y-4 mb-10 bg-background/50 p-6 rounded-2xl border border-border/50 hidden sm:block">
                      {[
                        "Custom SSO Integrations",
                        "Dedicated Infrastructure",
                        "Volume Pricing Tiers",
                        "10+ Network Scale"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground mt-auto"
                    >
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
                        <span className="text-7xl font-black tracking-tighter hover:text-foreground/90 hover:scale-102 transition-all duration-300">
                          $<AnimatedNumber value={billingCycle === "yearly" ? 2.49 : 4.99} />
                        </span>
                        <span className="text-muted-foreground font-medium pb-3 text-lg">/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium"> Billed {billingCycle === "yearly" ? "annually - Save 50% ($29.88)" : "monthly"} as one subscription.</p>
                    </div>

                    <ul className="space-y-4 mb-10 relative z-10">
                      {[
                        "Everything in Free",
                        "Unlimited Students & Courses",
                        "All Integrations with Crux AI",
                        "Teacher AI Dashboards",
                        "Network Waypoint Syncing",
                        "Comprehensive Control of Capacities & Limits",
                        "Cancel Anytime"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-base font-medium text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={handleCheckout}
                      disabled={upgrading || !isOwner}
                      className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground relative z-10"
                    >
                      {upgrading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Preparing Checkout...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{billingCycle === "yearly" ? "Claim Annual Plan" : "Start Monthly Plan"}</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>

                    {!isOwner && (
                      <p className="text-sm text-center text-muted-foreground mt-5 font-medium flex items-center justify-center gap-2 relative z-10">
                        <Lock className="h-4 w-4" /> Only network owners can edit billing
                      </p>
                    )}

                    <p className="text-xs text-center text-muted-foreground/70 mt-8 relative z-10 leading-relaxed px-4">
                      Payments are secure and encrypted. You can cancel your subscription at any time via the billing portal.
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="p-10 rounded-[2.5rem] border border-border bg-card shadow-xl relative overflow-hidden flex flex-col items-center text-center justify-center h-full min-h-[500px]">
                <div className="h-32 w-32 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8">
                  <ShieldCheck className="h-16 w-16 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Subscription Active</h3>
                <p className="text-muted-foreground mb-10 text-lg">
                  Your network is fully unlocked. All premium features, analytics, and scaling tools are available to your department.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full text-left mb-10">
                  <div className="p-5 bg-muted/50 rounded-2xl border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Seats</p>
                    <p className="font-black text-2xl">Unlimited</p>
                  </div>
                  <div className="p-5 bg-muted/50 rounded-2xl border border-border/50">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">AI Markup</p>
                    <p className="font-black text-2xl">0%</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-border hover:bg-muted text-base font-bold shadow-sm" asChild>
                  <Link href="https://polar.sh/scorpio/portal" target="_blank">
                    Open Billing Dashboard
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>



      {/* Cost Comparison Chart */}
      <div className="max-w-6xl mx-auto px-6 mt-24 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">See the Difference</h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Our pricing model is fundamentally different from traditional EdTech. Stop paying per-seat premiums for fundamental learning tools.
          </p>
        </div>
        <div className="bg-card border border-border shadow-2xl rounded-[3rem] p-4 md:p-8">
          <CostComparisonChart />
        </div>
      </div>
    </div>
  );
}
