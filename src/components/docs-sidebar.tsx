"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Info, Mail, Shield, Leaf } from "lucide-react";

const items = [
  { title: "About", href: "/about", icon: Info },
  { title: "Research & Methodology", href: "/research", icon: BookOpen },
  { title: "Sustainability & Green AI", href: "/sustainability", icon: Leaf },
  { title: "Privacy Policy", href: "/privacy", icon: Shield },
  { title: "Terms of Service", href: "/terms", icon: FileText },
  { title: "Contact Support", href: "/contact", icon: Mail },
];

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onNavigate={onNavigate}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
