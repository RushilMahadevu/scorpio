"use client";

import { motion } from "framer-motion";
import { MonitorPlay, PlayCircle, Sparkles, BookOpen, FileDown, ShieldCheck, ArrowRight, CheckCircle2, Video } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SystemAccordion } from "@/components/system-accordion";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Info, Mail, Shield, FileText, KeyRound, Leaf } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function DemosPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen relative font-medium scroll-smooth">
      <SpaceBackground />
      <SiteHeader />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <main className="relative z-10 pt-24 md:pt-32 pb-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-24">

            {/* Header Section */}
            <div className="text-center space-y-5 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary">
                <MonitorPlay className="h-3.5 w-3.5" />
                <span>Interactive Studio & Demonstrations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
                See Socratic Physics <span className="text-primary italic">in Motion.</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Discover how Scorpio scaffolds authentic student derivations, blocks homework solvers, and provides physics faculty with continuous conceptual telemetry.
              </p>
            </div>

            {/* Video Showcase Frame */}
            <div className="space-y-6">
              <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-card/60 backdrop-blur-2xl shadow-2xl">
                {/* macOS / Glass Browser Header Chrome */}
                <div className="px-5 py-3.5 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                    <span className="ml-3 text-xs text-muted-foreground font-mono hidden sm:inline-block">
                      scorpioedu.org/demo-preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase">
                      1080p High-Fidelity
                    </Badge>
                  </div>
                </div>

                {/* Video Player */}
                <div className="relative bg-black aspect-video">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full aspect-video cursor-pointer"
                    preload="metadata"
                    poster="/ai-tutor.png"
                  >
                    <source src="/demos/scorpio-demo.webm" type="video/webm" />
                    <source src="/demos/scorpio-demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Quick Chapter Selector Bar */}
                <div className="p-4 sm:p-5 border-t border-border/50 bg-background/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { time: 0, label: "01 Platform Tour", sub: "Architecture Overview" },
                    { time: 75, label: "02 Socratic Scaffolding", sub: "Anti-Solver Enforcement" },
                    { time: 160, label: "03 KaTeX Engine", sub: "0.92 Math Density" },
                    { time: 230, label: "04 Faculty Workflow", sub: "Constraint Parameters" },
                  ].map((chapter) => (
                    <button
                      key={chapter.label}
                      onClick={() => seekTo(chapter.time)}
                      className="text-left p-2.5 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-muted/40 transition-all text-xs cursor-pointer group"
                    >
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{chapter.label}</span>
                        <PlayCircle className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{chapter.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive System Studio */}
            <div className="space-y-8">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-widest text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Interactive Walkthrough Studio</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Explore Primary Pedagogical Modules
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Click through the core workflows to inspect the Socratic student workspace and faculty management tools.
                </p>
              </div>

              <SystemAccordion />
            </div>

            {/* Live AI Playground Callout Banner */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-background/50 backdrop-blur-xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
              <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div className="space-y-4">
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    Live Public Sandbox
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Want to test Raise yourself?
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                    Test how our Socratic engine handles real physics queries—from incline acceleration and normal force misconceptions to Newton&apos;s Third Law—without creating an account.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="rounded-full font-semibold shadow-lg shadow-primary/20">
                    <Link href="/ai" className="flex items-center gap-2">
                      Launch AI Playground <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Validated Efficacy & Ph.D. Study Strip */}
            <div className="rounded-3xl border border-border/50 bg-card/20 backdrop-blur-xl p-8 sm:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Independent Ph.D. Ablation Study</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Evidence-Based Pedagogical Outcomes
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/research">
                      <BookOpen className="h-4 w-4 mr-1.5" /> Read Methodology
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/demos/comprehensive_metrics.pdf" target="_blank">
                      <FileDown className="h-4 w-4 mr-1.5" /> Download Metrics PDF
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "0%", label: "Direct Answer Rate", desc: "Ablation study across 25 procedural physics problems" },
                  { value: "4.62 / 5", label: "Pedagogical Quality", desc: "Ph.D. blinded holistic audit scoring" },
                  { value: "0.92", label: "LaTeX Notation Density", desc: "Symbolic precision per 100 words" },
                  { value: "625", label: "Assessment Passes", desc: "Rigorous internal test battery" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</div>
                    <div className="text-xs font-bold text-foreground/80">{stat.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

        {/* Global Footer */}
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
      </motion.div>
    </div>
  );
}
