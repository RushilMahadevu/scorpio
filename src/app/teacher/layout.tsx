"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { PageTransition } from "@/components/page-transition";
import { DepartmentBanner } from "@/components/department-banner";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setIsCollapsed } = useSidebarState("teacher");

  return (
    <ProtectedRoute allowedRole="teacher">
      <SpaceBackground />
      <div className="flex h-dvh flex-col md:flex-row">
        <TeacherSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background/50">
          <DepartmentBanner />
          <div className="w-full px-4 pb-24 sm:px-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </div>
        </main>
        <NavigationChatbot userRole="teacher" />
      </div>
    </ProtectedRoute>
  );
}
