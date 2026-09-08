"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RaiseLogoProps extends HTMLMotionProps<"div"> {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const RaiseLogo: React.FC<RaiseLogoProps> = ({
  size = 24,
  className = "",
  strokeWidth = 2.25,
  ...props
}) => {
  return (
    <motion.div
      className={cn("flex items-center justify-center text-current shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Raise"
      {...props}
    >
      <Hand
        size={size}
        strokeWidth={strokeWidth}
      />
    </motion.div>
  );
};

export default RaiseLogo;
