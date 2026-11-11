import type { Metadata, Viewport } from "next";
import {
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inter,
  Lora,
  Plus_Jakarta_Sans,
  PT_Serif,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-lora",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

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

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false, // not used above-the-fold; lazy-load to unblock first paint
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // not used above-the-fold; lazy-load to unblock first paint
});

export const metadata: Metadata = {
  title: {
    default: "Scorpio • Socratic Guidance for Physics Education",
    template: "%s • Scorpio",
  },
  description: "The Socratic AI Learning Management System (LMS) built to empower the physics classroom. Restore integrity, stop the solvers, and reclaim the derivation process.",
  keywords: [
    "Physics Teacher Tool",
    "Socratic AI",
    "Physics Education",
    "Physics LMS",
    "Socratic LMS",
    "Stop AI Cheating",
    "Physics Classroom AI",
    "Socratic Method AI",
    "Raise AI Learning Assistant",
    "AI Physics Assistant",
    "Academic Integrity",
    "Physics Scaffolding",
    "Classroom Empowerment",
    "Scorpio Physics"
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
    title: "Scorpio • Socratic Guidance for Physics Education",
    description: "The Socratic AI Learning Management System (LMS) for physics classrooms. Restore integrity, stop the solvers, and reclaim the derivation process.",
    url: "https://scorpioedu.org",
    siteName: "Scorpio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Scorpio - Socratic AI for Physics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    "language": "en",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Scorpio",
  },
};

export const viewport: Viewport = {
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
    <html lang="en" className={`${plusJakarta.variable} ${lora.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const migrationKey = "app-font-migrated-ibm-plex-sans";
                  const defaultFont = "ibm-plex-sans";
                  const fonts = ["inter", "ibm-plex-sans", "verdana", "roboto-mono", "pt-serif", "atkinson"];
                  let font = localStorage.getItem("app-font");

                  if (localStorage.getItem(migrationKey) !== "true") {
                    font = defaultFont;
                    localStorage.setItem("app-font", font);
                    localStorage.setItem(migrationKey, "true");
                  }

                  document.documentElement.classList.add("font-" + (fonts.includes(font) ? font : defaultFont));
                } catch {}
              })();
            `,
          }}
        />
        {/* tweakcn design-preview — dev only, never load in production */}
        {process.env.NODE_ENV === "development" && (
          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        )}
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${ibmPlexSans.variable} ${ptSerif.variable} ${atkinson.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
