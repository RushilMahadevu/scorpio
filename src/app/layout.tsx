import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { SpaceEffectsProvider } from "@/contexts/space-effects-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Scorpio | AI-Powered Physics LMS",
    template: "%s | Scorpio",
  },
  description: "Scorpio is an AI-powered Learning Management System (LMS) utilizing advanced Large Language Models (LLMs) to transform physics education. Features research-grade AI tutoring, real-time LaTeX rendering, and immersive learning tools.",
  keywords: [
    "AI Powered LLM",
    "Physics LMS",
    "AI Tutor",
    "Large Language Model",
    "Education Technology",
    "Physics Education",
    "Scorpio Education",
    "LMS",
    "AI Learning Platform"
  ],
  icons: [
    { rel: "icon", url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
    { rel: "icon", url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  metadataBase: new URL("https://scorpioedu.org"),
  openGraph: {
    title: "Scorpio | AI-Powered Physics LMS",
    description: "Turn Physics Struggles Into Breakthroughs with Scorpio's research-grade AI tutoring and immersive learning platform.",
    url: "https://scorpioedu.org",
    siteName: "Scorpio",
    images: [
      {
        url: "/og-image-light.png",
        width: 1200,
        height: 630,
        alt: "Scorpio Open Graph Image (Light)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    "language": "en",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Scorpio",
              "url": "https://scorpioedu.org",
              "logo": "https://scorpioedu.org/og-image-light.png",
              "sameAs": []
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Scorpio",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
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
