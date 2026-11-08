"use client";

import { Hand, NotebookPen, Waypoints, PackageOpen, Maximize2, Sparkles, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  {
    id: 1,
    title: "Raise: Socratic Assistant",
    shortTitle: "Raise AI",
    badge: "Student Interface",
    Icon: Hand,
    imgSrc: "/ai-tutor.png",
    description: "A 4-layer scaffolding assistant that guides students through physics derivations without ever giving away direct answers.",
    bullets: [
      "Layer 1: Concept probing & diagnostic checks",
      "Layer 2: Symbolic hint scaffolding in LaTeX",
      "Layer 3: Verification of student free-body logic",
      "Hard constraint: Direct homework solving blocked",
    ],
    actionText: "Try Live AI Playground",
    actionHref: "/ai",
  },
  {
    id: 2,
    title: "Socratic Notebook",
    shortTitle: "Notebook",
    badge: "Interactive Derivation",
    Icon: NotebookPen,
    imgSrc: "/network-previews/notebook.png",
    description: "An interactive scratchpad where students articulate each physics step, verify unit consistency, and receive guided Socratic feedback.",
    bullets: [
      "Real-time dimensional analysis & sanity checks",
      "Side-by-side formula editor with KaTeX output",
      "Derivation history saved to student portfolio",
    ],
  },
  {
    id: 3,
    title: "Equation Vault",
    shortTitle: "Equations",
    badge: "Symbolic Knowledge Base",
    Icon: PackageOpen,
    imgSrc: "/equation-vault.png",
    description: "A centralized reference of foundational laws, constants, and verified derivations formatted in publication-grade LaTeX.",
    bullets: [
      "Instant KaTeX code export for student notebooks",
      "Cross-referenced with AP, IB, and university curricula",
      "Dimensional breakdowns for fundamental constants",
    ],
  },
  {
    id: 4,
    title: "Waypoints Network",
    shortTitle: "Waypoints",
    badge: "Faculty Collaborative",
    Icon: Waypoints,
    imgSrc: "/waypoints.png",
    description: "High-precision, peer-validated physics modules authored by real instructors — ready to drop into any assignment syllabus.",
    bullets: [
      "100% instructor-authored and peer-reviewed",
      "Plug-and-play assignment integration",
      "Multi-institution benchmarks for Newtonian dynamics and E&M",
    ],
  },
];

export const SystemAccordion = () => {
  const [activeId, setActiveId] = useState(items[0].id);
  const activeItem = items.find((item) => item.id === activeId) || items[0];

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Top Tab Bar */}
      <div className="flex border-b border-border/50 overflow-x-auto scrollbar-none bg-muted/20">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "flex-1 min-w-[140px] sm:min-w-[170px] py-4 px-3 sm:px-5 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 border-b-2 cursor-pointer relative",
                isActive
                  ? "border-primary text-primary bg-background/50 font-bold shadow-sm"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{item.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center"
        >
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                {activeItem.badge}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {activeItem.title}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {activeItem.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border/30">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">
                Key Architectural Capabilities
              </p>
              <ul className="space-y-2">
                {activeItem.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/80">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {activeItem.actionHref && (
              <div className="pt-2">
                <Button asChild size="sm" className="rounded-full">
                  <Link href={activeItem.actionHref} className="flex items-center gap-1.5">
                    {activeItem.actionText} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Image with Zoom Trigger */}
          <div className="lg:col-span-7">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-background/80 shadow-xl group cursor-pointer aspect-[16/10] flex items-center justify-center">
                  <Image
                    src={activeItem.imgSrc}
                    alt={activeItem.title}
                    width={1200}
                    height={750}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-foreground font-semibold text-xs bg-black/40 text-white">
                    <Maximize2 className="h-4 w-4" /> Click to expand preview
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] p-2 bg-background/95 backdrop-blur-2xl border border-border shadow-2xl">
                <DialogTitle className="text-base font-bold px-4 pt-2">
                  {activeItem.title}
                </DialogTitle>
                <div className="relative w-full aspect-[16/10] max-h-[80vh] overflow-hidden rounded-xl mt-2">
                  <Image
                    src={activeItem.imgSrc}
                    alt={activeItem.title}
                    width={1600}
                    height={1000}
                    className="w-full h-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
