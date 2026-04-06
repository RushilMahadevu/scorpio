"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ShieldAlert,
  Bot,
  Calculator,
  CheckCircle2,
  Zap,
  Lock,
  Search,
  MessageSquare,
  Sparkles,
  Layers
} from "lucide-react";

const steps = [
  {
    id: "step-1",
    title: "Domain Integrity Guard",
    description: "Strict physics context enforcement. Instantly neutralizes non-academic requests through hard refusal logic.",
    icon: ShieldAlert,
    color: "text-red-300",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
    glowColor: "shadow-red-400/20",
    features: ["Physics Context Refusal", "Solution Leakage Blocking", "Academic Domain Locking"]
  },
  {
    id: "step-2",
    title: "Pedagogical Intent Engine",
    description: "Classifies student intent in real-time to select the optimal scaffolding mode for the conceptual gap.",
    icon: Brain,
    color: "text-orange-300",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    glowColor: "shadow-orange-400/20",
    features: ["Intent Classification", "Scaffolding Mode Selection", "Cognitive Load Balancing"]
  },
  {
    id: "step-3",
    title: "Symbolic Notation Mesh",
    description: "Enforces rigid scientific syntax and LaTeX density. Verifies unit consistency before response generation.",
    icon: Calculator,
    color: "text-blue-300",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    glowColor: "shadow-blue-400/20",
    features: ["LaTeX Syntax Enforcement", "Unit Consistency Checks", "Symbolic Math Verification"]
  },
  {
    id: "step-4",
    title: "Socratic Scaffolding Output",
    description: "The complete stack output that elicits student reasoning through inference-time rule validation.",
    icon: Bot,
    color: "text-green-300",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    glowColor: "shadow-green-400/20",
    features: ["Rule Validation", "Inquiry-Based Guidance", "Mastery Telemetry"]
  }
];

export function SolutionFlowchart() {
  return (
    <section id="solution" className="container mx-auto px-6 py-24 md:py-40 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20 md:mb-32">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black tracking-[0.2em] uppercase text-primary"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Layers className="h-3 w-3" />
            <span>The Socratic Stack</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Why Crux is the <span className="text-primary italic">Solution</span>.
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            A 4-layer constraint architecture that makes bypassing the learning process structurally impossible.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Lines (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block -translate-y-1/2 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                {/* Connector for mobile/tablet */}
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-gradient-to-b from-border to-transparent lg:hidden -translate-x-1/2" />
                )}

                <div className={`p-8 rounded-[2.5rem] border ${step.borderColor} bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all duration-500 flex flex-col items-center text-center h-full group-hover:shadow-2xl ${step.glowColor}`}>

                  {/* Icon Node */}
                  <div className={`h-16 w-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />

                    {/* Pulsing ring */}
                    <div className={`absolute inset-0 rounded-2xl ${step.bgColor} animate-ping opacity-20`} />
                  </div>

                  {/* Step indicator */}
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
                    Layer {i + 1}
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight mb-4 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                    {step.description}
                  </p>

                  <ul className="space-y-3 w-full pt-6 border-t border-border/40">
                    {step.features.map((feature, j) => (
                      <li key={j} className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                        <CheckCircle2 className={`h-3 w-3 ${step.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow between steps (Desktop) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-10 hidden lg:block text-muted-foreground/30">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Differentiator Section */}
        <motion.div
          className="mt-32 md:mt-48 grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                What <span className="text-primary italic">Differentiates</span> Us.
              </h3>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                Standard LLMs are trained to be helpful assistants. Crux is architected to be a rigorous physics mentor.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Inference-Time Layering",
                  desc: "0% Direct Answer Rate achieved through rigid rule-layering at inference time, not black-box fine-tuning.",
                  icon: Zap
                },
                {
                  title: "Expert Validated",
                  desc: "+0.67 pedagogical uplift across 125 expert-blinded responses validated by Ph.D. physics educators.",
                  icon: CheckCircle2
                },
                {
                  title: "Symbolic Integrity",
                  desc: "0.92 LaTeX notation density ensures precision in mathematical derivation and unit consistency.",
                  icon: Calculator
                },
                {
                  title: "Verifiable Research",
                  desc: "Every claim is backed by the Scorpio Ablation Study, formalizing the shift from answer engines to scaffolding.",
                  icon: Search
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10" />
            <div className="rounded-3xl border border-primary/30 overflow-hidden bg-zinc-950 shadow-2xl relative group">
              {/* AI Inference Pipeline Visualization */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-red-500/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-amber-500/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    <span className="ml-2 text-[9px] font-mono text-muted-foreground/50 tracking-wider font-bold italic">crux-trace-scorpio.jsonl</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                    <span className="text-[8px] font-mono text-primary animate-pulse uppercase tracking-tighter font-black">System_Active_v4.2</span>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-[10.5px] leading-relaxed">

                  {/* Step 1 — BPE Tokenizer */}
                  <div className="space-y-1 group/item cursor-crosshair">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-muted-foreground/20" />
                      <div className="text-muted-foreground/40 text-[8px] uppercase tracking-widest">01 / BPE Tokenization</div>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <span className="text-violet-400">tokenizer</span>
                      <span className="text-muted-foreground">.</span>
                      <span className="text-blue-400">encode</span>
                      <span className="text-muted-foreground">(</span>
                      <span className="text-emerald-400">&quot;Just give me the answer.&quot;</span>
                      <span className="text-muted-foreground">)</span>
                    </div>
                    <div className="pl-3 flex items-center justify-between text-[9px] text-slate-400/70">
                      <div>tokens={<span className="text-amber-300/70">[13462, 3644, 668, 290, 6052, 13]</span>}</div>
                      <div className="flex gap-0.5 items-end h-3 pr-2">
                        {[4, 7, 2, 8, 4, 6].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-slate-600 rounded-full"
                            animate={{ height: [`${h}px`, `${Math.max(1, h - 2)}px`, `${h}px`] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 — Semantic Shield */}
                  <div className="space-y-2 group/item cursor-crosshair">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-muted-foreground/20" />
                      <div className="text-muted-foreground/40 text-[8px] uppercase tracking-widest">02 / Semantic Shield</div>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-violet-400">guardrail</span>
                      <span className="text-muted-foreground">.</span>
                      <span className="text-blue-400">intercept</span>
                      <span className="text-muted-foreground">(</span>
                      <span className="text-muted-foreground">)</span>
                    </div>
                    <div className="pl-3 border-l-2 border-red-500/30 bg-red-500/5 py-1.5 px-2 space-y-1.5 rounded-r-md">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-red-400 font-black tracking-tight uppercase">Answer_Seeking_Detected</span>
                        <span className="text-red-400/50">Prob: 0.99</span>
                      </div>
                      <div className="h-1 w-full bg-red-950/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-red-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: "99%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="text-[8px] text-red-300/70 italic">↳ ACTION: DEPLOY_SOCRATIC_BYPASS_CONTROL</div>
                    </div>
                  </div>

                  {/* Step 3 — Reasoning Trace (CoT) */}
                  <div className="space-y-1 group/item cursor-crosshair">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-muted-foreground/20" />
                      <div className="text-muted-foreground/40 text-[8px] uppercase tracking-widest">03 / Reasoning Trace (CoT)</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-violet-400">scorpio_engine</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-blue-400">think</span>
                        <span className="text-muted-foreground">(</span>
                        <span className="text-muted-foreground">)</span>
                      </div>
                      <div className="flex items-center gap-1.5 pr-2">
                        <span className="text-[7px] text-muted-foreground/40 uppercase font-black uppercase">Depth</span>
                        <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-400"
                            animate={{ width: ["10%", "85%", "85%"] }}
                            transition={{ duration: 2, times: [0, 0.4, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pl-3 text-[9px] text-muted-foreground/60 space-y-1 italic bg-white/5 p-2 rounded-lg border border-white/5 transition-colors group-hover/item:border-white/10">
                      <div>&quot;Supplying direct answer violates policy...&quot;</div>
                      <div>&quot;Formulating conceptual path via kinematics...&quot;</div>
                      <div>&quot;Targeting friction coefficient gap...&quot;</div>
                    </div>
                  </div>

                  {/* Step 4 — Logit Sampling */}
                  <div className="space-y-1 group/item cursor-crosshair">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-muted-foreground/20" />
                      <div className="text-muted-foreground/40 text-[8px] uppercase tracking-widest">04 / Logit Sampling</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-violet-400">decoder</span>
                      <span className="text-muted-foreground">.</span>
                      <span className="text-blue-400">sample_prob</span>
                      <span className="text-muted-foreground">(temp=</span>
                      <span className="text-amber-300">0.2</span>
                      <span className="text-muted-foreground">)</span>
                    </div>
                    <div className="flex gap-1 items-end h-8 pl-3">
                      {[30, 45, 90, 40, 55, 75, 45, 60].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary/40 rounded-t-sm"
                          animate={{
                            height: [`${h}%`, `${Math.min(100, h + i * 5)}%`, `${h}%`],
                            backgroundColor: i === 2 ? ["rgba(var(--primary), 0.5)", "rgba(var(--primary), 1)", "rgba(var(--primary), 0.5)"] : "rgba(var(--primary), 0.4)"
                          }}
                          transition={{
                            duration: 1.5 + Math.random(),
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                      <span className="text-[8px] text-primary ml-2 animate-pulse font-black whitespace-nowrap uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                        HINT_GEN_ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Step 5 — Post-Verification */}
                  <div className="space-y-1 group/item cursor-crosshair">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-4 bg-muted-foreground/20" />
                      <div className="text-muted-foreground/40 text-[8px] uppercase tracking-widest">05 / Post-Verification</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-2 gap-2 text-[8px] flex-1">
                        <div className="flex items-center gap-1.5 p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                          LATEX_INTEGRITY: 1.0
                        </div>
                        <div className="flex items-center gap-1.5 p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                          ZERO_LEAK_BYPASS
                        </div>
                      </div>
                      <div className="px-3 flex items-center justify-center">
                        <div className="relative h-6 w-6">
                          <svg className="h-6 w-6 -rotate-90">
                            <circle className="stroke-white/5 stroke-2 fill-none" cx="12" cy="12" r="10" />
                            <motion.circle
                              className="stroke-emerald-500 stroke-2 fill-none"
                              cx="12" cy="12" r="10"
                              strokeDasharray="62.8"
                              animate={{ strokeDashoffset: [62.8, 0] }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[6px] font-black text-emerald-400">100</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-4 flex justify-between items-end border-t border-border/20">
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                      Precison Index
                      <Sparkles className="h-2 w-2" />
                    </div>
                    <div className="text-2xl font-black text-white">99.8%</div>
                  </div>
                  <div className="h-9 w-9 flex items-center justify-center bg-primary/20 rounded-xl border border-primary/40 hover:bg-primary/30 transition-all cursor-pointer hover:scale-105 active:scale-95 group/check">
                    <CheckCircle2 className="h-4 w-4 text-primary group-hover/check:scale-110 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
