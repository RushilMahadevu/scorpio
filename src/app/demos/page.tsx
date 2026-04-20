"use client";

import { motion } from "framer-motion";
import { MonitorPlay } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SystemAccordion } from "@/components/system-accordion";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Github, Info, BookOpen, Mail, Shield, FileText, KeyRound } from "lucide-react";
import Link from "next/link";

export default function DemosPage() {
  return (
    <div className="min-h-screen relative font-medium scroll-smooth">
      <SpaceBackground />
      
      <motion.div
         initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
         animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
         transition={{ duration: 1.2, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <SiteHeader activeSection="demos" />

          <main className="relative z-10 pt-32 pb-20 min-h-screen flex items-center">
            {/* See It Work Section (Merged Demo + Dashboard) */}
            <section id="demos" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

              <div className="max-w-6xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                  <motion.div
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                  >
                    <MonitorPlay className="h-3.5 w-3.5" />
                    <span>See It In Action</span>
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System Demonstrations.</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Verify mastery through real-time observability and pedagogical scaffolding.</p>
                </div>

                <div className="grid lg:grid-cols-1 gap-6 lg:gap-12 items-center">
                  <motion.div
                    className="relative rounded-3xl overflow-hidden border border-border/60 bg-black/40 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <video
                      controls
                      className="w-full h-auto aspect-video cursor-pointer"
                      preload="metadata"
                    >
                      <source src="/demos/scorpio-demo.webm" type="video/webm" />
                      <source src="/demos/scorpio-demo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-center space-y-4 mb-8">
                      <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Interactive Demos.</h3>
                      <p className="text-muted-foreground text-base max-w-xl mx-auto font-medium">Explore the unified ecosystem of features designed for physics education.</p>
                    </div>
                    <SystemAccordion />
                  </motion.div>
                </div>
              </div>
            </section>
          </main>
          
          <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
            <div className="container mx-auto px-6 py-12">
              <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                {/* Logo Section */}
                <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
                  <Logo size={24} className="text-foreground" />
                  <span className="text-md font-extrabold">Scorpio</span>
                </div>

                {/* Links Section */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
                  <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Github className="h-5 w-5" />
                    <span className="text-sm font-medium">GitHub</span>
                  </Link>
                  <Link href="/about" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Info className="h-5 w-5" />
                    <span className="text-sm font-medium">About</span>
                  </Link>
                  <Link href="/research" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-medium">Research & Methodology</span>
                  </Link>
                  <Link href="/privacy" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Privacy</span>
                  </Link>
                  <Link href="/terms" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Terms</span>
                  </Link>
                  <Link href="/request-access" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <KeyRound className="h-5 w-5" />
                    <span className="text-sm font-medium">Request Access</span>
                  </Link>
                  <Link href="/contact" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Contact</span>
                  </Link>
                </div>

                {/* Credits Section */}
                <div className="text-center md:text-right space-y-2">
                  <div className="text-sm text-muted-foreground font-medium">
                    Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Scorpio. All rights reserved.
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </motion.div>
    </div>
  );
}
