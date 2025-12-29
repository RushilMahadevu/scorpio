import { motion } from "framer-motion";
import { Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  const stats = [
    { value: "4-Layer", label: "Constraint System", sublabel: "AI Architecture" },
    { value: "Real-time", label: "Sync & Feedback", sublabel: "Live Updates" },
    { value: "LaTeX", label: "Math Rendering", sublabel: "Equation Support" },
    { value: "Role-Based", label: "Access Control", sublabel: "Security Model" }
  ];

  return (
    <section id="home" className="container mx-auto px-6 py-20 text-center">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border bg-card/50 backdrop-blur-sm mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm tracking-wide font-medium">Research-Grade AI Tutoring Platform</span>
        </motion.div>

        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <Image src="/favicon.svg" alt="Scorpio" width={64} height={64} />
        </motion.div>

        {/* Main Title with Typography Hierarchy */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1 className="text-7xl md:text-6xl font-bold tracking-tight leading-none">
            Scorpio
          </h1>
        </motion.div>

        {/* Tagline with Contrast */}
        <motion.p
          className="text-2xl md:text-2xl font-semibold tracking-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          Turn Physics Struggles Into Breakthroughs
        </motion.p>

        {/* Description with Better Spacing */}
        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Built for Sage Ridge School, Scorpio delivers research-grade AI tutoring to every physics student while freeing teachers from hours of manual grading and feedback.
        </motion.p>

        {/* Stats with Improved Typography */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="space-y-2 p-6 rounded-xl border bg-card/30 hover:bg-card/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.15 }}
            >
              <div className="text-2xl font-medium text-primary">{stat.value}</div>
              <div className="text-sm font-normal leading-tight italic">{stat.label}</div>
              <div className="text-xs font-semilight text-muted-foreground uppercase tracking-wide">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
        >
          <Link href="#cta">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-extrabold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/about">
            <button className="px-8 py-3 border rounded-lg font-extrabold hover:bg-accent transition-colors">
              Learn More
            </button>
          </Link>
        </motion.div>

        <motion.div
          className="pt-8 animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
        >
          <button
            aria-label="Scroll to Challenge"
            onClick={() => {
              const el = document.getElementById("challenge");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="focus:outline-none"
            type="button"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}