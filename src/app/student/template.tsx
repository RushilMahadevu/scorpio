"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 5, opacity: 0, filter: "blur(5px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}