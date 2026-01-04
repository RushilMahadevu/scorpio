"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  Brain, ShieldUser, Users, MessageCircle, FileUp, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, Cloud, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github, Info, BookOpen, Mail, Shield, FileText
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";
import dynamic from "next/dynamic";

const DemoCarousel = dynamic(() => import("@/components/demo-carousel").then(mod => mod.DemoCarousel), {
  ssr: false,
  loading: () => <div className="h-[540px] w-full flex items-center justify-center bg-muted/20 rounded-2xl animate-pulse">Loading Demonstrations...</div>
});

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: Brain, title: "AI-Powered Tutoring", description: "Research-grade tutoring with 4-layer constraint architecture", tag: "Gemini 2.5 Flash" },
    { icon: SquareFunction, title: "Mathematical Rendering", description: "Real-time LaTeX rendering with custom math builder", tag: "KaTeX" },
    { icon: Orbit, title: "Immersive UI", description: "Multi-layered parallax space background paired with modular beautiful UI", tag: "Tailwind + Shadcn" },
    { icon: Cloud, title: "Real-time Sync", description: "Optimistic updates and offline support", tag: "Firestore" },
    { icon: ShieldUser, title: "Role-Based Access", description: "Server-side authentication with granular controls", tag: "Firebase" },
    { icon: MessageCircle, title: "Navigation Assistant", description: "Intuitive platform guidance and help powered with a LLM model", tag: "LLM model" },
    { icon: FileUp, title: "File Submissions", description: "Student PDF & Image uploads with base64 storage", tag: "Cloud Storage" },
    { icon: Users, title: "Type-Safe Forms", description: "Runtime validation with TypeScript inference", tag: "Zod" }
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


  {/* Navigation - Centered (shadcn-styled buttons, ready for dropdown) */}
  <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex space-x-2">
    {[
      { id: "home", label: "Home" },
      { id: "challenge", label: "Challenge" },
      { id: "features", label: "Features" },
      { id: "workflow", label: "Workflow" },
      { id: "cta", label: "Get Started" },
      { id: "docs", label: "Docs" }
    ].map(({ id, label }) => (
      <DropdownMenu key={id}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="font-medium text-muted-foreground hover:text-foreground px-3 cursor-pointer"
            type="button"
            onClick={id !== "docs" ? () => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
              setMenuOpen(false); // close menu if open
            } : undefined}
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        {id === "docs" && (
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <Info className="mr-2 h-4 w-4" />
                About
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/research" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                Research
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/privacy" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Privacy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/terms" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Terms
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
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
            { id: "challenge", label: "Challenge" },
            { id: "features", label: "Features" },
            { id: "workflow", label: "Workflow" },
            { id: "cta", label: "Get Started" },
            { id: "docs", label: "Docs" }
          ].map(({ id, label }) =>
            id !== "docs" ? (
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
            ) : (
              <DropdownMenu key={id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium text-muted-foreground hover:text-foreground text-lg px-2 py-3 rounded-lg w-full text-left"
                  >
                    {label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {/* Docs links */}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/research" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Research
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/privacy" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Privacy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/terms" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Terms
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </nav>
        <div className="px-6 pb-6">
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

            <motion.div
              className="flex justify-center mb-8 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.8, type: "spring" }}
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-50" />
              <Logo size={80} className="text-foreground relative z-10 drop-shadow-[0_0_25px_rgba(var(--primary),0.3)]" />
            </motion.div>

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
            >
              A modern, space-inspired learning platform where students and teachers collaborate, assign, and grade with the power of AI.
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
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="space-y-1 p-4 rounded-2xl bg-background/5 backdrop-blur-sm border border-white/5 hover:bg-white/2.5 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
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
                aria-label="Scroll to Challenge"
                onClick={() => {
                  const el = document.getElementById("challenge");
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

        {/* Challenge Section */}
        <section id="challenge" className="container mx-auto px-6 py-32">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="text-sm text-foreground/70 uppercase tracking-widest mb-4 font-extrabold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The Challenge
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-normal mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Traditional learning management systems force both groups into rigid workflows that don't reflect the dynamic nature of physics problem-solving
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8 pt-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.18
                  }
                }
              }}
            >
              {[
                {
                  icon: <Presentation className="size-5 mt-1" />,
                  label: "Teachers",
                  desc: "Spend hours on logistics instead of actual teaching"
                },
                {
                  icon: <GraduationCap className="size-5 mt-0.5" />,
                  label: "Students",
                  desc: "Lack real-time feedback during problem-solving"
                },
                {
                  icon: <ChartColumnIncreasing className="size-5 mt-1" />,
                  label: "Progress",
                  desc: "Requires manual tracking across disconnected tools"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="space-y-3 p-6 rounded-2xl border bg-card/30 hover:bg-card/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="flex space-x-2">
                    {item.icon}
                    <span className="text-lg font-bold">{item.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <div className="text-sm text-foreground/70 uppercase tracking-widest mb-4 font-extrabold">Core Features</div>
            <h2 className="text-4xl md:text-5xl font-bold">Built for Modern Education</h2>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border bg-card/20 hover:bg-card/50 transition-colors duration-300 cursor-pointer text-xs sm:text-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div
                  className="h-10 w-10 mb-6"
                  whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
                >
                  <feature.icon className="h-10 w-10" />
                </motion.div>
                <div className="space-y-3">
                  <div className="text-xs text-foreground/70 uppercase tracking-wider font-extrabold italic">{feature.tag}</div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Demo Carousel Section (moved below Features) */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="text-2xl md:text-3xl font-bold mb-8">Platform Demonstrations</div>
          <div className="flex justify-center">
            <DemoCarousel />
          </div>
        </section>

        {/* Workflow Section (Combined) */}
        <section id="workflow" className="container mx-auto px-6 py-32">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-sm text-foreground/70 uppercase tracking-widest mb-4 font-extrabold">Workflow</div>
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.18
                }
              }
            }}
          >
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <Presentation className="h-10 w-10" />
                <div>
                  <h3 className="text-2xl font-bold mb-1">For Teachers</h3>
                  <p className="text-foreground/80 text-sm font-medium">Streamlined tools that reduce friction and maximize teaching time</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Assignment Creation", desc: "Rich text editor with integrated math builder and PDF uploads" },
                  { title: "Smart Filtering", desc: "Intuitive organization with dropdown controls" },
                  { title: "AI-Assisted Grading", desc: "Automated feedback with manual override capabilities" },
                  { title: "Real-Time Analytics", desc: "Live dashboards showing submission status and progress" },
                  { title: "Resource Management", desc: "Centralized library for course materials and tagging" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex space-x-4 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-foreground/80 font-medium">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <GraduationCap className="h-10 w-10" />
                <div>
                  <h3 className="text-2xl font-bold mb-1">For Students</h3>
                  <p className="text-foreground/80 text-sm font-medium">Tools that support independent learning and real-time guidance</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Interactive Assignments", desc: "Submit work with LaTeX support and file attachments" },
                  { title: "AI Tutor", desc: "Research-grade conversational interface with constraint system" },
                  { title: "Progress Tracking", desc: "Clear view of grades and submission history" },
                  { title: "Resource Library", desc: "Searchable access to all course materials" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex space-x-4 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-foreground/80 font-medium">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section id="cta" className="container mx-auto px-6 py-32 text-center">
          <motion.div
            className="max-w-3xl mx-auto space-y-8 p-16 rounded-3xl border bg-card/0 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-semibold">Ready to Transform Your Classroom?</h2>
            <p className="text-muted-foreground text-lg font-medium">Join schools revolutionizing physics education with research-grade AI tutoring</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link href="/student">
                <Button size="lg" className="group font-extrabold cursor-pointer   w-full sm:w-auto">
                  Start as a Student
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/teacher">
                <Button size="lg" variant="outline" className="group font-extrabold cursor-pointer w-full sm:w-auto">
                  Start as a Teacher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
                href="/contact"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Contact</span>
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
            </div>

            {/* Credits Section */}
            <div className="text-center md:text-right space-y-2">
              <div className="text-sm text-muted-foreground font-medium">
                Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span>
              </div>
              <div className="text-xs text-muted-foreground">
                © 2025 Scorpio. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}