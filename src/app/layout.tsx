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
  title: {
    default: "Scorpio",
    template: "%s | Scorpio",
  },
  description: "Turn Physics Struggles Into Breakthroughs",
  icons: [
    { rel: "icon", url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
    { rel: "icon", url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  metadataBase: new URL("https://scorpioedu.org"),
  openGraph: {
    title: "Scorpio",
    description: "Turn Physics Struggles Into Breakthroughs",
    url: "https://scorpioedu.org",
    siteName: "Scorpio",
    images: [
      {
        url: "/og-image-light.png",
        width: 1200,
        height: 630,
        alt: "Scorpio Open Graph Image (Light)",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/og-image-dark.png",
        width: 1200,
        height: 630,
        alt: "Scorpio Open Graph Image (Dark)",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  themeColor: "#0f172a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  other: {
    "language": "en",
  },
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
