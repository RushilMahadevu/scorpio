"use client";

import Link from "next/link";
import { Info, Brain, SquareFunction, Orbit, ShieldCheck, Target, Users, Code, ArrowRight, Github, Globe, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { GitHubActivity } from "./github-activity";
import { motion } from "framer-motion";

export default function AboutClient() {
  const capabilities = [
    {
      icon: Brain,
      title: "Socratic AI Tutoring",
      description: "Moving beyond 'Answer Engines' to true pedagogical guidance. Our AI doesn't just solve problems; it helps students through the conceptual struggle.",
      tag: "Gemini 2.5 Flash"
    },
    {
      icon: SquareFunction,
      title: "Mathematical Precision",
      description: "Dynamic LaTeX rendering and a visual math builder ensure that the language of physics is never a barrier to entry.",
      tag: "KaTeX"
    },
    {
      icon: Orbit,
      title: "Immersive Learning",
      description: "A high-performance space-themed interface designed to maximize engagement and minimize cognitive load during complex problem solving.",
      tag: "Tailwind + Framer"
    },
    {
      icon: ShieldCheck,
      title: "Verifiable Governance",
      description: "Our transparent 4-layer constraint architecture ensures academic integrity and pedagogical consistency at scale.",
      tag: "Constraint Engineering"
    }
  ];

  return (
    <div className="max-w-4xl w-full space-y-16 pb-24">
      {/* Hero Section */}
      <section className="space-y-8 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex items-center gap-4 mb-2">
          <Badge variant="outline" className="px-4 py-1.5 bg-primary/5 text-primary border-primary/20 rounded-full font-mono text-[10px] uppercase tracking-widest">
            Protocol Status: Active
          </Badge>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest leading-[0.9]">
          About <span className="text-primary underline underline-offset-8 decoration-2 decoration-primary/30">Scorpio</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed max-w-2xl font-medium tracking-tight">
          Scorpio is an advanced pedagogical framework engineered to eliminate systemic friction in STEM education through precision Socratic guidance.
        </p>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Core Capabilities */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Mission Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((item, i) => (
            <Card key={i} className="bg-background/20 backdrop-blur-sm border-border/40 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter bg-muted/30 text-muted-foreground border-none px-2 rounded-md">
                    {item.tag}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-6 font-bold tracking-tight">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground/90 leading-relaxed font-medium">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Waypoints Network Section */}
      <section id="waypoints" className="space-y-8 pt-8">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">The Waypoints Network</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          High-precision, peer-validated physics modules built by instructors — shared across institutions. Drop them straight into your curriculum.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Globe,
              title: "Instructor Shared",
              body: "Every Waypoint is authored by a verified Scorpio teacher — not AI-generated.",
            },
            {
              icon: ShieldCheck,
              title: "Peer-Validated",
              body: "Modules go through a structured review process before they enter the network.",
            },
            {
              icon: Zap,
              title: "Drop-in Ready",
              body: "Browse, preview, and attach Waypoints to your assignments in seconds.",
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
              <item.icon className="h-5 w-5 text-primary mb-3" />
              <p className="font-bold text-sm text-foreground mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border/40" />

      {/* The Vision Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Why Scorpio?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="text-muted-foreground italic">"Physics isn't about memorizing formulas; it's about seeing the fundamental laws that govern the universe."</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Most AI tools today are "Answer Engines"—they provide the result but skip the derivation. Scorpio is built on the philosophy that true learning happens in the <strong>struggle</strong>.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              By enforcing Socratic dialogue, we guide students through hints, analogies, and conceptual checkpoints, ensuring they don't just get the answer, but gain the intuition.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Card className="bg-background/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-bold">Student Success</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reduces homework anxiety and "stuck" time by providing 24/7 expert-level Socratic assistance that adapts to their specific level.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-5 w-5 text-primary" />
                <span className="font-bold">Teacher Empowered</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Advanced dashboards allow educators to see where students are struggling conceptually, transforming classrooms into data-driven learning labs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission / Philosophy */}
      <section id="philosophy" className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 border border-primary/20 bg-primary/5 backdrop-blur-xl shadow-lg">
        <div className="absolute -top-16 -right-16 opacity-[0.03]" style={{ animation: "spin 30s linear infinite" }}>
          <Logo size={320} className="text-primary" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Our Philosophy</div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
              The constraint is the{" "}
              <span className="text-primary underline underline-offset-8 decoration-2 decoration-primary/30">curriculum.</span>
            </h2>
          </div>
          <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed max-w-3xl">
            We built Scorpio with one belief: a student who derives the answer will never forget it. Our constraint architecture doesn&apos;t restrict AI — it enforces the same rigor you apply in your classroom.
          </p>
          <p className="text-base text-muted-foreground/60 font-medium leading-relaxed max-w-2xl">
            No shortcuts. Every AI response is Socratic by design — pushing students back to first principles, never handing them the next step.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Pedagogy-First Architecture
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Institutional Integrity
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-background/50 border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Research-Driven
            </Badge>
          </div>
        </div>
      </section>

      <hr className="border-border/40" />

      {/* Meet the Founder Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Founder</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-border/40 shadow-2xl">
              <img
                src="/headshot-sage.jpg"
                alt="Rushil Mahadevu"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-6">
                <p className="text-2xl font-black tracking-tighter">Rushil Mahadevu</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">Founder & Builder</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/5 text-primary border border-primary/10 text-[9px] py-0.5 px-3 rounded-full font-black uppercase tracking-widest">
                Sage Ridge &apos;28
              </Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3 space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-black tracking-tightest leading-[1.1]">
                Building for the <span className="text-primary underline underline-offset-4 decoration-2 decoration-primary/20">next generation</span> of students.
              </h3>
              <p className="text-lg text-muted-foreground/90 leading-relaxed font-medium">
                I&apos;m a student at Sage Ridge who builds things with AI and physics. Most of my work lately has been focused on building verifiable LLM systems and high-performance software platforms.
              </p>
              <p className="text-muted-foreground/80 leading-relaxed font-medium italic border-l-2 border-primary/20 pl-4">
                &quot;I started Scorpio because I think the best way to learn is through the struggle of figuring things out yourself. I wanted to build something that gives everyone access to that kind of guidance.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <hr className="border-border/40" />

      <GitHubActivity />

      <hr className="border-border/40" />

      {/* GitHub/Links CTA */}
      <section className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 bg-background flex items-center justify-center p-2">
            <Info className="h-full w-full text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">Project Details</p>
            <p className="text-xs text-muted-foreground">Maintained by Rushil Mahadevu</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              Source Code
            </a>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/research">
              Read the Paper
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
