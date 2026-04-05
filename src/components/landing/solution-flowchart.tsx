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
    color: "text-slate-300",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/20",
    glowColor: "shadow-slate-400/20",
    features: ["Physics Context Refusal", "Solution Leakage Blocking", "Academic Domain Locking"]
  },
  {
    id: "step-2",
    title: "Pedagogical Intent Engine",
    description: "Classifies student intent in real-time to select the optimal scaffolding mode for the conceptual gap.",
    icon: Brain,
    color: "text-indigo-300",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    glowColor: "shadow-indigo-400/20",
    features: ["Intent Classification", "Scaffolding Mode Selection", "Cognitive Load Balancing"]
  },
  {
    id: "step-3",
    title: "Symbolic Notation Mesh",
    description: "Enforces rigid scientific syntax and LaTeX density. Verifies unit consistency before response generation.",
    icon: Calculator,
    color: "text-emerald-300",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    glowColor: "shadow-emerald-400/20",
    features: ["LaTeX Syntax Enforcement", "Unit Consistency Checks", "Symbolic Math Verification"]
  },
  {
    id: "step-4",
    title: "Socratic Scaffolding Output",
    description: "The complete stack output that elicits student reasoning through inference-time rule validation.",
    icon: Bot,
    color: "text-primary/90",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    glowColor: "shadow-primary/20",
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
            How Crux AI <span className="text-primary italic">Actually</span> Works.
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
                {/* Mock code/stack visualization */}
                <div className="p-6 space-y-4">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="h-3 w-3 rounded-full bg-red-500/50" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                      <span className="ml-2 text-[10px] font-mono text-muted-foreground/60">crux-pedagogical-engine.ts</span>
                   </div>
                   
                   <div className="space-y-3 font-mono text-[11px]">
                      <div className="flex items-center gap-2 animate-pulse">
                         <span className="text-primary">scorpio_stack</span>
                         <span className="text-muted-foreground">::</span>
                         <span className="text-blue-400">verify_intent</span>
                         <span className="text-muted-foreground">(</span>
                         <span className="text-emerald-400">&quot;Tell me the answer to 1a&quot;</span>
                         <span className="text-muted-foreground">)</span>
                      </div>
                      <div className="pl-4 text-red-400/80">→ Status: 403_INSTRUCTION_BREACH</div>
                      <div className="pl-4 text-muted-foreground">// Activating Socratic fallback...</div>
                      <div className="flex items-center gap-2 pt-2">
                         <span className="text-primary">scorpio_stack</span>
                         <span className="text-muted-foreground">::</span>
                         <span className="text-blue-400">apply_scaffolding</span>
                         <span className="text-muted-foreground">(</span>
                         <span className="text-violet-400">mode: EXPERT_VETTED</span>
                         <span className="text-muted-foreground">)</span>
                      </div>
                      <div className="pl-4 text-emerald-400/80">→ Gain: +0.67 PEDAGOGICAL_UPLIFT</div>
                      
                      <div className="flex items-center gap-2 pt-2">
                         <span className="text-primary">scorpio_stack</span>
                         <span className="text-muted-foreground">::</span>
                         <span className="text-blue-400">render_latex</span>
                         <span className="text-muted-foreground">(</span>
                         <span className="text-amber-400">context: equilibrium</span>
                         <span className="text-muted-foreground">)</span>
                      </div>
                      <div className="pl-4 text-muted-foreground/40 font-italic">{"Rendering \\sum \\vec{F} = 0..."}</div>
                   </div>

                   <div className="pt-8 flex justify-between items-end">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black uppercase tracking-widest text-primary">Direct Answer Rate</div>
                         <div className="text-2xl font-black text-white">0.0%</div>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center bg-primary/20 rounded-xl border border-primary/40">
                         <CheckCircle2 className="h-5 w-5 text-primary" />
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
