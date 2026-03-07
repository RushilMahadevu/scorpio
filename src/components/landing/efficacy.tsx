"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, BookOpen, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Efficacy() {
  return (
    <section id="efficacy" className="container mx-auto px-6 py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      {/* Ambient equations */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        {[
          { eq: "S = k ln Ω",        x: "1%",  y: "18%", delay: 0,   dur: 12 },
          { eq: "H = U + pV",         x: "88%", y: "10%", delay: 2,   dur: 10 },
          { eq: "c = 1/√(μ₀ε₀)",     x: "82%", y: "82%", delay: 1.5, dur: 13 },
          { eq: "σ = F/A",            x: "4%",  y: "72%", delay: 3.5, dur: 9  },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute text-xs text-primary/10 dark:text-primary/15 whitespace-nowrap"
            style={{ left: p.x, top: p.y, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0.45, 0], y: [0, -16] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
          >
            {p.eq}
          </motion.span>
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          className="flex-1 space-y-8"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="space-y-4">
            <motion.div 
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-xs font-bold tracking-widest uppercase text-secondary-foreground"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Evidence-Based Results</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-foreground">
              Validated Institutional <span className="text-secondary-foreground italic">Efficacy.</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
              Based on our 125-response ablation study, Scorpio's framework successfully eliminates direct solution delivery while achieving expert-validated gains in pedagogical quality and symbolic precision.
            </p>
          </div>
          
          <motion.div 
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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
               { label: "Direct Answer Rate", value: "0%", active: true },
               { label: "Expert Score Gain", value: "+0.67", active: true },
               { label: "LaTeX Density", value: "0.92", active: false },
               { label: "Pedagogical Quality", value: "4.62", active: false }
             ].map((stat, i) => (
               <motion.div 
                key={i} 
                className="p-6 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm space-y-2 group hover:border-secondary/30 transition-colors"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
               >
                  <div className="text-3xl font-black text-foreground group-hover:text-secondary-foreground transition-colors">{stat.value}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
               </motion.div>
             ))}
          </motion.div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link href="/research" target="_blank">
              <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all gap-3 group">
                <BookOpen className="h-5 w-5 text-secondary-foreground group-hover:scale-110 transition-transform" />
                View Scorpio Research
              </Button>
            </Link>
            <Link href="/demos/comprehensive_metrics.pdf" target="_blank">
              <Button size="lg" variant="outline" className="h-14 px-8 cursor-pointer rounded-full font-bold border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50 transition-all gap-3 group">
                <FileDown className="h-5 w-5 text-secondary-foreground group-hover:scale-110 transition-transform" />
                Download Comprehensive Metrics
              </Button>
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 w-full lg:max-w-md"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
           <div className="relative aspect-square rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center space-y-6 overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="h-20 w-20 rounded-3xl bg-background border border-border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="h-10 w-10 text-secondary-foreground" />
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-black italic">PhD-Validated Framework.</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                   Subjected to a rigorous 625-pass internal assessment battery and independently audited by Physics PhDs on a blinded 30-item stratified subset.
                </p>
              </div>
              <div className="pt-4 grid grid-cols-2 gap-4 w-full relative z-10 px-4">
                 <div className="text-left border-l-2 border-secondary/30 pl-3">
                    <div className="text-lg font-black leading-none">625</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Internal Assessments</div>
                 </div>
                 <div className="text-left border-l-2 border-secondary/30 pl-3">
                    <div className="text-lg font-black leading-none">0.51 κ</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Ph.D. Alignment</div>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
