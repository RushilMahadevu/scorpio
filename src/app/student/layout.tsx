"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { NavigationChatbot } from "@/components/navigation-chatbot";
import { useSidebarState } from "@/hooks/use-sidebar-state";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setIsCollapsed, isLoaded } = useSidebarState("student");

  // Prevent hydration mismatch or flicker by rendering a consistent initial state
  // or waiting for load. Since we want to respect the user's preference immediately,
  // we can use the isLoaded flag if we want to delay rendering, 
  // but for sidebars, usually a quick layout shift is acceptable or we just render default.
  // However, to strictly FIX "opens back up", we rely on the effect setting it correctly.
  
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
        <NavigationChatbot userRole="student" />
      </div>
    </ProtectedRoute>
  );
}
