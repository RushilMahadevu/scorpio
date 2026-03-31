import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { SpaceEffectsProvider } from "@/contexts/space-effects-context";
import { AppearanceProvider } from "@/contexts/appearance-context";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Scorpio",
    template: "%s • Scorpio",
  },
  description: "The only AI Physics LMS that prevents cheating. Our 4-layer constraint architecture enforces step-by-step derivation and genuine student understanding.",
  keywords: [
    "Physics LMS",
    "Anti-Cheating Physics Platform",
    "Verifiable AI",
    "Academic Integrity Software",
    "Physics Education Technology",
    "Step-by-Step Derivation Tool",
    "Scorpio Education",
    "AI Physics Teacher Tools"
  ],
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
    { rel: "icon", url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon-light.ico" }, // Fallback since png is missing
  ],
  metadataBase: new URL("https://scorpioedu.org"),
  openGraph: {
    title: "Scorpio | The Verifiable AI Physics LMS",
    description: "Enforce the struggle with the only LMS that prevents AI cheating. Research-grade constraint architecture for genuine physics mastery.",
    url: "https://scorpioedu.org",
    siteName: "Scorpio",
    images: [
      {
        url: "/og-image-pink.png",
        width: 1200,
        height: 630,
        alt: "Scorpio - The Verifiable AI Physics LMS",
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
      <body className={`${inter.variable} ${ibmPlexSans.variable} ${robotoMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
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
      </body>
    </html>
  );
}
