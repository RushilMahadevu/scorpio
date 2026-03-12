"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    title: "Welcome to Scorpio Network",
    description: "The Network is where you manage your school's 'Scorpio Collective'. It's built for department heads, lead teachers, and administrators to coordinate AI resources.",
    icon: <Users className="h-8 w-8 text-blue-500" />,
    color: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    title: "Collective Billing",
    description: "Instead of every teacher paying individually, one person (the Owner) manages a central AI budget. All teachers in the network draw from this shared pool.",
    icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-950/20"
  },
  {
    title: "Setting Student Limits",
    description: "You have granular control over student AI usage. Set monthly message caps for the AI Tutor, Practice problems, and AI Notebooks to manage costs and focus.",
    icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
    color: "bg-purple-50 dark:bg-purple-950/20"
  },
  {
    title: "Sharing Curriculum",
    description: "Networks allow instant sharing of 'Waypoints' (curriculum benchmarks) across all member teachers. Update once, and the whole department stays in sync.",
    icon: <Zap className="h-8 w-8 text-amber-500" />,
    color: "bg-amber-50 dark:bg-amber-950/20"
  },
  {
    title: "Usage Analytics",
    description: "Track exactly how many AI messages students and teachers are sending. Get real-time feedback on student engagement and AI interaction quality.",
    icon: <LayoutDashboard className="h-8 w-8 text-indigo-500" />,
    color: "bg-indigo-50 dark:bg-indigo-950/20"
  }
];

interface NetworkTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NetworkTutorial({ open, onOpenChange }: NetworkTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(() => setCurrentStep(0), 300);
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className={cn("p-8 transition-colors duration-500", step.color)}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-background rounded-2xl shadow-sm border border-border/50">
              {step.icon}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/20">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <DialogHeader className="text-left space-y-3">
            <DialogTitle className="text-3xl font-black tracking-tight leading-none">
              {step.title}
            </DialogTitle>
            <DialogDescription className="text-lg font-medium leading-relaxed text-foreground/80">
              {step.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-background space-y-6">
          <div className="flex gap-1.5 justify-center">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/20"
                )} 
              />
            ))}
          </div>

          <DialogFooter className="flex sm:justify-between items-center sm:gap-0 gap-3">
            <Button
              variant="ghost"
              onClick={back}
              disabled={currentStep === 0}
              className="cursor-pointer font-bold text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={next}
              className="cursor-pointer rounded-full px-8 font-black text-xs uppercase tracking-widest bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {currentStep === steps.length - 1 ? (
                "Got it!"
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
