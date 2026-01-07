"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Info, Mail, Shield } from "lucide-react";

const items = [
  { title: "About", href: "/about", icon: Info },
  { title: "Research", href: "/research", icon: BookOpen },
  { title: "Privacy Policy", href: "/privacy", icon: Shield },
  { title: "Terms of Service", href: "/terms", icon: FileText },
  { title: "Contact", href: "/contact", icon: Mail },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200",
              pathname === item.href ? "bg-accent text-accent-foreground shadow-sm" : "transparent text-muted-foreground"
            )}
          >
            <item.icon className="mr-3 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
