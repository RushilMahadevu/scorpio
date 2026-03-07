"use client";

import { motion } from "framer-motion";
import { SquareFunction, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export function MathematicalFidelity() {
  return (
    <section id="math-fidelity" className="container mx-auto px-6 py-32 relative">
      <div className="max-w-6xl mx-auto rounded-[3rem] border border-border/60 bg-card/20 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row items-center gap-12 group">
        <div className="flex-1 p-12 lg:p-20 space-y-8">
          <motion.div 
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SquareFunction className="h-3.5 w-3.5" />
            <span>The Architecture</span>
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Mathematical <span className="text-primary italic">Fidelity.</span></h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
              Scorpio features a custom-built LaTeX engine designed specifically for physics pedagogy. From complex integrals to 4-vector notation, our interface ensures symbols are rendered with publication-grade precision.
            </p>
          </div>
          <motion.ul 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4
                }
              }
            }}
          >
             {[
               "Intuitive Math Builder UI",
               "Real-time KaTeX Syntax Validation",
               "Waypoints Reference System",
               "Dynamic Preview & Correction"
             ].map((text, i) => (
               <motion.li 
                key={i} 
                className="flex items-center gap-3 text-sm font-bold text-foreground/80"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
               >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {text}
               </motion.li>
             ))}
          </motion.ul>
        </div>
        <div className="flex-1 w-full lg:w-1/2 p-6 lg:p-12 relative">
           <Dialog>
              <DialogTrigger asChild>
                 <motion.div 
                    className="relative rounded-2xl overflow-hidden border border-border shadow-3xl bg-background group-hover:opacity-80 transition-opacity duration-700 cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                 >
                    <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Maximize2 className="h-8 w-8 text-white" />
                    </div>
                    <Image 
                      src="/demos/math-builder.png" 
                      alt="Scorpio Integral Builder" 
                      width={600} 
                      height={400} 
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                 </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
                <DialogTitle className="sr-only">Mathematical Precision Interface</DialogTitle>
                <Image 
                  src="/demos/math-builder.png" 
                  alt="Scorpio Integral Builder Full View" 
                  width={1200} 
                  height={800} 
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
                />
              </DialogContent>
           </Dialog>
           {/* Decorative background blur */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
        </div>
      </div>
    </section>
  );
}
