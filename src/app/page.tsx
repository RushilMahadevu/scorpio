"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, Calculator, KeyRound, ShieldUser, MessageCircle, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText, AlertTriangle, ShieldCheck, Maximize2, MonitorPlay, PlayCircle, CheckCircle2, Zap, Lock, Globe
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { LoadingScreen } from "@/components/loading-screen";
import { LandingChatbot } from "@/components/landing-chatbot";
import { LandingFAQ } from "@/components/landing-faq";
import { Comparison } from "@/components/landing/comparison";
import { SystemAccordion } from "@/components/system-accordion";

import { ContainerScroll} from "@/components/ui/container-scroll-animation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Logo = dynamic(() => import("@/components/ui/logo").then(mod => mod.Logo), { ssr: false });

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'teacher') {
        router.push('/teacher');
      } else if (role === 'student') {
        router.push('/student');
      }
    }
  }, [user, role, authLoading, router]);

  const CostComparisonChart = dynamic(() => import("@/components/admin/cost-comparison-chart"), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse" />
});


  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setHoveredNav(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    /* fetchStats removed - activity feed relocated to about page */
  }, []);

  const features = [
    { icon: Brain, title: "Socratic Scaffolding", description: "Enforces the 'Struggle'—a 4-layer architecture ensuring pedagogical depth over simple answer-retrieval.", tag: "Pedagogical" },
    { icon: SquareFunction, title: "0.92 Notation Density", description: "Real-time, symbolic LaTeX rendering verified for professional academic standards and precision.", tag: "Mathematical" },
    { icon: Orbit, title: "Inference-Time Scaffolding", description: "No fine-tuning, no black-box retraining. Every Socratic behaviour is enforced at inference-time — observable, auditable, reproducible.", tag: "Verifiable" },
    { icon: Calculator, title: "Constraint-Led Derivation", description: "Students are guided through the derivation, not handed it. The AI architecture makes bypassing the learning process structurally impossible.", tag: "Architecture" },
    { icon: ShieldUser, title: "Verifiable Integrity", description: "Rigid schema constraints block 'homework-solving' hacks and ensure academic honesty at scale.", tag: "Verifiable" }
  ];

  const stats = [
    { value: "0%", label: "Direct Answer Rate", sublabel: "Verified by Ph.D. Audit" },
    { value: "+0.67", label: "Pedagogical Uplift", sublabel: "125-Response Ablation Study" },
    { value: "100%", label: "Cost Transparency", sublabel: "Zero-Markup Pass-through" },
    { value: "4-Layer", label: "Constraint Architecture", sublabel: "Inference-Time Scaffolding" }
  ];

  return (
    <div className="min-h-screen relative font-medium scroll-smooth">
      <LoadingScreen onFinish={() => setIsLoaded(true)} />
      <SpaceBackground />

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Sticky Blurred Header */}
            <motion.header
              className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
            {[
              { id: "home", label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
              { id: "problem", label: "Problem", target: "problem" },
              { id: "demos", label: "Demos", target: "demos" },
              { id: "efficacy", label: "Research", target: "efficacy" },
              { id: "pricing", label: "Pricing", target: "pricing" },
            ].map((item) => (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredNav(null)}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.target) {
                    const element = document.getElementById(item.target);
                    if (element) {
                      const yOffset = -80;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }
                  setHoveredNav(null);
                }}
                className="h-8 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-full transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            
            {/* Docs Dropdown */}
            <button
              onMouseEnter={() => setHoveredNav("docs")}
              className={`h-8 px-4 text-sm font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
                hoveredNav === "docs"
                  ? "text-foreground bg-muted/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Docs
              <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${hoveredNav === "docs" ? "rotate-180" : ""}`} />
            </button>

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
                      { id: "problem", label: "Problem", icon: AlertTriangle },
                      { id: "demo", label: "Product", icon: PlayCircle },
                      { id: "how-it-works", label: "System", icon: Zap },
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
                      { id: "efficacy", label: "Research", icon: Brain },
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
          {hoveredNav === "docs" && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 border-b border-border/40 bg-background/98 backdrop-blur-2xl shadow-2xl"
            >
              <div className="container mx-auto px-8 py-8 max-w-6xl">
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
        <section id="home" className="container mx-auto px-4 sm:px-6 pt-2 pb-12 text-center relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center">

          {/* Atmospheric background */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
            {/* Primary central glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/8 blur-[140px] rounded-full" />
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[200px] bg-primary/4 blur-[90px] rounded-full" />
            <div className="absolute bottom-[15%] right-[8%] w-[350px] h-[220px] bg-primary/4 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-8">

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-background/50 backdrop-blur-xl shadow-inner shadow-primary/5 hover:bg-primary/5 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </div>
              <span className="text-[11px] font-black tracking-[0.25em] text-foreground/90 uppercase">Built for Physics Educators</span>
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
              className="space-y-4 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.3 }}
            >
              <h1 className="text-5xl md:text-[5.5rem] lg:text-[6.5rem] font-black tracking-tighter text-foreground leading-[1] drop-shadow-xl">
                The World&apos;s Only
              </h1>
              <h1 className="text-5xl md:text-[5.5rem] lg:text-[6.5rem] font-black tracking-tighter leading-[1]">
                <span className="relative inline-block pb-2">
                  <span className="relative z-10 px-2 bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">AI Physics LMS</span>
                  <motion.span 
                    className="absolute inset-x-0 bottom-0 h-[4px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full" 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              The first verifiable framework for Socratic physics tutoring.
              <br className="hidden md:block" /> Enforce the struggle with a 4-layer constraint architecture
              that makes bypassing the learning process{" "}
              <span className="text-foreground font-bold">structurally impossible.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto z-20 relative pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <Link href="/request-access" className="w-full sm:w-auto flex-1 group">
                <Button size="lg" className="w-full font-black text-sm px-8 h-12 rounded-full shadow-[0_0_40px_rgba(var(--primary),0.2)] hover:shadow-[0_0_60px_rgba(var(--primary),0.4)] transition-all duration-300 hover:scale-[1.02] cursor-pointer gap-2 relative overflow-hidden">
                  <KeyRound className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Request Access</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => { const el = document.getElementById("demos"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                className="flex-1 w-full sm:w-auto font-bold text-sm px-8 h-12 rounded-full border border-border/60 bg-background/50 backdrop-blur-xl hover:bg-muted/50 cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] text-foreground/80 hover:text-foreground group"
              >
                <PlayCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
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
                       <span className="text-primary font-medium">Precise AI Tracking</span>
                    </Badge>
                  </Link>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-foreground/90 pb-4 leading-tight">
                  Your Network <br />
                  <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-black mt-1 leading-none text-primary">
                    Granular Analytics
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



        {/* Problem Section */}
        <section id="problem" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <motion.div 
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-[10px] font-black tracking-[0.2em] uppercase text-red-600 dark:text-red-400"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <AlertTriangle className="h-3 w-3" />
                <span>The Cognitive Crisis</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Physics is being <span className="text-red-500 dark:text-red-400 italic">erased</span><br />
                by "Answer Engines."
              </motion.h2>
              <motion.p 
                className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Standard LLMs bypass the productive struggle. They don&apos;t teach physics; they solve it—leaving students with full marks and zero mastery.
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Solution Leakage", 
                  desc: "ChatGPT and Gemini prioritize the 'Final Answer,' effectively making homework a game of copy-paste instead of derivation.", 
                  icon: AlertTriangle,
                  color: "red"
                },
                { 
                  title: "The 'Black Box' Student", 
                  desc: "When students rely on unconstrained AI, instructors lose all insight into the actual learning gaps and misconceptions.", 
                  icon: Brain,
                  color: "red"
                },
                { 
                  title: "Institutional Rot", 
                  desc: "Degrees lose value when procedural mastery can be faked. Scorpio restores the integrity of the physics curriculum.", 
                  icon: Shield,
                  color: "red"
                },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="p-8 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-xl hover:border-red-500/30 transition-all text-left space-y-5 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:bg-red-900 group-hover:text-white transition-all duration-300">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="pt-4 flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/about">
                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors">
                  Read our full mission statement <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* See It Work Section (Merged Demo + Dashboard) */}
        <section id="demos" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
          
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <motion.div 
                 className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
               >
                 <MonitorPlay className="h-3.5 w-3.5" />
                 <span>See It In Action</span>
               </motion.div>
               <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System Demonstrations.</h2>
               <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Verify mastery through real-time observability and pedagogical scaffolding.</p>
            </div>

            <div className="grid lg:grid-cols-1 gap-6 lg:gap-12 items-center">
              <motion.div 
                className="relative rounded-3xl overflow-hidden border border-border/60 bg-black/40 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                 <video 
                   src="/demos/scorpio-demo.mp4" 
                   controls 
                   className="w-full h-auto aspect-video cursor-pointer"
                 />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center space-y-4 mb-8">
                   <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Scan Our Features.</h3>
                   <p className="text-muted-foreground text-base max-w-xl mx-auto font-medium">Explore the unified ecosystem of features designed for physics education.</p>
                </div>
                <SystemAccordion />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Research Section (Relocated Content) */}
        <section id="efficacy">
          <Comparison />
        </section>



        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative">
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
                One flat subscription. Unlimited students. Zero markup on AI.
              </motion.p>
            </div>

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
        <section id="cta" className="container mx-auto px-4 sm:px-6 py-20 md:py-40">
          <motion.div
            className="max-w-5xl mx-auto rounded-[2rem] sm:rounded-[3.5rem] p-8 sm:p-12 md:p-24 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            
            <div className="relative z-10 space-y-8 md:space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground">Empower Your <span className="text-primary italic">Department.</span></h2>
                <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}