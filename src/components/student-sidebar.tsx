"use client";

import {
  LayoutDashboard,
  FileText,
  Bot,
  FileCheck,
  Library,
  GraduationCap,
  PackageOpen,
  BowArrow,
  NotebookPen
} from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/submissions", label: "My Submissions", icon: FileCheck },
  { href: "/student/grades", label: "Grades", icon: GraduationCap },
  { href: "/student/practice", label: "Practice", icon: BowArrow },
  { href: "/student/notebook", label: "Notebook", icon: NotebookPen },
  { href: "/student/vault", label: "Equation Vault", icon: PackageOpen },
  { href: "/student/tutor", label: "AI Tutor", icon: Bot },
  { href: "/student/resources", label: "Resources", icon: Library },
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
