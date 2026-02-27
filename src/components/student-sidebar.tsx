"use client";

import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  FileCheck,
  Library,
  GraduationCap,
  PackageOpen,
  Boxes,
  NotebookPen
} from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/sandbox", label: "Sandbox", icon: Boxes },
  { href: "/student/notebook", label: "Digital Notebook", icon: NotebookPen },
  { href: "/student/vault", label: "Equation Vault", icon: PackageOpen },
  { href: "/student/tutor", label: "AI Tutor", icon: Bot },
  { href: "/student/submissions", label: "My Submissions", icon: FileCheck },
  { href: "/student/resources", label: "Resources", icon: Library },
  { href: "/student/grades", label: "Grades", icon: GraduationCap },
];

export function StudentSidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <AppSidebar
      roleLabel="Student"
      navItems={navItems}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  );
}
