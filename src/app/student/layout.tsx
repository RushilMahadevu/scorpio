"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";
import { SpaceBackground } from "@/components/ui/space-background";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRole="student">
      <SpaceBackground />
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen relative"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full">
            <StudentSidebar />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <main className="flex-1 p-8 max-w-7xl">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ProtectedRoute>
  );
}
