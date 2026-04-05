"use client";

import { motion } from "framer-motion";
import { Sparkles, KeyRound, PlayCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { CruxLogo } from "@/components/ui/crux-logo";
import Link from "next/link";
import { useState } from "react";

export function LandingHero() {
  const [logoRotation, setLogoRotation] = useState(0);

  const stats = [
    { value: "0%", label: "Direct Answer Rate", sublabel: "Verified by Ph.D. Audit" },
    { value: "+0.67", label: "Pedagogical Uplift", sublabel: "125-Response Ablation Study" },
    { value: "100%", label: "Cost Transparency", sublabel: "Zero-Markup Pass-through" },
    { value: "4-Layer", label: "Constraint Architecture", sublabel: "Inference-Time Scaffolding" }
  ];

  return (
    <section id="home" className="container mx-auto px-6 py-16 text-center relative overflow-hidden">
      {/* Atmospheric background — floating equations */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[200px] bg-primary/5 blur-[90px] rounded-full" />
        <div className="absolute bottom-[15%] right-[8%] w-[350px] h-[220px] bg-primary/5 blur-[100px] rounded-full" />

        {[
          { eq: "F = ma",         x: "8%",  y: "20%", delay: 0,   dur: 8  },
          { eq: "E = mc²",        x: "80%", y: "15%", delay: 1.5, dur: 10 },
          { eq: "∇ × B = μ₀J",   x: "12%", y: "72%", delay: 0.8, dur: 9  },
          { eq: "ΔS ≥ 0",         x: "75%", y: "68%", delay: 2,   dur: 11 },
          { eq: "p = ℏk",         x: "50%", y: "82%", delay: 1.2, dur: 7  },
          { eq: "∮ E·dA = Q/ε₀",  x: "88%", y: "44%", delay: 3,  dur: 12 },
          { eq: "λ = h/mv",       x: "3%",  y: "46%", delay: 2.5, dur: 9  },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute text-sm font-semibold text-primary/30 dark:text-primary/40 whitespace-nowrap"
            style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 0.6, 0.6, 0], y: [10, -30] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1]
            }}
          >
            {p.eq}
          </motion.span>
        ))}

        {[
          { eq: "∇²φ = ρ/ε₀",    x: "62%", y: "8%",  delay: 4,   dur: 13 },
          { eq: "v = fλ",          x: "27%", y: "11%", delay: 5.5, dur: 8  },
          { eq: "τ = Iα",          x: "91%", y: "78%", delay: 2.2, dur: 10 },
          { eq: "KE = ½mv²",       x: "38%", y: "90%", delay: 6,   dur: 11 },
          { eq: "L = Iω",          x: "1%",  y: "88%", delay: 3.8, dur: 9  },
        ].map((p, i) => (
          <motion.span
            key={`s${i}`}
            className="absolute text-xs font-medium text-primary/15 dark:text-primary/20 whitespace-nowrap"
            style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 0.4, 0.4, 0], y: [6, -20] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.25, 0.75, 1]
            }}
          >
            {p.eq}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="max-w-4xl mx-auto space-y-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary/90 uppercase">Built for Physics Educators</span>
        </motion.div>

        <div className="flex justify-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-48 h-48 bg-primary/20 blur-[100px] rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <motion.div
              className="cursor-pointer"
              onClick={() => setLogoRotation(prev => prev + 360)}
              animate={{ rotate: logoRotation, y: [0, -8, 0] }}
              whileHover={{ scale: 1.08 }}
              transition={{
                rotate: { type: "spring", stiffness: 60, damping: 12 },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                default: { duration: 2, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <Logo
                size={72}
                className="text-foreground drop-shadow-[0_0_30px_rgba(var(--primary),0.3)] dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.12)]"
              />
            </motion.div>
            
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-12 w-px bg-border/40 mx-2"
            />

            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <CruxLogo 
                size={56} 
                className="text-primary animate-pulse shadow-[0_0_30px_rgba(var(--primary),0.4)]" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Crux Engine</span>
            </motion.div>
          </div>
        </div>

        <motion.h1
          className="text-6xl md:text-8xl font-black font-inter tracking-tighter mb-4 text-foreground pb-2 leading-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Scorpio
        </motion.h1>

        <motion.p
          className="text-2xl md:text-4xl font-black mb-8 max-w-3xl mx-auto leading-tight bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
        >
          The Physics LMS Powered by Crux
        </motion.p>

        <motion.p
          className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          whileHover={{ 
            textShadow: "0 0 20px rgba(var(--primary),0.2)",
            transition: { duration: 0.3 }
          }}
        >
          The first verifiable framework for Socratic physics tutoring. 
          Enforce the struggle with a 4-layer constraint architecture 
          powered by the <span className="text-primary font-bold">Crux Socratic Engine</span>.
        </motion.p>


        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 1.0
              }
            }
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="space-y-1 p-4 rounded-2xl bg-background/5 backdrop-blur-sm border border-white/5 hover:bg-white/2.5 transition-colors"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
            >
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs font-bold text-foreground/80 leading-tight">{stat.label}</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center pt-1 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto font-bold text-base px-8 h-12 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all cursor-pointer">
              <KeyRound className="h-4 w-4" />
              Get Faculty Access
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => { const el = document.getElementById("demos"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            className="w-full sm:w-auto font-bold text-base px-8 h-12 rounded-full bg-background/50 backdrop-blur-md border border-white/10 hover:bg-white/10 cursor-pointer inline-flex items-center justify-center gap-2 transition-all"
          >
            <PlayCircle className="h-4 w-4" />
            Watch Platform Demo
          </button>
        </motion.div>

        <motion.div
          className=" animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
        >
          <button
            aria-label="Scroll to Mission Control"
            onClick={() => {
              const el = document.getElementById("mission-control");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="focus:outline-none"
            type="button"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto cursor-pointer hover:text-foreground transition-colors" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
