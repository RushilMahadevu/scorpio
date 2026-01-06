import Link from "next/link";
import { Metadata } from "next";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { MessageCircle, Github, BookOpen, TrendingUp, Users, Target, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Research & Methodology | Scorpio AI Effectiveness Study",
  description: "Read our ablation study on AI tutoring effectiveness. See how Scorpio's 4-layer constraint system outperforms base LLMs in physics education.",
  keywords: ["AI Research", "EdTech Study", "LLM Pedagogical Constraints", "Socratic Method AI", "Physics Education Research"],
};

export default function ResearchPage() {
  const researchHighlights = [
    {
      metric: "Constraint Effectiveness",
      finding: "Modular constraint stack enforces 100% domain adherence and notation accuracy (LaTeX density 0.92)",
      impact: "Eliminates off-topic and poorly formatted responses",
      significance: "High"
    },
    {
      metric: "Direct Answer Prevention",
      finding: "Direct Answer Rate (DAR) reduced from 100% (NONE) to 0% (FULL)",
      impact: "Forces productive struggle and guided reasoning",
      significance: "High"
    },
    {
      metric: "Socratic Engagement",
      finding: "FULL stack achieves 1.16 questions per response (vs. 0.32 for DOMAIN ONLY)",
      impact: "Significant increase in inquiry-based interaction",
      significance: "High"
    },
    {
      metric: "Pedagogical Quality",
      finding: "Quality scores remain high and consistent (3.92/5 FULL, 3.96/5 NONE)",
      impact: "Reliable teaching effectiveness across all tiers",
      significance: "Medium"
    }
  ];

  const constraintLevels = [
    {
      level: "NONE",
      description: "Baseline Gemini 2.5 Flash, no constraints",
      domainAdherence: "0.0%",
      directAnswerRate: "100%",
      pedagogicalQuality: "3.96",
      latexUsage: "0.22",
      avgQuestions: "1.08"
    },
    {
      level: "DOMAIN",
      description: "Physics domain restriction only",
      domainAdherence: "100.0%",
      directAnswerRate: "100%",
      pedagogicalQuality: "3.98",
      latexUsage: "0.35",
      avgQuestions: "0.32"
    },
    {
      level: "PEDAGOGY",
      description: "Domain + response classification",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "3.86",
      latexUsage: "0.28",
      avgQuestions: "0.84"
    },
    {
      level: "NOTATION",
      description: "Domain + pedagogy + LaTeX/unit enforcement",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "4.02",
      latexUsage: "0.88",
      avgQuestions: "1.04"
    },
    {
      level: "FULL",
      description: "Complete Socratic tutoring stack",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "3.92",
      latexUsage: "0.92",
      avgQuestions: "1.16"
    }
  ];

  const methodologyData = [
    { category: "Question Types", count: "28 total", breakdown: "Conceptual, Procedural, Adversarial" },
    { category: "Difficulty Levels", count: "4 levels", breakdown: "Basic (8), Intermediate (10), Advanced (6), College (4)" },
    { category: "Constraint Levels", count: "5 configurations", breakdown: "NONE, DOMAIN, PEDAGOGY, NOTATION, FULL" },
    { category: "Metrics Collected", count: "Direct Answer Rate, LaTeX Density, Question Density, Domain Adherence, Pedagogical Quality" },
    { category: "Sample Size", count: "140 responses", breakdown: "28 questions × 5 constraint levels" },
    { category: "AI Model", count: "Gemini 2.5 Flash", breakdown: "Lightweight model, inference-time constraints" }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 max-w-6xl w-full space-y-8 p-6">
        {/* Back Button */}
        <BackButton
          className="absolute top-6 left-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition cursor-pointer z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </BackButton>

        {/* Header */}
        <div className="text-center pt-16">
          <Logo size={48} className="mx-auto mb-6 drop-shadow-lg text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-foreground">Scorpio Research</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Investigating the effectiveness of constraint-based AI tutoring systems in physics education.
            Our ablation study demonstrates how a layered architecture of inference-time rules can transform
            a general-purpose LLM into a specialized Socratic tutor without expensive fine-tuning.
          </p>
        </div>

        {/* Key Findings */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6" />
              Key Research Findings
            </CardTitle>
            <CardDescription>
              Results from comprehensive ablation study on AI tutoring effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchHighlights.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{item.metric}</h3>
                    <Badge variant={item.significance === 'High' ? 'default' : 'secondary'} className="text-xs">
                      {item.significance}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.finding}</p>
                  <p className="text-xs text-primary font-medium">{item.impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Constraint Performance Table */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              Constraint System Performance
            </CardTitle>
            <CardDescription>
              Comparative effectiveness of different constraint configurations across all test questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Constraint Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Domain Adh.</TableHead>
                  <TableHead className="text-right">DAR</TableHead>
                  <TableHead className="text-right">LaTeX %</TableHead>
                  <TableHead className="text-right">Avg Q's</TableHead>
                  <TableHead className="text-right">Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {constraintLevels.map((level, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{level.level}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{level.description}</TableCell>
                    <TableCell className="text-right font-mono">{level.domainAdherence}</TableCell>
                    <TableCell className="text-right font-mono">{level.directAnswerRate}</TableCell>
                    <TableCell className="text-right font-mono">{level.latexUsage}</TableCell>
                    <TableCell className="text-right font-mono">{level.avgQuestions}</TableCell>
                    <TableCell className="text-right font-mono">{level.pedagogicalQuality}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Constraint System Documentation */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6" />
              Constraint System Architecture
            </CardTitle>
            <CardDescription>
              Detailed documentation of constraint levels and implementation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[80vh] rounded-lg overflow-hidden relative bg-transparent">
              <iframe
                src="/architecture.pdf#navpanes=0"
                className="w-full h-full"
                title="Constraint System Architecture"
                style={{ height: "100%", background: "transparent" }}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-lg text-muted-foreground">PDF failed to load. <a href="/architecture.pdf" className="underline">Download PDF</a></span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This document outlines the complete constraint system architecture, including all constraint levels (NONE, DOMAIN, PEDAGOGY, NOTATION, FULL) and their specific implementations.
            </p>
          </CardContent>
        </Card>

        {/* Difficulty Performance Table */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6" />
              Performance by Difficulty Level
            </CardTitle>
            <CardDescription>
              How the FULL constraint stack performs across different academic tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Quality</TableHead>
                  <TableHead className="text-right">Rule Adherence %</TableHead>
                  <TableHead className="text-right">Avg Length (Chars)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Basic</TableCell>
                  <TableCell className="text-right font-mono">3.72</TableCell>
                  <TableCell className="text-right font-mono">77.8%</TableCell>
                  <TableCell className="text-right font-mono">399</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Intermediate</TableCell>
                  <TableCell className="text-right font-mono">4.05</TableCell>
                  <TableCell className="text-right font-mono">100.0%</TableCell>
                  <TableCell className="text-right font-mono">641</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Advanced</TableCell>
                  <TableCell className="text-right font-mono">4.13</TableCell>
                  <TableCell className="text-right font-mono">100.0%</TableCell>
                  <TableCell className="text-right font-mono">1578</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">College</TableCell>
                  <TableCell className="text-right font-mono">3.75</TableCell>
                  <TableCell className="text-right font-mono">100.0%</TableCell>
                  <TableCell className="text-right font-mono">3322</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6" />
              Research Methodology
            </CardTitle>
            <CardDescription>
              Comprehensive ablation study design and implementation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Count/Details</TableHead>
                  <TableHead>Breakdown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methodologyData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.breakdown}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-background/90 backdrop-blur-md border-primary/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              Get Involved
            </CardTitle>
            <CardDescription>
              Join the research community and help advance AI tutoring systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer">
                  <Github className="mr-2 h-4 w-4" />
                  View Source Code
                </Button>
              </Link>
              <Link href="/contact" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Researcher
                </Button>
              </Link>
              <Link href="/about" className="flex-1">
                <Button className="w-full cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Learn About Scorpio
                </Button>
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/research/admin">
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Access
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}