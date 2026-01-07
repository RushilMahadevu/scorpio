import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Target, Download } from "lucide-react";

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
    <div className="w-full space-y-10">
        {/* Header */}
        <div className="border-b border-border/40 pb-8">
            <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen size={32} className="text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Scorpio Research</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Investigating the effectiveness of constraint-based AI tutoring systems.
            Our ablation study demonstrates how a layered architecture of inference-time rules can transform
            a general-purpose LLM into a specialized Socratic tutor.
            </p>
            <div className="mt-8">
                <Button asChild className="gap-2 cursor-pointer">
                    <a href="/architecture.pdf" target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download System Architecture PDF
                    </a>
                </Button>
            </div>
        </div>

        {/* Key Findings */}
        <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-primary" />
              Key Findings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchHighlights.map((item, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-base">{item.metric}</h3>
                        <Badge variant={item.significance === 'High' ? 'default' : 'secondary'} className="text-xs">
                        {item.significance}
                        </Badge>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{item.finding}</p>
                    <p className="text-xs text-primary font-medium">{item.impact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </section>

        {/* Constraint Performance Table */}
        <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Target className="h-6 w-6 text-primary" />
              System Performance
            </h2>
            <Card className="overflow-hidden border-border/50">
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
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
                            <TableCell className="text-right font-mono text-xs">{level.domainAdherence}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{level.directAnswerRate}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{level.latexUsage}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{level.avgQuestions}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{level.pedagogicalQuality}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
            </Card>
        </section>

        {/* Difficulty Performance */}
        <section className="space-y-4">
             <h2 className="text-xl font-bold">Performance by Difficulty</h2>
             <Card className="border-border/50">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
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
             </Card>
        </section>

        {/* Methodology */}
        <section className="space-y-4">
             <h2 className="text-xl font-bold">Methodology</h2>
             <Card className="border-border/50">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
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
                            <TableCell className="text-muted-foreground italic">{item.breakdown}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </Card>
        </section>
    </div>
  );
}
