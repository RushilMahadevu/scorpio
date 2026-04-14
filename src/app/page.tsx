"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform, animate } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, Calculator, KeyRound, ShieldUser, MessageCircle, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText, AlertTriangle, ShieldCheck, Maximize2, MonitorPlay, PlayCircle, CheckCircle2, Zap, Lock, Globe, Layers, X, Users, Building2
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
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/loading-screen";
import { LandingChatbot } from "@/components/landing-chatbot";
import { LandingFAQ } from "@/components/landing-faq";
import { Comparison } from "@/components/landing/comparison";
import { LayerEfficacyChart } from "@/components/landing/layer-efficacy-chart";
import { SystemAccordion } from "@/components/system-accordion";
import { FloatingPrompts } from "@/components/ui/floating-prompts";
import { SolutionFlowchart } from "@/components/landing/solution-flowchart";
import { Logo } from "@/components/ui/logo";
import { CruxLogo } from "@/components/ui/crux-logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


import { ContainerScroll } from "@/components/ui/container-scroll-animation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}



export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "enterprise">("yearly");
  const [theaterOpen, setTheaterOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { user, role, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Handle theater mode side effects (scroll lock + escape key)
  useEffect(() => {
    if (theaterOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setTheaterOpen(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [theaterOpen]);

  // Logged-in users should be able to view the landing page freely, 
  // UNLESS they have the auto-redirect preference enabled.
  useEffect(() => {
    if (isLoaded && !authLoading && user && role && (profile?.preferences?.autoRedirectPortal ?? true)) {
      if (role === "teacher") {
        router.push("/teacher");
      } else if (role === "student") {
        router.push("/student");
      }
    }
  }, [user, role, profile, authLoading, router, isLoaded]);

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

  // Scroll-driven video pitch: starts tilted up (rotateX positive = top toward viewer),
  // flattens to 0 as user scrolls into the page — classic SaaS hero reveal.
  const videoPitchRaw = useTransform(scrollYProgress, [0, 0.12], [16, 0]);
  const videoScaleRaw = useTransform(scrollYProgress, [0, 0.12], [0.92, 1]);
  const videoPitch = useSpring(videoPitchRaw, { stiffness: 55, damping: 18 });
  const videoScale = useSpring(videoScaleRaw, { stiffness: 55, damping: 18 });

  // Re-sync scroll progress on mount to handle hydration mismatch
  useEffect(() => {
    const syncScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const initialProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      scrollYProgress.set(initialProgress);
      scaleX.set(initialProgress);
    };

    // Initial sync
    syncScroll();

    // Secondary sync after a short delay to ensure layout is complete
    const timeout = setTimeout(syncScroll, 100);
    return () => clearTimeout(timeout);
  }, [scrollYProgress, scaleX]);

  useEffect(() => {
    if (isLoaded && heroVideoRef.current) {
      const playVideo = async () => {
        try {
          if (heroVideoRef.current) {
            heroVideoRef.current.muted = true;
            await heroVideoRef.current.play();
          }
        } catch (err) {
          console.warn("Hero video autoplay was blocked or failed", err);
        }
      };
      playVideo();
    }
  }, [isLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section for nav highlight
      const sections = ["home", "problem", "solution", "demos", "efficacy", "pricing"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveNav(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Brain, title: "Socratic Scaffolding", description: "Enforces the 'Struggle'—a 4-layer architecture ensuring pedagogical depth over simple answer-retrieval.", tag: "Pedagogical" },
    { icon: SquareFunction, title: "0.92 Notation Density", description: "Real-time, symbolic LaTeX rendering verified for professional academic standards and precision.", tag: "Mathematical" },
    { icon: Orbit, title: "Inference-Time Scaffolding", description: "No fine-tuning, no black-box retraining. Every Socratic behaviour is enforced by Crux at inference-time — observable, auditable, reproducible.", tag: "Verifiable" },
    { icon: Calculator, title: "Constraint-Led Derivation", description: "Students are guided through the derivation, not handed it. The Crux architecture makes bypassing the learning process structurally impossible.", tag: "Architecture" },
    { icon: ShieldUser, title: "Verifiable Integrity", description: "Rigid schema constraints block 'homework-solving' hacks and ensure academic honesty at scale.", tag: "Verifiable" }
  ];

  const stats = [
    { value: "0%", label: "Direct Answer Rate", sublabel: "Verified by Ph.D. Audit" },
    { value: "100%", label: "Socratic Guidance", sublabel: "Forces Productive Struggle" },
    { value: "100%", label: "Guided Derivations", sublabel: "Focuses on the Process" },
    { value: "Verifiable", label: "Learning Process", sublabel: "No Bypassing Allowed" }
  ];

  const onLoadingFinish = useCallback(() => setIsLoaded(true), []);

  return (
    <>
      <div className="min-h-screen relative font-medium scroll-smooth">
        <LoadingScreen onFinish={onLoadingFinish} />
        <SpaceBackground />

        <AnimatePresence>
          {isLoaded && (
            <>
              {/* Sticky Blurred Header */}
              <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                  ? "py-3 bg-background/90 backdrop-blur-2xl border-b border-border/80 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.2)]"
                  : "py-6 bg-background/0 backdrop-blur-0 border-b border-transparent"
                  }`}
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <div className="flex items-center justify-between px-8 max-w-[1500px] mx-auto w-full">
                  {/* Logo Section */}
                  <Link href="/" className="flex items-center gap-4 group shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                      <Logo size={24} className="text-foreground relative z-10 group-hover:rotate-[20deg] transition-transform duration-500" />
                    </div>
                    <span className="font-inter text-xl font-black tracking-tighter group-hover:text-primary transition-colors">Scorpio</span>
                  </Link>

                  {/* Unified Desktop Navigation Track */}
                  <div className="hidden lg:flex items-center p-1.5 bg-muted/20 dark:bg-muted/10 backdrop-blur-xl rounded-full border border-border/50 absolute left-1/2 -translate-x-1/2 shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]">
                    <nav className="flex items-center gap-1">
                      {[
                        { id: "home", label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                        { id: "problem", label: "Problem", target: "problem" },
                        { id: "solution", label: "Solution", target: "solution" },
                        { id: "demos", label: "Demos", target: "demos" },
                        { id: "efficacy", label: "Compare", target: "efficacy" },
                        { id: "pricing", label: "Pricing", target: "pricing" },
                        { id: "docs", label: "Docs", isDropdown: true },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onMouseEnter={() => setHoveredNav(item.id)}
                          onClick={() => {
                            if (!item.isDropdown) setActiveNav(item.id);
                            if (item.action) {
                              item.action();
                            } else if (item.target) {
                              const element = document.getElementById(item.target);
                              if (element) {
                                const yOffset = 0;
                                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
                              }
                            }
                            if (!item.isDropdown) setHoveredNav(null);
                          }}
                          className={`relative h-11 px-6 text-[15px] font-bold transition-all duration-300 cursor-pointer rounded-full flex items-center gap-1.5 ${activeNav === item.id || hoveredNav === item.id
                            ? "text-foreground"
                            : "text-muted-foreground/60 hover:text-foreground"
                            }`}
                        >
                          {((hoveredNav ? hoveredNav === item.id : activeNav === item.id) && !item.isDropdown) && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute inset-0 bg-background shadow-md border border-border/50 rounded-full -z-10"
                              transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            />
                          )}
                          {item.label}
                          {item.isDropdown && (
                            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-300 ${hoveredNav === "docs" ? "rotate-180" : ""}`} />
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Right-side Actions Group */}
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:block hover:bg-muted/30 p-1.5 rounded-full transition-colors order-first">
                      <ModeToggle />
                    </div>

                    <div className="flex items-center p-1 bg-muted/20 dark:bg-muted/10 backdrop-blur-xl rounded-full border border-border/50 shadow-sm">
                      <Link href="/login" className="hidden sm:block">
                        <Button variant="ghost" className="h-10 px-6 font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer text-[14px] rounded-full hover:bg-background/40">
                          Login
                        </Button>
                      </Link>

                      <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />

                      <Link href="/signup">
                        <Button
                          className="h-10 font-black px-8 rounded-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_4px_15px_-4px_rgba(var(--primary),0.3)] text-[14px]"
                        >
                          Sign up
                        </Button>
                      </Link>
                    </div>

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden h-11 w-11 hover:bg-muted/50 rounded-full border border-border/40 ml-1 shadow-sm" aria-label="Open menu">
                          <Menu className="h-6 w-6" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-[280px] sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden border-l border-border/40" hideClose>
                        <div className="flex items-center justify-between px-6 py-6 border-b">
                          <span className="font-extrabold text-xl">Menu</span>
                          <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="rounded-full hover:bg-accent h-10 w-10">
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
                              { id: "home", label: "Home", icon: Globe, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                              { id: "problem", label: "Problem", icon: AlertTriangle },
                              { id: "demos", label: "Demos", icon: PlayCircle },
                            ].map((item) => (
                              <Button key={item.id} variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]" onClick={() => { if (item.action) { item.action(); } else { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); } setMenuOpen(false); }}>
                                <div className="p-2 bg-primary/5 rounded-lg"><item.icon className="h-4 w-4 text-primary" /></div>
                                {item.label}
                              </Button>
                            ))}
                          </div>
                          <div className="space-y-1">
                            <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3 block">Institutional</span>
                            {[
                              { id: "efficacy", label: "Compare", icon: Brain },
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
                            <Link href="/signup"><Button size="lg" className="h-11 w-full font-semibold cursor-pointer">Sign up</Button></Link>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Mega Menu Panel — lives inside header so no mouse-gap issues */}
                <AnimatePresence>
                  {hoveredNav === "docs" && (
                    <motion.div
                      key="docs"
                      initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute top-full left-0 right-0 border-b border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl"
                    >
                      <div className="container mx-auto px-10 py-12 max-w-[1300px] grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Left Column: Context */}
                        <div className="md:col-span-1 space-y-6">
                          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 inline-flex shadow-sm">
                            <BookOpen className="h-7 w-7 text-primary" />
                          </div>
                          <h3 className="text-xl font-black tracking-tight">Scorpio Docs</h3>
                          <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                            Comprehensive guides and institutional research documentation for the Scorpio ecosystem.
                          </p>
                          <div className="pt-2">
                            <Link href="/about" onClick={() => setHoveredNav(null)}>
                              <Button variant="link" className="p-0 h-auto text-primary text-sm font-bold gap-1 group">
                                Explore Mission <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Right Columns: Links */}
                        <div className="md:col-span-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">Documentation Modules</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                              { href: "/about", label: "About Scorpio", desc: "Our mission to revolutionize physics education.", icon: Info },
                              { href: "/research", label: "Research & Methodology", desc: "Deep dive into the Crux Socratic architecture.", icon: Brain },
                              { href: "/request-access", label: "Request Access", desc: "Apply for institution-wide invite codes.", icon: KeyRound },
                              { href: "/contact", label: "Contact Us", desc: "Institutional success & support team.", icon: Mail },
                              { href: "/privacy", label: "Privacy Policy", desc: "FERPA/GDPR compliant infrastructure.", icon: Shield },
                              { href: "/terms", label: "Terms of Service", desc: "Institutional and usage terms.", icon: FileText },
                            ].map((item, i) => (
                              <Link key={item.href} href={item.href} onClick={() => setHoveredNav(null)}>
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 + 0.1 }}
                                  className="flex items-start gap-4 p-5 rounded-[1.5rem] hover:bg-muted/80 transition-all group cursor-pointer border border-transparent hover:border-border/50 shadow-none hover:shadow-lg hover:shadow-black/5"
                                >
                                  <div className="h-10 w-10 rounded-[0.9rem] bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <item.icon className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 pt-0.5">
                                    <p className="text-[15px] font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-1.5">{item.label}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium leading-snug">{item.desc}</p>
                                  </div>
                                </motion.div>
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
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary origin-left z-50"
                  style={{ scaleX, originX: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isScrolled ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.header>



              {/* Page wrapper with animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >


                <main className="relative z-10">
                  {/* Hero Section */}
                  <section id="home" className="relative overflow-hidden min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 pb-16">

                    {/* Atmospheric background */}
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
                      {/* Reduced glow on mobile to save performance */}
                      {isMobile ? (
                        <>
                          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full" />
                        </>
                      ) : (
                        <>
                          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[160px] rounded-full" />
                          <div className="absolute top-[10%] left-[5%] w-[400px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />
                          <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[350px] bg-primary/5 blur-[130px] rounded-full" />
                        </>
                      )}
                    </div>

                    {!isMobile && (
                      <div className="hidden md:block">
                        <FloatingPrompts />
                      </div>
                    )}

                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl w-full flex flex-col items-center gap-6 md:gap-8 relative z-10">

                      {/* Badge */}
                      <motion.div
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-background/50 backdrop-blur-xl shadow-inner shadow-primary/5 hover:bg-primary/5 transition-colors"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.25em] text-foreground/90 uppercase">Audited by a Ph.D.</span>
                      </motion.div>

                      {/* Headline */}
                      <motion.div
                        className="space-y-4 relative z-10 text-center"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: isMobile ? 0 : 0.12,
                              delayChildren: isMobile ? 0.2 : 0.8
                            }
                          }
                        }}
                      >
                        <motion.h1
                          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.05em] text-foreground leading-[0.9] drop-shadow-2xl"
                          variants={{
                            hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                          }}
                        >
                          Empower Thinking
                        </motion.h1>
                        <motion.h1
                          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.05em] leading-[0.9]"
                          variants={{
                            hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                          }}
                        >
                          <span className="relative inline-block pb-1">
                            <span className="relative z-10 bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">Stop AI Solvers</span>
                            <motion.span
                              className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full"
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                            />
                          </span>
                        </motion.h1>
                      </motion.div>

                      {/* Description */}
                      <motion.p
                        className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                      >
                        <TooltipProvider delayDuration={0}>
                          Powered by{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-foreground cursor-help border-b border-dotted border-foreground/30">Crux</span>
                            </TooltipTrigger>
                            <TooltipContent className="p-4 bg-background border border-border shadow-2xl max-w-xs" side="top">
                              <div className="flex flex-col gap-3 text-left">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-primary/10">
                                    <CruxLogo size={18} className="text-primary" />
                                  </div>
                                  <span className="font-bold text-foreground text-sm">Crux AI</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  The engine behind Scorpio. A specialized AI architecture that enforces Socratic methodology through 4-layer inference-time constraints.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          , Scorpio is the Socratic AI platform built to empower the physics classroom. We guide the students, you focus on teaching.
                        </TooltipProvider>
                      </motion.p>

                      {/* CTAs */}
                      <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto z-20 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: isMobile ? 0.8 : 1.5, duration: 1, ease: "easeOut" }}
                      >

                        <Link href="/request-access" className="w-full sm:w-auto flex-1 group">
                          <Button size="lg" className="w-full font-black text-sm px-8 h-12 rounded-full shadow-[0_0_40px_rgba(var(--primary),0.2)] hover:shadow-[0_0_60px_rgba(var(--primary),0.4)] transition-all duration-300 hover:scale-[1.1] cursor-pointer gap-2 relative overflow-hidden">
                            <KeyRound className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">Request Access</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-0.5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => { const el = document.getElementById("demos"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                          className="flex-1 w-full sm:w-auto font-bold text-sm px-8 h-12 rounded-full border border-border/60 bg-background/50 backdrop-blur-xl hover:bg-muted/50 cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.1] text-foreground/80 hover:text-foreground group"
                        >
                          <PlayCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          5-Minute Demo
                        </button>
                      </motion.div>

                      {/* Scroll-driven pitched card — starts angled, flattens as you scroll */}
                      <motion.div
                        className="w-full mx-auto relative -mt-14 md:-mt-18"
                        style={{ perspective: "1200px" }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: isMobile ? 1.2 : 1.8, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Ambient glow */}
                        <div className="absolute -inset-12 bg-primary/12 rounded-full blur-[90px] pointer-events-none" />
                        <div className="absolute -inset-6 bg-primary/7 rounded-[50px] blur-[45px] pointer-events-none" />

                        {/* Clickable pitched card */}
                        <motion.div
                          className="relative rounded-2xl overflow-hidden cursor-pointer group"
                          style={{
                            rotateX: videoPitch,
                            scale: videoScale,
                            transformOrigin: "bottom center",
                            boxShadow: "0 60px 140px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.12)",
                          }}
                          onClick={() => setTheaterOpen(true)}
                          whileHover={{ boxShadow: "0 60px 160px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.15)" }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Leading-edge rim light */}
                          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none" />
                          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none" />

                          {/* Video — exact 1656×1080 ratio */}
                          <div className="bg-black" style={{ aspectRatio: "1656/1080" }}>
                            <video
                              ref={heroVideoRef}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="auto"
                              className="w-full h-full object-cover"
                              onLoadedMetadata={(e) => {
                                e.currentTarget.muted = true;
                              }}
                            >
                              <source src="/demos/landing-demo.webm" type="video/webm" />
                              <source src="/demos/landing-demo.mp4" type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>

                          {/* Hover theater overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 z-20 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 flex flex-col items-center gap-2">
                              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 shadow-2xl">
                                <Maximize2 className="h-7 w-7 text-white" />
                              </div>
                              <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Theater Mode</span>
                            </div>
                          </div>

                          {/* Bottom vignette */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
                        </motion.div>

                        {/* Ground plane shadow */}
                        <div className="absolute inset-x-20 -bottom-8 h-16 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute inset-x-32 -bottom-3 h-8 bg-black/60 blur-2xl rounded-full pointer-events-none" />
                      </motion.div>

                    </div>

                    {/* Bottom blend — fades hero into the next section */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-20" />

                  </section>


                  {/* Partnered Schools Section */}
                  <section className="container mx-auto px-4 sm:px-6 py-12 md:py-24 relative z-10 border-y border-border/5 bg-background/5">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                      <motion.div
                        className="text-left space-y-4 md:w-1/2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                          Trusted by innovative schools.
                        </h3>
                        <p className="text-muted-foreground font-medium text-base md:text-lg leading-relaxed">
                          Scorpio is partnering with forward-thinking institutions to bring rigorous, Socratic AI into the physics curriculum.
                        </p>
                      </motion.div>
                      <motion.div
                        className="md:w-1/2 flex justify-center md:justify-end items-center"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          href="https://www.sageridge.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-center items-center transition-transform duration-300 hover:scale-105 opacity-90 hover:opacity-100"
                        >
                          <Image
                            src="/school-logos/SageRidgeSchool.svg"
                            alt="Sage Ridge School"
                            width={240}
                            height={100}
                            className="object-contain dark:brightness-0 dark:invert transition-all"
                          />
                        </Link>
                      </motion.div>
                    </div>
                  </section>



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
                          by &quot;Answer Engines.&quot;
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
                            title: "Academic Dishonesty",
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
                          <Button variant="ghost" className="cursor-pointer text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors">
                            Read our full mission statement <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </section>

                  {/* Solution Flowchart Section - Only on Desktop */}
                  {!isMobile && (
                    <div id="solution">
                      <SolutionFlowchart />
                    </div>
                  )}

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
                            controls
                            className="w-full h-auto aspect-video cursor-pointer"
                            preload="metadata"
                          >
                            <source src="/demos/scorpio-demo.webm" type="video/webm" />
                            <source src="/demos/scorpio-demo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
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
                    <div className="container mx-auto px-4 sm:px-6 pb-24 md:pb-32">
                      <LayerEfficacyChart />
                    </div>
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

                      {/* Unified Billing Widget */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">

                        {/* Left Column: Context / Image */}
                        <div className="lg:col-span-6 space-y-8">
                          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl group bg-muted/40 pb-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                            <Image
                              src="/plan.jpg"
                              alt="Platform Preview"
                              width={800}
                              height={600}
                              className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out border-b border-border"
                              loading="eager"
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
                              <div key={idx} className="p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm hover:bg-muted/40 transition-colors shadow-sm">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-4" />
                                <h4 className="text-base font-bold mb-2 text-foreground">{feature.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Column: Pricing Switcher */}
                        <div className="lg:col-span-6 sticky top-24">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 md:p-10 rounded-[2.5rem] border border-border bg-card shadow-2xl relative overflow-hidden"
                          >
                            <div className="absolute -top-10 -right-10 p-6 pointer-events-none opacity-[0.03] dark:opacity-10">
                              <ShieldCheck className="w-64 h-64 text-foreground" />
                            </div>

                            <h3 className="text-3xl font-extrabold mb-3 relative z-10 tracking-tight text-foreground">Global License</h3>
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
                                    <span className="text-7xl font-black tracking-tighter text-foreground">
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

                                <Link href="/signup">
                                  <Button
                                    className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground relative z-10"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{billingCycle === "yearly" ? "Claim Annual Plan" : "Start Monthly Plan"}</span>
                                      <ArrowRight className="h-5 w-5" />
                                    </div>
                                  </Button>
                                </Link>

                                <p className="text-xs text-center text-muted-foreground/70 mt-8 relative z-10 leading-relaxed px-4">
                                  Payments are secure and encrypted. Institutions can cancel subscription at any time.
                                </p>
                              </>
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Why Zero Markup block */}
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-muted/20 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-8 md:p-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                      >
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                            <Zap className="h-4 w-4" />
                            Zero Markup Pass-Through
                          </div>
                          <h3 className="text-3xl font-black tracking-tight text-foreground">One Platform. Zero EdTech Bloat.</h3>
                          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                            Most platforms markup AI costs 500%. We charge a flat fee for the infrastructure and pass raw compute costs directly to you. Every dollar goes into student mastery, not platform margins.
                          </p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              "Google Gemini-Flash Rates",
                              "FERPA & GDPR Infrastructure",
                              "Department-Wide Syncing",
                              "Priority Inference Tunnels"
                            ].map(f => (
                              <li key={f} className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-8 rounded-3xl bg-background/50 border border-border/50 text-center shadow-sm">
                            <p className="text-3xl font-black text-primary mb-1">$0.15</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1M Tokens Input</p>
                          </div>
                          <div className="p-8 rounded-3xl bg-background/50 border border-border/50 text-center shadow-sm">
                            <p className="text-3xl font-black text-primary mb-1">$0.60</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1M Tokens Output</p>
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
                        <div className="text-center mb-10">
                          <h3 className="text-2xl font-bold mb-2 text-foreground italic">The scale difference.</h3>
                        </div>
                        <div className="bg-card/40 backdrop-blur-xl border border-border shadow-2xl rounded-[3rem] p-4 md:p-8">
                          <CostComparisonChart />
                        </div>
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
                  <div id="faq">
                    <LandingFAQ />
                  </div>
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
                          <span className="text-sm font-medium">Research & Methodology</span>
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
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {isLoaded && <LandingChatbot />}

      {/* Theater modal — at root to escape filter/transform stacking contexts */}
      <AnimatePresence>
        {theaterOpen && (
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Direct Backdrop — handles click to close */}
            <div
              className="absolute inset-0 bg-black/98 backdrop-blur-2xl cursor-zoom-out"
              onClick={() => setTheaterOpen(false)}
            />

            {/* Content Container */}
            <motion.div
              className="relative w-full max-w-[90vw] xl:max-w-7xl z-10"
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-black tracking-[0.25em] uppercase text-white/40">Scorpio Production Demo</span>
                </div>

                <button
                  onClick={() => setTheaterOpen(false)}
                  className="flex items-center gap-3 text-white/40 hover:text-white transition-all group cursor-pointer py-1"
                >
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Exit Theater</span>
                  <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group-active:scale-90">
                    <X className="h-4 w-4" />
                  </div>
                </button>
              </div>

              <div
                className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_60px_150px_rgba(0,0,0,0.9)] bg-black"
                style={{ aspectRatio: "1656/1080" }}
              >
                <video
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/demos/landing-demo.webm" type="video/webm" />
                  <source src="/demos/landing-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}