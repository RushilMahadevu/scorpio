"use client";

import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  PlusCircle,
  BarChart3,
  ChartColumnBig,
  Building2,
  Waypoints,
  PackageCheck,
  Presentation,
} from "lucide-react";
import { AppSidebar, NavSection } from "./app-sidebar";

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/teacher", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Classes",
    items: [
      { href: "/teacher/network", label: "Network", icon: Building2 },
      { href: "/teacher/students", label: "Students", icon: Users },
    ],
  },
  {
    label: "Assessments",
    items: [
      { href: "/teacher/grades", label: "Gradebook", icon: ChartColumnBig },
      { href: "/teacher/assignments", label: "My Assignments", icon: FileText },
      { href: "/teacher/create", label: "Create Assignment", icon: PlusCircle },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/teacher/waypoints", label: "Waypoints", icon: Waypoints },
      { href: "/teacher/vault", label: "Vault Controls", icon: PackageCheck },
      { href: "/teacher/uploads", label: "Resource Uploads", icon: Upload },
    ],
  },
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
      roleIcon={Presentation}
      navSections={navSections}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  );
}
