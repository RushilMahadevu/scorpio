"use client";

import React, { ReactNode } from 'react';
import { motion, SVGMotionProps } from 'framer-motion';

interface LogoProps extends SVGMotionProps<SVGSVGElement> {
  size?: number;
  className?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 24, 
  className = '', 
  strokeWidth = 2.8,
  children,
  ...props 
}) => {

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Scorpio Logo"
      {...props}
    >
      <title>Scorpio Logo</title>
      {children || (
        <>
          <motion.circle 
            cx="12" 
            cy="12" 
            r="10" 
          />
          <motion.polygon 
            points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" 
          />
        </>
      )}
    </motion.svg>
  );
};