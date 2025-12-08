"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { SpaceBackground } from "@/components/ui/space-background";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRole="teacher">
      <SpaceBackground />
      <div className="flex h-screen">
        <TeacherSidebar isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="m-4"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="p-8 pt-0">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
