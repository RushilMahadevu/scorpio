"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "teacher" | "student";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRole && role !== allowedRole) {
        if (role === "teacher") {
          router.push("/teacher");
        } else if (role === "student") {
          router.push("/student");
        } else {
          // If role is null (e.g. error or new user), redirect to login or home
          router.push("/login");
        }
      }
    }
  }, [user, role, loading, router, allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRole && role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
