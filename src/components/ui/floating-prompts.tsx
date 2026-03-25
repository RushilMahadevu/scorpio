"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Brain, Calculator, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface PromptCardProps {
  icon: any;
  userText: string;
  aiText: string | React.ReactNode;
  delay: number;
  rotation: number;
  // Use a unified position object to handle viewport layout cleanly
  side: "left" | "right";
  top: string;
}

const PromptCard = ({ icon: Icon, userText, aiText, delay, rotation, side, top }: PromptCardProps) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [0, 1], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [0, 1], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width;
    const yPct = mouseY / height;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, filter: "brightness(2) blur(10px)", y: 50, rotate: rotation }}
      animate={{ 
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: rotation,
        filter: "brightness(1) blur(0px)"
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9, 
        filter: "brightness(1.5) blur(8px)",
        y: -30,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
      transition={{ 
        duration: 2,
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`absolute w-full max-w-[220px] xl:max-w-[310px] z-[30] pointer-events-auto group ${
        side === "left" ? "left-4 xl:left-8" : "right-4 xl:right-8"
      }`}
      style={{ top, perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [0, 1, 0, -1, 0]
        }}
        transition={{ 
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative p-4 xl:p-6 rounded-2xl bg-background/65 backdrop-blur-3xl border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-visible group-hover:bg-background/85 group-hover:border-primary/45 group-hover:shadow-[0_30px_80px_rgba(var(--primary),0.3)] transition-all duration-500 cursor-default"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
        
        <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
          <div className="flex items-start gap-4 mb-3 xl:mb-4">
            <div className="h-9 w-9 xl:h-11 xl:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner shadow-primary/20 border border-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
            </div>
            <div className="space-y-1 mt-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 leading-none">Perspective</p>
              <p className="text-xs xl:text-sm font-bold text-foreground leading-tight italic pr-2">"{userText}"</p>
            </div>
          </div>
        </div>

        <div style={{ transform: "translateZ(30px)" }} className="relative z-10 pl-[48px] xl:pl-[56px]">
          <div className="absolute left-[24px] xl:left-[28px] top-[-10px] bottom-0 w-[1.5px] bg-gradient-to-b from-primary/40 to-transparent" />
          <div className="space-y-2 pt-1">
             <div className="flex items-center gap-2">
                <Sparkles className="h-3 xl:h-3.5 w-3 xl:w-3.5 text-primary animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary leading-none font-mono">Scorpio</p>
             </div>
             <div className="text-[12px] xl:text-[13.5px] font-medium text-muted-foreground/90 leading-relaxed pr-1">
               {typeof aiText === 'string' ? aiText : aiText}
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const FloatingPrompts = () => {
  const [activeCycle, setActiveCycle] = useState(0);

  const prompts = [
    // Cycle 1: Aggressive Peripheral Top-Left & Mid-Right (Raised above stats)
    {
      icon: MessageSquare,
      userText: "What's the answer to question 4?",
      aiText: (
        <>
          I can't give you the answer, but let's look at the free-body diagram first. The sum of forces is:
          <div className="mt-2.5 py-1.5 px-3 bg-primary/8 rounded-lg border border-primary/20 overflow-x-hidden text-sm">
            <InlineMath math="\sum F_y = N - mg \cos \theta = 0" />
          </div>
        </>
      ),
      delay: 0,
      side: "left" as const,
      top: "10%",
      rotation: -8
    },
    {
      icon: Calculator,
      userText: "Calculate the orbital velocity.",
      aiText: (
        <>
          Start with the balance of gravitational and centripetal force:
          <div className="mt-2.5 py-1.5 px-3 bg-primary/8 rounded-lg border border-primary/20 overflow-x-hidden text-sm">
            <InlineMath math="v = \sqrt{\frac{GM}{r}}" />
          </div>
        </>
      ),
      delay: 0.6,
      side: "right" as const,
      top: "45%", 
      rotation: 6
    },
    // Cycle 2: Top-Right & Mid-Left (Raised above stats)
    {
      icon: Brain,
      userText: "Is normal force always mg?",
      aiText: (
        <>
          Not always. Think about an object on a slope. The normal force component is restricted by:
          <div className="mt-2.5 py-1.5 px-3 bg-primary/8 rounded-lg border border-primary/20 overflow-x-hidden text-sm">
            <InlineMath math="F_n = m \cdot g \cos(\phi)" />
          </div>
        </>
      ),
      delay: 0,
      side: "right" as const,
      top: "12%",
      rotation: 10
    },
    {
      icon: GraduationCap,
      userText: "I'm stuck on wave interference.",
      aiText: (
        <>
          Recall the condition for constructive interference. The path difference must satisfy:
          <div className="mt-2.5 py-1.5 px-3 bg-primary/8 rounded-lg border border-primary/20 overflow-x-hidden text-sm">
             <InlineMath math="\Delta L = n\lambda" />
          </div>
        </>
      ),
      delay: 0.4,
      side: "left" as const, 
      top: "48%", 
      rotation: -10
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      setActiveCycle(1); 
      interval = setInterval(() => {
        setActiveCycle((prev) => (prev === 1 ? 2 : 1));
      }, 9000);
    }, 2800);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none z-[40] select-none">
      <AnimatePresence mode="wait">
        {activeCycle === 1 && (
          <motion.div key="cycle-1" className="contents">
            <PromptCard {...prompts[0]} />
            <PromptCard {...prompts[1]} />
          </motion.div>
        )}
        {activeCycle === 2 && (
          <motion.div key="cycle-2" className="contents">
            <PromptCard {...prompts[2]} />
            <PromptCard {...prompts[3]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
