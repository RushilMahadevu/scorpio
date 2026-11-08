"use client";

import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { DocsSidebar } from "@/components/docs-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex bg-background/50">
      <SpaceBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border/40 bg-card md:flex fixed inset-y-0 z-50">
        <div className="flex items-center gap-3 p-8 border-b border-border/10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105 active:scale-95">
            <Logo size={28} className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            <span className="font-black text-xl tracking-tight">Scorpio Docs</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-10 px-6">
          <div className="mb-6 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
            <span className="w-4 h-px bg-primary/30" />
            Docs
          </div>
          <DocsSidebar />
        </ScrollArea>

        <div className="p-6 border-t border-border/10 bg-background/5">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="flex-1 justify-start">
              <Link href="/"><Home /> Home</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="min-w-0 flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={20} className="text-primary" />
            <span className="font-bold tracking-tighter ">Scorpio Docs</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open documentation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 overflow-y-auto" aria-describedby={undefined}>
                <div className="flex items-center gap-3 p-8 border-b border-border/10">
                  <Logo size={28} className="text-primary" />
                  <SheetTitle>Scorpio Docs</SheetTitle>
                </div>
                <div className="p-6">
                  <div className="mb-6 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <span className="w-4 h-px bg-primary/30" />
                    Docs
                  </div>
                  <DocsSidebar onNavigate={() => setMenuOpen(false)} />
                  <div className="mt-10 pt-8 border-t border-border/10">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/"><Home /> Home</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 container max-w-4xl mx-auto py-12 md:py-20 px-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
