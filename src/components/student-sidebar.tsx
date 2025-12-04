"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  FileCheck,
  LogOut
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { CompassLogo } from "@/components/ui/compass-logo";

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/tutor", label: "AI Tutor", icon: Bot },
  { href: "/student/submissions", label: "My Submissions", icon: FileCheck },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CompassLogo className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">Scorpio</span>
          </div>
          <div className="px-3 py-1.5 bg-muted/50 rounded-md mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</p>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
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
    </aside>
  );
}
