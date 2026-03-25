"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Binary, Cpu, Network } from "lucide-react";

interface ConstraintBadgeProps {
  label: string;
  icon: any;
  delay: number;
  initialX: string;
  initialY: string;
}

const ConstraintBadge = ({ label, icon: Icon, delay, initialX, initialY }: ConstraintBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, filter: "brightness(2) contrast(1.5)" }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        x: [-20, 0, 10, 40],
        filter: [
          "brightness(2) contrast(1.5) blur(4px)",
          "brightness(1) contrast(1) blur(0px)",
          "brightness(1) contrast(1) blur(0px)",
          "brightness(3) contrast(2) blur(8px)"
        ]
      }}
      transition={{ 
        duration: 9,
        delay,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "linear"
      }}
      className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 backdrop-blur-3xl border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.1)] z-0 pointer-events-none group"
      style={{ left: initialX, top: initialY }}
    >
      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 animate-pulse">
        <Icon className="h-2.5 w-2.5 text-primary" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 whitespace-nowrap font-mono">{label}</span>
      <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] animate-[scan_3s_linear_infinite]" />
      
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
      `}</style>
    </motion.div>
  );
};

export const ConstraintEngine = () => {
  const constraints = [
    { label: "LaTeX VERIFIED", icon: Binary, delay: 0.5, initialX: "15%", initialY: "45%" },
    { label: "SOCRATIC GUARD ACTIVE", icon: ShieldCheck, delay: 4, initialX: "65%", initialY: "35%" },
    { label: "SCHEMA BOUNDED", icon: Lock, delay: 2.2, initialX: "5%", initialY: "15%" },
    { label: "PHYSICS ENGINE SYNC", icon: Cpu, delay: 6.5, initialX: "80%", initialY: "75%" },
    { label: "O1 INFERENCE CHAIN", icon: Network, delay: 1, initialX: "20%", initialY: "85%" }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40 mix-blend-screen overflow-hidden">
      {constraints.map((c, i) => (
        <ConstraintBadge key={i} {...c} />
      ))}
    </div>
  );
};
