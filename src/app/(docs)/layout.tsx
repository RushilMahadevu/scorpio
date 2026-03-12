import { DocsSidebar } from "@/components/docs-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { BackButton } from "@/components/ui/back-button";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Assuming these exist
import { Menu, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex bg-background/50">
        <SpaceBackground />
        
        {/* Desktop Sidebar */}
         <aside className="hidden w-72 flex-col border-r border-border/40 bg-background/20 backdrop-blur-2xl md:flex fixed inset-y-0 z-50">
             <div className="flex items-center gap-3 p-8 border-b border-border/10">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105 active:scale-95">
                    <Logo size={28} className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                    <span className="font-black text-xl tracking-tighter uppercase italic">Scorpio</span>
                </Link>
             </div>
             
             <ScrollArea className="flex-1 py-10 px-6">
                <div className="mb-6 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <span className="w-4 h-px bg-primary/30" />
                    Documentation
                </div>
                <DocsSidebar />
            </ScrollArea>

            <div className="p-6 border-t border-border/10 bg-background/5">
                <Link href="/" className="w-full block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer w-full h-12 flex items-center gap-3 text-muted-foreground hover:text-primary px-4 rounded-xl font-bold transition-all hover:bg-primary/5 active:scale-[0.98] group"
                    aria-label="Back to Home"
                  >
                    <div className="p-1.5 bg-muted/20 rounded-lg group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-[-12deg]">
                      <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-sm tracking-tight">Home</span>
                  </Button>
                </Link>
            </div>
         </aside>

        {/* Mobile Header & Content */}
        <div className="flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <Logo size={20} className="text-primary" />
                    <span className="font-bold tracking-tighter uppercase italic">Scorpio Docs</span>
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl border border-border/40">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 bg-background/95 backdrop-blur-xl border-r border-border/40">
                         <div className="flex items-center gap-3 p-8 border-b border-border/10">
                            <Logo size={28} className="text-primary" />
                            <span className="font-black text-xl tracking-tighter uppercase italic">Scorpio</span>
                        </div>
                        <div className="p-6">
                             <div className="mb-6 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                <span className="w-4 h-px bg-primary/30" />
                                Documentation
                            </div>
                             <DocsSidebar />
                             <div className="mt-10 pt-8 border-t border-border/10">
                                <Link href="/" className="w-full block">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer w-full h-12 flex items-center gap-3 text-muted-foreground hover:text-primary px-4 rounded-xl font-bold transition-all hover:bg-primary/5 active:scale-[0.98] group"
                                    aria-label="Back to Home"
                                  >
                                    <div className="p-1.5 bg-muted/20 rounded-lg group-hover:bg-primary/20 transition-all text-primary">
                                      <Home className="h-4.5 w-4.5" />
                                    </div>
                                    <span className="text-base tracking-tight">Home</span>
                                  </Button>
                                </Link>
                             </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container max-w-4xl mx-auto py-12 md:py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>
        </div>
    </div>
  );
}
