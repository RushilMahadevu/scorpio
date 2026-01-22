"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setIsCollapsed } = useSidebarState("student");
  const pathname = usePathname();

  const isAssignmentView = pathname?.includes("assignment-view");
  
  return (
    <ProtectedRoute allowedRole="student">
      <SpaceBackground />
      <div className="flex h-screen">
        <StudentSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
        {!isAssignmentView && <NavigationChatbot userRole="student" />}
      </div>
    </ProtectedRoute>
  );
}
