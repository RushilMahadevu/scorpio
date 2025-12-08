"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  PlusCircle,
  BarChart3,
  GraduationCap
} from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/assignments", label: "Assignments", icon: FileText },
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
