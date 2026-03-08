"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, Calculator, KeyRound, Waypoints, ShieldUser, Users, MessageCircle, FileUp, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, Cloud, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText, AlertTriangle, Activity, ShieldCheck, FileDown, Maximize2, MonitorPlay, PlayCircle, CheckCircle2, Zap, Lock, Globe
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/loading-screen";
import { LandingChatbot } from "@/components/landing-chatbot";
import { LandingFAQ } from "@/components/landing-faq";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DemoCarousel = dynamic(() => import("@/components/demo-carousel").then(mod => mod.DemoCarousel), {
  ssr: false,
  loading: () => <div className="h-[540px] w-full flex items-center justify-center bg-muted/20 rounded-2xl animate-pulse">Loading Demonstrations...</div>
});

const CostComparisonChart = dynamic(() => import("@/components/admin/cost-comparison-chart"), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse" />
});

interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: string;
}

interface LandingNavItem {
  id: string;
  label: string;
  href?: string;
  dropdownItems?: { label: string; href?: string; id?: string; icon: any; description?: string }[];
}

// Simple helper for relative time
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 66);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setHoveredNav(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);
  const [githubData, setGithubData] = useState<{ totalCommits: string; recentCommits: GitHubCommit[] } | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/github/stats");
        if (res.ok) {
          const data = await res.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      } finally {
        setIsLoadingGithub(false);
      }
    }
    fetchStats();
  }, []);

  const features = [
    { icon: Brain, title: "Socratic Scaffolding", description: "Enforces the 'Struggle'—a 4-layer architecture ensuring pedagogical depth over simple answer-retrieval.", tag: "Pedagogical" },
    { icon: SquareFunction, title: "0.92 Notation Density", description: "Real-time, symbolic LaTeX rendering verified for professional academic standards and precision.", tag: "Mathematical" },
    { icon: Orbit, title: "Inference-Time Scaffolding", description: "No fine-tuning, no black-box retraining. Every Socratic behaviour is enforced at inference-time — observable, auditable, reproducible.", tag: "Verifiable" },
    { icon: Calculator, title: "Constraint-Led Derivation", description: "Students are guided through the derivation, not handed it. The AI architecture makes bypassing the learning process structurally impossible.", tag: "Architecture" },
    { icon: Waypoints, title: "Shared Waypoints", description: "Integrate high-precision, peer-validated physics modules and benchmarks into your curriculum.", tag: "Network" },
    { icon: ShieldUser, title: "Verifiable Integrity", description: "Rigid schema constraints block 'homework-solving' hacks and ensure academic honesty at scale.", tag: "Verifiable" },
    { icon: FileUp, title: "Evidence Logistics", description: "End-to-end support for multi-format coursework, including OCR-ready PDF and image uploads.", tag: "Logistics" },
    { icon: Users, title: "Departmental Scale", description: "Role-based access designed for deans and instructors to manage massive student cohorts efficiently.", tag: "Enterprise" }
  ];

  const stats = [
    { value: "0%", label: "Direct Answer Rate", sublabel: "Verified by Ph.D. Audit" },
    { value: "+0.67", label: "Pedagogical Uplift", sublabel: "125-Response Ablation Study" },
    { value: "100%", label: "Cost Transparency", sublabel: "Zero-Markup Pass-through" },
    { value: "4-Layer", label: "Constraint Architecture", sublabel: "Inference-Time Scaffolding" }
  ];

  return (
    <div className="min-h-screen relative font-medium scroll-smooth">
      <LoadingScreen />
      <SpaceBackground />

      {/* Sticky Blurred Header */}
      <motion.header
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onMouseLeave={() => setHoveredNav(null)}
      >
        <div className="flex items-center justify-between px-6 py-3.5 max-w-[1400px] mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Logo size={20} className="text-foreground" />
            <span className="text-sm font-extrabold">Scorpio</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            <button
              onMouseEnter={() => setHoveredNav("home")}
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setHoveredNav(null); }}
              className="h-8 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-full transition-colors cursor-pointer"
            >
              Home
            </button>
            {(["platform", "institutional", "docs"] as const).map((id) => (
              <button
                key={id}
                onMouseEnter={() => setHoveredNav(id)}
                className={`h-8 px-4 text-sm font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hoveredNav === id
                    ? "text-foreground bg-muted/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {{ platform: "Platform", institutional: "Institutional", docs: "Docs" }[id]}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${hoveredNav === id ? "rotate-180" : ""}`} />
              </button>
            ))}
            <button
              onClick={() => {
                const element = document.getElementById("faq");
                if (element) {
                  const yOffset = -80;
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
                setHoveredNav(null);
              }}
              className="h-8 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-full transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              {menuOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />
              )}
              <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden" style={{ top: 0, bottom: 0, right: 0, left: "auto" }} hideClose>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <span className="font-extrabold text-lg">Menu</span>
                  <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="rounded-full hover:bg-accent">
                    <span className="sr-only">Close menu</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <nav className="flex flex-col space-y-6 px-6 py-8 flex-1 overflow-y-auto">
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3 block">Platform</span>
                    {[
                      { id: "mission-control", label: "Dashboard", icon: ShieldUser },
                      { id: "challenge", label: "The Challenge", icon: AlertTriangle },
                      { id: "comparison", label: "vs. Other Tools", icon: ChartColumnIncreasing },
                      { id: "math-fidelity", label: "Math Fidelity", icon: SquareFunction },
                      { id: "demos", label: "Demos", icon: PlayCircle },
                      { id: "workflow", label: "Workflow", icon: Zap },
                      { id: "waypoints", label: "Waypoints Network", icon: Waypoints },
                    ].map((item) => (
                      <Button key={item.id} variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]" onClick={() => { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
                        <div className="p-2 bg-primary/5 rounded-lg"><item.icon className="h-4 w-4 text-primary" /></div>
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3 block">Institutional</span>
                    {[
                      { id: "efficacy", label: "Research & Efficacy", icon: Brain },
                      { id: "mission", label: "Philosophy", icon: Orbit },
                      { id: "activity", label: "Activity", icon: Activity },
                      { id: "pricing", label: "Pricing", icon: ChartColumnIncreasing },
                      { id: "faq", label: "FAQ", icon: MessageCircle },
                    ].map((item) => (
                      <Button key={item.id} variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]" onClick={() => { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
                        <div className="p-2 bg-primary/5 rounded-lg"><item.icon className="h-4 w-4 text-primary" /></div>
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3 block">Documentation</span>
                    {[
                      { label: "About Scorpio", href: "/about", icon: Info },
                      { label: "Research & Methodology", href: "/research", icon: Brain },
                      { label: "Request Access", href: "/request-access", icon: KeyRound },
                      { label: "Contact Support", href: "/contact", icon: Mail },
                      { label: "Privacy Policy", href: "/privacy", icon: Shield },
                      { label: "Terms of Service", href: "/terms", icon: FileText },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                        <Button variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]">
                          <div className="p-2 bg-primary/5 rounded-lg"><item.icon className="h-4 w-4 text-primary" /></div>
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </nav>
                <div className="px-6 pb-6 pt-4 border-t bg-muted/5">
                  <div className="flex flex-col gap-2">
                    <Link href="/login"><Button variant="outline" size="lg" className="w-full font-medium cursor-pointer">Login</Button></Link>
                    <Link href="/signup"><Button size="lg" className="w-full font-medium cursor-pointer">Sign up</Button></Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
            <div className="h-5 w-px bg-border/40 hidden lg:block" />
            <Link href="/login" className="hidden lg:block">
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors cursor-pointer">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-semibold px-5 rounded-full cursor-pointer shadow-none hover:opacity-90 transition-opacity">
                Sign up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mega Menu Panel — lives inside header so no mouse-gap issues */}
        <AnimatePresence>
          {hoveredNav && hoveredNav !== "home" && (
            <motion.div
              key={hoveredNav}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 border-b border-border/40 bg-background/98 backdrop-blur-2xl shadow-2xl"
            >
              <div className="container mx-auto px-8 py-8 max-w-6xl">

                {/* Platform */}
                {hoveredNav === "platform" && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Platform</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {[
                        { id: "mission-control", label: "Mission Control", desc: "Central dashboard for instructors and students.", icon: ShieldUser },
                        { id: "challenge", label: "The Challenge", desc: "Understanding the physics education gap.", icon: AlertTriangle },
                        { id: "comparison", label: "vs. Other Tools", desc: "Research-backed comparison against ChatGPT and Khanmigo.", icon: ChartColumnIncreasing },
                        { id: "math-fidelity", label: "Math Fidelity", desc: "Proprietary LaTeX engine for complex derivations.", icon: SquareFunction },
                        { id: "demos", label: "System Demos", desc: "Interactive overview of AI tutoring capabilities.", icon: PlayCircle },
                        { id: "workflow", label: "Workflow", desc: "End-to-end assignment and feedback loop.", icon: Zap },
                        { id: "waypoints", label: "Waypoints Network", desc: "Peer-validated physics modules shared across institutions.", icon: Waypoints },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); setHoveredNav(null); }}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors mt-0.5">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Institutional */}
                {hoveredNav === "institutional" && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Institutional</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {[
                        { id: "efficacy", label: "Efficacy", desc: "Pedagogical methodology and learning outcomes.", icon: Brain },
                        { id: "mission", label: "Philosophy", desc: "The first principles behind constraint-led tutoring.", icon: Orbit },
                        { id: "activity", label: "Development", desc: "Live updates and platform evolution stats.", icon: Activity },
                        { id: "pricing", label: "Cost & Scale", desc: "Institutional pricing and ROI analysis.", icon: ChartColumnIncreasing },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); setHoveredNav(null); }}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors mt-0.5">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Docs */}
                {hoveredNav === "docs" && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Documentation</p>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {[
                        { href: "/about", label: "About Scorpio", desc: "Our mission to revolutionize physics education.", icon: Info },
                        { href: "/research", label: "Research & Methodology", desc: "Deep dive into our 4-layer AI architecture.", icon: Brain },
                        { href: "/request-access", label: "Request Access", desc: "Apply for an organization invite code to get started.", icon: KeyRound },
                        { href: "/contact", label: "Contact Us", desc: "Get help from our institutional success team.", icon: Mail },
                        { href: "/privacy", label: "Privacy Policy", desc: "FERPA/GDPR compliant data infrastructure.", icon: Shield },
                        { href: "/terms", label: "Terms of Service", desc: "Standard institutional and usage terms.", icon: FileText },
                      ].map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setHoveredNav(null)}>
                          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors mt-0.5">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary/40 origin-left z-50"
          style={{ scaleX }}
        />
      </motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-6 pt-2 pb-12 text-center relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center">

          {/* Atmospheric background */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
            {/* Primary central glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/8 blur-[140px] rounded-full" />
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[200px] bg-primary/4 blur-[90px] rounded-full" />
            <div className="absolute bottom-[15%] right-[8%] w-[350px] h-[220px] bg-primary/4 blur-[100px] rounded-full" />

            {/* Floating equations — primary layer */}
            {[
              { eq: "F = ma",         x: "8%",  y: "20%", delay: 0,   dur: 8  },
              { eq: "E = mc²",        x: "80%", y: "15%", delay: 1.5, dur: 10 },
              { eq: "∇ × B = μ₀J",   x: "12%", y: "72%", delay: 0.8, dur: 9  },
              { eq: "ΔS ≥ 0",         x: "75%", y: "68%", delay: 2,   dur: 11 },
              { eq: "p = ℏk",         x: "50%", y: "82%", delay: 1.2, dur: 7  },
              { eq: "∮ E·dA = Q/ε₀",  x: "88%", y: "44%", delay: 3,  dur: 12 },
              { eq: "λ = h/mv",       x: "3%",  y: "46%", delay: 2.5, dur: 9  },
            ].map((p, i) => (
              <motion.span
                key={i}
                className="absolute text-sm font-semibold text-primary/30 dark:text-primary/40 whitespace-nowrap"
                style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 0.6, 0.6, 0], y: [10, -30] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
              >
                {p.eq}
              </motion.span>
            ))}

            {/* Floating equations — secondary faint layer */}
            {[
              { eq: "∇²φ = ρ/ε₀",    x: "62%", y: "8%",  delay: 4,   dur: 13 },
              { eq: "v = fλ",          x: "27%", y: "11%", delay: 5.5, dur: 8  },
              { eq: "τ = Iα",          x: "91%", y: "78%", delay: 2.2, dur: 10 },
              { eq: "KE = ½mv²",       x: "38%", y: "90%", delay: 6,   dur: 11 },
              { eq: "L = Iω",          x: "1%",  y: "88%", delay: 3.8, dur: 9  },
            ].map((p, i) => (
              <motion.span
                key={`s${i}`}
                className="absolute text-xs font-medium text-primary/15 dark:text-primary/20 whitespace-nowrap"
                style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 0.4, 0.4, 0], y: [6, -20] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.75, 1] }}
              >
                {p.eq}
              </motion.span>
            ))}
          </div>

          <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-8">

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-bold tracking-widest text-primary/90 uppercase">Built for Physics Educators</span>
            </motion.div>

            {/* Logo */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 bg-primary/15 blur-3xl rounded-full" />
              </div>
              <motion.div
                className="relative cursor-pointer"
                onClick={() => setLogoRotation(prev => prev + 360)}
                animate={{ rotate: logoRotation, y: [0, -8, 0] }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{
                  rotate: { type: "spring", stiffness: 60, damping: 12 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  default: { duration: 2.5, ease: [0.16, 1, 0.3, 1] }
                }}
              >
                <Logo size={72} className="text-foreground drop-shadow-[0_0_30px_rgba(var(--primary),0.3)] dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all duration-300" />
              </motion.div>
            </div>

            {/* Headline */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
                The World&apos;s Only
              </h1>
              <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.05]">
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">AI Physics LMS</span>
                  <span className="absolute inset-x-0 bottom-1 h-[3px] bg-primary/40 rounded-full" />
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              The first verifiable framework for Socratic physics tutoring.
              Enforce the struggle with a 4-layer constraint architecture
              that makes bypassing the learning process{" "}
              <span className="text-foreground font-semibold">structurally impossible.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <Link href="/request-access">
                <Button size="lg" className="w-full sm:w-auto font-bold text-sm px-7 h-11 rounded-full shadow-[0_0_24px_rgba(var(--primary),0.25)] hover:shadow-[0_0_36px_rgba(var(--primary),0.45)] transition-all cursor-pointer gap-2">
                  <KeyRound className="h-4 w-4" />
                  Request Access
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => { const el = document.getElementById("demos"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                className="w-full sm:w-auto font-semibold text-sm px-7 h-11 rounded-full border border-border/60 bg-background/40 backdrop-blur-md hover:bg-muted/40 cursor-pointer inline-flex items-center justify-center gap-2 transition-all text-foreground/80 hover:text-foreground"
              >
                <PlayCircle className="h-4 w-4" />
                Watch Demo
              </button>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              className="w-full grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40 mt-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 1.1 } }
              }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center justify-center gap-1 py-5 px-4 bg-background/70 backdrop-blur-sm hover:bg-muted/30 transition-colors group"
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                >
                  <span className="text-2xl font-black text-foreground tabular-nums">{stat.value}</span>
                  <span className="text-[11px] font-bold text-foreground/75 leading-tight text-center">{stat.label}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest text-center">{stat.sublabel}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.6 }}
          >
            <button
              aria-label="Scroll down"
              onClick={() => { const el = document.getElementById("mission-control"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
              className="flex flex-col items-center gap-1.5 group focus:outline-none"
              type="button"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">Scroll</span>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
                <ChevronDown className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </motion.div>
            </button>
          </motion.div>

        </section>

        {/* Container Scroll Section */}
        <div id="mission-control" className="flex flex-col pt-0 md:pt-10">
          <ContainerScroll
            titleComponent={
              <div className="flex flex-col items-center justify-center mb-0 md:mb-10">
                 <Link href="/signup" className="mb-4">
                    <Badge className="h-8 px-4 rounded-full flex items-center justify-center gap-2 border-primary/20 bg-primary/10 hover:bg-primary/20 backdrop-blur-md" variant="secondary">
                       <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                       <span className="text-primary font-medium">Faculty Command Center</span>
                    </Badge>
                  </Link>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center text-foreground pb-4 leading-tight">
                  Your Faculty <br />
                  <span className="text-5xl md:text-7xl lg:text-[6rem] font-bold mt-1 leading-none text-foreground">
                    Mission Control.
                  </span>
                </h1>
              </div>
            }
          >
            <Image
              src="/mission-control.png"
              alt="Scorpio Teacher Dashboard showing assignments and student progress"
              height={1280}
              width={2650}
              className="mx-auto rounded-2xl object-contain h-full w-full bg-zinc-900"
              draggable={false}
            />
          </ContainerScroll>
        </div>

        {/* Challenge Section */}
        <section id="challenge" className="container mx-auto px-6 py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[120px] pointer-events-none -z-10" />
          {/* Faint background equations — atmosphere only */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
            {[
              { eq: "ΔE · Δt ≥ ℏ/2", x: "2%",  y: "12%", delay: 1,   dur: 14 },
              { eq: "F = -kx",         x: "85%", y: "20%", delay: 3,   dur: 11 },
              { eq: "∇ · E = ρ/ε₀",   x: "78%", y: "75%", delay: 0.5, dur: 13 },
              { eq: "pV = nRT",         x: "5%",  y: "80%", delay: 2.5, dur: 10 },
            ].map((p, i) => (
              <motion.span
                key={i}
                className="absolute text-xs text-primary/10 dark:text-primary/15 whitespace-nowrap"
                style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0.5, 0], y: [0, -18] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
              >
                {p.eq}
              </motion.span>
            ))}
          </div>
          
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
              <div className="space-y-6 max-w-2xl">
                <motion.div
                  className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-bold tracking-widest uppercase text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                  <span>Why Other Tools Fail Educators</span>
                </motion.div>
                <motion.h2
                  className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Every AI physics tool has the <span className="text-primary italic">same fatal flaw.</span>
                </motion.h2>
              </div>
              <motion.p 
                className="text-muted-foreground text-lg font-medium max-w-md pb-2 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Traditional platforms give students the answer. Without the struggle of derivation, there is no learning — only the appearance of it.
              </motion.p>
            </div>

            <motion.div
              className="grid md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {[
                {
                  icon: <Brain className="size-6 text-primary" />,
                  label: "AI Gives Away the Answer",
                  desc: "ChatGPT, Wolfram, Khan AI — every competing tool completes the derivation for students. Learning requires the struggle. These tools bypass it entirely.",
                },
                {
                  icon: <GraduationCap className="size-6 text-primary" />,
                  label: "Misconceptions Compound Silently",
                  desc: "A student who misunderstands conservation of momentum will misapply it for the rest of the course. The only cure is catching the flaw in the derivation — not after the exam.",
                },
                {
                  icon: <ChartColumnIncreasing className="size-6 text-primary" />,
                  label: "Grading Without Understanding",
                  desc: "A submitted answer tells you what a student wrote, not what they understood. Scorpio captures the derivation process itself — every step, every constraint applied.",
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`group relative overflow-hidden space-y-4 p-8 rounded-3xl border border-border/60 bg-card/10 backdrop-blur-md hover:bg-card/20 hover:border-primary/20 transition-all duration-500`}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-background border border-border flex items-center justify-center mb-6 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{item.label}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none -z-10" />
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center space-y-4 mb-16">
              <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Independent Research · 125-Response Ablation Study</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Not another AI chatbot wrapper.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Every metric below is sourced from our published ablation study — blinded scoring by an independent Ph.D. auditor across 25 physics problems.
              </p>
              <div className="flex justify-center pt-2">
                <Link href="/research">
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors cursor-pointer">
                    Read the full methodology →
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Table */}
            <motion.div
              className="rounded-3xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {/* Table header */}
              <div className="grid grid-cols-5 bg-muted/30 border-b border-border/50 px-6 py-4">
                <div className="col-span-1 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Capability</div>
                <div className="col-span-1 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Scorpio</span>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Full Stack</span>
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">ChatGPT / Gemini</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Khanmigo</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Human Tutor</span>
                </div>
              </div>

              {/* Rows */}
              {[
                {
                  capability: "Direct Answer Rate",
                  footnote: "Ablation study, 25 procedural physics problems",
                  scorpio: { val: "0%", good: true },
                  chatgpt: { val: "~100%", good: false },
                  khan: { val: "~40%", good: false },
                  human: { val: "Varies", good: null },
                },
                {
                  capability: "Pedagogical Quality Score",
                  footnote: "Ph.D. blinded holistic audit, 5-point scale",
                  scorpio: { val: "4.62 / 5", good: true },
                  chatgpt: { val: "4.38 / 5¹", good: false },
                  khan: { val: "No data", good: null },
                  human: { val: "~4.5 / 5", good: null },
                },
                {
                  capability: "LaTeX Notation Density",
                  footnote: "Per 100 words, ablation study",
                  scorpio: { val: "0.92", good: true },
                  chatgpt: { val: "0.22¹", good: false },
                  khan: { val: "Limited", good: false },
                  human: { val: "Whiteboard", good: null },
                },
                {
                  capability: "Socratic Questions / Response",
                  footnote: "Avg. across 125-response study",
                  scorpio: { val: "1.25", good: true },
                  chatgpt: { val: "1.00¹", good: false },
                  khan: { val: "~0.8", good: false },
                  human: { val: "~1.5", good: null },
                },
                {
                  capability: "Constraint Architecture",
                  footnote: "Inference-time, no fine-tuning required",
                  scorpio: { val: "4-Layer Enforced", good: true },
                  chatgpt: { val: "None", good: false },
                  khan: { val: "Prompt-only", good: false },
                  human: { val: "Implicit", good: null },
                },
                {
                  capability: "Cost Transparency",
                  footnote: "Per-student, per-request visibility",
                  scorpio: { val: "100% — zero markup", good: true },
                  chatgpt: { val: "Fixed subscription", good: false },
                  khan: { val: "Fixed subscription", good: false },
                  human: { val: "$40–120 / hr", good: false },
                },
                {
                  capability: "Verifiable / Auditable",
                  footnote: "Published methodology, reproducible results",
                  scorpio: { val: "Yes — open study", good: true },
                  chatgpt: { val: "No", good: false },
                  khan: { val: "No", good: false },
                  human: { val: "Subjective", good: null },
                },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  className={`grid grid-cols-5 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <div className="col-span-1 pr-4">
                    <p className="text-sm font-bold text-foreground">{row.capability}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">{row.footnote}</p>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-black text-primary bg-primary/8 px-3 py-1 rounded-full">{row.scorpio.val}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`text-sm font-semibold ${row.chatgpt.good === false ? "text-muted-foreground/50" : "text-foreground"}`}>{row.chatgpt.val}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`text-sm font-semibold ${row.khan.good === false ? "text-muted-foreground/50" : "text-foreground"}`}>{row.khan.val}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-semibold text-muted-foreground/70">{row.human.val}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Footnotes */}
            <div className="mt-6 space-y-1 px-2">
              <p className="text-[10px] text-muted-foreground/50 font-medium">¹ Baseline Gemini 2.5 Flash (NONE constraint level) from Scorpio ablation study — used as proxy for unconstrained LLM performance. ChatGPT results are directionally comparable.</p>
              <p className="text-[10px] text-muted-foreground/50 font-medium">Khanmigo and human tutor figures are estimates based on published third-party educational research. Scorpio figures are from our 125-response expert-validated internal study.</p>
              <p className="text-[10px] text-muted-foreground/50 font-medium">Full methodology, raw data, and blinded scoring rubric available at <Link href="/research" className="text-primary/70 hover:text-primary underline underline-offset-2">scorpio/research</Link>.</p>
            </div>
          </motion.div>
        </section>

        {/* Features Grid section removed: now integrated into demonstration gallery as Core Capabilities */}

        {/* Featured: Mathematical Precision */}
        <section id="math-fidelity" className="container mx-auto px-6 py-32 relative">
          <div className="max-w-6xl mx-auto rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row items-center gap-12 group">
            <div className="flex-1 p-12 lg:p-20 space-y-8">
              <motion.div 
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <SquareFunction className="h-3.5 w-3.5" />
                <span>The Architecture</span>
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Mathematical <span className="text-primary italic">Fidelity.</span></h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                  Scorpio features a custom-built LaTeX engine designed specifically for physics pedagogy. From complex integrals to 4-vector notation, our interface ensures symbols are rendered with publication-grade precision.
                </p>
              </div>
              <motion.ul 
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.4
                    }
                  }
                }}
              >
                 {[
                   "Intuitive Math Builder UI",
                   "Real-time KaTeX Syntax Validation",
                   "Waypoints Reference System",
                   "Dynamic Preview & Correction"
                 ].map((text, i) => (
                   <motion.li 
                    key={i} 
                    className="flex items-center gap-3 text-sm font-bold text-foreground/80"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                   >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {text}
                   </motion.li>
                 ))}
              </motion.ul>
            </div>
            <div className="flex-1 w-full lg:w-1/2 p-6 lg:p-12 relative">
               <Dialog>
                  <DialogTrigger asChild>
                     <motion.div 
                        className="relative rounded-2xl overflow-hidden border border-border shadow-3xl bg-background group-hover:opacity-80 transition-opacity duration-700 cursor-pointer"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                     >
                        <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Maximize2 className="h-8 w-8 text-white" />
                        </div>
                        <Image 
                          src="/demos/math-builder.png" 
                          alt="Scorpio Integral Builder" 
                          width={600} 
                          height={400} 
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                     </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                    <DialogTitle className="sr-only">Mathematical Precision Interface</DialogTitle>
                    <Image 
                      src="/demos/math-builder.png" 
                      alt="Scorpio Integral Builder Full View" 
                      width={1200} 
                      height={800} 
                      className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
                    />
                  </DialogContent>
               </Dialog>
               {/* Decorative background blur */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </section>

        {/* Demonstration Gallery */}
        <section id="demos" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
          
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <motion.div 
                 className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
               >
                 <MonitorPlay className="h-3.5 w-3.5" />
                 <span>Instructional Showcases</span>
               </motion.div>
               <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System Demonstrations.</h2>
            </div>

            <Tabs defaultValue="overview" className="w-full">
               <div className="flex justify-center mb-16">
                 <TabsList className="bg-background/20 backdrop-blur-md border border-border/50 p-1 h-auto rounded-full flex flex-wrap justify-center">
                    <TabsTrigger value="overview" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                       <PlayCircle className="h-4 w-4" />
                       Full Platform Walkthrough
                    </TabsTrigger>
                    <TabsTrigger value="capabilities" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                       <Presentation className="h-4 w-4" />
                       Core Capability Demos
                    </TabsTrigger>
                 </TabsList>
               </div>

               <TabsContent value="overview" className="mt-4 focus-visible:outline-none" forceMount>
                  <motion.div 
                    className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border/60 bg-black/40 shadow-3xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                     <video 
                       src="/demos/scorpio-demo.mp4" 
                       controls 
                       className="w-full h-auto aspect-video cursor-pointer"
                     />
                  </motion.div>
                  <div className="mt-10 text-center max-w-3xl mx-auto space-y-4">
                     <p className="text-muted-foreground text-lg font-medium leading-relaxed italic">
                        "A comprehensive 5-minute deep-dive into the architectural nuances and pedagogical advantages of the Scorpio framework."
                     </p>
                  </div>
               </TabsContent>

               <TabsContent value="capabilities" className="mt-8 focus-visible:outline-none" forceMount>
                  <div className="flex justify-center">
                    <DemoCarousel />
                  </div>
                  <div className="mt-10 text-center max-w-3xl mx-auto">
                     <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.25em] opacity-60">
                        Modular Breakdowns of Primary Instructional Workflows
                     </p>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Workflow Section (Combined) */}
        <section id="workflow" className="container mx-auto px-6 py-40 relative">
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
             <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[180px]" />
             <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[140px]" />
          </div>
          
          <motion.div
            className="text-center mb-24 space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Two Interfaces. One System.</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Classroom. Reimagined.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">You control the AI constraints. Students experience the Socratic method. Both sides get exactly what they need — without compromise.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-20 max-w-7xl mx-auto relative px-4">
            {/* Center Connector (Hidden on mobile) */}
            <div className="absolute left-1/2 top-40 bottom-40 w-px bg-border hidden lg:block -translate-x-1/2 border-dashed border-l" />

            {/* Teacher Path */}
            <motion.div
              className="space-y-12 relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-center gap-6 mb-10 group">
                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 transition-all duration-500 shadow-sm">
                  <Presentation className="h-7 w-7 text-primary" />
                </div>
                <div>
                   <h3 className="text-2xl font-extrabold tracking-tight">Instructional Design</h3>
                   <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Faculty Interface</p>
                </div>
              </div>

              {/* Added Image Modal for Teachers */}
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div 
                    className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20">
                          <Maximize2 className="h-6 w-6 text-white" />
                       </div>
                    </div>
                    <Image 
                      src="/demos/teacher-editor.png" 
                      alt="Scorpio Question Editor" 
                      width={800} 
                      height={600} 
                      className="w-full h-[300px] object-cover object-top"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                       <p className="text-xs font-bold text-white uppercase tracking-widest">View Faculty Question Editor Interface</p>
                    </div>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Instructional Design Interface</DialogTitle>
                  <Image 
                    src="/demos/teacher-editor.png" 
                    alt="Scorpio Question Editor Full View" 
                    width={1920} 
                    height={1080} 
                    className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
                  />
                </DialogContent>
              </Dialog>

              <div className="space-y-10 pl-5 border-l border-border/60">
                {[
                  { title: "Rigorous Content Integration", desc: "Construct multi-modal assignments with full LaTeX support and resource linking.", icon: <FileText className="h-3.5 w-3.5" /> },
                  { title: "Pedagogical Constraint Logic", desc: "Define AI-tutoring parameters to enforce specific problem-solving pathways.", icon: <Brain className="h-3.5 w-3.5" /> },
                  { title: "Facilitated Assessment", desc: "Review conceptual feedback loops and validate student derivations with AI assistance.", icon: <ChartColumnIncreasing className="h-3.5 w-3.5" /> },
                  { title: "Real-Time Telemetry", desc: "Monitor class-wide conceptual bottlenecks via dynamic statistical dashboards.", icon: <Activity className="h-3.5 w-3.5" /> }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="relative group "
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-primary transition-colors duration-500" />
                    <div className="space-y-2">
                       <h4 className="font-bold text-lg leading-none flex items-center gap-2">
                          {item.title}
                       </h4>
                       <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Student Path */}
            <motion.div
              className="space-y-12 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-center gap-6 mb-10 lg:flex-row-reverse group">
                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-secondary/40 transition-all duration-500 shadow-sm">
                  <GraduationCap className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div className="lg:text-right">
                   <h3 className="text-2xl font-extrabold tracking-tight">Conceptual Discovery</h3>
                   <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Student Interface</p>
                </div>
              </div>

              {/* Added Image Modal for Students */}
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div 
                    className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20">
                          <Maximize2 className="h-6 w-6 text-white" />
                       </div>
                    </div>
                    <Image 
                      src="/demos/ai-tutor.png" 
                      alt="Scorpio AI Tutor Chat" 
                      width={800} 
                      height={600} 
                      className="w-full h-[300px] object-cover object-top"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20 lg:text-right">
                       <p className="text-xs font-bold text-white uppercase tracking-widest">View AI Tutor Interface</p>
                    </div>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                  <DialogTitle className="sr-only">Conceptual Discovery Interface</DialogTitle>
                  <Image 
                    src="/demos/ai-tutor.png" 
                    alt="Scorpio AI Tutor Full View" 
                    width={1920} 
                    height={1080} 
                    className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
                  />
                </DialogContent>
              </Dialog>

              <div className="space-y-10 lg:text-right lg:pr-5 lg:border-r lg:border-l-0 border-l border-border/60 pl-5 lg:pl-0">
                {[
                  { title: "Adaptive Socratic Guidance", desc: "Engage with a constraint-led AI specialized in guiding derivations.", icon: <SquareFunction className="h-3.5 w-3.5" /> },
                  { title: "Immersive Problem Solving", desc: "Interact with physics challenges through high-fidelity math rendering.", icon: <Orbit className="h-3.5 w-3.5" /> },
                  { title: "Continuous Feedback Loop", desc: "Receive immediate sanity checks for unit consistency and physical logic.", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                  { title: "Synthesized Learning Path", desc: "Access a collection of Waypoints tailored to current coursework.", icon: <MessageCircle className="h-3.5 w-3.5" /> }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="absolute lg:-right-[25px] -left-[25px] lg:left-auto top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-secondary transition-colors duration-500" />
                    <div className="space-y-2">
                       <h4 className="font-bold text-lg leading-none flex items-center gap-2 lg:flex-row-reverse">
                          {item.title}
                       </h4>
                       <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm lg:ml-auto">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Institutional Efficacy Section */}
        <section id="efficacy" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          {/* Ambient equations */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
            {[
              { eq: "S = k ln Ω",        x: "1%",  y: "18%", delay: 0,   dur: 12 },
              { eq: "H = U + pV",         x: "88%", y: "10%", delay: 2,   dur: 10 },
              { eq: "c = 1/√(μ₀ε₀)",     x: "82%", y: "82%", delay: 1.5, dur: 13 },
              { eq: "σ = F/A",            x: "4%",  y: "72%", delay: 3.5, dur: 9  },
            ].map((p, i) => (
              <motion.span
                key={i}
                className="absolute text-xs text-primary/10 dark:text-primary/15 whitespace-nowrap"
                style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.45, 0.45, 0], y: [0, -16] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
              >
                {p.eq}
              </motion.span>
            ))}
          </div>
          
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-xs font-bold tracking-widest uppercase text-secondary-foreground"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Evidence-Based Results</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-foreground">
                  Validated Institutional <span className="text-secondary-foreground italic">Efficacy.</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
                  Based on our 125-response ablation study, Scorpio's framework successfully eliminates direct solution delivery while achieving expert-validated gains in pedagogical quality and symbolic precision.
                </p>
              </div>
              
              <motion.div 
                className="grid sm:grid-cols-2 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                 {[
                   { label: "Direct Answer Rate", value: "0%", active: true },
                   { label: "Expert Score Gain", value: "+0.67", active: true },
                   { label: "LaTeX Density", value: "0.92", active: false },
                   { label: "Pedagogical Quality", value: "4.62", active: false }
                 ].map((stat, i) => (
                   <motion.div 
                    key={i} 
                    className="p-6 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm space-y-2 group hover:border-secondary/30 transition-colors"
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 }
                    }}
                   >
                      <div className="text-3xl font-black text-foreground group-hover:text-secondary-foreground transition-colors">{stat.value}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                   </motion.div>
                 ))}
              </motion.div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link href="/research" target="_blank">
                  <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all gap-3 group">
                    <BookOpen className="h-5 w-5 text-secondary-foreground group-hover:scale-110 transition-transform" />
                    View Scorpio Research
                  </Button>
                </Link>
                <Link href="/demos/comprehensive_metrics.pdf" target="_blank">
                  <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all gap-3 group">
                    <FileDown className="h-5 w-5 text-secondary-foreground group-hover:scale-110 transition-transform" />
                    Download Comprehensive Metrics
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 w-full lg:max-w-md"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
               <div className="relative aspect-square rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center space-y-6 overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="h-20 w-20 rounded-3xl bg-background border border-border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="h-10 w-10 text-secondary-foreground" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black italic">PhD-Validated Framework.</h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                       Subjected to a rigorous 625-pass internal assessment battery and independently audited by Physics PhDs on a blinded 30-item stratified subset.
                    </p>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4 w-full relative z-10 px-4">
                     <div className="text-left border-l-2 border-secondary/30 pl-3">
                        <div className="text-lg font-black leading-none">625</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Internal Assessments</div>
                     </div>
                     <div className="text-left border-l-2 border-secondary/30 pl-3">
                        <div className="text-lg font-black leading-none">0.51 κ</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Ph.D. Alignment</div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        {/* Waypoints Network Section */}
        <section id="waypoints" className="container mx-auto px-6 py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[130px] pointer-events-none -z-10" />
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            {/* Header */}
            <div className="text-center space-y-4 mb-20">
              <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Collaborative Infrastructure</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Waypoints Network</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                High-precision, peer-validated physics modules built by instructors — shared across institutions. Drop them straight into your curriculum.
              </p>
            </div>

            {/* Main split layout */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left: concept */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="space-y-6">
                  {[
                    {
                      icon: Globe,
                      title: "Shared by real instructors",
                      body: "Every Waypoint is authored by a verified Scorpio teacher — not generated. You know exactly where the pedagogy comes from.",
                      color: "text-blue-500",
                      bg: "bg-blue-500/8",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Peer-validated before publish",
                      body: "Modules go through a structured review before they enter the network. Mathematical notation, Socratic depth, and accuracy are checked.",
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/8",
                    },
                    {
                      icon: Zap,
                      title: "Drop into any assignment",
                      body: "Browse, preview, and attach Waypoints to your assignments in seconds. No reformatting, no copy-paste — structurally compatible out of the box.",
                      color: "text-violet-500",
                      bg: "bg-violet-500/8",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-4 p-5 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-border/70 transition-colors"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground mb-1">{item.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: mock Waypoints browser card */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl">
                  {/* Card header */}
                  <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Waypoints className="h-4 w-4 text-primary" />
                      <span className="text-sm font-black tracking-tight">Waypoint Browser</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary">Network</Badge>
                  </div>
                  {/* Waypoint entries */}
                  <div className="p-4 space-y-3">
                    {[
                      { title: "Rotational Dynamics — Torque & Inertia", tag: "Mechanics", author: "Dr. A. Patel", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                      { title: "Maxwell's Equations — Integral Form", tag: "E&M", author: "Prof. R. Chen", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                      { title: "Quantum Tunneling — WKB Approximation", tag: "Quantum", author: "Dr. S. Okafor", badge: "Under Review", badgeColor: "bg-amber-500/10 text-amber-500" },
                      { title: "Thermodynamic Cycles — Carnot Engine", tag: "Thermo", author: "Prof. L. Torres", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                    ].map((w, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/30 bg-background/50 hover:border-border/60 hover:bg-background/80 transition-all group cursor-default"
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{w.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{w.tag} · {w.author}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${w.badgeColor}`}>{w.badge}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between bg-muted/10">
                    <span className="text-[10px] text-muted-foreground font-semibold">Example modules — network launching with early access</span>
                    <span className="text-[10px] text-primary font-bold cursor-default">Coming soon →</span>
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[80px] -z-10" />
              </motion.div>
            </div>

            {/* Bottom stats strip */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {[
                { value: "Early", label: "Access Now Open", sub: "Be first to shape the network" },
                { value: "100%", label: "Instructor-Authored", sub: "No AI-generated content" },
                { value: "Zero", label: "Reformatting Required", sub: "Drop-in compatible by design" },
                { value: "Growing", label: "Module Library", sub: "Expanding with every school" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-center hover:border-border/70 transition-colors"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs font-bold text-foreground/80 mt-1">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="container mx-auto px-6 py-32">
          <motion.div 
            className="max-w-5xl mx-auto rounded-[3.5rem] p-12 md:p-20 border border-primary/20 bg-primary/5 backdrop-blur-xl relative overflow-hidden shadow-2xl group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute -top-24 -right-24 p-12 opacity-[0.03] transition-opacity duration-1000"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            >
               <Logo size={450} className="text-primary" />
            </motion.div>
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Our Philosophy</div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground">The constraint is the <span className="text-primary underline underline-offset-8 decoration-2 decoration-primary/30">curriculum.</span></h2>
              </div>
              <p className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed max-w-3xl">
                We built Scorpio with one belief: a student who derives the answer will never forget it. Our constraint architecture doesn’t restrict AI — it enforces the same rigor you apply in your classroom.
              </p>
              <p className="text-base text-muted-foreground/60 font-medium leading-relaxed max-w-2xl">
                No shortcuts. Every AI response is Socratic by design — pushing students back to first principles, never handing them the next step.
              </p>
              <div className="flex flex-wrap gap-4 pt-6">
                 <Badge variant="outline" className="px-5 py-2 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">Pedagogy-First Architecture</Badge>
                 <Badge variant="outline" className="px-5 py-2 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">Institutional Integrity</Badge>
                 <Badge variant="outline" className="px-5 py-2 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">Research-Driven</Badge>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Recent Development Activity */}
        <section id="activity" className="container mx-auto px-6 py-20">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">Recent Development</h2>
                    {githubData ? (
                      <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold">
                        {githubData.totalCommits} Commits
                      </Badge>
                    ) : (
                      <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                    )}
                 </div>
                <p className="text-muted-foreground font-medium text-sm">Real-time telemetry from the Scorpio core repository.</p>
              </div>
              <Link 
                href="https://github.com/RushilMahadevu/scorpio/commits/main" 
                target="_blank"
                className="text-sm font-bold text-primary hover:underline flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {isLoadingGithub ? (
                // Loading Skeletons
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border bg-card/10 flex items-start gap-4 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : githubData?.recentCommits.map((commit, i) => (
                <motion.div
                  key={commit.sha}
                  className="p-5 rounded-2xl border bg-card/10 hover:bg-card/30 transition-all group flex items-start gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Github className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{commit.sha.substring(0, 7)}</span>
                      <span className="text-xs text-muted-foreground font-medium">• {getRelativeTime(commit.date)}</span>
                    </div>
                    <p className="font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                      {commit.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                      By {commit.author}
                    </p>
                  </div>
                  <Link 
                    href={commit.url} 
                    target="_blank"
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-2 rounded-full hover:bg-muted"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
              {!isLoadingGithub && !githubData && (
                <div className="text-center p-10 border border-dashed rounded-2xl">
                  <p className="text-sm text-muted-foreground">Unable to load activity. Check <Link href="https://github.com/RushilMahadevu/scorpio" className="underline">GitHub</Link> for latest updates.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Pricing + Cost Comparison */}
        <section id="pricing" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px] pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto space-y-20">

            {/* Section Header */}
            <div className="text-center space-y-5">
              <motion.div
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transparent Pricing</span>
              </motion.div>
              <motion.h2
                className="text-4xl md:text-6xl font-black tracking-tighter leading-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                AI-powered physics<br />
                <span className="text-primary italic">for less than a textbook.</span>
              </motion.h2>
              <motion.p
                className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                One flat subscription. Unlimited students. Zero markup on AI. While competitors charge{" "}
                <span className="text-foreground font-bold">$5–$12 per student per month</span>, Scorpio charges{" "}
                <span className="text-emerald-500 font-bold">$4.99 total</span>.
              </motion.p>
            </div>

            {/* Social Proof Strip */}
            <motion.div
              className="flex flex-wrap items-center justify-between gap-6 px-8 py-5 rounded-2xl border border-border/40 bg-muted/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {[
                { value: "98%",    label: "cheaper than industry average at scale" },
                { value: "$0.08",  label: "effective per-student cost at 250 students" },
                { value: "∞",      label: "students on one flat subscription" },
                { value: "0×",     label: "markup on Google DeepMind AI costs" },
              ].map((stat, i) => (
                <div key={i} className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground max-w-[140px] leading-tight">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Pricing Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {/* Monthly */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="relative p-8 border border-border bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl shadow-sm"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">Monthly</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">$4.99</span>
                    <span className="text-muted-foreground text-base font-medium">/mo</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Flexible access, cancel anytime.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Teacher AI Dashboard", "Network Waypoints", "Real-time Mastery Views", "Priority Support"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
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

              {/* Yearly */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="relative p-8 border-2 border-primary bg-primary/[0.02] rounded-2xl flex flex-col gap-6 overflow-hidden transition-all hover:scale-[1.01] duration-300 shadow-lg shadow-primary/5"
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-4 py-1.5 font-black uppercase tracking-widest rounded-bl-xl">
                  Best Value
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-0.5 mb-4">Yearly</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">$29.88</span>
                    <span className="text-muted-foreground text-base font-medium">/yr</span>
                  </div>
                  <p className="text-sm text-primary font-bold mt-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> $2.49/mo — save $30 a year
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Everything in Monthly", "Priority AI Processing", "Extended Usage History", "Dept-wide Discount"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-foreground">
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

            {/* Info strip */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
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
              <div className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl text-white space-y-4 overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <h4 className="font-black text-foreground text-sm">Scaling Beyond One School?</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">District-wide deployment, custom SSO, dedicated infrastructure, and volume pricing for 10+ networks.</p>
                  <Link href="/contact">
                    <Button variant="outline" className="cursor-pointer w-full bg-transparent border-white/20 text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl mt-2">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Cost Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CostComparisonChart />
            </motion.div>

          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="container mx-auto px-6 py-40">
          <motion.div
            className="max-w-5xl mx-auto rounded-[3.5rem] p-12 md:p-24 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground">Empower Your <span className="text-primary italic">Department.</span></h2>
                <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                  Deploy in one afternoon. No LMS integration required. Just better physics outcomes from day one — for every student in your roster.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_15px_30px_rgba(var(--primary),0.2)] cursor-pointer transition-all duration-300">
                    Get Faculty Access
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg cursor-pointer font-black border-2 border-border bg-background/50 backdrop-blur-md hover:bg-muted/30 transition-all duration-300">
                    Request Department Demo
                  </Button>
                </Link>
              </div>
              <div className="pt-4">
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">PhD-Validated Framework • FERPA-Ready Infrastructure • Zero Markup AI</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <LandingFAQ />
      </main>

      <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
              <Logo size={24} className="text-foreground" />
              <span className="text-md font-extrabold">Scorpio</span>
            </div>

            {/* Links Section */}
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
                <span className="text-sm font-medium">Research</span>
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

            {/* Credits Section */}
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

      {/* Landing AI Chatbot — visitor-scoped, 10 msg limit, billed to developer account */}
      <LandingChatbot />
    </div>
  );
}