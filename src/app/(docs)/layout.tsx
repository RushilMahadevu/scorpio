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
         <aside className="hidden w-64 flex-col border-r border-border/40 bg-background/30 backdrop-blur-xl md:flex fixed inset-y-0 z-50">
             <div className="flex items-center gap-3 p-6 border-b border-border/40">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Logo size={24} className="text-primary" />
                    <span className="font-bold text-lg">Scorpio</span>
                </Link>
             </div>
             
             <ScrollArea className="flex-1 py-6 px-4">
                <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Documentation
                </div>
                <DocsSidebar />
            </ScrollArea>

            <div className="p-6 border-t border-border/40 bg-background/20">
                <Link href="/" className="w-full block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center gap-3 text-muted-foreground hover:text-primary px-3 py-5 rounded-xl font-bold transition-all hover:bg-primary/10 active:scale-[0.98] cursor-pointer group"
                    aria-label="Back to Home"
                  >
                    <div className="p-1.5 bg-muted/50 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-sm tracking-tight">Return Home</span>
                  </Button>
                </Link>
            </div>
         </aside>

        {/* Mobile Header & Content */}
        <div className="flex-1 md:ml-64 relative z-10 flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <Logo size={20} className="text-primary" />
                    <span className="font-bold">Scorpio Docs</span>
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                         <div className="flex items-center gap-3 p-6 border-b">
                            <Logo size={24} className="text-primary" />
                            <span className="font-bold text-lg">Scorpio</span>
                        </div>
                        <div className="p-4">
                             <DocsSidebar />
                             <div className="mt-8 pt-6 border-t border-border/40">
                                <Link href="/" className="w-full block">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full flex items-center gap-3 text-muted-foreground hover:text-primary px-3 py-5 rounded-xl font-bold transition-all hover:bg-primary/10 active:scale-[0.98] cursor-pointer group"
                                    aria-label="Back to Home"
                                  >
                                    <div className="p-1.5 bg-muted/50 rounded-lg group-hover:bg-primary/20 transition-colors text-primary">
                                      <Home className="h-4.5 w-4.5" />
                                    </div>
                                    <span className="text-base tracking-tight">Return Home</span>
                                  </Button>
                                </Link>
                             </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container max-w-4xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
        </div>
    </div>
  );
}
