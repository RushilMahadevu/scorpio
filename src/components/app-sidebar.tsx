"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, LucideIcon, Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { CompassLogo } from "@/components/ui/compass-logo";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  roleLabel: string;
  navItems: NavItem[];
}

interface SidebarContentProps extends AppSidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({ roleLabel, navItems, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <CompassLogo className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Scorpio</span>
        </div>
        <div className="px-3 py-1.5 bg-muted/50 rounded-md mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{roleLabel}</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t bg-muted/10">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <ModeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function AppSidebar({ roleLabel, navItems }: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent roleLabel={roleLabel} navItems={navItems} />
      </aside>

      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r">
            <SidebarContent 
              roleLabel={roleLabel} 
              navItems={navItems} 
              onNavigate={() => setOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
