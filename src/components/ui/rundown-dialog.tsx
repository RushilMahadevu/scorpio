"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info, BrainCircuit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RundownStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color?: string;
  isSpecial?: boolean;
}

interface RundownDialogProps {
  steps: RundownStep[];
  title: string;
  triggerLabel?: string;
  userRole: "teacher" | "student";
}

export function RundownDialog({ steps, title, triggerLabel = "How Scorpio Works", userRole }: RundownDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset to first step when dialog closes
      setTimeout(() => setCurrentStep(1), 300);
    }
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 cursor-pointer shadow-sm hover:bg-primary/5 transition-all">
          <Info className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 overflow-hidden sm:rounded-3xl border-none shadow-2xl">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted/30 z-50">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="p-8 pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                   <div className={cn(
                     "p-3 rounded-2xl bg-primary/10 flex items-center justify-center",
                     step.isSpecial && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                   )}>
                    <step.icon className={cn("h-8 w-8", !step.isSpecial && "text-primary")} />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className={cn(
                    "text-3xl font-black tracking-tight",
                    step.isSpecial && "bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent"
                  )}>
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {step.isSpecial && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-primary/80 font-semibold italic">
                      This is what makes Scorpio different from any other platform.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <DialogFooter className="p-6 pt-0 flex sm:justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 font-bold rounded-full group transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Previous
            </Button>

            <div className="flex-1" />

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="px-6 font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <DialogClose asChild>
                <Button
                  className="px-8 font-black rounded-full shadow-lg shadow-primary/30 hover:scale-[1.05] active:scale-[0.95] transition-all bg-primary"
                >
                  Start Exploring
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
