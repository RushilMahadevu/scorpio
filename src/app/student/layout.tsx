"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { StudentSidebar } from "@/components/student-sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <main className="flex-1 ml-72 p-8 max-w-7xl">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
