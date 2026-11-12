"use client";

import { useState, useMemo } from "react";
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
  Lightbulb,
  FileText,
  School,
  GraduationCap,
  Shield,
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

export default function SustainabilityContent() {
  // Student Calculator State
  const [studentWeeklyHints, setStudentWeeklyHints] = useState<number>(15);
  // Teacher Calculator State
  const [teacherStudentCount, setTeacherStudentCount] = useState<number>(60);
  const [teacherAssignmentsPerSemester, setTeacherAssignmentsPerSemester] = useState<number>(16);

  const [copiedDisclosure, setCopiedDisclosure] = useState(false);

  // Student metrics calculations (Accurate empirical data based on Gemini 3.8 Flash on Google TPUs)
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

  const districtDisclosureText = `Scorpio environmental summary

Scorpio runs its model on Google Cloud TPUs and keeps hints short to limit the amount of text the model generates. Google matches electricity use with renewable purchases over the year. The local grid mix varies by hour, and manufacturing the hardware produces emissions.

For a class of ${teacherStudentCount} students, moving ${teacherAssignmentsPerSemester} three-page assignments online could save ${teacherMetrics.sheetsSaved} sheets per semester. The calculator estimates that this could save about ${teacherMetrics.waterSavedGallons} gallons of water used in paper manufacturing.

Scorpio prioritizes reducing energy and paper use. We plan to support long-term carbon removal once we are consistently profitable.`;

  const copyDisclosure = () => {
    navigator.clipboard.writeText(districtDisclosureText);
    setCopiedDisclosure(true);
    toast.success("Environmental disclosure copied to clipboard!");
    setTimeout(() => setCopiedDisclosure(false), 2500);
  };

  return (
    <>
      {/* Overview */}
      <div className="space-y-6 text-center max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="px-3.5 py-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5"
          >
            <Leaf className="w-3.5 h-3.5" />
            Sustainability
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-border/40 text-muted-foreground font-semibold text-xs"
          >
            Energy, water & paper
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-border/40 text-muted-foreground font-semibold text-xs"
          >
            Google Cloud TPUs
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
          The environmental cost of <span className="text-emerald-500 italic">using Scorpio</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          Each hint uses electricity, and cooling the servers can use water. Digital assignments can also save paper. Here’s how we estimate those costs and what we do to keep them down.
        </p>

        <div className="p-5 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xl text-left text-sm text-muted-foreground leading-relaxed space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Scale className="w-4 h-4 text-emerald-500" />
            <span>The physics behind a hint</span>
          </div>
          <p>
            If you know a processor’s power draw and how long it runs, you can estimate the energy it uses by multiplying the two. The data center also needs energy to carry away the heat.
          </p>
          <p>
            The calculator below uses estimates. Try changing the number of hints you use or the number of assignments your class prints.
          </p>
        </div>
      </div>

      {/* Where the footprint comes from */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-primary border-primary/20">
            From device to data center
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            What happens when you ask for a hint?
          </h2>
          <p className="text-muted-foreground text-sm">
            The request starts on your device. Most of the work happens at the data center, and the electricity and hardware both contribute to the footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Step 1 */}
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs mb-2">
                01
              </div>
              <CardTitle className="text-base">Your device</CardTitle>
              <CardDescription className="text-xs">Your laptop or phone</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                We estimate that sending a request over Wi-Fi or LTE uses about <strong>0.005 Wh</strong> on your device.
              </p>
              <div className="pt-2 border-t border-border/30 text-[11px]">
                The emissions depend on the electricity that charges your device.
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs mb-2">
                02
              </div>
              <CardTitle className="text-base">Running the model</CardTitle>
              <CardDescription className="text-xs">Google TPU v5 Silicon</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                Scorpio keeps hints short. The calculator uses <strong>0.20 Wh</strong>, or 720 joules, as an estimate per hint.
              </p>
              <div className="pt-2 border-t border-border/30 text-[11px]">
                Shorter replies give the model fewer tokens to generate.
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs mb-2">
                03
              </div>
              <CardTitle className="text-base">Cooling the servers</CardTitle>
              <CardDescription className="text-xs">Evaporative towers & chillers</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                We use an estimate of <strong>0.2 to 0.5 mL</strong> of cooling water per hint.
              </p>
              <div className="pt-2 border-t border-border/30 text-[11px]">
                Actual water use varies by data center and cooling system.
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs mb-2">
                04
              </div>
              <CardTitle className="text-base">Powering the data center</CardTitle>
              <CardDescription className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Local electricity supply</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                Google buys enough renewable energy to match its annual electricity use. Data centers still draw power from their local grids throughout the day.
              </p>
              <div className="pt-2 border-t border-amber-500/20 text-[11px]">
                Some of that electricity can come from fossil fuels.
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs mb-2">
                05
              </div>
              <CardTitle className="text-base">Making the hardware</CardTitle>
              <CardDescription className="text-xs">Mining, fabs & e-waste</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>
                Mining materials, manufacturing chips, and building data centers all produce emissions before the servers run.
              </p>
              <div className="pt-2 border-t border-border/30 text-[11px]">
                Those emissions are separate from the electricity used to run a hint.
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
            Carbon footprint
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Are we carbon neutral?
          </h2>
          <p className="text-muted-foreground text-sm">
            Scorpio still has emissions from cloud electricity and hardware. We plan to fund carbon removal once we’re profitable.
          </p>
        </div>

        {/* Main Progress Meter Card */}
        <Card className="border-border/50 bg-gradient-to-b from-card/60 to-card/20 backdrop-blur-xl overflow-hidden shadow-xl">
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Score Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Scope 1 (Direct Operations)</span>
                </div>
                <div className="text-xl font-black text-emerald-500">Direct emissions</div>
                <p className="text-[11px] text-muted-foreground">
                  Scorpio operates no vehicle fleets, factories, or fossil-fuel boilers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scope 2 (Cloud Electricity)</span>
                </div>
                <div className="text-xl font-black text-amber-500">Annual matching</div>
                <p className="text-[11px] text-muted-foreground">
                  Renewable purchases match annual electricity use. The local grid mix changes by hour.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  <span>Scope 3 (Hardware & Silicon)</span>
                </div>
                <div className="text-xl font-black text-purple-500">Manufacturing</div>
                <p className="text-[11px] text-muted-foreground">
                  Manufacturing the chips and other equipment produces emissions.
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
                      Our plan to fund carbon removal
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      We plan to contribute through Stripe Climate and Frontier.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shrink-0">
                  1%–2% of revenue
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once Scorpio is consistently profitable, we plan to put <strong>1% to 2% of platform revenue</strong> toward long-term carbon removal through <strong>Stripe Climate and Frontier</strong>.
              </p>

              {/* The 5-Cent Math Breakdown */}
              <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>An example of what the pledge could fund</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">1. One year of hints</span>
                    <p className="mt-0.5">At 720 hints a year and 0.20 Wh per hint, a student would use about 144 Wh. This example assumes a footprint of <strong>150 grams of CO₂e</strong> including hardware.</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">2. Example removal cost</span>
                    <p className="mt-0.5">At an assumed price of $350 per metric ton, removing 0.15 kg would cost about <strong>5 cents</strong>.</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">3. Example contribution</span>
                    <p className="mt-0.5">At that same price, a contribution of <strong>50 cents to $1 per student</strong> could fund about 1.4 to 2.9 kg of removal.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Stage Milestone Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                What we’re working toward
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Today</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">In use</Badge>
                  </div>
                  <div className="text-lg font-black text-foreground">Shorter hints</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We limit how much text each hint generates and run the model on Google Cloud TPUs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">When profitable</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">Planned</Badge>
                  </div>
                  <div className="text-lg font-black text-emerald-500">Fund carbon removal</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We plan to direct a share of revenue to carbon removal.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Google’s goal</span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/30">2030 target</Badge>
                  </div>
                  <div className="text-lg font-black text-foreground">Clean power every hour</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Google aims to match electricity use with carbon-free power around the clock.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paper and digital comparison */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-card/60 to-card/20 border border-border/50 backdrop-blur-xl space-y-6">
        <div className="space-y-2 max-w-3xl">
          <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 border-emerald-500/30">
            Energy and water
          </Badge>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            How do hints compare with printed worksheets?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Making paper takes energy and water too. Here’s a rough comparison using the estimates in the calculator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>One sheet of copy paper</span>
            </div>
            <div className="text-2xl font-black text-amber-500">~16 Wh + 10L Water</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The estimate includes the energy used to make and transport the paper.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>One Scorpio hint</span>
            </div>
            <div className="text-2xl font-black text-emerald-500">~0.20 Wh + 0.3 mL Water</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Using these estimates, making one sheet takes about <strong>80 times</strong> the energy of generating one hint.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
              <TreePine className="w-4 h-4 text-blue-500" />
              <span>One class over a semester</span>
            </div>
            <div className="text-2xl font-black text-blue-500">~2,880 fewer sheets</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              That’s the estimate for a class of 60 students that moves 16 three-page assignments online.
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
            Estimate your impact
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Change the sliders to estimate the energy used by hints or the paper a class could save.
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/40 p-1">
            <TabsTrigger value="student" className="flex items-center gap-2 font-bold text-xs">
              <GraduationCap className="w-4 h-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2 font-bold text-xs">
              <School className="w-4 h-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          {/* Student Tab */}
          <TabsContent value="student" className="mt-6 space-y-6">
            <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg">
                  <span>Hints in a typical week</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {studentWeeklyHints} Hints / Week
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Choose how many hints you use in a week.
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
                      <span>Energy used</span>
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
                      <span>10 W light bulb</span>
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
                      <span>Sheets of paper saved</span>
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
                      <span>Water saved</span>
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
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg">
                  <span>Paper saved in a semester</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {teacherStudentCount} Students · {teacherAssignmentsPerSemester} Assignments
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Enter your class size and the number of assignments you move online.
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
                      <span>Fewer printed pages</span>
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
                      <span>Water saved</span>
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
                      <span>Paper manufacturing energy</span>
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
                        Environmental summary for schools
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Copy a summary of the estimates for your syllabus or district review.
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
            What we do to use less
          </h2>
          <p className="text-muted-foreground text-sm">
            We keep hints short, make common formulas easy to look up, and give classes a way to use less paper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">1. Short hints</CardTitle>
              <CardDescription className="text-xs">Fewer tokens per reply</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              We keep hints short so the model generates fewer tokens and students can get back to the problem.
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">2. Cutting emissions first</CardTitle>
              <CardDescription className="text-xs">Our approach to offsets</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              We focus on reducing the energy and materials Scorpio uses. Our plan is to support carbon removal that can be measured and verified.
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                <Server className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">3. Google Cloud TPUs</CardTitle>
              <CardDescription className="text-xs">Hardware that runs the model</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              The model runs on processors designed for the kinds of calculations it performs.
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">4. Equation Vault</CardTitle>
              <CardDescription className="text-xs">Formula lookup without an AI request</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              The Equation Vault stores formulas on your device. You can look up a constant or an equation without running the model.
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">5. Long-term carbon removal</CardTitle>
              <CardDescription className="text-xs">Planned once profitable</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              We plan to support projects that can verify how much carbon they remove and how long it stays stored.
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardHeader className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <TreePine className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">6. Digital assignments</CardTitle>
              <CardDescription className="text-xs">Less printing</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed">
              Teachers can post and grade assignments online, and students can turn them in without printing a copy.
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
            <CardTitle className="text-lg">For students</CardTitle>
            <CardDescription>Get help with fewer prompts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-foreground">Ask about the step you’re stuck on</strong>
                <p className="mt-0.5">
                  Point to the equation or step that’s giving you trouble. For example, ask how to split a force into its horizontal and vertical components.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-foreground">Try the hint before asking again</strong>
                <p className="mt-0.5">
                  Spend a minute working through the hint on scratch paper. If you’re still stuck, say what you tried.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-foreground">Look up formulas in the Equation Vault</strong>
                <p className="mt-0.5">
                  You can find constants, formulas, and units without sending an AI request.
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
            <CardTitle className="text-lg">For teachers</CardTitle>
            <CardDescription>Use less paper and help students get unstuck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-foreground">Post problem sets online</strong>
                <p className="mt-0.5">
                  Post and collect problem sets in Scorpio to cut down on printing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-foreground">Add hints with Waypoints</strong>
                <p className="mt-0.5">
                  Add a hint at a step where students often get stuck, such as setting up a free-body diagram.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-foreground">Use the calculator in class</strong>
                <p className="mt-0.5">
                  Ask students to estimate how much energy their study tools use by multiplying power by time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ: Answering the FAQ */}
      <div className="space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-border/40">
            FAQ
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Questions about energy and emissions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="faq-1" className="border-border/40">
            <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
              How much water does a hint use?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                We use <strong>0.2 to 0.5 mL of cooling water per hint</strong> as an estimate. The amount varies with the data center, its cooling system, and the work each request takes.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-border/40">
            <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
              How do you approach carbon offsets?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                We focus first on the energy and materials we can save. For future purchases, we plan to fund projects that can measure how much carbon they remove and verify how long it stays stored.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-border/40">
            <AccordionTrigger className="text-sm md:text-base font-bold text-foreground">
              Does the data center run on clean energy around the clock?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                Google matches its electricity use with renewable purchases over the year. At any given hour, a data center draws power from its local grid, which can include natural gas or coal.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
