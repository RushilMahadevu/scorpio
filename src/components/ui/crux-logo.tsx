"use client";

import React from 'react';
import { Icon } from 'lucide-react';
import { starNorth } from '@lucide/lab';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CruxLogoProps extends HTMLMotionProps<"div"> {
  size?: number;
  className?: string;
}

export const CruxLogo: React.FC<CruxLogoProps> = ({ 
  size = 24, 
  className = '', 
  ...props 
}) => {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Crux AI Logo"
      {...props}
    >
      <Icon 
        iconNode={starNorth} 
        size={size} 
        strokeWidth={2.5}
      />
    </motion.div>
  );
};
