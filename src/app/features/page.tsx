"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, Calculator, Waypoints, ShieldUser, Users, FileUp, ArrowRight,
  Sparkles, Orbit, SquareFunction, Menu, Github, Info, BookOpen, Mail,
  Shield, FileText, Activity, PlayCircle, CheckCircle2, Zap, Presentation,
  MonitorPlay, ShieldCheck, FileDown, Maximize2, Globe, ChartColumnIncreasing
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const DemoCarousel = dynamic(() => import("@/components/demo-carousel").then(m => m.DemoCarousel), {
  ssr: false,
  loading: () => <div className="h-[540px] w-full flex items-center justify-center bg-muted/20 rounded-2xl animate-pulse">Loading Demonstrations...</div>,
});

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function FeaturesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: Brain, title: "Socratic Scaffolding", description: "Enforces the Struggle\u2014a 4-layer architecture ensuring pedagogical depth over simple answer-retrieval.", tag: "Pedagogical" },
    { icon: SquareFunction, title: "0.92 Notation Density", description: "Real-time, symbolic LaTeX rendering verified for professional academic standards and precision.", tag: "Mathematical" },
    { icon: Orbit, title: "Inference-Time Scaffolding", description: "No fine-tuning, no black-box retraining. Every Socratic behaviour is enforced at inference-time \u2014 observable, auditable, reproducible.", tag: "Verifiable" },
    { icon: Calculator, title: "Constraint-Led Derivation", description: "Students are guided through the derivation, not handed it. The AI architecture makes bypassing the learning process structurally impossible.", tag: "Architecture" },
    { icon: Waypoints, title: "Shared Waypoints", description: "Integrate high-precision, peer-validated physics modules and benchmarks into your curriculum.", tag: "Network" },
    { icon: ShieldUser, title: "Verifiable Integrity", description: "Rigid schema constraints block homework-solving hacks and ensure academic honesty at scale.", tag: "Verifiable" },
    { icon: FileUp, title: "Evidence Logistics", description: "End-to-end support for multi-format coursework, including OCR-ready PDF and image uploads.", tag: "Logistics" },
    { icon: Users, title: "Departmental Scale", description: "Role-based access designed for deans and instructors to manage massive student cohorts efficiently.", tag: "Enterprise" },
  ];

  return (
    <div className="min-h-screen relative font-medium">
      <SpaceBackground />

      {/* Header */}
      <motion.header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="flex items-center justify-between px-6 py-3.5 max-w-[1400px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Logo size={20} className="text-foreground" />
            <span className="text-sm font-extrabold">Scorpio</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href}>
                <button className={`h-8 px-4 text-sm font-semibold rounded-full transition-colors cursor-pointer ${href === "/features" ? "text-foreground bg-muted/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>{label}</button>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}
              <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden" hideClose>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <span className="font-extrabold text-lg">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="rounded-full hover:bg-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
                <nav className="flex flex-col space-y-1 px-6 py-8 flex-1 overflow-y-auto">
                  {navLinks.map(({ label, href }) => (
                    <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="justify-start font-semibold text-muted-foreground text-base px-2 py-3 rounded-xl w-full">{label}</Button>
                    </Link>
                  ))}
                </nav>
                <div className="px-6 pb-6 pt-4 border-t bg-muted/5">
                  <div className="flex flex-col gap-2">
                    <Link href="/login"><Button variant="outline" size="lg" className="w-full">Login</Button></Link>
                    <Link href="/signup"><Button size="lg" className="w-full">Sign up</Button></Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
            <div className="h-5 w-px bg-border/40 hidden lg:block" />
            <Link href="/login" className="hidden lg:block">
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-semibold px-5 rounded-full cursor-pointer shadow-none hover:opacity-90">Sign up</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">

        {/* Page Header */}
        <section className="container mx-auto px-6 pt-20 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary">
              <Brain className="h-3.5 w-3.5" /><span>Platform Features</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">Everything the physics classroom needs.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              From verified pedagogical architecture to collaborative waypoints \u2014 every feature is purpose-built to enforce the Socratic method at scale.
            </p>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-6 py-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
            {features.map((feature, i) => (
              <motion.div key={i} className="group p-6 rounded-2xl border border-border/60 bg-card/10 backdrop-blur-md hover:bg-card/20 hover:border-primary/20 transition-all duration-300 space-y-3"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary/70 px-2 py-0.5">{feature.tag}</Badge>
                <h3 className="font-bold text-sm leading-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none -z-10" />
          <motion.div className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7 }}>
            <div className="text-center space-y-4 mb-16">
              <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Independent Research \u00B7 125-Response Ablation Study</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Not another AI chatbot wrapper.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Every metric below is sourced from our published ablation study \u2014 blinded scoring by an independent Ph.D. auditor across 25 physics problems.
              </p>
              <div className="flex justify-center pt-2">
                <Link href="/research">
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors cursor-pointer">
                    Read the full methodology \u2192
                  </Badge>
                </Link>
              </div>
            </div>
            <motion.div className="rounded-3xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-xl"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.6 }}>
              <div className="grid grid-cols-5 bg-muted/30 border-b border-border/50 px-6 py-4">
                <div className="col-span-1 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Capability</div>
                <div className="col-span-1 text-center"><div className="inline-flex flex-col items-center gap-1"><span className="text-xs font-black uppercase tracking-widest text-foreground">Scorpio</span><span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Full Stack</span></div></div>
                <div className="col-span-1 text-center"><span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">ChatGPT / Gemini</span></div>
                <div className="col-span-1 text-center"><span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Khanmigo</span></div>
                <div className="col-span-1 text-center"><span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Human Tutor</span></div>
              </div>
              {[
                { capability: "Direct Answer Rate", footnote: "Ablation study, 25 procedural physics problems", scorpio: { val: "0%" }, chatgpt: { val: "~100%", dim: true }, khan: { val: "~40%", dim: true }, human: { val: "Varies" } },
                { capability: "Pedagogical Quality Score", footnote: "Ph.D. blinded holistic audit, 5-point scale", scorpio: { val: "4.62 / 5" }, chatgpt: { val: "4.38 / 5\u00B9", dim: true }, khan: { val: "No data" }, human: { val: "~4.5 / 5" } },
                { capability: "LaTeX Notation Density", footnote: "Per 100 words, ablation study", scorpio: { val: "0.92" }, chatgpt: { val: "0.22\u00B9", dim: true }, khan: { val: "Limited", dim: true }, human: { val: "Whiteboard" } },
                { capability: "Socratic Questions / Response", footnote: "Avg. across 125-response study", scorpio: { val: "1.25" }, chatgpt: { val: "1.00\u00B9", dim: true }, khan: { val: "~0.8", dim: true }, human: { val: "~1.5" } },
                { capability: "Constraint Architecture", footnote: "Inference-time, no fine-tuning required", scorpio: { val: "4-Layer Enforced" }, chatgpt: { val: "None", dim: true }, khan: { val: "Prompt-only", dim: true }, human: { val: "Implicit" } },
                { capability: "Cost Transparency", footnote: "Per-student, per-request visibility", scorpio: { val: "100% \u2014 zero markup" }, chatgpt: { val: "Fixed subscription", dim: true }, khan: { val: "Fixed subscription", dim: true }, human: { val: "$40\u2013120 / hr", dim: true } },
                { capability: "Verifiable / Auditable", footnote: "Published methodology, reproducible results", scorpio: { val: "Yes \u2014 open study" }, chatgpt: { val: "No", dim: true }, khan: { val: "No", dim: true }, human: { val: "Subjective" } },
              ].map((row, i) => (
                <motion.div key={i} className={`grid grid-cols-5 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, duration: 0.4 }}>
                  <div className="col-span-1 pr-4"><p className="text-sm font-bold text-foreground">{row.capability}</p><p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">{row.footnote}</p></div>
                  <div className="col-span-1 flex items-center justify-center"><span className="text-sm font-black text-primary bg-primary/8 px-3 py-1 rounded-full">{row.scorpio.val}</span></div>
                  <div className="col-span-1 flex items-center justify-center"><span className={`text-sm font-semibold ${row.chatgpt.dim ? "text-muted-foreground/50" : "text-foreground"}`}>{row.chatgpt.val}</span></div>
                  <div className="col-span-1 flex items-center justify-center"><span className={`text-sm font-semibold ${row.khan.dim ? "text-muted-foreground/50" : "text-foreground"}`}>{row.khan.val}</span></div>
                  <div className="col-span-1 flex items-center justify-center"><span className="text-sm font-semibold text-muted-foreground/70">{row.human.val}</span></div>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-6 space-y-1 px-2">
              <p className="text-[10px] text-muted-foreground/50 font-medium">\u00B9 Baseline Gemini 2.5 Flash (NONE constraint level) from Scorpio ablation study \u2014 used as proxy for unconstrained LLM performance.</p>
              <p className="text-[10px] text-muted-foreground/50 font-medium">Full methodology, raw data, and blinded scoring rubric available at <Link href="/research" className="text-primary/70 hover:text-primary underline underline-offset-2">scorpio/research</Link>.</p>
            </div>
          </motion.div>
        </section>

        {/* Math Fidelity */}
        <section id="math-fidelity" className="container mx-auto px-6 py-32 relative">
          <div className="max-w-6xl mx-auto rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row items-center gap-12 group">
            <div className="flex-1 p-12 lg:p-20 space-y-8">
              <motion.div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary"
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <SquareFunction className="h-3.5 w-3.5" /><span>The Architecture</span>
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Mathematical <span className="text-primary italic">Fidelity.</span></h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                  Scorpio features a custom-built LaTeX engine designed specifically for physics pedagogy. From complex integrals to 4-vector notation, our interface ensures symbols are rendered with publication-grade precision.
                </p>
              </div>
              <motion.ul className="space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}>
                {["Intuitive Math Builder UI", "Real-time KaTeX Syntax Validation", "Waypoints Reference System", "Dynamic Preview & Correction"].map((text, i) => (
                  <motion.li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80"
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                    <div className="h-2 w-2 rounded-full bg-primary" />{text}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            <div className="flex-1 w-full lg:w-1/2 p-6 lg:p-12 relative">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div className="relative rounded-2xl overflow-hidden border border-border shadow-3xl bg-background group-hover:opacity-80 transition-opacity duration-700 cursor-pointer"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white" />
                    </div>
                    <Image src="/demos/math-builder.png" alt="Scorpio Integral Builder" width={600} height={400} className="w-full h-auto" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Mathematical Precision Interface</DialogTitle>
                  <Image src="/demos/math-builder.png" alt="Scorpio Integral Builder Full View" width={1200} height={800} className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain" />
                </DialogContent>
              </Dialog>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </section>

        {/* Demonstrations */}
        <section id="demos" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <motion.div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
                <MonitorPlay className="h-3.5 w-3.5" /><span>Instructional Showcases</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System Demonstrations.</h2>
            </div>
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-center mb-16">
                <TabsList className="bg-background/20 backdrop-blur-md border border-border/50 p-1 h-auto rounded-full flex flex-wrap justify-center">
                  <TabsTrigger value="overview" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                    <PlayCircle className="h-4 w-4" />Full Platform Walkthrough
                  </TabsTrigger>
                  <TabsTrigger value="capabilities" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                    <Presentation className="h-4 w-4" />Core Capability Demos
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview" className="mt-4 focus-visible:outline-none" forceMount>
                <motion.div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border/60 bg-black/40 shadow-3xl"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <video src="/demos/scorpio-demo.mp4" controls className="w-full h-auto aspect-video cursor-pointer" />
                </motion.div>
                <div className="mt-10 text-center max-w-3xl mx-auto space-y-4">
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed italic">
                    "A comprehensive 5-minute deep-dive into the architectural nuances and pedagogical advantages of the Scorpio framework."
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="capabilities" className="mt-8 focus-visible:outline-none" forceMount>
                <div className="flex justify-center"><DemoCarousel /></div>
                <div className="mt-10 text-center max-w-3xl mx-auto">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.25em] opacity-60">Modular Breakdowns of Primary Instructional Workflows</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="container mx-auto px-6 py-40 relative">
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
            <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[180px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[140px]" />
          </div>
          <motion.div className="text-center mb-24 space-y-4"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}>
            <div className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Two Interfaces. One System.</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Classroom. Reimagined.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">You control the AI constraints. Students experience the Socratic method. Both sides get exactly what they need \u2014 without compromise.</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-20 max-w-7xl mx-auto relative px-4">
            <div className="absolute left-1/2 top-40 bottom-40 w-px bg-border hidden lg:block -translate-x-1/2 border-dashed border-l" />
            {/* Teacher */}
            <motion.div className="space-y-12 relative" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, amount: 0.2 }}>
              <div className="flex items-center gap-6 mb-10 group">
                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 transition-all duration-500 shadow-sm">
                  <Presentation className="h-7 w-7 text-primary" />
                </div>
                <div><h3 className="text-2xl font-extrabold tracking-tight">Instructional Design</h3><p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Faculty Interface</p></div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}>
                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20"><Maximize2 className="h-6 w-6 text-white" /></div>
                    </div>
                    <Image src="/demos/teacher-editor.png" alt="Scorpio Question Editor" width={800} height={600} className="w-full h-[300px] object-cover object-top" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                      <p className="text-xs font-bold text-white uppercase tracking-widest">View Faculty Question Editor Interface</p>
                    </div>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Instructional Design Interface</DialogTitle>
                  <Image src="/demos/teacher-editor.png" alt="Scorpio Question Editor Full View" width={1920} height={1080} className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain" />
                </DialogContent>
              </Dialog>
              <div className="space-y-10 pl-5 border-l border-border/60">
                {[
                  { title: "Rigorous Content Integration", desc: "Construct multi-modal assignments with full LaTeX support and resource linking." },
                  { title: "Pedagogical Constraint Logic", desc: "Define AI-tutoring parameters to enforce specific problem-solving pathways." },
                  { title: "Facilitated Assessment", desc: "Review conceptual feedback loops and validate student derivations with AI assistance." },
                  { title: "Real-Time Telemetry", desc: "Monitor class-wide conceptual bottlenecks via dynamic statistical dashboards." },
                ].map((item, i) => (
                  <motion.div key={i} className="relative group" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-primary transition-colors duration-500" />
                    <div className="space-y-2"><h4 className="font-bold text-lg leading-none">{item.title}</h4><p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">{item.desc}</p></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Student */}
            <motion.div className="space-y-12 relative" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, amount: 0.2 }}>
              <div className="flex items-center gap-6 mb-10 lg:flex-row-reverse group">
                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-secondary/40 transition-all duration-500 shadow-sm">
                  <Users className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div className="lg:text-right"><h3 className="text-2xl font-extrabold tracking-tight">Conceptual Discovery</h3><p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Student Interface</p></div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}>
                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20"><Maximize2 className="h-6 w-6 text-white" /></div>
                    </div>
                    <Image src="/demos/ai-tutor.png" alt="Crux Tutor Chat" width={800} height={600} className="w-full h-[300px] object-cover object-top" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20 lg:text-right">
                      <p className="text-xs font-bold text-white uppercase tracking-widest">View AI Tutor Interface</p>
                    </div>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Conceptual Discovery Interface</DialogTitle>
                  <Image src="/demos/ai-tutor.png" alt="Crux Tutor Full View" width={1920} height={1080} className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain" />
                </DialogContent>
              </Dialog>
              <div className="space-y-10 lg:text-right lg:pr-5 lg:border-r lg:border-l-0 border-l border-border/60 pl-5 lg:pl-0">
                {[
                  { title: "Adaptive Socratic Guidance", desc: "Engage with a constraint-led AI specialized in guiding derivations." },
                  { title: "Immersive Problem Solving", desc: "Interact with physics challenges through high-fidelity math rendering." },
                  { title: "Continuous Feedback Loop", desc: "Receive immediate sanity checks for unit consistency and physical logic." },
                  { title: "Synthesized Learning Path", desc: "Access a collection of Waypoints tailored to current coursework." },
                ].map((item, i) => (
                  <motion.div key={i} className="relative group" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div className="absolute lg:-right-[25px] -left-[25px] lg:left-auto top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-secondary transition-colors duration-500" />
                    <div className="space-y-2"><h4 className="font-bold text-lg leading-none lg:flex-row-reverse flex">{item.title}</h4><p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm lg:ml-auto">{item.desc}</p></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Efficacy */}
        <section id="efficacy" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <motion.div className="flex-1 space-y-8" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-xs font-bold tracking-widest uppercase text-secondary-foreground">
                  <Activity className="h-3.5 w-3.5" /><span>Evidence-Based Results</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-foreground">Validated Institutional <span className="text-secondary-foreground italic">Efficacy.</span></h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
                  Based on our 125-response ablation study, Scorpio&apos;s framework successfully eliminates direct solution delivery while achieving expert-validated gains in pedagogical quality and symbolic precision.
                </p>
              </div>
              <motion.div className="grid sm:grid-cols-2 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "Direct Answer Rate", value: "0%" },
                  { label: "Expert Score Gain", value: "+0.67" },
                  { label: "LaTeX Density", value: "0.92" },
                  { label: "Pedagogical Quality", value: "4.62" },
                ].map((stat, i) => (
                  <motion.div key={i} className="p-6 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm space-y-2 group hover:border-secondary/30 transition-colors"
                    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="text-3xl font-black text-foreground group-hover:text-secondary-foreground transition-colors">{stat.value}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link href="/research" target="_blank">
                  <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 gap-3">
                    <BookOpen className="h-5 w-5 text-secondary-foreground" />View Scorpio Research
                  </Button>
                </Link>
                <Link href="/demos/comprehensive_metrics.pdf" target="_blank">
                  <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 gap-3">
                    <FileDown className="h-5 w-5 text-secondary-foreground" />Download Comprehensive Metrics
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div className="flex-1 w-full lg:max-w-md" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="relative aspect-square rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center space-y-6 overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="h-20 w-20 rounded-3xl bg-background border border-border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black italic">PhD-Validated Framework.</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">Subjected to a rigorous 625-pass internal assessment battery and independently audited by Physics PhDs on a blinded 30-item stratified subset.</p>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4 w-full relative z-10 px-4">
                  <div className="text-left border-l-2 border-secondary/30 pl-3"><div className="text-lg font-black leading-none">625</div><div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Internal Assessments</div></div>
                  <div className="text-left border-l-2 border-secondary/30 pl-3"><div className="text-lg font-black leading-none">0.51 \u03BA</div><div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Ph.D. Alignment</div></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Waypoints Network */}
        <section id="waypoints" className="container mx-auto px-6 py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[130px] pointer-events-none -z-10" />
          <motion.div className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}>
            <div className="text-center space-y-4 mb-20">
              <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Collaborative Infrastructure</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Waypoints Network</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">High-precision, peer-validated physics modules built by instructors \u2014 shared across institutions. Drop them straight into your curriculum.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div className="space-y-8" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <div className="space-y-6">
                  {[
                    { icon: Globe, title: "Shared by real instructors", body: "Every Waypoint is authored by a verified Scorpio teacher \u2014 not generated. You know exactly where the pedagogy comes from.", color: "text-blue-500", bg: "bg-blue-500/8" },
                    { icon: ShieldCheck, title: "Peer-validated before publish", body: "Modules go through a structured review before they enter the network. Mathematical notation, Socratic depth, and accuracy are checked.", color: "text-emerald-500", bg: "bg-emerald-500/8" },
                    { icon: Zap, title: "Drop into any assignment", body: "Browse, preview, and attach Waypoints to your assignments in seconds. No reformatting, no copy-paste \u2014 structurally compatible out of the box.", color: "text-violet-500", bg: "bg-violet-500/8" },
                  ].map((item, i) => (
                    <motion.div key={i} className="flex gap-4 p-5 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-border/70 transition-colors"
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                      <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div><p className="font-bold text-sm text-foreground mb-1">{item.title}</p><p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p></div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div className="relative" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2"><Waypoints className="h-4 w-4 text-primary" /><span className="text-sm font-black tracking-tight">Waypoint Browser</span></div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary">Network</Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { title: "Rotational Dynamics \u2014 Torque & Inertia", tag: "Mechanics", author: "Dr. A. Patel", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                      { title: "Maxwell\u2019s Equations \u2014 Integral Form", tag: "E&M", author: "Prof. R. Chen", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                      { title: "Quantum Tunneling \u2014 WKB Approximation", tag: "Quantum", author: "Dr. S. Okafor", badge: "Under Review", badgeColor: "bg-amber-500/10 text-amber-500" },
                      { title: "Thermodynamic Cycles \u2014 Carnot Engine", tag: "Thermo", author: "Prof. L. Torres", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                    ].map((w, i) => (
                      <motion.div key={i} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/30 bg-background/50 hover:border-border/60 hover:bg-background/80 transition-all group cursor-default"
                        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}>
                        <div className="flex-1 min-w-0"><p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{w.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{w.tag} \u00B7 {w.author}</p></div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${w.badgeColor}`}>{w.badge}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between bg-muted/10">
                    <span className="text-[10px] text-muted-foreground font-semibold">Example modules \u2014 network launching with early access</span>
                    <span className="text-[10px] text-primary font-bold cursor-default">Coming soon \u2192</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[80px] -z-10" />
              </motion.div>
            </div>
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
              {[
                { value: "Early", label: "Access Now Open", sub: "Be first to shape the network" },
                { value: "100%", label: "Instructor-Authored", sub: "No AI-generated content" },
                { value: "Zero", label: "Reformatting Required", sub: "Drop-in compatible by design" },
                { value: "Growing", label: "Module Library", sub: "Expanding with every school" },
              ].map((stat, i) => (
                <motion.div key={i} className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-center hover:border-border/70 transition-colors"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs font-bold text-foreground/80 mt-1">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-24">
          <motion.div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Ready to deploy?</h2>
              <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto leading-relaxed">Get faculty access in minutes, or see full pricing and ROI analysis.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup"><Button size="lg" className="h-14 px-10 rounded-full text-lg font-black cursor-pointer">Get Faculty Access <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/pricing"><Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg cursor-pointer font-black border-2 bg-background/50">See Pricing</Button></Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
              <Logo size={24} className="text-foreground" /><span className="text-md font-extrabold">Scorpio</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
              {[
                { href: "https://github.com/RushilMahadevu/scorpio", icon: Github, label: "GitHub", external: true },
                { href: "/about", icon: Info, label: "About" },
                { href: "/research", icon: BookOpen, label: "Research" },
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
              <div className="text-xs text-muted-foreground">{`\u00A9 ${new Date().getFullYear()} Scorpio. All rights reserved.`}</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
