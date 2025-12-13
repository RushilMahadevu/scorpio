import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { SpaceEffectsProvider } from "@/contexts/space-effects-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scorpio",
  description: "Powering Physics at Sage Ridge",
  icons: [
    { rel: "icon", url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
    { rel: "icon", url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <SpaceEffectsProvider>
            <AuthProvider>{children}</AuthProvider>
          </SpaceEffectsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
