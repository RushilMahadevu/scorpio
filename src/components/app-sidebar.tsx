"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  LucideIcon,
  Menu,
  PanelLeft,
  PanelRight,
  Home,
  Lock,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { CompassLogo } from "@/components/ui/compass-logo";
import { SettingsDialog } from "@/components/settings-dialog";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  roleLabel: string;
  navItems: NavItem[];
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SidebarContentProps extends AppSidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({
  roleLabel,
  navItems,
  isCollapsed,
  onNavigate,
  onToggle,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  
  const autoRedirect = profile?.preferences?.autoRedirectPortal;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col min-w-[72px] max-w-64 overflow-hidden">
      <div className="px-4 py-6 border-b border-border/40 flex-shrink-0">
        <motion.div
          className="flex items-center gap-3 mb-6 px-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-primary/10 p-2.5 rounded-xl shadow-inner-sm">
            <CompassLogo className="h-6 w-6 text-primary flex-shrink-0" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-xl tracking-tight whitespace-nowrap"
              >
                Scorpio
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3 py-1.5 bg-muted/40 rounded-lg mb-2"
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
                {roleLabel}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <motion.div
                  initial={false}
                  animate={isActive ? { x: 4 } : { x: 0 }}
                  whileHover={!isCollapsed ? { x: 8, backgroundColor: "rgba(var(--muted), 0.8)" } : { scale: 1.1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors group",
                    isActive
                      ? "bg-muted text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isCollapsed ? "justify-center w-10 mx-auto px-0" : "w-full"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.span 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border/40 space-y-3 bg-muted/10">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center p-2.5 rounded-xl transition shadow-sm border border-transparent min-w-[40px] h-10 overflow-hidden",
                  isCollapsed ? "" : "px-3",
                  autoRedirect ? "opacity-40 cursor-help bg-muted/30" : "hover:bg-background hover:border-border/50 bg-background/50"
                )}
              >
                {!autoRedirect ? (
                  <Link href="/" className="flex items-center gap-2 w-full justify-center group" prefetch={false}>
                    <Home className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {!isCollapsed && (
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap group-hover:text-foreground transition-colors p-0.5">
                        Main Site
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground/60" />
                    {!isCollapsed && (
                      <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] whitespace-nowrap">
                        Main Locked
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {autoRedirect && (
              <TooltipContent side="right" className="max-w-[200px] text-xs font-bold p-3 bg-background border-border/50 text-foreground animate-in fade-in zoom-in-95 duration-200">
                <p className="leading-relaxed">
                  The landing page is disabled while <span className="text-primary italic">"Auto-Portal Redirect"</span> is ON. Disable it in settings to visit the home page.
                </p>
              </TooltipContent>
            )}
            {!autoRedirect && !isCollapsed && (
               <TooltipContent side="right" className="text-[10px] font-black uppercase tracking-widest p-2">
                  Visit Landing Page
               </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <div className="space-y-2">
          <div className={cn("flex items-center justify-between min-h-[32px]", isCollapsed ? "justify-center" : "px-2")}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-muted-foreground/150 uppercase tracking-widest overflow-hidden whitespace-nowrap"
                >
                  Sidebar
                </motion.span>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted shrink-0",
                isCollapsed ? "" : "ml-auto"
              )}
            >
              {isCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className={cn("flex items-center justify-between min-h-[32px]", isCollapsed ? "justify-center" : "px-2")}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-muted-foreground/150 uppercase tracking-widest overflow-hidden whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
            <div className={cn("shrink-0", isCollapsed ? "" : "ml-auto")}>
              <SettingsDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  roleLabel,
  navItems,
  isCollapsed,
  onToggle,
}: AppSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex md:flex-col h-full bg-background/40 backdrop-blur-xl border-r border-border/30 transition-all duration-300 ease-in-out relative flex-shrink-0",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="w-full h-full overflow-hidden">
          <SidebarContent
            roleLabel={roleLabel}
            navItems={navItems}
            isCollapsed={isCollapsed}
            onToggle={onToggle}
          />
        </div>
      </aside>
      <div className="md:hidden p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent
              roleLabel={roleLabel}
              navItems={navItems}
              isCollapsed={false}
              onToggle={() => {}}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

