"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { SpaceBackground } from "@/components/ui/space-background";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { PageTransition } from "@/components/page-transition";
import { usePathname } from "next/navigation";


export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setIsCollapsed } = useSidebarState("teacher");
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRole="teacher">
      <SpaceBackground />
      <div className="flex h-screen">
        <TeacherSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 overflow-auto bg-background/50">
          <div className="p-8 max-w-7xl mx-auto w-full">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <NavigationChatbot userRole="teacher" />
      </div>
    </ProtectedRoute>
  );
}
