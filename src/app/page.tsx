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
  Brain, ShieldUser, Users, MessageCircle, FileUp, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, CloudSync, SquareFunction, Presentation, ChartColumnIncreasing, Menu, Github
} from "lucide-react";
import Link from "next/link";
import { DemoCarousel } from "@/components/demo-carousel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: SquareFunction, title: "Mathematical Rendering", description: "Real-time LaTeX rendering with custom math builder", tag: "KaTeX" },
    { icon: Orbit, title: "Immersive UI", description: "Multi-layered parallax space background paired with modular beautiful UI", tag: "Tailwind + Shadcn" },
    { icon: CloudSync, title: "Real-time Sync", description: "Optimistic updates and offline support", tag: "Firestore" },
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
      { id: "cta", label: "Get Started" }
    ].map(({ id, label }) => (
      <DropdownMenu key={id}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="font-medium text-muted-foreground hover:text-foreground px-3 cursor-pointer"
            type="button"
            onClick={() => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
              setMenuOpen(false); // close menu if open
            }}
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        {/* DropdownMenuContent can be added here for future dropdowns */}
      </DropdownMenu>
    ))}
  </nav>

  {/* Actions */}
  <div className="flex items-center space-x-3">
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-8">
          {[
            { id: "home", label: "Home" },
            { id: "challenge", label: "Challenge" },
            { id: "features", label: "Features" },
            { id: "workflow", label: "Workflow" },
            { id: "cta", label: "Get Started" }
          ].map(({ id, label }) => (
            <Button
              key={id}
              variant="ghost"
              className="justify-start font-medium text-muted-foreground hover:text-foreground"
              onClick={() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
                setMenuOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
    <ModeToggle />
    <div className="h-5 w-px bg-border/70"></div>
    <div className="flex items-center space-x-2 pl-0.5">
      <Link href="/login">
        <Button variant="outline" size="sm" className="font-medium hover:bg-accent transition-colors cursor-pointer">
          Login
        </Button>
      </Link>
      <Link href="/signup">
        <Button size="sm" className="font-medium cursor-pointer">
          Sign up
        </Button>
      </Link>
    </div>
  </div>
</motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-6 py-32 text-center">
          <motion.div
            className="max-w-5xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border bg-card/50 backdrop-blur-sm mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm text-muted-foreground font-bold">Research-Grade AI Tutoring Platform</span>
            </motion.div>

            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <Logo size={64} className="text-primary" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Scorpio
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl lg:text-3xl font-semibold mb-8 max-w-2xl mx-auto text-primary drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              Turn Physics Struggles Into Breakthroughs
            </motion.p>

            <motion.p
              className="text-base text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <strong>Scorpio</strong> is a modern, space-inspired physics learning platform designed to help students and teachers <em>collaborate, assign, and grade assignments with ease.</em>
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-12"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="space-y-2 p-6 rounded-xl border bg-card/30 hover:bg-card/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + i * 0.15 }}
                >
                  <div className="text-2xl font-medium text-primary">{stat.value}</div>
                  <div className="text-sm font-normal leading-tight italic">{stat.label}</div>
                  <div className="text-xs font-semilight text-muted-foreground uppercase tracking-wide">{stat.sublabel}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
            >
              <></>
              <Link href="#cta">
                <Button size="lg" className="w-full sm:w-auto font-extrabold cursor-pointer">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-extrabold cursor-pointer">
                  Learn More
                </Button>
              </Link>
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
                <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
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
              className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold"
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
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold">Core Features</div>
            <h2 className="text-4xl md:text-5xl font-bold">Built for Modern Education</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
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
                className="group p-8 rounded-2xl border bg-card/20 hover:bg-card/50 transition-all duration-300 cursor-pointer hover:scale-105"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <feature.icon className="h-10 w-10 mb-6 group-hover:scale-110 transition-transform" />
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold italic">{feature.tag}</div>
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
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold">Workflow</div>
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
                  <p className="text-muted-foreground text-sm font-medium">Streamlined tools that reduce friction and maximize teaching time</p>
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
                      <div className="text-sm text-muted-foreground font-medium">{item.desc}</div>
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
                  <p className="text-muted-foreground text-sm font-medium">Tools that support independent learning and real-time guidance</p>
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
                      <div className="text-sm text-muted-foreground font-medium">{item.desc}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <Logo size={24} className="text-foreground" />
              <span className="text-md font-extrabold">Scorpio</span>
            </div>

            {/* Links Section */}
            <div className="flex justify-center space-x-6">
              <Link
                href="https://github.com/RushilMahadevu/scorpio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm font-medium">GitHub</span>
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/research"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Research
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Credits Section */}
            <div className="text-right space-y-2">
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