"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { SpaceEffectsProvider } from "@/contexts/space-effects-context";
import { AppearanceProvider } from "@/contexts/appearance-context";
import { Toaster } from "sonner";
import { RouteProgressBar } from "@/components/route-progress-bar";
import { Suspense } from "react";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const needsAuth = pathname !== "/" && pathname !== "/demos/teacher";

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppearanceProvider>
        <SpaceEffectsProvider>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <AuthProvider needsAuth={needsAuth}>{children}</AuthProvider>
          <Toaster position="top-center" richColors />
        </SpaceEffectsProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
