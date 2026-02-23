"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Info, Mail, Shield } from "lucide-react";

const items = [
  { title: "About", href: "/about", icon: Info },
  { title: "Research & Data", href: "/research", icon: BookOpen },
  { title: "Privacy Policy", href: "/privacy", icon: Shield },
  { title: "Terms of Service", href: "/terms", icon: FileText },
  { title: "Contact Support", href: "/contact", icon: Mail },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="relative group">
            <span
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative z-10",
                isActive 
                  ? "text-primary bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-4 w-4 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              <span>{item.title}</span>
              {isActive && (
                <span className="absolute left-0 w-1 h-4 bg-primary rounded-full" />
              )}
            </span>
            {isActive && (
              <div className="absolute inset-0 bg-primary/5 blur-md rounded-lg -z-10" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
