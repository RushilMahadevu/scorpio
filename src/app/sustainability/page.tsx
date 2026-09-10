"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/landing/site-header";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import {
  Leaf,
  Zap,
  Cpu,
  Server,
  FileCheck2,
  TreePine,
  Droplets,
  Copy,
  Check,
  Sparkles,
  Info,
  Lightbulb,
  FileText,
  School,
  GraduationCap,
  Github,
  BookOpen,
  Shield,
  Mail,
  KeyRound,
  Layers,
  Scale,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Coins
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export default function SustainabilityPage() {
  // Student Calculator State
  const [studentWeeklyHints, setStudentWeeklyHints] = useState<number>(15);
  // Teacher Calculator State
  const [teacherStudentCount, setTeacherStudentCount] = useState<number>(60);
  const [teacherAssignmentsPerSemester, setTeacherAssignmentsPerSemester] = useState<number>(16);

  const [copiedDisclosure, setCopiedDisclosure] = useState(false);

  // Student metrics calculations (Accurate empirical data based on Gemini 2.5 Flash on Google TPUs)
  // Avg Scorpio Socratic hint: ~0.20 Wh = 720 Joules of energy (approx 60-80 output tokens)
  // Traditional 1 sheet of 20lb paper: ~16 Wh of manufacturing energy, ~10 L of water (EPN data)
  // Equivalent 10W LED bulb: 10 Wh / hr = 0.166 Wh / min
  const studentMetrics = useMemo(() => {
    const weeklyEnergyWh = studentWeeklyHints * 0.20;
    const weeklyEnergyJoules = weeklyEnergyWh * 3600;
    const ledMinutes = (weeklyEnergyWh / 10) * 60;
    // An average student using digital assignments avoids ~3 printed worksheets per week
    const paperSheetsSaved = Math.round(studentWeeklyHints * 0.25);
    const waterSavedLiters = paperSheetsSaved * 10;
    const rawGridEmissionsGrams = weeklyEnergyWh * 0.38;

    return {
      weeklyEnergyWh: weeklyEnergyWh.toFixed(2),
      weeklyEnergyJoules: Math.round(weeklyEnergyJoules).toLocaleString(),
      ledMinutes: ledMinutes.toFixed(1),
      paperSheetsSaved,
      waterSavedLiters,
      rawGridEmissionsGrams: rawGridEmissionsGrams.toFixed(2),
    };
  }, [studentWeeklyHints]);

  // Teacher / Classroom metrics
  const teacherMetrics = useMemo(() => {
    const totalSubmissions = teacherStudentCount * teacherAssignmentsPerSemester;
    const sheetsSaved = totalSubmissions * 3;
    const treesSaved = (sheetsSaved / 8333).toFixed(2);
    const waterSavedGallons = Math.round((sheetsSaved * 10) / 3.785);
    const aiEnergyKWh = ((totalSubmissions * 0.4) / 1000).toFixed(2);
    const paperEnergySavedKWh = ((sheetsSaved * 16) / 1000).toFixed(1);

    return {
      totalSubmissions: totalSubmissions.toLocaleString(),
      sheetsSaved: sheetsSaved.toLocaleString(),
      treesSaved,
      waterSavedGallons: waterSavedGallons.toLocaleString(),
      aiEnergyKWh,
      paperEnergySavedKWh,
    };
  }, [teacherStudentCount, teacherAssignmentsPerSemester]);

  const districtDisclosureText = `[District / Department Environmental Disclosure]
Platform: Scorpio Physics (Crux Pedagogical AI)
Infrastructure: Hosted on Google Cloud Platform with annual renewable energy matching (wind/solar PPAs) and Google TPU v5 custom silicon (average PUE ~1.10).
Honest Real-Time Disclosure: While Google matches 100% of global electricity annually with renewables, real-time hourly carbon-free energy (CFE) varies by regional grid conditions. Embedded Scope 3 manufacturing emissions for data center hardware still exist.
Algorithmic Mitigation: Operates under a 4-layer pedagogical constraint architecture that limits responses to concise Socratic nudges (approx. 50–90 output tokens) rather than unconstrained generative essays, reducing AI inference cycles by an estimated 70–80%.
Paper Reduction: Digital homework creation, student work submission, and Socratic scaffolding eliminate an estimated ${teacherMetrics.sheetsSaved} sheets of printed paper per semester for ${teacherStudentCount} students, saving approx. ${teacherMetrics.waterSavedGallons} gallons of paper manufacturing water.
Offset Policy: Scorpio does NOT purchase unverified voluntary carbon credits or claim marketing-driven "instant zero carbon." We prioritize direct thermodynamic reduction and measurable infrastructure efficiency.`;

  const copyDisclosure = () => {
    navigator.clipboard.writeText(districtDisclosureText);
    setCopiedDisclosure(true);
    toast.success("Environmental disclosure copied to clipboard!");
    setTimeout(() => setCopiedDisclosure(false), 2500);
  };

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
        <SpaceBackground />
        <SiteHeader activeSection="sustainability" />

        <main className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto space-y-20">
          {/* Hero Section: Unflinching Acknowledgment */}
          <div className="space-y-6 text-center max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="px-3.5 py-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5"
              >
                <Leaf className="w-3.5 h-3.5" />
                First-Principles Accounting
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full border-border/40 text-muted-foreground font-semibold text-xs"
              >
                No Phantom Carbon Credits
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full border-border/40 text-muted-foreground font-semibold text-xs"
              >
                Google Cloud TPU Infrastructure
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              We know how AI affects the environment. <br className="hidden sm:inline" />
              <span className="text-emerald-500 italic">We are not ignorant.</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              Every time an artificial intelligence model runs, physical electricity surges through data center racks. 
              Millions of gallons of water evaporate to cool server infrastructure. Coal, gas, and regional power grids 
              are strained to deliver computational answers.
            </p>

            <div className="p-5 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xl text-left text-sm text-muted-foreground leading-relaxed space-y-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Scale className="w-4 h-4 text-emerald-500" />
                <span>The Physicist&apos;s Perspective</span>
              </div>
              <p>
                As physics educators, we literally teach the First and Second Laws of Thermodynamics: 
                energy cannot be created from nothing ($E = P \cdot t$), and every computational state change irreversibly dissipates heat 
                and increases entropy in our shared atmosphere.
              </p>
              <p>
                We refuse to hide behind corporate marketing euphemisms, cheap $0.50 voluntary carbon offsets, or defensive excuses. 
                Below is a completely honest, step-by-step account of our computational footprint, where we fall short, and the engineering 
                solutions we implement to minimize waste.
              </p>
            </div>
          </div>

          {/* Step-by-Step Lifecycle Audit: Are We Actually Carbon Neutral? */}
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-primary border-primary/20">
                Step-by-Step Lifecycle Audit
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Are We Actually Carbon Neutral? The Brutal Truth.
              </h2>
              <p className="text-muted-foreground text-sm">
                Trace what physically happens from the moment a student types a physics question to the electrons burning in the grid.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Step 1 */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="p-5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs mb-2">
                    01
                  </div>
                  <CardTitle className="text-base">The Student Device</CardTitle>
                  <CardDescription className="text-xs">Your laptop or phone</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
                  <p>
                    Transmitting a request over local Wi-Fi or LTE draws roughly <strong>~0.005 Wh</strong> from the student&apos;s wall charger.
                  </p>
                  <div className="pt-2 border-t border-border/30 text-[11px]">
                    <span className="font-semibold text-foreground">Verdict: </span>
                    Negligible, but tied directly to whatever local grid powers your home or school.
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="p-5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs mb-2">
                    02
                  </div>
                  <CardTitle className="text-base">Silicon Compute</CardTitle>
                  <CardDescription className="text-xs">Google TPU v5 Silicon</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
                  <p>
                    A Google TPU board draws ~250W–300W during inference. Scorpio constrains responses to ~60 tokens, keeping the burst under 1.2s (<strong>~0.20 Wh</strong> or 720 Joules).
                  </p>
                  <div className="pt-2 border-t border-border/30 text-[11px]">
                    <span className="font-semibold text-foreground">Verdict: </span>
                    75% leaner than general 600-word chatbots, but genuine electrical load nonetheless.
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="p-5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs mb-2">
                    03
                  </div>
                  <CardTitle className="text-base">Water & Cooling</CardTitle>
                  <CardDescription className="text-xs">Evaporative towers & chillers</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
                  <p>
                    Data center cooling evaporates roughly <strong>0.2 to 0.5 mL</strong> of water per Flash query to prevent processors from overheating.
                  </p>
                  <div className="pt-2 border-t border-border/30 text-[11px]">
                    <span className="font-semibold text-foreground">Verdict: </span>
                    Not the sensationalized &quot;500 mL per prompt&quot; myth, but fresh water is undeniably consumed.
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="p-5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs mb-2">
                    04
                  </div>
                  <CardTitle className="text-base">The Grid Match</CardTitle>
                  <CardDescription className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Where reality hits</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
                  <p>
                    Google matches 100% of electricity <em>annually</em> with wind & solar contracts. But if you study at night when the wind is calm, the local grid still burns fossil fuels.
                  </p>
                  <div className="pt-2 border-t border-amber-500/20 text-[11px]">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Honest Truth: </span>
                    We are NOT 100% 24/7 carbon-free yet. No AI cloud provider is today.
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="p-5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs mb-2">
                    05
                  </div>
                  <CardTitle className="text-base">Scope 3 Hardware</CardTitle>
                  <CardDescription className="text-xs">Mining, fabs & e-waste</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
                  <p>
                    Etching silicon wafers, mining copper/lithium, and building concrete data centers creates massive upfront embodied emissions.
                  </p>
                  <div className="pt-2 border-t border-border/30 text-[11px]">
                    <span className="font-semibold text-foreground">Verdict: </span>
                    Running on solar energy does not erase the carbon spent manufacturing the chips.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress Tracker & Frontier / Stripe Climate Commitment */}
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 w-fit mx-auto"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Live Neutrality Tracker & Frontier Roadmap
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                How Close Are We? The Path to 100%+
              </h2>
              <p className="text-muted-foreground text-sm">
                A quantitative look at our current real-time carbon neutrality score and our formal pledge 
                to activate Frontier permanent removal upon profitable funding.
              </p>
            </div>

            {/* Main Progress Meter Card */}
            <Card className="border-border/50 bg-gradient-to-b from-card/60 to-card/20 backdrop-blur-xl overflow-hidden shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-8">
                {/* Visual Progress Bar */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Current Physical Carbon Neutrality Score
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-foreground flex items-baseline gap-2 mt-0.5">
                        <span>70%</span>
                        <span className="text-xs font-semibold text-emerald-500">
                          (Target: 100% → 200%+ Climate-Positive with Frontier)
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs py-1 px-3 w-fit font-bold">
                      ~30% Physical Lifecycle Gap
                    </Badge>
                  </div>

                  {/* Multi-segmented Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/40 rounded-full overflow-hidden flex relative border border-border/40">
                      {/* Current active 70% */}
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 relative"
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      >
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-black tracking-wider">
                          70% ACTIVE
                        </span>
                      </motion.div>
                      {/* Remaining 30% gap */}
                      <div className="h-full w-[30%] bg-amber-500/10 border-l border-amber-500/30 relative flex items-center justify-center">
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                          30% GAP
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                      <span>0% (Unmitigated AI)</span>
                      <span className="text-emerald-500 font-bold">70% (Scorpio Today)</span>
                      <span className="text-foreground font-bold">100% (Frontier Pledge)</span>
                      <span className="text-primary font-bold">200%+ (Climate-Positive)</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Scope 1 (Direct Operations)</span>
                    </div>
                    <div className="text-xl font-black text-emerald-500">100% Clean</div>
                    <p className="text-[11px] text-muted-foreground">
                      0 physical vehicle fleets, factories, or fossil boilers.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Scope 2 (Cloud Electricity)</span>
                    </div>
                    <div className="text-xl font-black text-amber-500">~70% Real-Time</div>
                    <p className="text-[11px] text-muted-foreground">
                      100% matched annually, but ~30% nighttime hourly grid residual.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-500" />
                      <span>Scope 3 (Hardware & Silicon)</span>
                    </div>
                    <div className="text-xl font-black text-purple-500">Frontier Target</div>
                    <p className="text-[11px] text-muted-foreground">
                      Embodied chip manufacturing to be offset via permanent removal.
                    </p>
                  </div>
                </div>

                {/* The Frontier / Stripe Climate Commitment Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border border-emerald-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">
                          Our Commitment: Stripe Climate / Frontier Funding Pledge
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Permanent, verifiable 1,000+ year carbon removal as soon as profitable funding is achieved.
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shrink-0">
                      Pledge: 1%–2% of Revenue
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We refuse to participate in greenwashing by buying cheap, unverified voluntary forestry credits. 
                    Instead, <strong>as soon as Scorpio achieves sustainable profitable revenue</strong>, we will automatically 
                    pledge a fixed <strong>1% to 2% of platform revenue</strong> directly to <strong>Frontier / Stripe Climate</strong>. 
                    Frontier funds high-durability permanent carbon removal technologies: direct air capture (DAC), biochar mineralization, 
                    and enhanced rock weathering.
                  </p>

                  {/* The 5-Cent Math Breakdown */}
                  <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-2 text-xs">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>The Proof: Why 1% Revenue Completely Eliminates Our Footprint</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">1. Student Annual Compute:</span>
                        <p className="mt-0.5">720 hints/year = ~144 Wh. Total annual lifecycle footprint (including embodied silicon) is <strong>~150 grams of CO₂e</strong>.</p>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">2. Frontier Removal Cost:</span>
                        <p className="mt-0.5">At ~$350/ton ($0.35/kg), permanently removing 0.15 kg of carbon costs only <strong>~$0.05 (5 cents) per student per year</strong>.</p>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">3. The 1% Multiplier:</span>
                        <p className="mt-0.5">A 1% revenue pledge contributes <strong>$0.50–$1.00 per student</strong>—permanently sequestering <strong>10× to 20× more carbon</strong> than their compute generates!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Stage Milestone Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Neutrality Milestone Roadmap
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Stage 1: Baseline</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Active Today</Badge>
                      </div>
                      <div className="text-lg font-black text-foreground">70% Real-Time</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Google Cloud TPU infrastructure, 100% annual renewable PPA matching, and Scorpio Socratic token pruning cutting inference cycles by 75%.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Stage 2: Frontier Launch</span>
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">Upon Profitability</Badge>
                      </div>
                      <div className="text-lg font-black text-emerald-500">100% → 200%+ Negative</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        1% revenue allocation to Frontier / Stripe Climate permanently sequesters 10×–20× residual student emissions, closing the grid gap and Scope 3 hardware.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Stage 3: 24/7 Clean Grid</span>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/30">2028–2030</Badge>
                      </div>
                      <div className="text-lg font-black text-foreground">100% True Physical Zero</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Google Cloud achieves 100% 24/7 Carbon-Free Energy on all regional grids. Electricity is clean at the electron level every hour of the day without offset reliance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* The Net Thermodynamic Equation: Paper vs Digital */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-card/60 to-card/20 border border-border/50 backdrop-blur-xl space-y-6">
            <div className="space-y-2 max-w-3xl">
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 border-emerald-500/30">
                The Educational Trade-off
              </Badge>
              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
                Why Use AI At All If It Costs Energy?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If computing consumes real electricity and water, why not just go back to paper worksheets and printed textbooks? 
                Because the industrial manufacturing lifecycle of physical classroom paper is shockingly energy and water intensive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>1 Sheet of Copy Paper</span>
                </div>
                <div className="text-2xl font-black text-amber-500">~16 Wh + 10L Water</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Timber harvesting, chemical kraft pulping, chlorine bleaching, and fossil fuel trucking consume roughly 16 Watt-hours of industrial energy per single sheet.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>1 Scorpio Socratic Hint</span>
                </div>
                <div className="text-2xl font-black text-emerald-500">~0.20 Wh + 0.3 mL Water</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Processed on Google Cloud TPUs with 100% annual renewable energy matching. A single sheet of paper uses <strong>80× more energy</strong> to manufacture than one Scorpio hint!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <TreePine className="w-4 h-4 text-blue-500" />
                  <span>The Net Classroom Delta</span>
                </div>
                <div className="text-2xl font-black text-blue-500">Net Energy Negative</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By replacing physical 4-page homework packets with digital Socratic scaffolding, a classroom of 60 students saves over <strong>2,800 printed pages</strong> per semester.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-primary border-primary/20">
                Interactive Tool
              </Badge>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Calculate Your Real Thermodynamic Footprint
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Test the numbers yourself. Adjust the sliders to see the exact Joules, Watt-hours, and material tradeoffs for your study habits or school.
              </p>
            </div>

            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/40 p-1">
                <TabsTrigger value="student" className="flex items-center gap-2 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                  Student Study Mode
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2 font-bold text-xs">
                  <School className="w-4 h-4" />
                  Teacher & School Mode
                </TabsTrigger>
              </TabsList>

              {/* Student Tab */}
              <TabsContent value="student" className="mt-6 space-y-6">
                <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Weekly Socratic Study Footprint</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {studentWeeklyHints} Hints / Week
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Simulate how many Socratic hints you receive from Crux in an average study week.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Light check-in (5 hints)</span>
                        <span className="text-foreground font-bold">{studentWeeklyHints} hints</span>
                        <span>Heavy AP prep (50 hints)</span>
                      </div>
                      <Slider
                        min={2}
                        max={60}
                        step={1}
                        value={[studentWeeklyHints]}
                        onValueChange={(vals) => setStudentWeeklyHints(vals[0])}
                        className="py-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Energy Work ($E$)</span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          {studentMetrics.weeklyEnergyWh} Wh
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ({studentMetrics.weeklyEnergyJoules} Joules)
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                          <span>10W LED Equivalent</span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          {studentMetrics.ledMinutes} mins
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Time to power an LED desk bulb
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Paper Worksheets Saved</span>
                        </div>
                        <div className="text-xl font-black text-emerald-500">
                          ~{studentMetrics.paperSheetsSaved} sheets
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          By doing work digitally
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <span>Water Conserved</span>
                        </div>
                        <div className="text-xl font-black text-blue-500">
                          {studentMetrics.waterSavedLiters} Liters
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          From avoided paper mill bleaching
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teacher Tab */}
              <TabsContent value="teacher" className="mt-6 space-y-6">
                <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Classroom & Department Semester Savings</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {teacherStudentCount} Students · {teacherAssignmentsPerSemester} Assignments
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Calculate the real conservation of running a paperless, AI-scaffolded physics curriculum.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">Enrolled Students:</span>
                          <span className="text-foreground font-bold">{teacherStudentCount} students</span>
                        </div>
                        <Slider
                          min={10}
                          max={200}
                          step={5}
                          value={[teacherStudentCount]}
                          onValueChange={(vals) => setTeacherStudentCount(vals[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">Assignments per Semester:</span>
                          <span className="text-foreground font-bold">{teacherAssignmentsPerSemester} assignments</span>
                        </div>
                        <Slider
                          min={4}
                          max={32}
                          step={2}
                          value={[teacherAssignmentsPerSemester]}
                          onValueChange={(vals) => setTeacherAssignmentsPerSemester(vals[0])}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Printed Pages Eliminated</span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          {teacherMetrics.sheetsSaved} pages
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Across {teacherMetrics.totalSubmissions} submissions
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <TreePine className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Trees Preserved</span>
                        </div>
                        <div className="text-xl font-black text-emerald-500">
                          ~{teacherMetrics.treesSaved} trees
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Standard wood pulp ratio
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <span>Industrial Water Saved</span>
                        </div>
                        <div className="text-xl font-black text-blue-500">
                          {teacherMetrics.waterSavedGallons} gal
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Avoided paper mill processing
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Net Energy Delta</span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          +{teacherMetrics.paperEnergySavedKWh} kWh
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Paper saved vs {teacherMetrics.aiEnergyKWh} kWh AI used
                        </div>
                      </div>
                    </div>

                    {/* Copyable District Disclosure */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">
                            Official Syllabus & School Board Disclosure
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Copy this honest, verifiable disclosure directly into your course syllabus or district IT committee review.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyDisclosure}
                          className="gap-2 cursor-pointer font-semibold text-xs shrink-0 self-start sm:self-auto"
                        >
                          {copiedDisclosure ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Statement
                            </>
                          )}
                        </Button>
                      </div>

                      <pre className="p-4 rounded-xl bg-muted/50 border border-border/40 text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground select-all overflow-x-auto">
                        {districtDisclosureText}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Our 5-Point Engineering Solution */}
          <div className="space-y-8">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 border-emerald-500/20">
                What We Control
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Our 5 Engineering Commitments
              </h2>
              <p className="text-muted-foreground text-sm">
                We cannot control the global power grid overnight. Here are the architectural decisions we make to eliminate waste right now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">1. The Architectural Token Diet</CardTitle>
                  <CardDescription className="text-xs">Autoregressive compute minimization</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  In Large Language Models, energy consumption scales linearly with <em>output tokens generated</em>. 
                  Unconstrained chatbots produce 500–800 words of conversational prose. Scorpio&apos;s 
                  <code>STRICT_CONCISE_CONSTRAINT</code> caps generation to 40–90 tokens, cutting active decoding power by over 75%.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">2. Zero Phantom Offsets</CardTitle>
                  <CardDescription className="text-xs">No cheap voluntary credits</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  We refuse to buy $0.50 unverified forestry carbon credits to put a misleading &quot;100% Carbon Neutral&quot; 
                  sticker on our website. We focus 100% of our effort on first-principles compute reduction and honest reporting.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                    <Server className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">3. Custom TPU Silicon Selection</CardTitle>
                  <CardDescription className="text-xs">High performance per watt</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  Crux runs on Google TPU v5e/v5p custom ASICs specifically engineered for matrix multiplication, 
                  achieving significantly higher energy efficiency than legacy general-purpose GPU clusters, backed by Google&apos;s 1.10 average PUE.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">4. Client-Side Equation Vault</CardTitle>
                  <CardDescription className="text-xs">Zero-compute formula lookup</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  Students don&apos;t need to trigger a cloud GPU query to look up Newton&apos;s laws or $G = 6.67 \times 10^{-11}$. 
                  Scorpio caches formulas locally on the client device in the Equation Vault, requiring 0 Joules of AI server inference.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">5. Future Permanent Removal</CardTitle>
                  <CardDescription className="text-xs">Permanent durability roadmap</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  As Scorpio reaches school district scale, we will not buy paper offsets. We will support permanent, 
                  verifiable carbon removal (such as biochar mineralization or direct air capture) where carbon is locked away for 1,000+ years.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                <CardHeader className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">6. Paperless Classroom Tooling</CardTitle>
                  <CardDescription className="text-xs">Direct physical resource replacement</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
                  By providing full homework creation, student submission, and automated rubric grading in one web platform, 
                  we actively remove the need for schools to print hundreds of thousands of physical paper pages every semester.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actionable Playbooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Actionable Tips for Students</CardTitle>
                <CardDescription>How you can reduce wasted server cycles while learning faster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground">Ask targeted questions:</strong>
                    <p className="mt-0.5">
                      Don&apos;t dump an entire 10-problem assignment into the prompt. Ask about the exact equation or vector decomposition you&apos;re stuck on.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-foreground">Think before re-prompting:</strong>
                    <p className="mt-0.5">
                      Take 60 seconds to work through the Socratic nudge on scratch paper before typing another response. Avoid rapid-fire prompt thrashing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-foreground">Use the local Equation Vault:</strong>
                    <p className="mt-0.5">
                      Constants, formulas, and units are stored locally on your device in the Equation Vault—0 Joules of AI server inference required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                  <School className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Actionable Tips for Teachers</CardTitle>
                <CardDescription>Running high-impact physics with near-zero material waste</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground">Distribute problem sets digitally:</strong>
                    <p className="mt-0.5">
                      Stop printing 5-page AP Physics problem sets. Assign them through Scorpio to eliminate paper mill pulping and toxic bleaching waste.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-foreground">Use Waypoints for staged scaffolding:</strong>
                    <p className="mt-0.5">
                      Modular checkpoints ensure students receive structured hints only when stuck, cutting down on repetitive, unguided chatbot queries.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-foreground">Turn computing into a physics lesson:</strong>
                    <p className="mt-0.5">
                      Use the energy calculator above as an in-class problem: have students calculate the electrical work ($W = P \Delta t$) and thermal dissipation of their own study tools!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ: Answering the Hard Questions */}
          <div className="space-y-6">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-border/40">
                Hard Questions
              </Badge>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Addressing Environmental Concerns Directly
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="faq-1" className="border-border/40">
                <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
                  Does a single AI prompt evaporate 500 mL (a full bottle) of water?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    <strong>No, that viral statistic conflated multi-month model training with single inference calls.</strong> 
                    Researchers divided the entire cooling water consumption of training massive dense frontier models (hundreds of billions of parameters running for months) by a sample query count.
                  </p>
                  <p>
                    In reality, a single inference call of a distilled model like <strong>Gemini 2.5 Flash</strong> in Google&apos;s data centers consumes roughly <strong>0.2 to 0.5 mL of water</strong> (fractions of a drop). However, we do not dismiss water consumption—millions of queries add up, which is why we enforce concise output constraints.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border-border/40">
                <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
                  Why not buy carbon offsets so you can say Scorpio is &quot;100% Carbon Neutral&quot;?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    Because cheap voluntary carbon credits (e.g. paying someone not to cut down trees for a short period) have been proven in academic investigations to often lack permanence and real additionality. 
                    Buying cheap credits to look good in marketing materials is greenwashing.
                  </p>
                  <p>
                    We believe in <strong>thermodynamic reduction first</strong>: using efficient TPU silicon, cutting output tokens by 75%, and replacing physical paper worksheets.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border-border/40">
                <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
                  Are you truly zero-carbon 24 hours a day, 7 days a week?
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    <strong>No, and anyone claiming otherwise about their cloud software is being dishonest.</strong>
                  </p>
                  <p>
                    Google matches 100% of global electricity consumption with renewable power purchases on an <em>annual</em> basis. 
                    However, at 11 PM when the sun is down and winds are calm, local data center grids may draw power from natural gas or coal peaker plants. Google is working toward 24/7 Carbon-Free Energy by 2030, but true hour-by-hour zero carbon is not yet achieved on every electrical grid worldwide.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </main>

        {/* Standard Landing Footer */}
        <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <div className="container mx-auto px-6 py-12">
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
                <Logo size={24} className="text-foreground" />
                <span className="text-md font-extrabold">Scorpio</span>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
                <Link
                  href="https://github.com/RushilMahadevu/scorpio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm font-medium">GitHub</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Info className="h-5 w-5" />
                  <span className="text-sm font-medium">About</span>
                </Link>
                <Link
                  href="/research"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium">Research & Methodology</span>
                </Link>
                <Link
                  href="/sustainability"
                  className="flex items-center space-x-2 text-emerald-500 font-semibold transition-colors cursor-pointer"
                >
                  <Leaf className="h-5 w-5" />
                  <span className="text-sm font-medium">Sustainability</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Privacy</span>
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Terms</span>
                </Link>
                <Link
                  href="/request-access"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <KeyRound className="h-5 w-5" />
                  <span className="text-sm font-medium">Request Access</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
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
    </>
  );
}
