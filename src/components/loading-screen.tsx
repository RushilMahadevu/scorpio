"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";

const SWEEP_EASE = [0.76, 0, 0.24, 1] as const;
const CHARS = "Scorpio".split("");

export function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      onFinish?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {/* Background panel — sweeps right, leaving logo behind */}
      {loading && (
        <motion.div
          key="loader-bg"
          className="fixed inset-0 z-[100] bg-background overflow-hidden"
          exit={{ 
            opacity: 0,
            filter: "blur(20px)",
            scale: 1.1,
            transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Edge vignette — fades dots near screen edges */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 35%, var(--background) 100%)",
            }}
          />
        </motion.div>
      )}

      {/* Logo + text — stays in place, fades out as sweep begins */}
      {loading && (
        <motion.div
          key="loader-logo"
          className="fixed inset-0 z-[101] flex items-center justify-center select-none pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeIn", delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -180, scale: 0.8, filter: "blur(12px)" }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: { 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1], // Custom "out-expo" for a smooth finish
                  delay: 0.2,
                },
              }}
            >
              <Logo size={70} className="text-foreground" />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: 1,
                scaleY: 1,
                transition: { duration: 0.25, ease: "easeOut", delay: 0.3 },
              }}
              className="inline-block w-px h-6 bg-foreground/20 origin-center"
            />

            <span className="flex" aria-label="Scorpio">
              {CHARS.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: "blur(14px)", y: 8 }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    y: 0,
                    transition: {
                      duration: 0.35,
                      ease: "easeOut",
                      delay: 0.35 + i * 0.05,
                    },
                  }}
                  className="inline-block font-sans text-6xl font-black text-foreground"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
