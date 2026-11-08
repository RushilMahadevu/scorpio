"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // When pathname or searchParams change, flash a subtle, sleek progress indicator
  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 280);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          key="route-progress"
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-blue-400 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
