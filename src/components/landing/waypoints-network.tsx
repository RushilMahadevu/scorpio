"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Zap, Waypoints } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WaypointsNetwork() {
  return (
    <section id="waypoints" className="container mx-auto px-6 py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[130px] pointer-events-none -z-10" />
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <div className="text-center space-y-4 mb-20">
          <div className="text-xs font-black text-primary uppercase tracking-[0.25em]">Collaborative Infrastructure</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Waypoints Network</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            High-precision, peer-validated physics modules built by instructors — shared across institutions. Drop them straight into your curriculum.
          </p>
        </div>

        {/* Main split layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: concept */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-6">
              {[
                {
                  icon: Globe,
                  title: "Shared by real instructors",
                  body: "Every Waypoint is authored by a verified Scorpio teacher — not generated. You know exactly where the pedagogy comes from.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/8",
                },
                {
                  icon: ShieldCheck,
                  title: "Peer-validated before publish",
                  body: "Modules go through a structured review before they enter the network. Mathematical notation, Socratic depth, and accuracy are checked.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/8",
                },
                {
                  icon: Zap,
                  title: "Drop into any assignment",
                  body: "Browse, preview, and attach Waypoints to your assignments in seconds. No reformatting, no copy-paste — structurally compatible out of the box.",
                  color: "text-violet-500",
                  bg: "bg-violet-500/8",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-border/70 transition-colors"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: mock Waypoints browser card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <Waypoints className="h-4 w-4 text-primary" />
                  <span className="text-sm font-black tracking-tight">Waypoint Browser</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary">Network</Badge>
              </div>
              {/* Waypoint entries */}
              <div className="p-4 space-y-3">
                {[
                  { title: "Rotational Dynamics — Torque & Inertia", tag: "Mechanics", author: "Dr. A. Patel", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                  { title: "Maxwell's Equations — Integral Form", tag: "E&M", author: "Prof. R. Chen", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                  { title: "Quantum Tunneling — WKB Approximation", tag: "Quantum", author: "Dr. S. Okafor", badge: "Under Review", badgeColor: "bg-amber-500/10 text-amber-500" },
                  { title: "Thermodynamic Cycles — Carnot Engine", tag: "Thermo", author: "Prof. L. Torres", badge: "Verified", badgeColor: "bg-emerald-500/10 text-emerald-500" },
                ].map((w, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/30 bg-background/50 hover:border-border/60 hover:bg-background/80 transition-all group cursor-default"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{w.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{w.tag} · {w.author}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${w.badgeColor}`}>{w.badge}</span>
                  </motion.div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-semibold">Example modules — network launching with early access</span>
                <span className="text-[10px] text-primary font-bold cursor-default">Coming soon →</span>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[80px] -z-10" />
          </motion.div>
        </div>

        {/* Bottom stats strip */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {[
            { value: "Early", label: "Access Now Open", sub: "Be first to shape the network" },
            { value: "100%", label: "Instructor-Authored", sub: "No AI-generated content" },
            { value: "Zero", label: "Reformatting Required", sub: "Drop-in compatible by design" },
            { value: "Growing", label: "Module Library", sub: "Expanding with every school" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-center hover:border-border/70 transition-colors"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-bold text-foreground/80 mt-1">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
