"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className || "w-full relative"}
    >
      {children}
    </motion.div>
  );
}
