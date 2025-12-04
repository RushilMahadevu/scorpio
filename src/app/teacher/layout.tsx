"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { TeacherSidebar } from "@/components/teacher-sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRole="teacher">
      <div className="flex min-h-screen">
        <TeacherSidebar />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
