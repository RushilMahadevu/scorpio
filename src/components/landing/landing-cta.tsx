"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingCTA() {
  return (
    <section id="cta" className="container mx-auto px-6 py-40">
      <motion.div
        className="max-w-5xl mx-auto rounded-[3.5rem] p-12 md:p-24 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground">Empower Your <span className="text-primary italic">Department.</span></h2>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Deploy in one afternoon. No LMS integration required. Just better physics outcomes from day one — for every student in your roster.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_15px_30px_rgba(var(--primary),0.2)] cursor-pointer transition-all duration-300">
                Get Faculty Access
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg cursor-pointer font-black border-2 border-border bg-background/50 backdrop-blur-md hover:bg-muted/30 transition-all duration-300">
                Request Department Demo
              </Button>
            </Link>
          </div>
          <div className="pt-4">
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">PhD-Validated Framework • FERPA-Ready Infrastructure • Zero Markup AI</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
