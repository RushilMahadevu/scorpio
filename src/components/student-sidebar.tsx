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
import { TutorLogo } from "./ui/crux-logo";
import { AppSidebar, NavSection } from "./app-sidebar";

const SidebarTutorIcon = ({ className }: { className?: string }) => (
  <TutorLogo size={22} className={className} />
);

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/student", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Coursework",
    items: [
      { href: "/student/assignments", label: "Assignments", icon: FileText },
      { href: "/student/submissions", label: "My Submissions", icon: FileCheck },
      { href: "/student/grades", label: "Grades", icon: ChartColumnBig },
    ],
  },
  {
    label: "Study",
    items: [
      { href: "/student/practice", label: "Practice", icon: BowArrow },
      { href: "/student/notebook", label: "Notebook", icon: NotebookPen },
      { href: "/student/vault", label: "Equation Vault", icon: PackageOpen },
      { href: "/student/tutor", label: "Tutor", icon: SidebarTutorIcon },
      { href: "/student/resources", label: "Resources", icon: Library },
    ],
  },
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
      navSections={navSections}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  );
}
