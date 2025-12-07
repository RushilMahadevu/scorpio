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
  isCollapsed: boolean;
}

interface SidebarContentProps extends AppSidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({ roleLabel, navItems, onNavigate, isCollapsed }: SidebarContentProps) {
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
          <span className={cn("font-bold text-lg tracking-tight", isCollapsed && "hidden")}>Scorpio</span>
        </div>
        <div className={cn("px-3 py-1.5 bg-muted/50 rounded-md mb-2", isCollapsed && "hidden")}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{roleLabel}</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <span
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
              </span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className={cn("p-4 mt-auto border-t bg-muted/10", isCollapsed && "p-2")}>
        <div className={cn("flex items-center justify-between px-2 mb-2", isCollapsed && "hidden")}>
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <ModeToggle />
        </div>
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10", isCollapsed && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className={cn(isCollapsed && "hidden")}>Logout</span>
        </Button>
      </div>
    </div>
  );
}

export function AppSidebar({ roleLabel, navItems, isCollapsed }: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:block h-full w-full bg-background/80 backdrop-blur-sm border-r">
        <SidebarContent roleLabel={roleLabel} navItems={navItems} isCollapsed={isCollapsed} />
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
              isCollapsed={false} 
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
