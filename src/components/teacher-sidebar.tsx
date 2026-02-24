"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  PlusCircle,
  BarChart3,
  GraduationCap,
  Building2,
  BookOpen
} from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/network", label: "Network", icon: Building2 },
  { href: "/teacher/library", label: "Physics Library", icon: BookOpen },
  { href: "/teacher/assignments", label: "My Assignments", icon: FileText },
  { href: "/teacher/create", label: "Create Assignment", icon: PlusCircle },
  { href: "/teacher/uploads", label: "Resource Uploads", icon: Upload },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/grades", label: "Gradebook", icon: GraduationCap },
];

export function TeacherSidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <AppSidebar
      roleLabel="Teacher"
      navItems={navItems}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  );
}
