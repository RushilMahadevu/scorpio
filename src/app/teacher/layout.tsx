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
        <main className="flex-1 ml-72 p-8 max-w-7xl">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
