"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, ShieldCheck, Zap, Brain } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────
//
// Source: research/page.tsx constraintLevels (125-response ablation study)
//
// Metric mapping onto 0–5 scale:
//  "Ped. Quality"   – PhD-audited holistic score reported directly on 0–5 scale.
//  "LaTeX Density"  – latexUsage (words/100w) normalised to 5: value × (5 / 0.92).
//                     Max in study = 0.92 → maps to 5.0.
//  "Socratic Q's"   – avgQuestions normalised: value × (5 / 1.25).
//                     Max in study = 1.25 → maps to 5.0.
//  "Answer Refusal" – Inverse of Direct Answer Rate %.
//                     DAR 100% → 0.0  |  DAR 0% → 5.0.

const data = [
  {
    // NONE: Baseline Gemini 2.5 Flash, no constraints
    // DAR=100% → refusal=0  |  latex=0.22 → 1.20  |  avgQ=1.00 → 4.00  |  ped=4.38
    name: "NONE",
    "Answer Refusal":  0.00,
    "LaTeX Density":   1.20,
    "Socratic Q's":    4.00,
    "Ped. Quality":    4.38,
  },
  {
    // DOMAIN: Physics domain restriction only
    // DAR=100% → refusal=0  |  latex=0.35 → 1.90  |  avgQ=0.50 → 2.00  |  ped=4.50
    name: "DOMAIN",
    "Answer Refusal":  0.00,
    "LaTeX Density":   1.90,
    "Socratic Q's":    2.00,
    "Ped. Quality":    4.50,
  },
  {
    // PEDAGOGY: Domain + response classification
    // DAR=0% → refusal=5  |  latex=0.28 → 1.52  |  avgQ=1.12 → 4.48  |  ped=3.88
    name: "PEDAGOGY",
    "Answer Refusal":  5.00,
    "LaTeX Density":   1.52,
    "Socratic Q's":    4.48,
    "Ped. Quality":    3.88,
  },
  {
    // NOTATION: Domain + pedagogy + LaTeX/unit enforcement
    // DAR=0% → refusal=5  |  latex=0.88 → 4.78  |  avgQ=1.00 → 4.00  |  ped=4.12
    name: "NOTATION",
    "Answer Refusal":  5.00,
    "LaTeX Density":   4.78,
    "Socratic Q's":    4.00,
    "Ped. Quality":    4.12,
  },
  {
    // FULL: Complete Socratic tutoring stack
    // DAR=0% → refusal=5  |  latex=0.92 → 5.00  |  avgQ=1.25 → 5.00  |  ped=4.62
    name: "FULL",
    "Answer Refusal":  5.00,
    "LaTeX Density":   5.00,
    "Socratic Q's":    5.00,
    "Ped. Quality":    4.62,
  },
];

// Raw source values for the tooltip (so users see real paper numbers)
const rawData: Record<string, Record<string, string>> = {
  NONE:     { "Answer Refusal": "DAR 100%",  "LaTeX Density": "0.22/100w", "Socratic Q's": "1.00/resp", "Ped. Quality": "4.38 / 5" },
  DOMAIN:   { "Answer Refusal": "DAR 100%",  "LaTeX Density": "0.35/100w", "Socratic Q's": "0.50/resp", "Ped. Quality": "4.50 / 5" },
  PEDAGOGY: { "Answer Refusal": "DAR 0%",    "LaTeX Density": "0.28/100w", "Socratic Q's": "1.12/resp", "Ped. Quality": "3.88 / 5" },
  NOTATION: { "Answer Refusal": "DAR 0%",    "LaTeX Density": "0.88/100w", "Socratic Q's": "1.00/resp", "Ped. Quality": "4.12 / 5" },
  FULL:     { "Answer Refusal": "DAR 0%",    "LaTeX Density": "0.92/100w", "Socratic Q's": "1.25/resp", "Ped. Quality": "4.62 / 5" },
};

const metrics = [
  { key: "Answer Refusal", color: "#f43f5e" },   // rose-500
  { key: "LaTeX Density",  color: "#818cf8" },   // indigo-400
  { key: "Socratic Q's",  color: "#34d399" },   // emerald-400
  { key: "Ped. Quality",  color: "#fbbf24" },   // amber-400
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface PayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const raw = rawData[label] ?? {};

  return (
    <div className="bg-background/95 backdrop-blur-2xl border border-border/60 rounded-2xl p-5 shadow-2xl min-w-[240px]">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 text-primary">
        Constraint Layer: {label}
      </p>
      <div className="space-y-2.5">
        {payload.map((entry: PayloadEntry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-bold text-foreground">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-black font-mono text-muted-foreground tabular-nums">
              {raw[entry.name] ?? entry.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border/40">
        <p className="text-[9px] text-muted-foreground font-medium italic leading-tight">
          All bars normalised to 0–5 for comparison. Hover values show raw study figures.
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LayerEfficacyChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
            <Zap className="h-4 w-4" />
            Empirical Performance · 125-Response Ablation Study
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-none text-foreground">
            Constraint Efficacy:<br />
            <span className="text-muted-foreground font-medium italic">Layer-by-Layer Impact</span>
          </h3>
          <p className="text-sm text-muted-foreground font-medium max-w-xl">
            Each constraint layer adds a measurable, verifiable effect. The FULL stack achieves 0% Direct Answer Rate,
            0.92 LaTeX density and a 4.62/5 PhD-validated quality score — all without fine-tuning.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">PhD Validated</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Brain className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">N=125 Trials</span>
          </div>
        </div>
      </div>

      {/* ─ Legend pills ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Answer Refusal", sub: "Inverse of Direct Answer Rate", color: "#f43f5e", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "LaTeX Density",  sub: "Notation per 100 words (norm.)", color: "#818cf8", bg: "bg-indigo-400/10 border-indigo-400/20" },
          { label: "Socratic Q's",  sub: "Avg questions per response",    color: "#34d399", bg: "bg-emerald-400/10 border-emerald-400/20" },
          { label: "Ped. Quality",  sub: "PhD holistic score (0-5)",      color: "#fbbf24", bg: "bg-amber-400/10 border-amber-400/20" },
        ].map((m) => (
          <div
            key={m.label}
            className={cn("flex items-start gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-sm", m.bg)}
          >
            <div className="h-3 w-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: m.color }} />
            <div>
              <p className="text-[11px] font-black text-foreground leading-tight">{m.label}</p>
              <p className="text-[9px] text-muted-foreground font-medium leading-tight mt-0.5">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bar Chart ─────────────────────────────────────────────────────────── */}
      <div className="w-full rounded-[3rem] border border-border/40 bg-card/30 backdrop-blur-xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500">
          <Brain className="w-72 h-72 text-foreground" />
        </div>

        <div className="h-[420px] md:h-[520px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: isMobile ? 8 : 24,
                left: isMobile ? -20 : 0,
                bottom: 20,
              }}
              barGap={isMobile ? 1 : 3}
              barCategoryGap={isMobile ? "18%" : "28%"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(128,128,128,0.08)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12, fontWeight: 900 }}
                axisLine={{ stroke: "rgba(128,128,128,0.12)" }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 32 : 40}
                tickFormatter={(v: number) => v.toFixed(0)}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(128,128,128,0.04)" }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "40px" }}
                formatter={(value) => (
                  <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {value}
                  </span>
                )}
              />

              {metrics.map((metric) => (
                <Bar
                  key={metric.key}
                  dataKey={metric.key}
                  fill={metric.color}
                  radius={[5, 5, 0, 0]}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Key Findings ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Domain Resets Socratic Depth",
            desc: "Adding domain constraints cuts avg questions from 1.00 → 0.50/response as the model prioritises content accuracy first.",
            icon: Info,
            bg: "bg-indigo-400/10 border-indigo-400/20",
            iconColor: "text-indigo-400",
          },
          {
            title: "Pedagogy Kills Direct Answers",
            desc: "The Pedagogy layer is the critical toggle: Direct Answer Rate drops from 100% → 0% in a single constraint addition.",
            icon: ShieldCheck,
            bg: "bg-rose-500/10 border-rose-500/20",
            iconColor: "text-rose-500",
          },
          {
            title: "Notation Unlocks LaTeX",
            desc: "LaTeX density jumps from 0.28 → 0.88 per 100 words — a 314% increase — upon adding the Notation constraint alone.",
            icon: Zap,
            bg: "bg-amber-400/10 border-amber-400/20",
            iconColor: "text-amber-400",
          },
          {
            title: "FULL Stack: +0.67 pts",
            desc: "PhD expert independently validated a +0.67 point pedagogical gain for the FULL stack vs baseline (3.83 vs 3.16).",
            icon: Brain,
            bg: "bg-emerald-400/10 border-emerald-400/20",
            iconColor: "text-emerald-400",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-6 rounded-2xl border backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300 shadow-sm",
              item.bg
            )}
          >
            <div className={cn("h-10 w-10 rounded-xl mb-5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300", item.bg)}>
              <item.icon className={cn("h-5 w-5", item.iconColor)} />
            </div>
            <h4 className="text-sm font-black mb-2 text-foreground">{item.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
