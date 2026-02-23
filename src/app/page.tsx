"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, ShieldUser, Users, MessageCircle, FileUp, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, Cloud, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText, AlertTriangle, Activity, ShieldCheck, FileDown, Maximize2, MonitorPlay, PlayCircle
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: string;
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
    { icon: Brain, title: "Constraint-Based Tutoring", description: "A proprietary 4-layer architecture ensuring pedagogical integrity and DAR elimination.", tag: "Instructional" },
    { icon: SquareFunction, title: "LaTeX Render Engine", description: "Real-time, standards-compliant mathematical rendering for complex physics derivations.", tag: "Standards" },
    { icon: Orbit, title: "Conceptual Interface", description: "A focus-oriented UI designed to minimize cognitive load while maintaining deep engagement.", tag: "UX Design" },
    { icon: Cloud, title: "Synchronized Workspace", description: "Real-time data persistence with optimistic updates for seamless classroom transitions.", tag: "Core" },
    { icon: ShieldUser, title: "Institutional Security", description: "Server-side authentication and granular role-based access for students and faculty.", tag: "Security" },
    { icon: MessageCircle, title: "Navigational Intelligence", description: "An integrated AI agent assisting users with platform discovery and resource location.", tag: "Support" },
    { icon: FileUp, title: "Evidence Submission", description: "End-to-end support for multi-format coursework, including OCR-ready PDF and image uploads.", tag: "Logistics" },
    { icon: Users, title: "Validated Framework", description: "Hardened schema-based data structures ensuring consistent cross-platform performance.", tag: "System" }
  ];

  const stats = [
    { value: "4-Layer", label: "Constraint System", sublabel: "AI Architecture" },
    { value: "Real-time", label: "Sync & Feedback", sublabel: "Live Updates" },
    { value: "LaTeX", label: "Math Rendering", sublabel: "Equation Support" },
    { value: "Role-Based", label: "Access Control", sublabel: "Security Model" }
  ];

  return (
    <div className="min-h-screen relative font-medium scroll-smooth">
      <SpaceBackground />

      {/* Sticky Blurred Header */}
<motion.header
  className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-background/70 backdrop-blur-md border-b border-border/50 shadow-sm"
  initial={{ opacity: 0, y: -40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>
  {/* Logo */}
  <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
    <Logo size={20} className="text-foreground" />
    <span className="text-sm font-extrabold">Scorpio</span>
  </Link>


  {/* Navigation - Centered (Modern Sliding Hover) */}
  <nav 
    className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center p-1 bg-background/20 backdrop-blur-lg rounded-full border border-border/30"
    onMouseLeave={() => setHoveredNav(null)}
  >
    {[
      { id: "home", label: "Home" },
      { id: "mission-control", label: "Dashboard" },
      { id: "demos", label: "Demos" },
      { id: "workflow", label: "Workflow" },
      { id: "efficacy", label: "Research" },
      { id: "activity", label: "Activity" },
      { 
        id: "docs", 
        label: "Docs", 
        dropdownItems: [
          { label: "About Scorpio", href: "/about", icon: Info },
          { label: "Research & Methodology", href: "/research", icon: Brain },
          { label: "Privacy Policy", href: "/privacy", icon: Shield },
          { label: "Terms of Service", href: "/terms", icon: FileText },
          { label: "Contact Us", href: "/contact", icon: Mail },

        ]
      }
    ].map((navItem) => (
      <div
        key={navItem.id}
        className="relative px-1 group/navitem"
        onMouseEnter={() => setHoveredNav(navItem.id)}
      >
        <AnimatePresence>
          {hoveredNav === navItem.id && (
            <motion.div
              layoutId="navbar-highlight"
              className="absolute inset-0 bg-primary/5 rounded-full z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 25, 
                mass: 1.2,
                duration: 0.8 
              }}
            />
          )}
        </AnimatePresence>
        
        {navItem.dropdownItems ? (
          <DropdownMenu 
            modal={false} 
            open={hoveredNav === navItem.id} 
            onOpenChange={(open) => {
              if (!open) setHoveredNav(null);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="link"
                className={`relative z-10 h-8 px-3.5 text-sm font-semibold transition-all duration-500 cursor-pointer no-underline hover:no-underline !bg-transparent flex items-center gap-1.5 ${
                  hoveredNav === navItem.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {navItem.label}
                <motion.div
                  animate={{ 
                    rotate: hoveredNav === navItem.id ? 180 : 0,
                    color: hoveredNav === navItem.id ? "var(--primary)" : "var(--muted-foreground)"
                  }}
                  transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-center opacity-60"
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className="w-56 bg-background/80 backdrop-blur-xl border-border/50 p-1.5 shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
              onMouseEnter={() => setHoveredNav(navItem.id)}
              onMouseLeave={() => setHoveredNav(null)}
              sideOffset={8}
            >
              {navItem.dropdownItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 group/item">
                    <div className="p-1.5 bg-primary/5 rounded-lg group-hover/item:bg-primary/20 transition-colors">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-[11px] tracking-tight">{item.label}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : navItem.href ? (
          <Link href={navItem.href}>
            <Button
              variant="link"
              className={`relative z-10 h-8 px-3.5 text-sm font-semibold transition-all duration-500 cursor-pointer no-underline hover:no-underline !bg-transparent ${
                hoveredNav === navItem.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {navItem.label}
            </Button>
          </Link>
        ) : (
          <Button
            variant="link"
            type="button"
            onClick={() => {
              const el = document.getElementById(navItem.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={`relative z-10 h-8 px-3.5 text-sm font-semibold transition-all duration-500 cursor-pointer no-underline hover:no-underline !bg-transparent ${
              hoveredNav === navItem.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {navItem.label}
          </Button>
        )}
      </div>
    ))}
  </nav>

  {/* Actions */}
  <div className="flex items-center space-x-3">
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      {/* Backdrop for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <SheetContent
        side="right"
        className="w-full max-w-xs sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden"
        style={{ top: 0, bottom: 0, right: 0, left: 'auto' }}
        hideClose
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="font-extrabold text-lg">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="rounded-full hover:bg-accent"
          >
            <span className="sr-only">Close menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <nav className="flex flex-col space-y-2 px-6 py-6 flex-1 overflow-y-auto">
          {[
            { id: "home", label: "Home" },
            { id: "mission-control", label: "Dashboard" },
            { id: "demos", label: "Demos" },
            { id: "workflow", label: "Workflow" },
            { id: "efficacy", label: "Research" },
            { id: "activity", label: "Activity" }
          ].map(({ id, label }) => (
            <Button
              key={id}
              variant="ghost"
              className="justify-start font-medium text-muted-foreground hover:text-foreground text-lg px-2 py-3 rounded-lg w-full text-left"
              onClick={() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
                setMenuOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
          <div className="pt-6 pb-2 border-t mt-4 space-y-1">
             <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-4 block">Resources & Docs</span>
             {[
               { label: "About Scorpio", href: "/about", icon: Info },
               { label: "Research & Methodology", href: "/research", icon: Brain },
               { label: "Privacy Policy", href: "/privacy", icon: Shield },
               { label: "Terms of Service", href: "/terms", icon: FileText },
                { label: "Contact Support", href: "/contact", icon: Mail }
             ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <div className="p-2 bg-primary/5 rounded-lg">
                      <item.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    {item.label}
                  </Button>
                </Link>
             ))}
          </div>
        </nav>
        <div className="px-6 pb-6 pt-4 border-t bg-muted/5">
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full font-medium cursor-pointer">
                Login 
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="w-full font-medium cursor-pointer">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    <ModeToggle />
    <div className="h-6 w-px bg-border/40 mx-2"></div>
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-primary hover:bg-transparent transition-colors cursor-pointer">
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
  {/* Subtle Scroll Progress Bar */}
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary/40 origin-left z-50"
    style={{ scaleX }}
  />
</motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-6 py-16 text-center relative">
          <motion.div
            className="max-w-4xl mx-auto space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary/90 uppercase">Research-Grade AI Tutoring</span>
            </motion.div>

            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-20 h-20 bg-primary/20 blur-3xl rounded-full scale-150 opacity-60" />
              </div>
              <motion.div
                className="relative cursor-pointer z-10"
                onClick={() => setLogoRotation(prev => prev + 360)}
                animate={{ 
                  rotate: logoRotation,
                  y: [0, -10, 0]
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  rotate: { type: "spring", stiffness: 60, damping: 12 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  default: { duration: 2.5, ease: [0.16, 1, 0.3, 1] }
                }}
              >
                <Logo size={80} className="text-foreground drop-shadow-[0_0_25px_rgba(var(--primary),0.3)] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.15)] transition-all duration-300" />
              </motion.div>
            </div>

            <motion.h1
              className="text-6xl md:text-8xl font-black mb-6 text-foreground pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Scorpio
            </motion.h1>

            <motion.p
              className="text-2xl md:text-3xl font-medium mb-8 max-w-2xl mx-auto text-foreground/90 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8 }}
            >
              Turn Physics Struggles Into <span className="text-primary">Breakthroughs</span>
            </motion.p>

            <motion.p
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ 
                textShadow: "0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.2)",
                scale: 1.005,
                transition: { duration: 0.3 }
              }}
            >
                  An AI-powered physics LMS with research-grade tutoring and immersive learning tools designed to foster breakthrough understanding.
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 1.0
                  }
                }
              }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="space-y-1 p-4 rounded-2xl bg-background/5 backdrop-blur-sm border border-white/5 hover:bg-white/2.5 transition-colors"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-1 py-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Link href="#cta">
                <Button size="lg" className="w-full sm:w-auto font-bold text-base px-8 h-12 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all cursor-pointer">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold text-base px-8 h-12 rounded-full bg-background/50 backdrop-blur-md border-white/10 hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </Button>
            </motion.div>

            <motion.div
              className="pt-16 animate-bounce"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              <button
                aria-label="Scroll to Mission Control"
                onClick={() => {
                  const el = document.getElementById("mission-control");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="focus:outline-none"
                type="button"
              >
                <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto cursor-pointer hover:text-foreground transition-colors" />
              </button>
            </motion.div>
          </motion.div>

        </section>

        {/* Container Scroll Section */}
        <div id="mission-control" className="flex flex-col">
          <ContainerScroll
            titleComponent={
              <div className="flex flex-col items-center justify-center mb-10">
                 <Link href="/signup" className="mb-4">
                    <Badge className="h-8 px-4 rounded-full flex items-center justify-center gap-2 border-primary/20 bg-primary/10 hover:bg-primary/20 backdrop-blur-md" variant="secondary">
                       <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                       <span className="text-primary font-medium">Teacher Dashboard</span>
                    </Badge>
                  </Link>
                <h1 className="text-4xl md:text-6xl font-black text-center text-foreground pb-4 leading-tight">
                  Mission Control <br />
                  <span className="text-5xl md:text-[6rem] font-bold mt-1 leading-none text-foreground">
                    For Your Classroom
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
                  <span>The Institutional Challenge</span>
                </motion.div>
                <motion.h2
                  className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Physics education requires a <span className="text-primary italic">methodological</span> shift.
                </motion.h2>
              </div>
              <motion.p 
                className="text-muted-foreground text-lg font-medium max-w-md pb-2 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Traditional platforms prioritize content delivery over conceptual discovery, often failing to capture the nuance of derivation and intuition.
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
                  icon: <Presentation className="size-6 text-primary" />,
                  label: "Administrative Drag",
                  desc: "Faculties spend excessive time on logistical management rather than deep pedagogical intervention.",
                },
                {
                  icon: <GraduationCap className="size-6 text-primary" />,
                  label: "Cognitive Walls",
                  desc: "Students hit conceptual barriers in isolation, lacking the socratic guidance required for mastery.",
                },
                {
                  icon: <ChartColumnIncreasing className="size-6 text-primary" />,
                  label: "Insight Deficits",
                  desc: "Crucial performance data is often lost in fragmented spreadsheets and static assessments.",
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

        {/* Features Grid section removed: now integrated into demonstration gallery as Core Capabilities */}

        {/* Featured: Mathematical Precision */}
        <section className="container mx-auto px-6 py-32 relative">
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
                   "Physics-optimized Symbol Library",
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
            <div className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Platform Modalities</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Synchronized Discovery.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">Scorpio integrates institutional oversight with personalized socratic guidance.</p>
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
                  { title: "Synthesized Learning Path", desc: "Access a consolidated library of resources tailored to current coursework.", icon: <MessageCircle className="h-3.5 w-3.5" /> }
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
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground">Understanding is the <span className="text-primary underline underline-offset-8 decoration-2 decoration-primary/30">First Principle.</span></h2>
              </div>
              <p className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed max-w-3xl">
                Scorpio transcends the "solution-centric" paradigm. By utilizing a strict constraint-led architecture, we ensure students articulate their physical reasoning, transforming every struggle into a verified breakthrough.
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
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground">Initiate the <span className="text-primary italic">Transition.</span></h2>
                <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                   Integrate Scorpio into your curriculum to foster the next generation of physical thinkers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/student">
                  <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_15px_30px_rgba(var(--primary),0.2)] cursor-pointer transition-all duration-300">
                    Student Login
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link> 
                <Link href="/teacher">
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg cursor-pointer font-black border-2 border-border bg-background/50 backdrop-blur-md hover:bg-muted/30 transition-all duration-300">
                    Faculty Registration
                  </Button>
                </Link>
              </div>
              <div className="pt-4">
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Verified Educational Platform • Institutional Ready</p>
              </div>
            </div>
          </motion.div>
        </section>
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
    </div>
  );
}