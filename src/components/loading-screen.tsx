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
      // Faster exit wait
      setTimeout(() => onFinish?.(), 400);
    }, 1200); // Snappy 1.2s duration
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
            transition: { duration: 0.4, ease: "easeOut" }
          }}
        >
          {/* Clean Mathematical Grid Background */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px),
                  linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 15%, transparent 75%)'
              }}
            />
          </motion.div>

          <div className="relative flex flex-col items-center gap-10">
            {/* Centered Logo Container */}
            <div className="relative flex items-center justify-center">
              {/* Precision Ring Pulse instead of muddy blur */}
              <motion.div
                className="absolute w-[90px] h-[90px] rounded-full border border-foreground/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 2], 
                  opacity: [0.6, 0] 
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 0.2
                }}
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
                    transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 }
                  }}
                  exit={{
                    pathLength: 0.8,
                    opacity: 0,
                    transition: { duration: 0.2, ease: "easeIn" }
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
                      pathLength: { duration: 0.8, ease: "easeInOut", delay: 0.2 },
                      opacity: { duration: 0.4, delay: 0.2 }
                    }
                  }}
                  exit={{
                    pathLength: 0,
                    opacity: 0,
                    transition: { duration: 0.2, ease: "easeIn" }
                  }}
                />
              </Logo>
            </div>

            {/* Scorpio Text Animation - Motion Blur Slide from Left */}
            <div className="flex flex-col items-center gap-2 pt-2">
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
                        duration: 0.4, 
                        ease: SWEEP_EASE,
                        delay: 0.4 + i * 0.03 
                      }
                    }}
                    exit={{
                      x: 10,
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: { duration: 0.2, ease: "easeIn" }
                    }}
                    className="inline-block font-inter text-5xl md:text-6xl font-black text-foreground tracking-tighter px-[0.01em]"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 0.4, 
                  transition: { delay: 0.8, duration: 0.4 }
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
              transition={{ duration: 1.2, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
