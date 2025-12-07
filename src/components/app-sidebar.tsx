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

function SidebarContent({ roleLabel, navItems, isCollapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <CompassLogo className="h-6 w-6 text-primary flex-shrink-0" />
          </div>
          {!isCollapsed && <span className="font-bold text-lg tracking-tight whitespace-nowrap">Scorpio</span>}
        </div>
        {!isCollapsed && (
          <div className="px-3 py-1.5 bg-muted/50 rounded-md mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{roleLabel}</p>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <span
                className={cn(
                  "flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t bg-muted/10">
        <div className={cn("flex items-center justify-between px-2 mb-2", isCollapsed && "justify-center")}>
          {!isCollapsed && <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Appearance</span>}
          <ModeToggle />
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export function AppSidebar({ roleLabel, navItems, isCollapsed }: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={cn(
        "hidden md:block h-full border-r-0 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
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
              isCollapsed={false}
              onNavigate={() => setOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
