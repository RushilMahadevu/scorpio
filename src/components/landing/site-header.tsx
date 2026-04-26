"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Brain,
  Sparkles,
  Calculator,
  KeyRound,
  MessageCircle,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Orbit,
  Presentation,
  Menu,
  Info,
  BookOpen,
  Mail,
  Shield,
  FileText,
  AlertCircle,
  Lightbulb,
  PlayCircle,
  BarChart3,
  Globe,
  AlertTriangle,
  ChartColumnIncreasing,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  action?: () => void;
  target?: string;
  isDropdown?: boolean;
  isExternal?: boolean;
};

type MenuItem = {
  label: string;
  desc: string;
  icon: any;
  target?: string;
  href?: string;
};

// ─── Nav Link with Left→Right Underline ────────────────────────────────────────

function NavLink({
  item,
  isActive,
  isHovered,
  onMouseEnter,
  onClick,
  delay,
}: {
  item: NavItem;
  isActive: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  delay: number;
}) {
  const active = isHovered || isActive;

  return (
    <motion.button
      initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        "relative group px-4 py-2.5 text-[13.5px] font-medium tracking-[-0.01em] cursor-pointer flex items-center gap-1 transition-colors duration-200",
        active ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground/80"
      )}
    >
      {item.label}

      {item.isExternal && (
        <ArrowUpRight
          className={cn(
            "h-3 w-3 transition-all duration-200",
            active
              ? "opacity-70 translate-x-0 -translate-y-0"
              : "opacity-0 -translate-x-0.5 translate-y-0.5 group-hover:opacity-50 group-hover:translate-x-0 group-hover:-translate-y-0"
          )}
        />
      )}

      {item.isDropdown && (
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-50 transition-all duration-300",
            isHovered ? "rotate-180 opacity-100" : ""
          )}
        />
      )}

      {/* Left-to-right underline */}
      <span className="absolute bottom-0 left-4 right-4 h-px overflow-hidden">
        <span
          className={cn(
            "block h-full bg-foreground transition-all duration-300 ease-out",
            active ? "w-full" : "w-0"
          )}
          style={{ transitionProperty: "width" }}
        />
      </span>
    </motion.button>
  );
}

// ─── Mega Menu ─────────────────────────────────────────────────────────────────

function MegaMenuCard({
  icon: Icon,
  label,
  desc,
  onClick,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick?: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative flex items-start gap-3.5 p-4 rounded-xl cursor-pointer
                 hover:bg-muted/60 transition-all duration-200 border border-transparent
                 hover:border-border/40"
    >
      {/* Icon */}
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0
                      group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground group-hover:text-primary
                      transition-colors duration-150 leading-tight mb-0.5 flex items-center gap-1">
          {label}
          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                                  transition-all duration-200" />
        </p>
        <p className="text-[11.5px] text-muted-foreground/80 leading-snug">{desc}</p>

        {/* Per-card underline sweep */}
        <span className="absolute bottom-3 left-4 right-4 h-px overflow-hidden">
          <span className="block h-full w-0 bg-primary/30 group-hover:w-full transition-all duration-300 ease-out" />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

interface SiteHeaderProps {
  activeSection?: string;
}

export function SiteHeader({ activeSection = "home" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>(activeSection);
  const [isScrolled, setIsScrolled] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setIsScrolled(y > 20);
  });

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setHoveredNav(null), 200);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Cinematic page-transition handler for external routes
  const navigateWithTransition = useCallback((href: string) => {
    if (transitioning || pathname === href) return;
    setTransitioning(true);
    // Give the overlay animation time to cover the screen before pushing
    setTimeout(() => router.push(href), 520);
  }, [transitioning, router, pathname]);

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      action: () => {
        if (isHomePage) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          navigateWithTransition("/");
        }
      }
    },
    { id: "platform", label: "Platform", isDropdown: true },
    { id: "demos", label: "Demos", isExternal: true, action: () => navigateWithTransition("/demos") },
    { id: "ai", label: "Try AI", isExternal: true, action: () => navigateWithTransition("/ai") },
    { id: "pricing", label: "Pricing", isExternal: true, action: () => navigateWithTransition("/pricing") },
    { id: "faq", label: "FAQ", target: "faq" },
    { id: "docs", label: "Docs", isDropdown: true },
  ];

  const platformItems: MenuItem[] = [
    { target: "problem", label: "The Problem", desc: "Why traditional physics tutors fail.", icon: AlertCircle },
    { target: "solution", label: "Our Solution", desc: "Socratic scaffolding in action.", icon: Lightbulb },
    { target: "features", label: "Features", desc: "Key features of Scorpio.", icon: Sparkles },
    { target: "efficacy", label: "Efficacy & Compare", desc: "Data-driven performance metrics.", icon: BarChart3 },
  ];

  const docsItems: MenuItem[] = [
    { href: "/about", label: "About Scorpio", desc: "Our mission to revolutionize physics education.", icon: Info },
    { href: "/research", label: "Research & Methodology", desc: "Deep dive into the Crux Socratic architecture.", icon: Brain },
    { href: "/request-access", label: "Request Access", desc: "Apply for institution-wide invite codes.", icon: KeyRound },
    { href: "/contact", label: "Contact Us", desc: "Institutional success & support team.", icon: Mail },
    { href: "/privacy", label: "Privacy Policy", desc: "FERPA/GDPR compliant infrastructure.", icon: Shield },
    { href: "/terms", label: "Terms of Service", desc: "Institutional and usage terms.", icon: FileText },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex flex-col justify-center"
        onMouseLeave={scheduleClose}
      >
        {/* ── Backdrop ────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-all duration-500",
            "bg-background/60 backdrop-blur-2xl",
            "[mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]",
            isScrolled ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Hairline border that appears on scroll */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-px bg-border/30 transition-opacity duration-500",
            isScrolled ? "opacity-100" : "opacity-0"
          )}
        />

        {/* ── Inner Row ───────────────────────────────────────────────────────── */}
        <div className={cn(
          "relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 mx-auto w-full max-w-[1500px] transition-all duration-500 ease-in-out",
          isScrolled ? "h-[50px]" : "h-[64px]"
        )}>

          {/* Logo Area */}
          <div className="flex justify-start">
            <motion.div
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                scale: isScrolled ? 0.94 : 1
              }}
              initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/"
                onClick={(e) => {
                  if (isHomePage) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    e.preventDefault();
                    navigateWithTransition("/");
                  }
                }}
                className="flex items-center gap-2.5 group shrink-0"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/25 blur-xl rounded-full scale-0 group-hover:scale-150
                                transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                  <Logo
                    size={22}
                    className="text-foreground relative z-10 group-hover:rotate-[25deg] transition-transform duration-500"
                  />
                </div>
                <span className="font-black text-[15px] tracking-[-0.03em] text-foreground
                               group-hover:text-primary transition-colors duration-200 !font-inter">
                  Scorpio
                </span>
              </Link>
            </motion.div>
          </div>

          {/* ── Desktop Nav ──────────────────────────────────────────────────── */}
          <motion.nav
            animate={{ scale: isScrolled ? 0.94 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex items-center justify-center h-full"
            onMouseEnter={cancelClose}
          >
            {navItems.map((item, i) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={!hoveredNav && activeNav === item.id}
                isHovered={hoveredNav === item.id}
                delay={0.1 + i * 0.07}
                onMouseEnter={() => {
                  cancelClose();
                  setHoveredNav(item.id);
                }}
                onClick={() => {
                  if (item.isDropdown) {
                    setHoveredNav(hoveredNav === item.id ? null : item.id);
                  } else {
                    setActiveNav(item.id);
                    setHoveredNav(null);
                    if (item.action) item.action();
                    else if (item.target) {
                      if (isHomePage) {
                        scrollToSection(item.target);
                      } else {
                        navigateWithTransition("/#" + item.target);
                      }
                    }
                  }
                }}
              />
            ))}
          </motion.nav>

          {/* ── Right Actions ────────────────────────────────────────────────── */}
          <div className="flex justify-end items-center gap-2">
            <motion.div
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                scale: isScrolled ? 0.94 : 1
              }}
              initial={{ opacity: 0, x: 10, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <div className="hidden sm:flex items-center">
                <ModeToggle />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-4 bg-border/40 mx-1" />

              <Link href="/login" className="hidden sm:block">
                <button className="relative group px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                  Login
                  <span className="absolute bottom-0 left-3 right-3 h-px overflow-hidden">
                    <span className="block h-full w-0 bg-foreground group-hover:w-full transition-all duration-250 ease-out" />
                  </span>
                </button>
              </Link>

              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative h-8 px-4 text-[13px] font-semibold rounded-full
                           bg-foreground text-background cursor-pointer overflow-hidden
                           shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]
                           transition-shadow duration-200 hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4)]"
                >
                  {/* Shimmer sweep */}
                  <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%]
                                 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                 transition-transform duration-700 ease-out pointer-events-none" />
                  Sign up
                </motion.button>
              </Link>

              {/* Mobile hamburger */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 rounded-full hover:bg-muted/60 border border-border/30 ml-1"
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-full max-w-[300px] h-full flex flex-col z-50 p-0 bg-background/95
                             backdrop-blur-2xl shadow-2xl lg:hidden border-l border-border/30"
                  hideClose
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                    <span className="font-black text-base tracking-tight">Menu</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full h-8 w-8 hover:bg-muted/60"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <nav className="flex flex-col gap-6 px-5 py-7 flex-1 overflow-y-auto">
                    {[
                      {
                        label: "Platform", items: platformItems.map(item => ({
                          id: item.target || item.label.toLowerCase(),
                          label: item.label,
                          icon: item.icon,
                          action: () => {
                            if (item.href) navigateWithTransition(item.href);
                            else if (item.target) {
                              if (isHomePage) scrollToSection(item.target);
                              else navigateWithTransition("/#" + item.target);
                            }
                          }
                        }))
                      },
                      {
                        label: "Institutional", items: [
                          { id: "demos", label: "Demos", icon: PlayCircle, href: "/demos" },
                          { id: "ai", label: "Try AI", icon: Sparkles, href: "/ai" },
                          { id: "pricing", label: "Pricing", icon: ChartColumnIncreasing, href: "/pricing" },
                          {
                            id: "efficacy", label: "Compare", icon: Brain, action: () => {
                              if (isHomePage) scrollToSection("efficacy");
                              else navigateWithTransition("/#efficacy");
                            }
                          },
                          {
                            id: "faq", label: "FAQ", icon: MessageCircle, action: () => {
                              if (isHomePage) scrollToSection("faq");
                              else navigateWithTransition("/#faq");
                            }
                          },
                        ]
                      },
                    ].map(({ label, items }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50 px-2 mb-2">
                          {label}
                        </p>
                        {items.map((item: any) => (
                          <button
                            key={item.id}
                            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-[13.5px]
                                       font-medium text-muted-foreground hover:text-foreground
                                       hover:bg-muted/50 transition-all duration-150 cursor-pointer text-left"
                            onClick={() => {
                              if (item.href) {
                                if (!isHomePage) navigateWithTransition(item.href);
                                else router.push(item.href);
                              }
                              else if (item.action) item.action();
                              else {
                                if (isHomePage) scrollToSection(item.id);
                                else navigateWithTransition("/#" + item.id);
                              }
                              setMenuOpen(false);
                            }}
                          >
                            <div className="h-7 w-7 rounded-md bg-muted/80 flex items-center justify-center shrink-0">
                              <item.icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ))}

                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50 px-2 mb-2">
                        Docs
                      </p>
                      {docsItems.map((item) => (
                        <Link key={item.label} href={item.href || "#"} onClick={() => setMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50
                                        transition-colors duration-150 cursor-pointer">
                            <div className="h-7 w-7 rounded-md bg-muted/80 flex items-center justify-center shrink-0">
                              <item.icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[13.5px] font-medium text-muted-foreground">{item.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <div className="px-5 pb-6 pt-4 border-t border-border/30 grid grid-cols-2 gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full font-semibold text-[13px] h-9">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full font-semibold text-[13px] h-9">Sign up</Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </div>

        {/* ── Mega Menus ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {hoveredNav === "platform" && (
            <motion.div
              key="platform-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1
                       w-[calc(100%-3rem)] max-w-[880px]
                       bg-background/80 backdrop-blur-2xl border border-border/30
                       rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]
                       overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                {/* Left */}
                <div className="space-y-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Orbit className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black tracking-tight text-foreground">The Platform</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                      Explore how Scorpio solves the pedagogical gap in physics education.
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setHoveredNav(null);
                        if (isHomePage) {
                          scrollToSection("solution");
                        } else {
                          navigateWithTransition("/#solution");
                        }
                      }}
                      className="group flex items-center gap-1 text-[12px] font-semibold text-primary
                               hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      Explore system
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {platformItems.map((item, i) => (
                    <MegaMenuCard
                      key={item.target || item.href}
                      icon={item.icon}
                      label={item.label}
                      desc={item.desc}
                      delay={i * 0.04}
                      onClick={() => {
                        setHoveredNav(null);
                        if (item.href) {
                          navigateWithTransition(item.href);
                        } else if (item.target) {
                          if (isHomePage) {
                            scrollToSection(item.target);
                            setActiveNav("platform");
                          } else {
                            navigateWithTransition("/#" + item.target);
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {hoveredNav === "docs" && (
            <motion.div
              key="docs-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1
                       w-[calc(100%-3rem)] max-w-[880px]
                       bg-background/80 backdrop-blur-2xl border border-border/30
                       rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]
                       overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
                {/* Left */}
                <div className="space-y-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black tracking-tight text-foreground">Documentation</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                      Comprehensive guides and institutional research for the Scorpio ecosystem.
                    </p>
                  </div>
                  <Link href="/about" onClick={() => setHoveredNav(null)}>
                    <button className="group flex items-center gap-1 text-[12px] font-semibold text-primary
                                     hover:text-primary/80 transition-colors cursor-pointer">
                      Explore mission
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {docsItems.map((item, i) => (
                    <Link key={item.label} href={item.href || "#"} onClick={() => setHoveredNav(null)}>
                      <MegaMenuCard
                        icon={item.icon}
                        label={item.label}
                        desc={item.desc}
                        delay={i * 0.04}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Cinematic Page Transition Overlay ────────────────────────────── */}
      <AnimatePresence>
        {transitioning && (
          <>
            {/* Primary sweep — clips from bottom-left corner upward */}
            <motion.div
              key="transition-overlay"
              className="fixed inset-0 z-[200] pointer-events-none origin-bottom-left"
              style={{ background: "hsl(var(--background))" }}
              initial={{ clipPath: "polygon(0% 100%, 0% 100%, 0% 100%)" }}
              animate={{ clipPath: "polygon(0% 0%, 150% 0%, 0% 150%)" }}
              transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            />
            {/* Accent layer — slightly offset for depth */}
            <motion.div
              key="transition-accent"
              className="fixed inset-0 z-[199] pointer-events-none origin-bottom-left"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
              initial={{ clipPath: "polygon(0% 100%, 0% 100%, 0% 100%)" }}
              animate={{ clipPath: "polygon(0% 0%, 150% 0%, 0% 150%)" }}
              transition={{ duration: 0.55, delay: 0.06, ease: [0.76, 0, 0.24, 1] }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}