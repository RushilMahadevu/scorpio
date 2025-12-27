"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Brain, ShieldUser, Users, MessageCircle, FileUp, GraduationCap, ArrowRight, Sparkles, ChevronDown, Orbit, CloudSync, SquareFunction, Presentation, ChartColumnIncreasing
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    { icon: Brain, title: "AI-Powered Tutoring", description: "Research-grade tutoring with 4-layer constraint architecture", tag: "Gemini 2.5 Flash" },
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
<header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-background/70 backdrop-blur-md border-b border-border/50 shadow-sm">
  {/* Logo */}
  <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
    <Image src="/favicon.svg" alt="Scorpio" width={20} height={20} />
    <span className="text-sm font-semibold">Scorpio</span>
  </Link>

  {/* Navigation - Centered */}
    <nav className="absolute left-1/2 -translate-x-1/2 flex space-x-8">
      <Link href="#home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Home
      </Link>
      <Link href="#challenge" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Challenge
      </Link>
      <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Features
      </Link>
      <Link href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Workflow
      </Link>
      <Link href="#cta" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Get Started
      </Link>
    </nav>

  {/* Actions */}
  <div className="flex items-center space-x-3">
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
</header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border bg-card/50 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm text-muted-foreground font-bold">Research-Grade AI Tutoring Platform</span>
            </div>

            <div className="flex justify-center mb-6">
              <Image src="/favicon.svg" alt="Scorpio" width={64} height={64} />
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Scorpio</h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-bold">
              Powering Physics at Sage Ridge
            </p>

            <p className="text-base text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            <strong>Scorpio</strong> is a modern, space-inspired physics learning platform designed to help students and teachers <em>collaborate, assign, and grade assignments with ease.</em>
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-12">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-2 p-6 rounded-xl border bg-card/30 hover:bg-card/50 transition-all">
                  <div className="text-2xl font-medium text-primary">{stat.value}</div>
                  <div className="text-sm font-normal leading-tight italic">{stat.label}</div>
                  <div className="text-xs font-semilight text-muted-foreground uppercase tracking-wide">{stat.sublabel}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
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
            </div>

            <div className="pt-16 animate-bounce">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
            </div>
          </div>
        </section>

        {/* Challenge Section */}
        <section id="challenge" className="container mx-auto px-6 py-32">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold">The Challenge</div>
            <h2 className="text-4xl md:text-5xl font-normal mb-8 leading-tight">
              Traditional learning management systems force both groups into rigid workflows that don't reflect the dynamic nature of physics problem-solving
            </h2>
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-3 p-6 rounded-2xl border bg-card/30 hover:bg-card/50 transition-all">
              <div className="flex space-x-2">
                <Presentation className="size-5 mt-1"></Presentation>
                <span className="text-lg font-bold">Teachers</span>
              </div>
                <p className="text-sm text-muted-foreground font-medium">Spend hours on logistics instead of actual teaching</p>
              </div>
              <div className="space-y-3 p-6 rounded-2xl border bg-card/30 hover:bg-card/50 transition-all">
              <div className="flex space-x-2">
                <GraduationCap className="size-5 mt-0.5"></GraduationCap>
                <span className="text-lg font-bold">Students</span>
              </div>
                <p className="text-sm text-muted-foreground font-medium">Lack real-time feedback during problem-solving</p>
              </div>
              <div className="space-y-3 p-6 rounded-2xl border bg-card/30 hover:bg-card/50 transition-all">
              <div className="flex space-x-2">
                <ChartColumnIncreasing className="size-5 mt-1"></ChartColumnIncreasing>
                <span className="text-lg font-bold">Progress</span>
              </div>
                <p className="text-sm text-muted-foreground font-medium">Requires manual tracking across disconnected tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold">Core Features</div>
            <h2 className="text-4xl md:text-5xl font-bold">Built for Modern Education</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border bg-card/20 hover:bg-card/50 transition-all duration-300 cursor-pointer hover:scale-105">
                <feature.icon className="h-10 w-10 mb-6 group-hover:scale-110 transition-transform" />
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold italic">{feature.tag}</div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Section (Combined) */}
        <section id="workflow" className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4 font-extrabold">Workflow</div>
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
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
                  <div key={i} className="flex space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground font-medium">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
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
                  <div key={i} className="flex space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground font-medium">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-3xl mx-auto space-y-8 p-16 rounded-3xl border bg-card/0 backdrop-blur-sm">
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
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Image src="/favicon.svg" alt="Scorpio" width={24} height={24} />
              <span className="text-md font-extrabold">Scorpio</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span> for Sage Ridge School
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}