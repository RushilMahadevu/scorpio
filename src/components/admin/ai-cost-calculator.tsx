"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles, User, HelpCircle, ArrowRight, Zap, Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function AICostCalculator() {
  const [students, setStudents] = useState<number>(150);
  const [queriesPerStudent, setQueriesPerStudent] = useState<number>(45);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(800);
  const [avgOutputTokens, setAvgOutputTokens] = useState<number>(400);
  const [planType, setPlanType] = useState<"monthly" | "yearly">("yearly");

  // Gemini 2.5 Flash Rates in Dollars per 1M tokens
  const INPUT_RATE_USD = 0.15 / 1_000_000;
  const OUTPUT_RATE_USD = 0.60 / 1_000_000;
  
  const BASE_FEE = planType === "monthly" ? 4.99 : 2.49; 

  const results = useMemo(() => {
    const totalQueries = students * queriesPerStudent;
    const totalInputTokens = totalQueries * avgPromptTokens;
    const totalOutputTokens = totalQueries * avgOutputTokens;

    const inputCost = totalInputTokens * INPUT_RATE_USD;
    const outputCost = totalOutputTokens * OUTPUT_RATE_USD;
    const aiUsageCost = inputCost + outputCost;

    return {
      aiUsageCost,
      totalCost: aiUsageCost + BASE_FEE,
      totalQueries,
      costPerStudent: (aiUsageCost + BASE_FEE) / Math.max(students, 1)
    };
  }, [students, queriesPerStudent, avgPromptTokens, avgOutputTokens, planType]);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-card shadow-sm overflow-hidden transition-all duration-300">
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <Calculator className="h-4 w-4 text-black dark:text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Investment Estimator
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-zinc-400 cursor-help inline-flex ml-2 transition-all hover:text-black dark:hover:text-white" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[320px] p-0 overflow-hidden border-zinc-200/50 shadow-2xl rounded-2xl">
                    <div className="bg-zinc-900 p-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator className="h-4 w-4 text-zinc-400" />
                        <p className="font-black text-xs uppercase tracking-widest">Network Budgeting</p>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium font-sans">
                        Estimate your monthly network costs based on class size and AI usage intensity.
                      </p>
                    </div>
                    <div className="p-4 space-y-3 bg-white dark:bg-zinc-950">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3 bg-zinc-50 dark:bg-zinc-900/50 px-2 py-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                          <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="font-black text-[9px] uppercase text-zinc-600 dark:text-zinc-400 font-mono tracking-wider">SAFETY CAPS</p>
                            <p className="text-[10px] text-muted-foreground leading-snug">Set hard limits in Network Settings to ensure costs never exceed your budget.</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-start gap-3 bg-zinc-50 dark:bg-zinc-900/50 px-2 py-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                          <Sparkles className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="font-black text-[9px] uppercase text-zinc-600 dark:text-zinc-400 font-mono tracking-wider">ZERO SURCHARGE</p>
                            <p className="text-[10px] text-muted-foreground leading-snug">Scorpio forwards raw API costs from Google Cloud directly to you with 0% markup.</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-tighter">Usage intensity affects token volume per interaction.</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Calculate department costs with pass-through billing.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ${results.totalCost.toFixed(2)}<span className="text-[10px] font-normal text-zinc-500">/mo</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">Est. Total</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-8 border-t border-zinc-100 dark:border-zinc-900 mt-4">
        <div className="flex justify-center pt-4">
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full max-w-[300px]">
            <button 
              onClick={() => setPlanType("monthly")}
              className={cn(
                "text-[10px] py-1.5 rounded-md transition-all font-medium cursor-pointer flex items-center justify-center gap-1",
                planType === "monthly" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >Monthly</button>
            <button 
              onClick={() => setPlanType("yearly")}
              className={cn(
                "text-[10px] py-1.5 rounded-md transition-all font-medium flex items-center justify-center gap-1 cursor-pointer flex items-center justify-center gap-1",
                planType === "yearly" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >Yearly <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-none">-50%</Badge></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column: Sliders */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Student Count
                </Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={students} 
                    onChange={(e) => setStudents(Number(e.target.value))}
                    className="w-16 h-7 text-xs font-mono text-center p-0"
                  />
                </div>
              </div>
              <Slider 
                value={[students]} 
                onValueChange={(val) => setStudents(val[0])}
                max={2000} 
                min={1}
                step={1}
                className="cursor-pointer py-1"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Monthly Queries
                </Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={queriesPerStudent} 
                    onChange={(e) => setQueriesPerStudent(Number(e.target.value))}
                    className="w-16 h-7 text-xs font-mono text-center p-0"
                  />
                </div>
              </div>
              <Slider 
                value={[queriesPerStudent]} 
                onValueChange={(val) => setQueriesPerStudent(val[0])}
                max={3000} 
                min={0}
                step={1}
                className="cursor-pointer py-1"
              />
              <div className="flex justify-between text-[9px] text-zinc-400 font-medium lowercase">
                <span>Light (150+)</span>
                <span>~{(queriesPerStudent / 30).toFixed(1)} queries/day avg</span>
                <span>Heavy (750+)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Intensity Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              Instructional Intensity
            </Label>
            <div className="space-y-2">
              {[
                { label: "Casual Inquiry", sub: "Homework help, quick questions", p: 400, o: 200 },
                { label: "Socratic Tutoring", sub: "Deep dialogue, guiding logic", p: 800, o: 400 },
                { label: "Detailed Grading", sub: "Formative feedback sessions", p: 2000, o: 1000 },
              ].map((mode) => (
                <button 
                  key={mode.label}
                  onClick={() => { setAvgPromptTokens(mode.p); setAvgOutputTokens(mode.o); }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all text-sm cursor-pointer",
                    avgPromptTokens === mode.p 
                      ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 ring-1 ring-zinc-200 dark:ring-zinc-800' 
                      : 'bg-transparent border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{mode.label}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{mode.sub}</p>
                    </div>
                    {avgPromptTokens === mode.p && (
                      <div className="h-1.5 w-1.5 rounded-full bg-foreground shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Billing Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-100 dark:border-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Monthly</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-loose">
                  ${results.totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-medium text-zinc-500 border-b border-zinc-200/50 dark:border-zinc-800 pb-2">
                  <span>BREAKDOWN</span>
                  <span>MONTHLY</span>
              </div>
              <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500">Platform License</span>
                      <span className="font-mono font-semibold">${BASE_FEE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500">AI Tokens (Estimated)</span>
                      <span className="font-mono font-semibold">${results.aiUsageCost.toFixed(2)}</span>
                  </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-end text-right">
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">Effective Rate</p>
                <p className="text-xl font-black font-mono tracking-tighter">
                  ${results.costPerStudent.toFixed(2)}
                  <span className="text-[10px] font-normal lowercase ml-1">/student</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Info className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
            Scorpio operates on a <span className="text-zinc-900 dark:text-zinc-200 font-bold">Zero-Margin Pass-Through</span> model. 
            AI costs are calculated at raw Google Cloud rates ($0.15/$0.60 per 1M tokens) and billed directly via Polar with no platform surcharge.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
