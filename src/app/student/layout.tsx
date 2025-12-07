"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRole="student">
      <SpaceBackground />
      <div className="flex h-screen">
        <StudentSidebar isCollapsed={isCollapsed} />
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
