"use client";

import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Library,
  GraduationCap,
  PackageOpen,
  ChartColumnBig,
  BowArrow,
  NotebookPen
} from "lucide-react";
import { CruxLogo } from "./ui/crux-logo";
import { AppSidebar } from "./app-sidebar";

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/submissions", label: "My Submissions", icon: FileCheck },
  { href: "/student/grades", label: "Grades", icon: ChartColumnBig },
  { href: "/student/practice", label: "Practice", icon: BowArrow },
  { href: "/student/notebook", label: "Notebook", icon: NotebookPen },
  { href: "/student/vault", label: "Equation Vault", icon: PackageOpen },
  { href: "/student/tutor", label: "AI Tutor", icon: CruxLogo },
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
      roleIcon={GraduationCap}
      navItems={navItems}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  );
}
