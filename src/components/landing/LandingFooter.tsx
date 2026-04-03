import { Github, Info, BookOpen, Shield, FileText, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
      <div className="container mx-auto px-6 py-12">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0 !font-inter">
            <Logo size={24} className="text-foreground" />
            <span className="text-md font-inter font-black tracking-tighter">Scorpio</span>
          </div>

          {/* Links Section */}
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
              <span className="text-sm font-medium">Research</span>
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
              href="/contact"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
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
  );
}
