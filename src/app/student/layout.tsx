"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/page-transition";


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
        {!isAssignmentView && (
          <StudentSidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        )}
        <main className={`flex-1 bg-background/50 ${isAssignmentView ? "overflow-hidden w-screen fixed inset-0 z-50" : "overflow-auto"}`}>
          <div className={isAssignmentView ? "h-full w-full" : "p-8 max-w-7xl mx-auto w-full"}>
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        {!isAssignmentView && <NavigationChatbot userRole="student" />}
      </div>
    </ProtectedRoute>
  );
}
