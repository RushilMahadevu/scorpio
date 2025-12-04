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
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
