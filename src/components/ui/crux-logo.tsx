"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { SquareUserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorLogoProps extends HTMLMotionProps<"div"> {
  size?: number;
  className?: string;
}

export const TutorLogo: React.FC<TutorLogoProps> = ({
  size = 24, 
  className = '', 
  ...props 
}) => {
  return (
    <motion.div
      className={cn("flex items-center justify-center text-current", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Tutor"
      {...props}
    >
      <SquareUserRound
        size={size} 
        strokeWidth={2.25}
      />
    </motion.div>
  );
};

/** @deprecated Use TutorLogo for user-facing surfaces. */
export const CruxLogo = TutorLogo;