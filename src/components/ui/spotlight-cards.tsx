"use client";

/**
 * @author dorianbaffier
 * @description Feature grid with aurora ambient, magnetic 3D tilt, and focus-dim siblings.
 * @version 2.0.0
 * @date 2025-02-20
 * @license MIT
 * @website https://kokonutui.com
 * @github https://github.com/kokonut-labs/kokonutui
 */

import { type LucideIcon } from "lucide-react";
import { Cloud, Code, Cpu, Globe, Lock, Zap, AlertTriangle, Brain, Shield } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TILT_MAX = 9;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

// ─── Data ────────────────────────────────────────────────────────────────────────

export interface SpotlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const DEFAULT_ITEMS: SpotlightItem[] = [
  {
    title: "Solution Leakage",
    description: "ChatGPT and Gemini prioritize the 'Final Answer,' effectively making homework a game of copy-paste instead of derivation.",
    icon: AlertTriangle,
    color: "#ef4444"
  },
  {
    title: "The 'Black Box' Student",
    description: "When students rely on unconstrained AI, instructors lose all insight into the actual learning gaps and misconceptions.",
    icon: Brain,
    color: "#ef4444"
  },
  {
    title: "Academic Dishonesty",
    description: "Degrees lose value when procedural mastery can be faked. Scorpio restores the integrity of the physics curriculum.",
    icon: Shield,
    color: "#ef4444"
  },
];

// ─── Card ────────────────────────────────────────────────────────────────────────

interface CardProps {
  item: SpotlightItem;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const Card = ({ item, dimmed, onHoverStart, onHoverEnd }: CardProps) => {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const mouseX = useTransform(normX, [0, 1], [0, 100]);
  const mouseY = useTransform(normY, [0, 1], [0, 100]);

  const spotlightBg = useMotionTemplate`radial-gradient(ellipse at ${mouseX}% ${mouseY}%, ${item.color}14, transparent 65%)`;
  const focusBg = useMotionTemplate`radial-gradient(ellipse at ${mouseX}% ${mouseY}%, ${item.color}2e, transparent 65%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  };

  return (
    <motion.div
      animate={{
        scale: dimmed ? 0.96 : 1,
        opacity: dimmed ? 0.5 : 1,
      }}
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-[2rem] border p-8",
        // Light
        "border-zinc-200/50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        // Dark
        "dark:border-white/5 dark:bg-white/3 dark:shadow-none",
        "transition-[border-color] duration-300",
        "hover:border-zinc-300"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      whileHover={{ borderColor: `${item.color}50` }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: spotlightBg,
        }}
      />

      {/* Hover glow layer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: glowOpacity,
          background: focusBg,
        }}
      />

      {/* Shimmer sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/4.5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
      />

      {/* Icon badge */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: `${item.color}18`,
          boxShadow: `inset 0 0 0 1px ${item.color}30`,
        }}
      >
        <Icon size={20} strokeWidth={1.9} style={{ color: item.color }} />
      </div>

      {/* Text */}
      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="font-extrabold text-[20px] text-zinc-900 tracking-tight dark:text-white">
          {item.title}
        </h3>
        <p className="text-[14px] text-zinc-500 leading-relaxed dark:text-white/40 font-medium">
          {item.description}
        </p>
      </div>

      {/* Accent bottom line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{
          background: `linear-gradient(to right, ${item.color}80, transparent)`,
        }}
      />
    </motion.div>
  );
}

Card.displayName = "Card";

// ─── Main export ──────────────────────────────────────────────────────────────────

export interface SpotlightCardsProps {
  items?: SpotlightItem[];
  eyebrow?: string;
  heading?: string;
  className?: string;
}

export default function SpotlightCards({
  items = DEFAULT_ITEMS,
  className,
  gridClassName,
}: SpotlightCardsProps & { gridClassName?: string }) {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative w-full px-0",
        className
      )}
    >
      {/* Card grid */}
      <div className={cn("relative grid grid-cols-1 md:grid-cols-3 gap-6 p-4", gridClassName)}>
        {items.map((item) => (
          <Card
            dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
            item={item}
            key={item.title}
            onHoverEnd={() => setHoveredTitle(null)}
            onHoverStart={() => setHoveredTitle(item.title)}
          />
        ))}
      </div>
    </div>
  );
}
