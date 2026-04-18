"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform, animate } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, Calculator, KeyRound, ShieldUser, MessageCircle, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText, AlertTriangle, ShieldCheck, Maximize2, MonitorPlay, PlayCircle, CheckCircle2, Zap, Lock, Globe, Layers, X, Users, Building2, AlertCircle, Lightbulb, BarChart3
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
import { SiteHeader } from "@/components/landing/site-header";


import { ContainerScroll } from "@/components/ui/container-scroll-animation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TextAnimate } from "@/components/ui/text-animate";

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
  const [activeNav, setActiveNav] = useState<string>("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [theaterOpen, setTheaterOpen] = useState(false);

  const heroVideoRef = useRef<HTMLVideoElement>(null);

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

  // Students are ALWAYS forced to redirect to their portal.
  // Teachers are redirected unless they disable the auto-redirect preference.
  useEffect(() => {
    if (isLoaded && !authLoading && user && role) {
      if (role === "student") {
        router.push("/student");
      } else if (role === "teacher" && (profile?.preferences?.autoRedirectPortal ?? true)) {
        router.push("/teacher");
      }
    }
  }, [user, role, profile, authLoading, router, isLoaded]);





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
      const sections = ["home", "problem", "solution", "demos", "efficacy", "pricing", "faq", "cta"];
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
              <SiteHeader activeSection={activeNav} />

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
                      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full" />
                    </div>

                    {/* Remove FloatingPrompts for a cleaner, linear-like look */}

                    <div className="container mx-auto px-4 sm:px-8 max-w-[1400px] w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-10 relative z-20">

                      {/* Left: Content */}
                      <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">
                        {/* Badge */}
                        <motion.div
                          className="inline-flex items-center gap-3 mt-20 px-3 py-1 rounded-full border border-primary/20 bg-background/50 backdrop-blur-xl shadow-inner shadow-primary/5 hover:bg-primary/5 transition-colors mb-6"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                            <span className="relative inline-flex rounded-full h-1 w-1 bg-primary" />
                          </div>
                          <span className="text-[9px] font-black tracking-[0.2em] text-foreground/80 uppercase">Audited by a Ph.D.</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.div
                          className="relative z-10 mb-6"
                          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                          viewport={{ once: true }}
                        >
                          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.05em] text-foreground leading-[1.05]">
                            <TextAnimate animation="blurIn" by="character" duration={.75} delay={0.3} className="block" once>
                              The operating system
                            </TextAnimate>
                            <span className="text-primary block">
                              <TextAnimate animation="blurIn" by="character" duration={.75} delay={1.05} className="inline-block" once>
                                for physics teachers
                              </TextAnimate>
                            </span>
                          </h1>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                          className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          viewport={{ once: true }}
                        >
                          <TextAnimate animation="blurInUp" by="character" duration={.75} delay={1.8} className="inline-block" once>
                            Deploy tutoring for every student. Designed for the AI Era.
                          </TextAnimate>
                        </motion.div>
                      </div>

                      {/* Right: Subtle CTAs */}
                      <motion.div
                        className="flex items-center gap-6 shrink-0 pb-2 md:pb-4 relative z-30"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.55, duration: 1, ease: "easeOut" }}
                      >
                        <Link href="/request-access">
                          <Button variant="link" className="h-auto p-0 font-medium text-sm text-primary hover:text-primary/80 transition-all flex items-center gap-1.5 group">
                            Request Access
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <div className="w-px h-4 bg-primary/20 hidden md:block" />
                        <button
                          type="button"
                          onClick={() => { const el = document.getElementById("demos"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                          className=" cursor-pointer text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2 group"
                        >
                          5-Minute Demo
                        </button>
                      </motion.div>
                    </div>

                    {/* Centered, Larger Video Container - Pushed UP */}
                    <div className="container mx-auto px-4 sm:px-6 max-w-7xl w-full md:mt-[-50px] relative z-10 flex justify-center">
                      <motion.div
                        className="w-full relative"
                        style={{ perspective: "1600px" }}
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3.3, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
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
                              <source src="/demos/landing-demo-v2.webm" type="video/webm" />
                              <source src="/demos/landing-demo-v2.mp4" type="video/mp4" />
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
                  <section className="container mx-auto px-4 sm:px-6 py-12 md:py-24 relative z-10">
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
                            style={{ width: "auto", height: "auto" }}
                            priority
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

                  {/* Solution Flowchart Section */}
                  <div id="solution">
                    <SolutionFlowchart />
                  </div>

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
                    {/* <div className="container mx-auto px-4 sm:px-6 pb-24 md:pb-32">
                      <LayerEfficacyChart />
                    </div> */}
                  </section>

                  {/* Pricing Teaser Section */}
                  <section id="pricing-teaser" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] pointer-events-none -z-10" />
                    <div className="max-w-5xl mx-auto space-y-12">

                      {/* Section Header */}
                      <div className="text-center space-y-4">
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
                          className="text-4xl md:text-5xl font-black tracking-tighter leading-none"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                        >
                          Less than a textbook.<br />
                          <span className="text-primary italic">Unlimited students.</span>
                        </motion.h2>
                      </div>

                      {/* Stats Grid */}
                      <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-3"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                      >
                        {[
                          { value: "98%", label: "cheaper than industry average" },
                          { value: "$0.08", label: "per student at 250 seats" },
                          { value: "∞", label: "students, one subscription" },
                          { value: "0×", label: "markup on AI costs" },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            className="p-5 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm text-center space-y-1.5 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * i + 0.15 }}
                          >
                            <p className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium leading-tight">{stat.label}</p>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Pricing Cards Grid */}
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                      >
                        {/* Monthly */}
                        <div className="p-6 rounded-[1.5rem] border border-border bg-card/30 backdrop-blur-sm space-y-5 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">Monthly</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black tracking-tighter">$4.99</span>
                              <span className="text-muted-foreground text-sm font-medium">/mo</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">Flexible access, cancel anytime.</p>
                          </div>
                          <ul className="space-y-2.5">
                            {["Unlimited Students", "Teacher AI Dashboard", "Network Waypoints", "Real-time Analytics"].map((f) => (
                              <li key={f} className="flex items-center gap-2.5 text-xs text-foreground/80 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Annual — highlighted */}
                        <div className="p-6 rounded-[1.5rem] border-2 border-primary bg-primary/[0.02] space-y-5 relative overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-3 py-1.5 font-black uppercase tracking-widest rounded-bl-xl">Best Value</div>
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-0.5 mb-4">Annual</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black tracking-tighter">$2.49</span>
                              <span className="text-muted-foreground text-sm font-medium">/mo</span>
                            </div>
                            <p className="text-xs text-primary font-bold mt-1.5 flex items-center gap-1.5">
                              <Zap className="h-3 w-3" /> Billed $29.88/yr — save 50%
                            </p>
                          </div>
                          <ul className="space-y-2.5">
                            {["Everything in Monthly", "Priority AI Processing", "Extended Usage History", "50% Savings"].map((f) => (
                              <li key={f} className="flex items-center gap-2.5 text-xs font-bold text-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="p-6 rounded-[1.5rem] border border-border/50 bg-muted/10 space-y-5 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">Enterprise</div>
                            <p className="text-4xl font-black tracking-tighter">Custom</p>
                            <p className="text-xs text-muted-foreground mt-1.5">Multi-network, district-wide scale.</p>
                          </div>
                          <ul className="space-y-2.5">
                            {["Custom SSO Integrations", "Dedicated Infrastructure", "Volume Pricing Tiers", "10+ Network Scale"].map((f) => (
                              <li key={f} className="flex items-center gap-2.5 text-xs text-foreground/80 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      {/* Link to full pricing page */}
                      <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link href="/pricing">
                          <Button variant="ghost" className="cursor-pointer text-sm font-bold text-muted-foreground hover:text-primary transition-colors group gap-2">
                            View full pricing, AI cost analysis & enterprise options
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
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
                  <source src="/demos/landing-demo-v2.webm" type="video/webm" />
                  <source src="/demos/landing-demo-v2.mp4" type="video/mp4" />
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