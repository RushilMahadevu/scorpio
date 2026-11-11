"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Leaf,
  PanelLeftClose,
  PanelLeftOpen,
  DoorClosedLocked,
  PlaneLanding,
} from "lucide-react";
import { CompassLogo } from "@/components/ui/compass-logo";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
  useAnimatedSidebar,
} from "@/components/motion/animated-sidebar";

const SustainabilityContent = dynamic(() => import("@/components/sustainability-content"), {
  loading: () => (
    <p role="status" className="text-muted-foreground">
      Loading sustainability…
    </p>
  ),
});

const SettingsDialog = dynamic(() => import("@/components/settings-dialog").then((module) => module.SettingsDialog));

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

type NavItem = NavLink | { dialog: "sustainability"; label: string };

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  roleLabel: string;
  roleIcon?: React.ComponentType<{ className?: string }>;
  navSections: NavSection[];
  isCollapsed: boolean;
  onToggle: () => void;
  sample?: {
    activeHref: string;
    onSelect: (href: string) => void;
  };
}

function SustainabilityDialogItem({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const context = useAnimatedSidebar();

  const handleOpen = () => {
    if (context.isMobile) {
      context.setOpenMobile(false);
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatedSidebarMenuItem>
        <DialogTrigger asChild>
          <AnimatedSidebarMenuButton
            icon={<Leaf className="size-5" />}
            onSelect={handleOpen}
            closeOnSelect={false}
          >
            {label}
          </AnimatedSidebarMenuButton>
        </DialogTrigger>
      </AnimatedSidebarMenuItem>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogTitle className="border-b px-5 py-4 pr-12 text-lg font-bold">
          {label}
        </DialogTitle>
        <div
          role="region"
          aria-label="Sustainability information"
          tabIndex={0}
          className="min-h-0 space-y-12 overflow-y-auto overscroll-contain px-4 py-6 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8"
        >
          <SustainabilityContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarFooterSection({
  roleLabel,
  isCollapsed,
}: {
  roleLabel: string;
  isCollapsed: boolean;
}) {
  const { profile, role, user } = useAuth();
  const autoRedirect = profile?.preferences?.autoRedirectPortal ?? true;

  const displayName = profile?.displayName || user?.displayName || "";
  const email = user?.email || profile?.email || "";

  const initials = (() => {
    if (displayName && typeof displayName === "string" && displayName.trim()) {
      return displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email && typeof email === "string" && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return roleLabel.slice(0, 2).toUpperCase();
  })();

  return (
    <AnimatedSidebarFooter className="gap-2.5 border-t border-border/30 p-3">
      {/* Landing page action for non-student roles */}
      {role !== "student" && (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {autoRedirect ? (
                <div className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs text-muted-foreground/60 bg-muted/20 cursor-help group-data-[state=collapsed]/sidebar:justify-center">
                  <DoorClosedLocked className="size-4.5 shrink-0 text-muted-foreground/60" />
                  <span className="truncate group-data-[state=collapsed]/sidebar:hidden font-medium">
                    Landing Locked
                  </span>
                </div>
              ) : (
                <Link
                  href="/"
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group-data-[state=collapsed]/sidebar:justify-center"
                >
                  <PlaneLanding className="size-4.5 shrink-0" />
                  <span className="truncate group-data-[state=collapsed]/sidebar:hidden">
                    Landing Page
                  </span>
                </Link>
              )}
            </TooltipTrigger>
            {autoRedirect && (
              <TooltipContent
                side="right"
                className="max-w-[220px] text-xs font-medium p-3 bg-background border-border/50 text-foreground"
              >
                The landing page is disabled while{" "}
                <span className="text-primary italic font-semibold">
                  &ldquo;Auto-Portal Redirect&rdquo;
                </span>{" "}
                is ON. Disable it in settings to visit the Landing page.
              </TooltipContent>
            )}
            {!autoRedirect && (
              <TooltipContent side="right" className="text-xs font-medium">
                Visit Landing Page
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* User profile card */}
      <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-muted/40 group-data-[state=collapsed]/sidebar:justify-center">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          {initials}
        </span>
        <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
          <p className="truncate text-sm font-semibold text-foreground leading-tight">
            {displayName || roleLabel}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {email || `${roleLabel.toLowerCase()}@scorpio.edu`}
          </p>
        </div>
      </div>

      {/* Control row: Settings & Collapse Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-border/20 group-data-[state=collapsed]/sidebar:flex-col group-data-[state=collapsed]/sidebar:gap-2">
        <div className="flex items-center gap-1 group-data-[state=collapsed]/sidebar:flex-col">
          <SettingsDialog />
        </div>
        <AnimatedSidebarTrigger
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-4.5" />
          ) : (
            <PanelLeftClose className="size-4.5" />
          )}
        </AnimatedSidebarTrigger>
      </div>
    </AnimatedSidebarFooter>
  );
}

export function AppSidebar({
  roleLabel,
  navSections,
  isCollapsed,
  onToggle,
  sample,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatedSidebarProvider
      open={!isCollapsed}
      keyboardShortcut={!sample}
      onOpenChange={(nextOpen) => {
        if (nextOpen === isCollapsed) {
          onToggle();
        }
      }}
      className="flex-col md:flex-row min-h-0 shrink-0 w-full md:w-auto"
    >
      {/* Mobile top navigation header */}
      <div className="md:hidden flex h-14 w-full items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <CompassLogo className="size-6 text-foreground" />
          <span className="font-inter font-black text-lg tracking-tight">Scorpio</span>
        </div>
        <AnimatedSidebarTrigger
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </AnimatedSidebarTrigger>
      </div>

      {/* Main Animated Sidebar */}
      <AnimatedSidebar
        ariaLabel={`${roleLabel} workspace`}
        collapsible="icon"
        className="min-h-0"
        panelClassName={sample
          ? "static h-full border-border/40 bg-card"
          : "h-dvh border-border/40 bg-card/60 backdrop-blur-xl"}
      >
        {/* Minimal, clean top header without slop */}
        <AnimatedSidebarHeader className="p-4 pb-3">
          <div className="flex items-center gap-3 overflow-hidden px-1">
            <div className="flex size-8 shrink-0 items-center justify-center text-foreground">
              <CompassLogo className="size-6 text-foreground" />
            </div>
            <span className="truncate text-lg font-black tracking-tight font-inter text-foreground group-data-[state=collapsed]/sidebar:hidden">
              Scorpio
            </span>
            <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:text-foreground hover:bg-muted md:hidden">
              <X aria-hidden="true" className="size-4.5" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent className="px-2.5 py-2">
          {navSections.map((section) => (
            <AnimatedSidebarGroup key={section.label} className="py-1">
              <AnimatedSidebarGroupLabel>
                {section.label}
              </AnimatedSidebarGroupLabel>
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {section.items.map((item) => {
                    if ("dialog" in item) {
                      return <SustainabilityDialogItem key={item.dialog} label={item.label} />;
                    }

                    const isRootRoute =
                      item.href === "/teacher" ||
                      item.href === "/student" ||
                      item.href === "/admin";
                    const isActive = pathname
                      ? isRootRoute
                        ? pathname === item.href
                        : pathname === item.href ||
                          pathname.startsWith(item.href + "/")
                      : false;

                    const Icon = item.icon;
                    return (
                      <AnimatedSidebarMenuItem key={item.href}>
                        <AnimatedSidebarMenuButton
                          href={sample ? undefined : item.href}
                          isActive={sample ? sample.activeHref === item.href : isActive}
                          onSelect={sample ? () => sample.onSelect(item.href) : undefined}
                          icon={<Icon className="size-5" />}
                          badge={
                            item.badge ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {item.badge}
                              </span>
                            ) : undefined
                          }
                        >
                          {item.label}
                        </AnimatedSidebarMenuButton>
                      </AnimatedSidebarMenuItem>
                    );
                  })}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          ))}
        </AnimatedSidebarContent>

        {sample ? (
          <AnimatedSidebarFooter className="gap-2.5 border-t border-border/30 p-3">
            <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-muted/40 group-data-[state=collapsed]/sidebar:justify-center">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                MC
              </span>
              <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                  Dr. Maya Chen
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Sample teacher
                </p>
              </div>
            </div>

            <div className="hidden items-center justify-end border-t border-border/20 pt-1 md:flex group-data-[state=collapsed]/sidebar:justify-center">
              <AnimatedSidebarTrigger
                className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="size-4.5" />
                ) : (
                  <PanelLeftClose className="size-4.5" />
                )}
              </AnimatedSidebarTrigger>
            </div>
          </AnimatedSidebarFooter>
        ) : (
          <SidebarFooterSection roleLabel={roleLabel} isCollapsed={isCollapsed} />
        )}

        <AnimatedSidebarRail />
      </AnimatedSidebar>
    </AnimatedSidebarProvider>
  );
}
