"use client";

import { motion } from "framer-motion";
import { CompassLogo } from "@/components/ui/compass-logo";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function LoadingSpinner({ 
  className = "", 
  size = "md",
  fullPage = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const container = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className} ${fullPage ? "min-h-[50vh] w-full" : ""}`}>
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-primary/20"
        >
          <CompassLogo className={sizeClasses[size]} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 select-none"
      >
        Loading
      </motion.p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        {container}
      </div>
    );
  }

  return container;
}
