"use client";

import { AICostCalculator } from "@/components/admin/ai-cost-calculator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Rocket, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InvestmentTrackerPage() {
  return (
    <div className="container p-6 mx-auto space-y-10 pb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="space-y-4">
          <Link href="/teacher/network">
            <Button variant="ghost" size="sm" className="pl-0 gap-2 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer h-auto py-0 font-bold text-xs uppercase tracking-widest">
              <ChevronLeft className="h-3 w-3" />
              Network
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">
              Investment Tracker
            </h1>
            <p className="text-muted-foreground font-medium text-sm max-w-md leading-relaxed">
              Strategic modeling for AI resource allocation and network scaling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 px-6 py-4 rounded-3xl border bg-zinc-50/50 dark:bg-zinc-900/30">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Efficiency</p>
             <p className="text-xl font-black font-mono text-emerald-500">Pass-Through</p>
           </div>
           <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">Method</p>
            <Link
              href="/research"
              className="text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 font-medium"
            >
            Transparent Modeling <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-8"
        >
          <AICostCalculator />
          
          <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
              <Rocket className="h-48 w-48" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Protocol</p>
                <h3 className="text-2xl font-bold tracking-tight max-w-md">Zero-Margin Infrastructure</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium max-w-xl">
                Scorpio operates on a transparent pass-through model. You pay exactly what Google Cloud charges for tokens, with no hidden margins or tiered premiums. As your network scales, your cost-per-student approaches the global floor of compute market rates.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[
                  { label: "Platform Fee", val: "0%" },
                  { label: "Token Markup", val: "0%" },
                  { label: "Data Pipeline", val: "Free" },
                  { label: "Compute", val: "Market" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">{stat.label}</p>
                    <p className="text-lg font-mono font-bold text-zinc-200">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="p-6 bg-white dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Resource Governance</h4>
            
            <div className="space-y-4">
              <div className="flex gap-4 group">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl h-fit">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Predictive Scaling</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automated allocation ensures students never face "Rate Limit" errors during peak assignment windows.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl h-fit">
                  <Rocket className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Fast Computation Speed</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scorpio's infrastructure is optimized for low latency, ensuring quick response times and a seamless user experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <Link href="/teacher/network">
                <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-12 gap-2 shadow-sm">
                  Configure Safety Caps
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2">
               <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
               <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">Security Note</p>
             </div>
             <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium leading-relaxed">
               All cost modeling is local to your session. Usage limits are enforced by hard-coded Firebase Security Rules and cannot be bypassed via browser console.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
