"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  Menu, ChevronDown, ShieldUser, AlertTriangle, ChartColumnIncreasing, 
  SquareFunction, PlayCircle, Zap, Waypoints, Brain, Orbit, Activity, 
  Info, Mail, Shield, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setHoveredNav(null);
    setMenuOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div className="flex items-center justify-between px-6 py-3.5 max-w-[1400px] mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 !font-inter">
          <Logo size={20} className="text-foreground" />
          <span className="text-sm font-inter font-black tracking-tighter">Scorpio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            onMouseEnter={() => setHoveredNav("home")}
            className="h-8 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-full transition-colors cursor-pointer flex items-center"
          >
            Home
          </Link>
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
            onClick={() => scrollToElement("faq")}
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
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden" hideClose>
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
                    <Button key={item.id} variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]" onClick={() => scrollToElement(item.id)}>
                      <div className="p-2 bg-primary/5 rounded-lg"><item.icon className="h-4 w-4 text-primary" /></div>
                      {item.label}
                    </Button>
                  ))}
                </div>
                <div className="space-y-1">
                  <span className="px-2 text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3 block">Institutional</span>
                  {[
                    { id: "efficacy", label: "Compare", icon: Brain },
                    { id: "mission", label: "Philosophy", icon: Orbit },
                    { id: "activity", label: "Activity", icon: Activity },
                    { id: "pricing", label: "Pricing", icon: ChartColumnIncreasing },
                    { id: "faq", label: "FAQ", icon: Brain /* MessageCircle was not in imports but Brain is safe placeholder */ },
                  ].map((item) => (
                    <Button key={item.id} variant="ghost" className="justify-start font-semibold text-muted-foreground hover:text-primary text-base px-2 py-3 rounded-xl w-full text-left flex items-center gap-4 transition-all hover:bg-primary/5 active:scale-[0.98]" onClick={() => scrollToElement(item.id)}>
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

      {/* Mega Menu Panel */}
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
              {hoveredNav === "platform" && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Platform</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { id: "mission-control", label: "Mission Control", desc: "Central dashboard for instructors and students.", icon: ShieldUser },
                      { id: "challenge", label: "The Challenge", desc: "Understanding the physics education gap.", icon: AlertTriangle },
                      { id: "comparison", label: "vs. Other Tools", desc: "Research-backed comparison against ChatGPT and Khanmigo.", icon: ChartColumnIncreasing },
                      { id: "math-fidelity", label: "Math Fidelity", desc: "Built-in LaTeX engine for complex derivations.", icon: SquareFunction },
                      { id: "demos", label: "System Demos", desc: "Interactive overview of AI tutoring capabilities.", icon: PlayCircle },
                      { id: "workflow", label: "Workflow", desc: "End-to-end assignment and feedback loop.", icon: Zap },
                      { id: "waypoints", label: "Waypoints Network", desc: "Peer-validated physics modules shared across institutions.", icon: Waypoints },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToElement(item.id)}
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

              {hoveredNav === "institutional" && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Institutional</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { id: "efficacy", label: "Compare", desc: "Pedagogical methodology and learning outcomes.", icon: Brain },
                      { id: "mission", label: "Philosophy", desc: "The first principles behind constraint-led tutoring.", icon: Orbit },
                      { id: "activity", label: "Development", desc: "Live updates and platform evolution stats.", icon: Activity },
                      { id: "pricing", label: "Cost & Scale", desc: "Institutional pricing and ROI analysis.", icon: ChartColumnIncreasing },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToElement(item.id)}
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

              {hoveredNav === "docs" && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Documentation</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { href: "/about", label: "About Scorpio", desc: "Our mission to revolutionize physics education.", icon: Info },
                      { href: "/research", label: "Research & Methodology", desc: "Deep dive into our 4-layer AI architecture.", icon: Brain },
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

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary/40 origin-left z-50"
        style={{ scaleX }}
      />
    </motion.header>
  );
}
