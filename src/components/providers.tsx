"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { SpaceEffectsProvider } from "@/contexts/space-effects-context";
import { AppearanceProvider } from "@/contexts/appearance-context";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppearanceProvider>
        <SpaceEffectsProvider>
          <AuthProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </AuthProvider>
          <Toaster position="top-center" richColors />
          <Analytics />
          <SpeedInsights />
        </SpaceEffectsProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
