"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";

const SWEEP_EASE = [0.16, 1, 0.3, 1] as const;
const CHARS = "Scorpio".split("");

export function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => onFinish?.(), 800);
    }, 1600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader-root"
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: SWEEP_EASE }
          }}
        >
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-primary/5 blur-[160px] rounded-full" />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                 style={{ 
                   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }} 
            />
          </motion.div>

          <div className="relative flex flex-col items-center gap-10">
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary/15 blur-[40px] rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1], 
                  opacity: [0.1, 0.3, 0.1] 
                }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
              
              <Logo 
                size={90} 
                className="text-foreground relative z-10"
                layoutId="hero-logo"
                strokeWidth={3}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { duration: 0.6, ease: SWEEP_EASE }
                }}
              >
                <motion.circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 1,
                    transition: { duration: 1.4, ease: "easeInOut", delay: 0.1 }
                  }}
                  exit={{
                    pathLength: 0.8,
                    opacity: 0,
                    transition: { duration: 0.4, ease: "easeIn" }
                  }}
                />
                <motion.path 
                  d="M16.24 7.76 L14.12 14.12 L7.76 16.24 L9.88 9.88 Z" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 1,
                    transition: { 
                      pathLength: { duration: 1.4, ease: "easeInOut", delay: 0.3 },
                      opacity: { duration: 0.8, delay: 0.3 }
                    }
                  }}
                  exit={{
                    pathLength: 0,
                    opacity: 0,
                    transition: { duration: 0.3, ease: "easeIn" }
                  }}
                />
              </Logo>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 items-center" aria-label="Scorpio">
                {CHARS.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: -25, opacity: 0, filter: "blur(24px)" }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      filter: "blur(0px)",
                      transition: { 
                        duration: 0.8, 
                        ease: SWEEP_EASE,
                        delay: 0.6 + i * 0.05 
                      }
                    }}
                    exit={{
                      x: 10,
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: { duration: 0.4, ease: "easeIn" }
                    }}
                    className="inline-block font-sans text-5xl md:text-6xl font-black text-foreground tracking-tighter px-[0.01em]"
                  >

                    {char}
                  </motion.span>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 0.4, 
                  transition: { delay: 1.2, duration: 0.8 }
                }}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60"
              >
                Verifiable Physics
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-muted/10 overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "linear" }}
              style={{ width: "0%" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
