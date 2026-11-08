"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator } from "@afixt/a11y-calc";
import "@afixt/a11y-calc/style.css";
import {
  Calculator as CalcIcon,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Physics Constants Reference ───────────────────────────────────────────────

export interface PhysicsConstant {
  symbol: string;
  name: string;
  value: string;
  displayValue: string;
  unit: string;
  category: "Mechanics" | "Electromagnetism" | "Quantum & Thermal" | "Math";
}

export const PHYSICS_CONSTANTS: PhysicsConstant[] = [
  { symbol: "g", name: "Standard Gravity", value: "9.80665", displayValue: "9.807", unit: "m/s²", category: "Mechanics" },
  { symbol: "c", name: "Speed of Light", value: "299792458", displayValue: "3.00 × 10⁸", unit: "m/s", category: "Mechanics" },
  { symbol: "G", name: "Gravitational Constant", value: "6.6743e-11", displayValue: "6.674 × 10⁻¹¹", unit: "N·m²/kg²", category: "Mechanics" },
  { symbol: "e", name: "Elementary Charge", value: "1.602176634e-19", displayValue: "1.602 × 10⁻¹⁹", unit: "C", category: "Electromagnetism" },
  { symbol: "k_e", name: "Coulomb's Constant", value: "8.9875517923e9", displayValue: "8.988 × 10⁹", unit: "N·m²/C²", category: "Electromagnetism" },
  { symbol: "ε₀", name: "Permittivity of Free Space", value: "8.8541878128e-12", displayValue: "8.854 × 10⁻¹²", unit: "F/m", category: "Electromagnetism" },
  { symbol: "μ₀", name: "Permeability of Free Space", value: "1.25663706212e-6", displayValue: "1.257 × 10⁻⁶", unit: "T·m/A", category: "Electromagnetism" },
  { symbol: "h", name: "Planck's Constant", value: "6.62607015e-34", displayValue: "6.626 × 10⁻³⁴", unit: "J·s", category: "Quantum & Thermal" },
  { symbol: "ℏ", name: "Reduced Planck's Constant", value: "1.054571817e-34", displayValue: "1.055 × 10⁻³⁴", unit: "J·s", category: "Quantum & Thermal" },
  { symbol: "m_e", name: "Electron Mass", value: "9.1093837e-31", displayValue: "9.109 × 10⁻³¹", unit: "kg", category: "Quantum & Thermal" },
  { symbol: "m_p", name: "Proton Mass", value: "1.67262192e-27", displayValue: "1.673 × 10⁻²⁷", unit: "kg", category: "Quantum & Thermal" },
  { symbol: "m_n", name: "Neutron Mass", value: "1.674927498e-27", displayValue: "1.675 × 10⁻²⁷", unit: "kg", category: "Quantum & Thermal" },
  { symbol: "k_B", name: "Boltzmann Constant", value: "1.380649e-23", displayValue: "1.381 × 10⁻²³", unit: "J/K", category: "Quantum & Thermal" },
  { symbol: "R", name: "Ideal Gas Constant", value: "8.314462618", displayValue: "8.314", unit: "J/(mol·K)", category: "Quantum & Thermal" },
  { symbol: "N_A", name: "Avogadro's Number", value: "6.02214076e23", displayValue: "6.022 × 10²³", unit: "mol⁻¹", category: "Quantum & Thermal" },
  { symbol: "σ", name: "Stefan-Boltzmann Constant", value: "5.670374419e-8", displayValue: "5.670 × 10⁻⁸", unit: "W/(m²·K⁴)", category: "Quantum & Thermal" },
  { symbol: "atm", name: "Standard Atmosphere", value: "101325", displayValue: "101,325", unit: "Pa", category: "Quantum & Thermal" },
  { symbol: "π", name: "Pi", value: "3.141592653589793", displayValue: "3.14159", unit: "", category: "Math" },
  { symbol: "e", name: "Euler's Number", value: "2.718281828459045", displayValue: "2.71828", unit: "", category: "Math" },
];

export type CalculatorMode = "desmos-sci" | "desmos-graph" | "react-calc" | "constants";

export interface ScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ScientificCalculator({
  isOpen,
  onClose,
  className,
}: ScientificCalculatorProps) {
  const [mode, setMode] = useState<CalculatorMode>("desmos-sci");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleCopyConstant = (constant: PhysicsConstant) => {
    navigator.clipboard.writeText(constant.value);
    setCopiedSymbol(constant.symbol);
    toast.success(`Copied ${constant.symbol} (${constant.displayValue}) to clipboard`);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  if (!isOpen) return null;

  const filteredConstants = selectedCategory === "All"
    ? PHYSICS_CONSTANTS
    : PHYSICS_CONSTANTS.filter((c) => c.category === selectedCategory);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "fixed z-[120] bottom-4 right-4 rounded-2xl shadow-2xl border border-border/80 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden text-foreground select-none transition-all duration-200",
          isMinimized
            ? "w-auto h-auto"
            : isExpanded
            ? "w-[94vw] max-w-5xl h-[86vh]"
            : mode === "desmos-graph"
            ? "w-[92vw] sm:w-[620px] h-[580px]"
            : "w-[92vw] sm:w-[480px] h-[560px]",
          className
        )}
      >
        {/* ── Header Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/60 shrink-0 gap-2">
          {/* Brand & Mode Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <CalcIcon className="h-4 w-4" />
            </div>

            {/* Mode Pills */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-full border border-border/60 text-[11px] font-semibold shrink-0">
              <button
                onClick={() => { setMode("desmos-sci"); setIsMinimized(false); }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                  mode === "desmos-sci"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Desmos Sci</span>
              </button>

              <button
                onClick={() => { setMode("desmos-graph"); setIsMinimized(false); }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                  mode === "desmos-graph"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LineChart className="h-3 w-3" />
                <span>Graphing</span>
              </button>

              <button
                onClick={() => { setMode("react-calc"); setIsMinimized(false); }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                  mode === "react-calc"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-3 w-3" />
                <span>React Calc</span>
              </button>

              <button
                onClick={() => { setMode("constants"); setIsMinimized(false); }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                  mode === "constants"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Constants</span>
              </button>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Expand / Restore */}
            {!isMinimized && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? "Standard view" : "Expand view"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            )}

            {/* Minimize / Expand Bar */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setIsMinimized((v) => !v)}
              title={isMinimized ? "Open calculator" : "Minimize to pill"}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={onClose}
              title="Close calculator"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Minimized bar */}
        {isMinimized ? (
          <div className="p-2.5 px-4 flex items-center justify-between gap-4 bg-card cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Calculator Active ({mode === "desmos-sci" ? "Desmos Scientific" : mode === "desmos-graph" ? "Desmos Graphing" : mode === "react-calc" ? "React Calc" : "Constants"})</span>
            </div>
            <span className="text-[11px] text-primary hover:underline font-medium">Click to open →</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 relative flex flex-col bg-background">
            {/* ── Mode 1: Desmos Official Scientific Calculator ─────────────────── */}
            {mode === "desmos-sci" && (
              <div className="w-full h-full flex flex-col relative bg-background">
                <iframe
                  src="https://www.desmos.com/scientific"
                  title="Desmos Scientific Calculator"
                  className="w-full flex-1 border-0"
                  allow="clipboard-write; clipboard-read"
                />
                <div className="px-3 py-1.5 bg-muted/40 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1 font-medium">
                    <span>Desmos Scientific Engine</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Standardized Testing Compliant</span>
                  </span>
                  <a
                    href="https://www.desmos.com/scientific"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground flex items-center gap-0.5 text-muted-foreground transition-colors"
                  >
                    Open standalone <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>
                </div>
              </div>
            )}

            {/* ── Mode 2: Desmos Official Graphing Calculator ───────────────────── */}
            {mode === "desmos-graph" && (
              <div className="w-full h-full flex flex-col relative bg-background">
                <iframe
                  src="https://www.desmos.com/calculator"
                  title="Desmos Graphing Calculator"
                  className="w-full flex-1 border-0"
                  allow="clipboard-write; clipboard-read"
                />
                <div className="px-3 py-1.5 bg-muted/40 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between shrink-0">
                  <span className="font-medium">Desmos Graphing Engine · Plot equations, find intercepts & extrema</span>
                  <a
                    href="https://www.desmos.com/calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground flex items-center gap-0.5 text-muted-foreground transition-colors"
                  >
                    Open standalone <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>
                </div>
              </div>
            )}

            {/* ── Mode 3: React Scientific Calculator Package (@afixt/a11y-calc) ── */}
            {mode === "react-calc" && (
              <div className="w-full h-full flex flex-col justify-between overflow-y-auto p-4 bg-card/40">
                <div className="w-full flex justify-center items-center flex-1">
                  <div className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-lg border border-border/60">
                    <Calculator
                      initialMode="scientific"
                      theme={{
                        "calc-bg": "hsl(var(--card))",
                        "calc-radius": "16px",
                        "calc-width-scientific": "100%",
                        "calc-width": "100%",
                        "btn-size": "44px",
                        "btn-font-size": "1rem",
                        "display-bg": "hsl(var(--muted) / 0.3)",
                        "display-text": "hsl(var(--foreground))",
                        "display-font-size": "2.2rem",
                        "btn-number-bg": "hsl(var(--muted) / 0.5)",
                        "btn-number-text": "hsl(var(--foreground))",
                        "btn-operator-bg": "hsl(var(--primary))",
                        "btn-operator-text": "hsl(var(--primary-foreground))",
                        "btn-scientific-bg": "hsl(var(--secondary) / 0.6)",
                        "btn-scientific-text": "hsl(var(--foreground))",
                        "btn-function-bg": "hsl(var(--muted) / 0.8)",
                        "btn-function-text": "hsl(var(--foreground))",
                      }}
                    />
                  </div>
                </div>

                <div className="text-center pt-2 text-[11px] text-muted-foreground shrink-0">
                  <span>Accessible React package (<code className="text-[10px] bg-muted px-1 py-0.5 rounded">@afixt/a11y-calc</code>) · Supports keyboard input &amp; macOS layout</span>
                </div>
              </div>
            )}

            {/* ── Mode 4: Physics Constants Reference ───────────────────────────── */}
            {mode === "constants" && (
              <div className="w-full h-full flex flex-col p-4 overflow-hidden bg-card/20">
                <div className="flex items-center justify-between pb-3 shrink-0">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Fundamental Physics Constants
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Click any constant to copy its exact numeric value to paste into your calculator.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 text-[10px]">
                    {["All", "Mechanics", "Electromagnetism", "Quantum & Thermal", "Math"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-2 py-0.5 rounded-full border transition-all cursor-pointer font-medium",
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of constants */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredConstants.map((c) => (
                    <div
                      key={c.symbol}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            {c.symbol}
                          </span>
                          <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {c.displayValue} {c.unit}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-medium cursor-pointer shrink-0 hover:bg-primary hover:text-primary-foreground transition-all gap-1.5"
                        onClick={() => handleCopyConstant(c)}
                      >
                        {copiedSymbol === c.symbol ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Value</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
