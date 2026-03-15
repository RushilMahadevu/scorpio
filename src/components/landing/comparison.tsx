"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Comparison() {
  return (
    <section id="comparison" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none -z-10" />
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center space-y-4 mb-16">
          <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Independent Research · 125-Response Ablation Study</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Not another AI chatbot wrapper.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Every metric below is sourced from our published ablation study — blinded scoring by an independent Ph.D. auditor across 25 physics problems.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/research">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors cursor-pointer">
                Read the full methodology →
              </Badge>
            </Link>
          </div>
        </div>

        {/* Table */}
        <motion.div
          className="rounded-3xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-5 bg-muted/30 border-b border-border/50 px-6 py-4 min-w-[600px]">
            <div className="col-span-1 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Capability</div>
            <div className="col-span-1 text-center">
              <div className="inline-flex flex-col items-center gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Scorpio</span>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Full Stack</span>
              </div>
            </div>
            <div className="col-span-1 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">ChatGPT / Gemini</span>
            </div>
            <div className="col-span-1 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Khanmigo</span>
            </div>
            <div className="col-span-1 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Human Tutor</span>
            </div>
          </div>

          {/* Rows */}
          {[
            {
              capability: "Direct Answer Rate",
              footnote: "Ablation study, 25 procedural physics problems",
              scorpio: { val: "0%", good: true },
              chatgpt: { val: "~100%", good: false },
              khan: { val: "~40%", good: false },
              human: { val: "Varies", good: null },
            },
            {
              capability: "Pedagogical Quality Score",
              footnote: "Ph.D. blinded holistic audit, 5-point scale",
              scorpio: { val: "4.62 / 5", good: true },
              chatgpt: { val: "4.38 / 5¹", good: false },
              khan: { val: "No data", good: null },
              human: { val: "~4.5 / 5", good: null },
            },
            {
              capability: "LaTeX Notation Density",
              footnote: "Per 100 words, ablation study",
              scorpio: { val: "0.92", good: true },
              chatgpt: { val: "0.22¹", good: false },
              khan: { val: "Limited", good: false },
              human: { val: "Whiteboard", good: null },
            },
            {
              capability: "Socratic Questions / Response",
              footnote: "Avg. across 125-response study",
              scorpio: { val: "1.25", good: true },
              chatgpt: { val: "1.00¹", good: false },
              khan: { val: "~0.8", good: false },
              human: { val: "~1.5", good: null },
            },
            {
              capability: "Constraint Architecture",
              footnote: "Inference-time, no fine-tuning required",
              scorpio: { val: "4-Layer Enforced", good: true },
              chatgpt: { val: "None", good: false },
              khan: { val: "Prompt-only", good: false },
              human: { val: "Implicit", good: null },
            },
            {
              capability: "Cost Transparency",
              footnote: "Per-student, per-request visibility",
              scorpio: { val: "100% — zero markup", good: true },
              chatgpt: { val: "Fixed subscription", good: false },
              khan: { val: "Fixed subscription", good: false },
              human: { val: "$40–120 / hr", good: false },
            },
            {
              capability: "Verifiable / Auditable",
              footnote: "Published methodology, reproducible results",
              scorpio: { val: "Yes — open study", good: true },
              chatgpt: { val: "No", good: false },
              khan: { val: "No", good: false },
              human: { val: "Subjective", good: null },
            },
          ].map((row, i) => (
            <motion.div
              key={i}
              className={`grid grid-cols-5 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors min-w-[600px] ${i % 2 === 0 ? "" : "bg-muted/5"}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <div className="col-span-1 pr-4">
                <p className="text-sm font-bold text-foreground">{row.capability}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">{row.footnote}</p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-black text-primary bg-primary/8 px-3 py-1 rounded-full">{row.scorpio.val}</span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className={`text-sm font-semibold ${row.chatgpt.good === false ? "text-muted-foreground/50" : "text-foreground"}`}>{row.chatgpt.val}</span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className={`text-sm font-semibold ${row.khan.good === false ? "text-muted-foreground/50" : "text-foreground"}`}>{row.khan.val}</span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-semibold text-muted-foreground/70">{row.human.val}</span>
              </div>
            </motion.div>
          ))}
          </div>{/* end overflow-x-auto */}
        </motion.div>

        {/* Footnotes */}
        <div className="mt-6 space-y-1 px-2">
          <p className="text-[10px] text-muted-foreground/50 font-medium">¹ Baseline Gemini 2.5 Flash (NONE constraint level) from Scorpio ablation study — used as proxy for unconstrained LLM performance. ChatGPT results are directionally comparable.</p>
          <p className="text-[10px] text-muted-foreground/50 font-medium">Khanmigo and human tutor figures are estimates based on published third-party educational research. Scorpio figures are from our 125-response expert-validated internal study.</p>
          <p className="text-[10px] text-muted-foreground/50 font-medium">Full methodology, raw data, and blinded scoring rubric available at <Link href="/research" className="text-primary/70 hover:text-primary underline underline-offset-2">scorpio/research</Link>.</p>
        </div>
      </motion.div>
    </section>
  );
}
