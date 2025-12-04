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
  Upload, 
  Users, 
  LogOut,
  PlusCircle
} from "lucide-react";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/assignments", label: "Assignments", icon: FileText },
  { href: "/teacher/create", label: "Create Assignment", icon: PlusCircle },
  { href: "/teacher/uploads", label: "PDF Uploads", icon: Upload },
  { href: "/teacher/students", label: "Students", icon: Users },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold">Scorpio</h1>
          <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
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
