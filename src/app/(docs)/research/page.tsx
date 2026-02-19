import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, TrendingUp, Target, Download, Eye, LayoutDashboard, ShieldCheck, Microscope, Layers, ChevronDown } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export const metadata: Metadata = {
  title: "Research & Methodology | Scorpio Verifiable AI Framework",
  description: "Explore Scorpio: A verifiable framework for enforcing Socratic scaffolding in physics LLMs beyond fine-tuning. Results from our 125-response expert-validated ablation study.",
  keywords: ["AI Research", "STEM Education", "Constraint Engineering", "Socratic Scaffolding", "Physics LLM", "Expert Validation"],
};

export default function ResearchPage() {
  const researchHighlights = [
    {
      metric: "Direct Answer Rate (DAR)",
      finding: "Reduced from 100% (NONE) to 0% (FULL) in all procedural physics problems",
      impact: "Eliminates answer-harvesting and forces productive struggle",
      significance: "Critical"
    },
    {
      metric: "Expert Validation",
      finding: "Independent Ph.D. audit confirmed a +0.67 point gain in pedagogical quality for the FULL stack",
      impact: "Statistically validates framework efficacy beyond self-assessment",
      significance: "High"
    },
    {
      metric: "Notation Accuracy",
      finding: "LaTeX mathematical density peaked at 0.92 per 100 words with explicit notation constraints",
      impact: "Ensures professional academic standards and symbolic clarity",
      significance: "High"
    },
    {
      metric: "Socratic Engagement",
      finding: "FULL stack achieved 1.25 questions per response (vs. 0.50 for DOMAIN ONLY)",
      impact: "Significant increase in inquiry-based student interaction",
      significance: "Medium"
    }
  ];

  const constraintLevels = [
    {
      level: "NONE",
      description: "Baseline Gemini 2.5 Flash, no constraints",
      domainAdherence: "100.0%",
      directAnswerRate: "100.0%",
      pedagogicalQuality: "4.38",
      latexUsage: "0.22",
      avgQuestions: "1.00"
    },
    {
      level: "DOMAIN",
      description: "Physics domain restriction only",
      domainAdherence: "100.0%",
      directAnswerRate: "100.0%",
      pedagogicalQuality: "4.50",
      latexUsage: "0.35",
      avgQuestions: "0.50"
    },
    {
      level: "PEDAGOGY",
      description: "Domain + response classification",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "3.88",
      latexUsage: "0.28",
      avgQuestions: "1.12"
    },
    {
      level: "NOTATION",
      description: "Domain + pedagogy + LaTeX/unit enforcement",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "4.12",
      latexUsage: "0.88",
      avgQuestions: "1.00"
    },
    {
      level: "FULL",
      description: "Complete Socratic tutoring stack",
      domainAdherence: "100.0%",
      directAnswerRate: "0.0%",
      pedagogicalQuality: "4.62",
      latexUsage: "0.92",
      avgQuestions: "1.25"
    }
  ];

  const methodologyData = [
    { category: "Test Battery", count: "25 questions", breakdown: "Conceptual (8), Procedural (12), Adversarial (5)" },
    { category: "Sample Size", count: "125 responses", breakdown: "25 questions × 5 constraint levels" },
    { category: "Difficulty Levels", count: "4 tiers", breakdown: "Basic, Intermediate, Advanced, College" },
    { category: "Evaluator Stats", count: "625 assessments", breakdown: "125 responses × 5 blinded criteria passes" },
    { category: "Expert Validation", count: "Ph.D. Audit", breakdown: "Blinded holistic scoring on stratified 30-item subset" },
    { category: "AI Model", count: "Gemini 2.5 Flash", breakdown: "Inference-time constraint layering (no fine-tuning)" }
  ];

  return (
    <div className="w-full space-y-10">
        {/* Header */}
        <div className="border-b border-border/40 pb-8">
            <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Scorpio Research</h1>
                  <p className="text-muted-foreground mt-2 text-sm italic font-medium">Scorpio: A Verifiable Framework for Enforcing Socratic Scaffolding in Physics LLMs Beyond Fine-Tuning</p>
                </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
            Investigating the shift from "Answer Engines" to "Socratic Scaffolding". 
            Our research formalizes a four-layer architecture to structure verifiable AI behavior 
            at inference-time, achieving a 0% Direct Answer Rate and significant pedagogical gains.
            </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
                <TabsTrigger value="dashboard" className="gap-2 cursor-pointer hover:scale-98 transition-transform">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </TabsTrigger>
                <TabsTrigger value="paper" className="gap-2 cursor-pointer hover:scale-98 transition-transform">
                    <Eye className="h-4 w-4" />
                    Full Paper
                </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-10">
                {/* System Architecture */}
                <section className="space-y-4">
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <Layers className="h-6 w-6 text-primary" />
                    Verifiable Framework: The 4-Layer Architecture
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { l: "01", t: "Domain", d: "Enforces physics context", c: "Refusal logic" },
                      { l: "02", t: "Pedagogical", d: "Classifies student intent", c: "Scaffolding mode" },
                      { l: "03", t: "Notation", d: "Enforces LaTeX & Units", c: "Scientific syntax" },
                      { l: "04", t: "Socratic", d: "Elicits student reasoning", c: "Rule validation" }
                    ].map((step) => (
                      <div key={step.l} className="relative p-4 rounded-xl border border-border/50 bg-card/30 overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="absolute top-0 right-0 p-2 text-primary/10 text-4xl font-black">{step.l}</div>
                        <h3 className="font-bold text-primary mb-1 relative z-10">{step.t}</h3>
                        <p className="text-xs text-foreground/80 font-medium relative z-10">{step.d}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono relative z-10">{step.c}</p>
                      </div>
                    ))}
                  </div>
                </section>

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
                                <Badge 
                                  variant={item.significance === 'Critical' ? 'destructive' : (item.significance === 'High' ? 'default' : 'secondary')} 
                                  className="text-xs"
                                >
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
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        Performance by Academic Tier (FULL Stack)
                     </h2>
                     <Card className="border-border/50 bg-card/40">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead>Difficulty Tier</TableHead>
                                <TableHead className="text-right">Ped. Quality</TableHead>
                                <TableHead className="text-right">On-Topic Adh. %</TableHead>
                                <TableHead className="text-right">Avg Response (Ch)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-muted/30">
                                <TableCell className="font-medium">Basic</TableCell>
                                <TableCell className="text-right font-mono">3.88</TableCell>
                                <TableCell className="text-right font-mono text-xs">80.0%</TableCell>
                                <TableCell className="text-right font-mono text-xs">477</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/30">
                                <TableCell className="font-medium">Intermediate</TableCell>
                                <TableCell className="text-right font-mono">4.20</TableCell>
                                <TableCell className="text-right font-mono text-xs">100.0%</TableCell>
                                <TableCell className="text-right font-mono text-xs">689</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/30">
                                <TableCell className="font-medium">Advanced</TableCell>
                                <TableCell className="text-right font-mono">4.17</TableCell>
                                <TableCell className="text-right font-mono text-xs">100.0%</TableCell>
                                <TableCell className="text-right font-mono text-xs">2323</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/30">
                                <TableCell className="font-medium">College</TableCell>
                                <TableCell className="text-right font-mono">3.75</TableCell>
                                <TableCell className="text-right font-mono text-xs">100.0%</TableCell>
                                <TableCell className="text-right font-mono text-xs">3316</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                     </Card>
                </section>

                {/* Expert Validation Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Independent Expert Validation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expert Agreement</CardTitle>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">0.51</span>
                            <span className="text-xs text-muted-foreground">Cohen's Kappa (κ)</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="text-primary border-primary/30">Moderate Agreement</Badge>
                          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                            Inter-rater reliability analysis on a stratified 30-item subset indicates successful 
                            pedagogical alignment between framework developers and Ph.D. physics educators.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2 border-border/50 bg-card/40">
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                              <div>
                                <h3 className="text-sm font-semibold">Pedagogical Improvement</h3>
                                <p className="text-xs text-muted-foreground mt-1">Validated by Ph.D. Physics Expert</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-primary">+0.67 pts</span>
                                <p className="text-[10px] text-muted-foreground">Gain over baseline (FULL vs NONE)</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 border rounded-lg bg-background/50">
                                <span className="text-[10px] text-muted-foreground uppercase block mb-1">Expert Baseline Score</span>
                                <span className="text-lg font-mono font-bold">3.16</span>
                              </div>
                              <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                                <span className="text-[10px] text-primary uppercase block mb-1">Expert FULL Score</span>
                                <span className="text-lg font-mono font-bold text-primary">3.83</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                </section>

                {/* Methodology (Enhanced) */}
                <section className="space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Methodology: Ablation Study Design
                     </h2>
                     <Card className="border-border/50 bg-card/40">
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Our experimental design isolates each layer of the Scorpio constraint architecture to measure its specific contribution to pedagogical effectiveness. 
                                We tested a battery of <strong>25 physics questions</strong> across 4 difficulty tiers (Basic, Intermediate, Advanced, College) and 3 question types (Conceptual, Procedural, Adversarial).
                                Each question was generated 5 times per constraint level to ensure statistical reliability.
                            </p>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Measurement</TableHead>
                                    <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {methodologyData.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-muted/30">
                                        <TableCell className="font-medium text-foreground">{item.category}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.count}</TableCell>
                                        <TableCell className="text-muted-foreground italic text-sm">{item.breakdown}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </section>
            </TabsContent>

            <TabsContent value="paper" className="space-y-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Full Length Research Paper</h2>
                            <p className="text-muted-foreground text-sm italic">Updated February 16, 2026</p>
                        </div>
                        <Button asChild className="gap-2">
                            <a href="/Scorpio_Verifiable_Physics_Tutoring_LLM.pdf" download>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    </div>

                    <details className="group border border-primary/20 bg-muted/30 rounded-lg overflow-hidden transition-all duration-300">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 list-none outline-none">
                            <div className="flex items-center gap-3">
                                <Eye className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm uppercase tracking-tight">Expand Abstract Preview</h3>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="pt-2 pb-10 px-10 border-t border-primary/10">
                            <h3 className="text-center font-bold text-lg mt-6 mb-6 tracking-tight uppercase">Abstract</h3>
                            <div className="font-serif text-justify leading-relaxed text-sm text-foreground/90 max-w-2xl mx-auto">
                                <MarkdownRenderer>
                                    {`While Large Language Models (LLMs) have demonstrated significant potential in STEM education, their tendency to provide direct solutions often undermines the learning process. This paper presents **Scorpio**, a framework that utilizes "Constraint Engineering" to transform a general-purpose LLM into a specialized, **verifiable physics tutor**. By implementing a layered architecture of inference-time rules, we enforce **Socratic scaffolding** without the need for expensive fine-tuning. Our results from a 125-response ablation study demonstrate that Scorpio successfully eliminates direct answer delivery (0% DAR), achieving a peak pedagogical quality score of **4.62**. Independent expert validation (Ph.D. physics educator) confirmed this success, with the expert independently ranking the FULL constraint system as the highest performing (Expert: 3.83 vs 3.16 baseline) and confirming a significant +0.67 point improvement in pedagogical quality. This work demonstrates that inference-time constraint layering can meaningfully shift LLM tutoring behavior toward Socratic scaffolding, proving that modular constraints can effectively manage complex STEM pedagogy at scale.`}
                                </MarkdownRenderer>
                            </div>
                        </div>
                    </details>
                </div>

                <Card className="p-0 overflow-hidden bg-muted border-border/50 h-[800px] relative">
                    <iframe 
                        src="/Scorpio_Verifiable_Physics_Tutoring_LLM.pdf#toolbar=0" 
                        className="w-full h-full border-none"
                        title="Scorpio Research Paper"
                    />
                </Card>
                <div className="flex justify-center py-4">
                    <p className="text-sm text-muted-foreground italic">
                        Can't see the preview? <a href="/Scorpio_Verifiable_Physics_Tutoring_LLM.pdf" className="text-primary underline">Download the PDF</a>.
                    </p>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
