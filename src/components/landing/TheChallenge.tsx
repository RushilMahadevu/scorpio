"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Brain, GraduationCap, ChartColumnIncreasing } from "lucide-react";

export function TheChallenge() {
  return (
    <section id="challenge" className="container mx-auto px-6 py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[120px] pointer-events-none -z-10" />
      {/* Faint background equations — atmosphere only */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {[
          { eq: "ΔE · Δt ≥ ℏ/2", x: "2%",  y: "12%", delay: 1,   dur: 14 },
          { eq: "F = -kx",         x: "85%", y: "20%", delay: 3,   dur: 11 },
          { eq: "∇ · E = ρ/ε₀",   x: "78%", y: "75%", delay: 0.5, dur: 13 },
          { eq: "pV = nRT",         x: "5%",  y: "80%", delay: 2.5, dur: 10 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute text-xs text-primary/10 dark:text-primary/15 whitespace-nowrap"
            style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.5, 0], y: [0, -18] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
          >
            {p.eq}
          </motion.span>
        ))}
      </div>
      
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="space-y-6 max-w-2xl">
            <motion.div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-bold tracking-widest uppercase text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-primary" />
              <span>Why Other Tools Fail Educators</span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Every AI physics tool has the <span className="text-primary italic">same fatal flaw.</span>
            </motion.h2>
          </div>
          <motion.p 
            className="text-muted-foreground text-lg font-medium max-w-md pb-2 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Traditional platforms give students the answer. Without the struggle of derivation, there is no learning — only the appearance of it.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[
            {
              icon: <Brain className="size-6 text-primary" />,
              label: "AI Gives Away the Answer",
              desc: "ChatGPT, Wolfram, Khan AI — every competing tool completes the derivation for students. Learning requires the struggle. These tools bypass it entirely.",
            },
            {
              icon: <GraduationCap className="size-6 text-primary" />,
              label: "Misconceptions Compound Silently",
              desc: "A student who misunderstands conservation of momentum will misapply it for the rest of the course. The only cure is catching the flaw in the derivation — not after the exam.",
            },
            {
              icon: <ChartColumnIncreasing className="size-6 text-primary" />,
              label: "Grading Without Understanding",
              desc: "A submitted answer tells you what a student wrote, not what they understood. Scorpio captures the derivation process itself — every step, every constraint applied.",
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`group relative overflow-hidden space-y-4 p-8 rounded-3xl border border-border/60 bg-card/10 backdrop-blur-md hover:bg-card/20 hover:border-primary/20 transition-all duration-500`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-background border border-border flex items-center justify-center mb-6 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{item.label}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
