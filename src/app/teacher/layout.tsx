"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { SpaceBackground } from "@/components/ui/space-background";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setIsCollapsed } = useSidebarState("teacher");

  return (
    <ProtectedRoute allowedRole="teacher">
      <SpaceBackground />
      <div className="flex h-screen">
        <TeacherSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
        <NavigationChatbot userRole="teacher" />
      </div>
    </ProtectedRoute>
  );
}
