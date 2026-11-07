"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/landing/site-header";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import SustainabilityContent from "@/components/sustainability-content";
import { BookOpen, FileText, Github, Info, KeyRound, Leaf, Mail, Shield } from "lucide-react";

export default function SustainabilityPage() {
  return (
    <>
      {/* ── Page-reveal wipe: sweeps out from top-right → bottom-left ────── */}
      <motion.div
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: "hsl(var(--background))" }}
        initial={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 0%)" }}
        animate={{ clipPath: "polygon(-50% 0%, 100% 0%, 100% 200%)" }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.08)" }}
        initial={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 0%)" }}
        animate={{ clipPath: "polygon(-50% 0%, 100% 0%, 100% 200%)" }}
        transition={{ duration: 0.65, delay: 0.06, ease: [0.76, 0, 0.24, 1] }}
      />

      <div className="min-h-screen relative font-medium">
        <SpaceBackground />
        <SiteHeader activeSection="sustainability" />

        <main className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto space-y-20">
          <SustainabilityContent />
        </main>

        {/* Standard Landing Footer */}
        <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <div className="container mx-auto px-6 py-12">
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0">
                <Logo size={24} className="text-foreground" />
                <span className="text-md font-extrabold">Scorpio</span>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
                <Link
                  href="https://github.com/RushilMahadevu/scorpio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm font-medium">GitHub</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Info className="h-5 w-5" />
                  <span className="text-sm font-medium">About</span>
                </Link>
                <Link
                  href="/research"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium">Research & Methodology</span>
                </Link>
                <Link
                  href="/sustainability"
                  className="flex items-center space-x-2 text-emerald-500 font-semibold transition-colors cursor-pointer"
                >
                  <Leaf className="h-5 w-5" />
                  <span className="text-sm font-medium">Sustainability</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Privacy</span>
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Terms</span>
                </Link>
                <Link
                  href="/request-access"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <KeyRound className="h-5 w-5" />
                  <span className="text-sm font-medium">Request Access</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">Contact</span>
                </Link>
              </div>

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
      </div>
    </>
  );
}
