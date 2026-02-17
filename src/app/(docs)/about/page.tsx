import Link from "next/link";
import { Metadata } from "next";
import { Info, Brain, SquareFunction, Orbit, ShieldCheck, Target, Users, Code, ArrowRight, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Scorpio | AI-Powered Physics Tutoring Vision",
  description: "Learn about the mission behind Scorpio: replacing traditional LMS frustration with AI-powered Socratic tutoring that helps physics students truly understand.",
};

export default function AboutPage() {
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
      description: "Our proprietary 4-layer constraint architecture ensures academic integrity and pedagogical consistency at scale.",
      tag: "Constraint Engineering"
    }
  ];

  return (
    <div className="max-w-4xl w-full space-y-12 pb-20">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            Our Mission
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
          Transforming Physics Education through <span className="text-primary">AI-Driven Socratic Tutoring</span>.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
          Scorpio is a research-driven educational platform engineered to bridge the gap between traditional LMS frustration and the dynamic cognitive requirements of physics understanding.
        </p>
      </section>

      <hr className="border-border/40" />

      {/* Core Capabilities */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Core Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((item, i) => (
            <Card key={i} className="bg-card/40 border-border/50 hover:border-primary/30 transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono uppercase bg-muted/50">
                    {item.tag}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

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
