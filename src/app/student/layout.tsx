"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
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
  const isTutor = pathname?.includes("/student/tutor");
  const isFullScreen = isAssignmentView || isTutor;
  
  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex h-dvh flex-col overflow-hidden bg-background md:flex-row">
        {!isFullScreen && (
          <StudentSidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        )}
        <main className={`flex min-h-0 min-w-0 flex-1 flex-col ${isFullScreen ? "overflow-hidden" : "overflow-auto"}`}>
          {isFullScreen ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-2 sm:px-6 md:pt-8 lg:px-8">
              {children}
            </div>
          )}
        </main>
        {!isFullScreen && <NavigationChatbot userRole="student" />}
      </div>
    </ProtectedRoute>
  );
}
