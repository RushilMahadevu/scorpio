"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    if (!document.startViewTransition) return;
    
    const observer = new MutationObserver(() => {
      document.startViewTransition(() => {});
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
