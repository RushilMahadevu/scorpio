"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Brain,
  Sparkles,
  KeyRound,
  MessageCircle,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Orbit,
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
  ChartColumnIncreasing,
  X,
  Leaf,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  href?: string;
  action?: () => void;
  target?: string;
  isDropdown?: boolean;
  isExternal?: boolean;
};

type MenuItem = {
  label: string;
  desc: string;
  icon: React.ElementType;
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

  const content = (
    <>
      <span className="flex items-center gap-1.5">
        {item.label}
        {item.id === "ai" && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </span>

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
      <span className="absolute bottom-0 left-3 right-3 h-px overflow-hidden">
        <span
          className={cn(
            "block h-full bg-foreground transition-all duration-300 ease-out",
            active ? "w-full" : "w-0"
          )}
          style={{ transitionProperty: "width" }}
        />
      </span>
    </>
  );

  const sharedClassName = cn(
    "relative group px-4 py-2 text-[13.5px] font-medium tracking-[-0.01em] cursor-pointer flex items-center gap-1.5 transition-colors duration-200",
    active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
  );

  if (item.href && !item.isDropdown) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={item.href}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          className={sharedClassName}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      type="button"
      aria-expanded={item.isDropdown ? isHovered : undefined}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={sharedClassName}
    >
      {content}
    </motion.button>
  );
}

// ─── Mega Menu Card ────────────────────────────────────────────────────────────

function MegaMenuCard({
  icon: Icon,
  label,
  desc,
  onClick,
  href,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick?: () => void;
  href?: string;
  delay: number;
}) {
  const innerContent = (
    <>
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

        <span className="absolute bottom-3 left-4 right-4 h-px overflow-hidden">
          <span className="block h-full w-0 bg-primary/30 group-hover:w-full transition-all duration-300 ease-out" />
        </span>
      </div>
    </>
  );

  const className = "group relative flex w-full items-start gap-3.5 p-4 rounded-xl cursor-pointer text-left hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border/40 focus-visible:outline-2 focus-visible:outline-ring";

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={href} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={className}
    >
      {innerContent}
    </motion.button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

interface SiteHeaderProps {
  activeSection?: string;
}

export function SiteHeader({ activeSection }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Active navigation matching 4 core pillars
  const currentActiveNav = (() => {
    if (pathname === "/features" || pathname === "/demos") return "platform";
    if (pathname === "/ai") return "ai";
    if (pathname === "/pricing") return "pricing";
    if (
      pathname === "/sustainability" ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/research") ||
      pathname.startsWith("/contact") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/terms") ||
      pathname === "/request-access"
    ) return "resources";
    if (isHomePage) {
      if (activeSection === "problem" || activeSection === "solution" || activeSection === "efficacy") return "platform";
      if (activeSection === "faq") return "resources";
      if (activeSection === "pricing") return "pricing";
      return "";
    }
    return "";
  })();

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
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // 4 Core Navigation Pillars
  const navItems: NavItem[] = [
    { id: "platform", label: "Platform", isDropdown: true },
    { id: "ai", label: "Try AI", href: "/ai" },
    { id: "pricing", label: "Pricing", href: "/pricing" },
    { id: "resources", label: "Resources", isDropdown: true },
  ];

  const platformItems: MenuItem[] = [
    { href: "/features", label: "Platform Features", desc: "4-layer Socratic scaffolding, KaTeX engine, and telemetry.", icon: Layers },
    { href: "/demos", label: "System Demos", desc: "Interactive module studio, video walkthroughs, and workflows.", icon: PlayCircle },
    { target: "solution", label: "How Raise Works", desc: "Diagnostic query, conceptual priming, and guided derivation.", icon: Lightbulb },
    { target: "problem", label: "The Problem", desc: "Why passive homework solvers destroy physics comprehension.", icon: AlertCircle },
    { target: "efficacy", label: "Research & Efficacy", desc: "Ph.D. blinded scoring and 125-response ablation metrics.", icon: BarChart3 },
  ];

  const resourcesItems: MenuItem[] = [
    { href: "/research", label: "Research & Methodology", desc: "Comprehensive ablation study data and Ph.D. audit methodology.", icon: Brain },
    { href: "/sustainability", label: "Sustainability & Climate", desc: "Measured compute, water, and paper efficiency benchmarks.", icon: Leaf },
    { href: "/about", label: "About Scorpio", desc: "Why we built the Socratic Learning Management System.", icon: Info },
    { target: "faq", label: "Frequently Asked Questions", desc: "Common questions about pricing, data security, and adoption.", icon: MessageCircle },
    { href: "/request-access", label: "Request Access", desc: "Institutional licenses, trial codes, and LMS integrations.", icon: KeyRound },
    { href: "/contact", label: "Contact Us", desc: "Direct support for physics departments and deans.", icon: Mail },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex flex-col justify-center"
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHoveredNav(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setHoveredNav(null);
      }}
    >
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-all duration-300",
          "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm",
          isScrolled ? "opacity-100" : "opacity-0"
        )}
      />

      {/* ── Inner Row ───────────────────────────────────────────────────────── */}
      <div className={cn(
        "relative z-10 grid grid-cols-[1fr_auto] xl:grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 md:px-10 mx-auto w-full max-w-[1440px] transition-all duration-300",
        isScrolled ? "h-[54px]" : "h-[64px]"
      )}>

        {/* Logo Area */}
        <div className="flex justify-start">
          <Link
            href="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
              <Logo
                size={22}
                className="text-foreground relative z-10 group-hover:rotate-[20deg] transition-transform duration-400"
              />
            </div>
            <span className="font-black text-[15px] tracking-[-0.03em] text-foreground group-hover:text-primary transition-colors duration-200">
              Scorpio
            </span>
          </Link>
        </div>

        {/* ── Desktop Nav (4 Streamlined Pillars) ──────────────────────────────── */}
        <nav
          className="hidden xl:flex items-center justify-center gap-1.5 h-full mx-auto"
          onMouseEnter={cancelClose}
        >
          {navItems.map((item, i) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={!hoveredNav && currentActiveNav === item.id}
              isHovered={hoveredNav === item.id}
              delay={0.04 + i * 0.03}
              onMouseEnter={() => {
                cancelClose();
                setHoveredNav(item.id);
              }}
              onClick={() => {
                if (item.isDropdown) {
                  setHoveredNav(hoveredNav === item.id ? null : item.id);
                } else {
                  setHoveredNav(null);
                  if (item.action) item.action();
                  else if (item.target) {
                    if (isHomePage) {
                      scrollToSection(item.target);
                    } else {
                      router.push("/#" + item.target);
                    }
                  }
                }
              }}
            />
          ))}
        </nav>

        {/* ── Right Actions ────────────────────────────────────────────────── */}
        <div className="flex justify-end items-center gap-2">
          <ModeToggle />

          <div className="hidden sm:block w-px h-4 bg-border/40 mx-1" />

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full shadow-sm shadow-primary/10">
            <Link href="/signup">Sign up</Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="xl:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full max-w-[320px] h-full flex flex-col z-50 p-0 bg-background/95 backdrop-blur-2xl shadow-2xl xl:hidden border-l border-border/40"
              hideClose
              aria-describedby={undefined}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Logo size={20} className="text-foreground" />
                  <SheetTitle className="text-base font-bold">Scorpio</SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex flex-col gap-6 px-5 py-6 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 px-2 mb-2">
                    Platform
                  </p>
                  {[
                    { label: "Platform Features", href: "/features", icon: Layers },
                    { label: "System Demos", href: "/demos", icon: PlayCircle },
                    { label: "Try AI Playground", href: "/ai", icon: Sparkles, highlight: true },
                    { label: "Pricing & Plans", href: "/pricing", icon: ChartColumnIncreasing },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                          <item.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 px-2 mb-2">
                    Resources & Research
                  </p>
                  {resourcesItems.map((item) => {
                    const href = item.href || (item.target ? (isHomePage ? undefined : `/#${item.target}`) : "#");
                    if (item.target && isHomePage) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setMenuOpen(false);
                            scrollToSection(item.target!);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="h-6 w-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                            <item.icon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span>{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.label}
                        href={href || "#"}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-6 w-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                          <item.icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="px-5 pb-6 pt-4 border-t border-border/30 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Mega Menus ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hoveredNav === "platform" && (
          <motion.div
            key="platform-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1
                     w-[calc(100%-2rem)] max-w-[860px]
                     bg-popover text-popover-foreground border border-border
                     rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]
                     overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Orbit className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight text-foreground">The Platform</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                    Explore how Scorpio transforms physics pedagogy from passive solving into active derivation.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/features"
                    onClick={() => setHoveredNav(null)}
                    className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    View All Features
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Grid */}
              <div className="grid grid-cols-2 gap-2">
                {platformItems.map((item, i) => (
                  <MegaMenuCard
                    key={item.target || item.href}
                    icon={item.icon}
                    label={item.label}
                    desc={item.desc}
                    href={item.href}
                    delay={i * 0.03}
                    onClick={() => {
                      setHoveredNav(null);
                      if (item.target) {
                        if (isHomePage) {
                          scrollToSection(item.target);
                        } else {
                          router.push("/#" + item.target);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {hoveredNav === "resources" && (
          <motion.div
            key="resources-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1
                     w-[calc(100%-2rem)] max-w-[860px]
                     bg-popover text-popover-foreground border border-border
                     rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]
                     overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight text-foreground">Resources & Research</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                    Independent ablation research, climate impact metrics, FAQs, and institutional pilot access.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/research"
                    onClick={() => setHoveredNav(null)}
                    className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Read Methodology <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Grid */}
              <div className="grid grid-cols-2 gap-2">
                {resourcesItems.map((item, i) => (
                  <MegaMenuCard
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    desc={item.desc}
                    href={item.href}
                    delay={i * 0.03}
                    onClick={() => {
                      setHoveredNav(null);
                      if (item.target) {
                        if (isHomePage) {
                          scrollToSection(item.target);
                        } else {
                          router.push("/#" + item.target);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
