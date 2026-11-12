"use client";

import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Check,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Building2,
  ShieldCheck,
  Cpu,
  Receipt,
  ExternalLink,
  Sliders,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Organization } from "@/lib/types";

export default function BillingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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
      const response = await authenticatedFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          organizationId: organization.id,
          planId: planId,
        }),
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading billing...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-xl bg-muted border border-border/60">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">No Department Network Found</h2>
        <p className="text-sm text-muted-foreground">
          You must be part of an authenticated Scorpio Network to view or manage department licensing.
        </p>
        <Button variant="outline" asChild size="sm">
          <Link href="/teacher/network">Return to Network</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.uid === organization.ownerId || (profile?.role as string) === "school_admin";
  const isFreePlan = !organization.planId || organization.planId === "free";
  const isYearlyActive = organization.planId?.includes("yearly");

  const budgetCapDollars = (organization.aiBudgetLimit || 0) / 100;
  const currentUsageDollars = (organization.aiUsageCurrent || 0) / 100;

  const handleCheckout = () => {
    handleUpgrade(billingCycle === "yearly" ? "standard_yearly" : "standard_monthly");
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/teacher/network"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Department Network
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Department Licensing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Flat department subscription with zero-markup AI pass-through.
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-3 bg-card border border-border/60 px-4 py-2 rounded-xl">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0",
                isFreePlan ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
            <div className="text-xs">
              <span className="text-muted-foreground">Current Plan: </span>
              <span className="font-semibold text-foreground">
                {isFreePlan ? "Free Starter" : "Department License"}
              </span>
              {!isFreePlan && (
                <span className="ml-1 text-muted-foreground">
                  ({isYearlyActive ? "Annual" : "Monthly"})
                </span>
              )}
            </div>
            {!isFreePlan && (
              <Button asChild variant="outline" size="sm" className="h-7 text-xs ml-1">
                <Link href="https://polar.sh/scorpio/portal" target="_blank" className="flex items-center gap-1">
                  Polar Portal <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Billing Cycle Toggle ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Plans & Pricing</h2>
          <p className="text-xs text-muted-foreground">
            Covers every physics instructor, section, and student in your school.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl border border-border/60 bg-muted/30">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly ($10/mo)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Annual ($100/yr)</span>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
              Save $20
            </span>
          </button>
        </div>
      </div>

      {/* ── Pricing Cards (Dominant Department License) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Free Starter Card (Compact - col-span-4) */}
        <Card className="lg:col-span-4 border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <Badge variant="outline" className="w-fit text-xs text-muted-foreground">
              Individual / Trial
            </Badge>
            <CardTitle className="text-lg font-bold mt-2">Free Starter</CardTitle>
            <CardDescription className="text-xs">
              Manual grading and course tools for individual teachers evaluating Scorpio.
            </CardDescription>
            <div className="pt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Free forever. No card required.</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <p className="font-semibold text-foreground text-xs">What&apos;s included:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>1 active Waypoint curriculum module</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>Unlimited courses and students</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>Manual review & LaTeX equation editor</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground/50">
                <span className="h-4 w-4 flex items-center justify-center shrink-0">—</span>
                <span>No AI tutor or automated grading</span>
              </li>
            </ul>
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="outline" disabled className="w-full h-9 text-xs font-medium cursor-default">
              {isFreePlan ? "Current Plan" : "Included"}
            </Button>
          </CardFooter>
        </Card>

        {/* Department License Card (Hero - Bigger & Dominant - col-span-8) */}
        <Card className="lg:col-span-8 border-primary/50 shadow-md bg-card flex flex-col justify-between relative ring-1 ring-primary/25 p-2 sm:p-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5">
                Department License
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">Entire School Department</span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold mt-2">Department License</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Complete physics LMS with Socratic AI tutoring, automated homework grading, and all Waypoints for your entire school.
            </CardDescription>

            <div className="pt-4 pb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                  {billingCycle === "yearly" ? "$100" : "$10"}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {billingCycle === "yearly" ? "/ year ($8.33/mo)" : "/ month"}
                </span>
              </div>
              <p className="text-xs font-semibold text-primary mt-1">
                Flat base fee + zero-markup metered AI compute
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-xs sm:text-sm">
            {/* Flat + Metered Summary Box */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2.5">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider">How Billing Works:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground shrink-0">• Flat Fee:</span>
                  <span>{billingCycle === "yearly" ? "$100/yr" : "$10/mo"} covers all teachers, courses, and students in your department. No per-seat fees.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground shrink-0">• At-Cost AI Metering:</span>
                  <span>Gemini 3.8 Flash passed through at exact Google cost ($0.75 / 1M in, $3.75 / 1M out). ~0.10/student/mo. Zero markup.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground shrink-0">• Spend Protection:</span>
                  <span>You set a hard monthly cap in Network Settings (e.g. $25). AI halts safely if reached—no surprise overages.</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/90 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Socratic AI tutor for all students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Instant automated homework and lab grading</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>All Waypoints physics curriculum modules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Hard department spend cap protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Unlimited teachers & course periods</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Itemized PDF receipts for school bookkeeping</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            {isFreePlan ? (
              <Button
                onClick={handleCheckout}
                disabled={upgrading || !isOwner}
                className="w-full h-13 sm:h-14 text-sm sm:text-base font-bold shadow-md cursor-pointer"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting to Polar Checkout...
                  </>
                ) : !isOwner ? (
                  "Only Network Owner Can Upgrade"
                ) : (
                  <>
                    Upgrade to Department License ({billingCycle === "yearly" ? "$100/yr" : "$10/mo"})
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button asChild className="flex-1 h-12 text-sm font-semibold" variant="outline">
                  <Link href="https://polar.sh/scorpio/portal" target="_blank" className="flex items-center justify-center gap-2">
                    <Receipt className="h-4 w-4" /> Polar Customer Portal
                  </Link>
                </Button>
                <Button asChild className="h-12 text-sm font-semibold" variant="secondary">
                  <Link href="/teacher/network" className="flex items-center justify-center gap-2">
                    <Sliders className="h-4 w-4" /> Adjust Spend Caps
                  </Link>
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

      </div>

      {/* ── Explanation: Flat Fee + Metering ── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">How Pricing Works</CardTitle>
          <CardDescription className="text-xs">
            A predictable flat license with raw pass-through AI compute.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span>1. Flat Department License</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {billingCycle === "yearly" ? "$100/year" : "$10/month"} covers your entire school. Unlimited teachers, unlimited course periods, and unlimited students. No per-seat license fees.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <span>2. At-Cost AI Metering</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AI requests use Gemini 3.8 Flash, billed at exact Google cost ($0.75 / 1M input, $3.75 / 1M output). Scorpio takes zero markup on AI compute.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>3. Guaranteed Spend Caps</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Set a monthly dollar cap in Network Settings. If reached, AI assistance halts safely until next month or until you raise it.
            </p>
          </div>
        </CardContent>

        {budgetCapDollars > 0 && (
          <CardFooter className="border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Department Spend Cap:</span>
              <span className="font-semibold text-foreground">${budgetCapDollars.toFixed(2)}/mo</span>
              <span>(Used this month: ${currentUsageDollars.toFixed(2)})</span>
            </div>
            <Link href="/teacher/network" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
              Adjust in Network Settings <ArrowRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
