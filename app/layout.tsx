import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ScrollProvider } from "@/components/providers/ScrollProvider";

// Metric-compatible grotesque fallback so a missing Favorit weight never
// breaks layout while the self-hosted face loads.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: "Marble — Document your training.",
  description:
    "Marble is a training journal for documenting and visualizing physical training. No coaches. No notifications. No noise. Now on the App Store.",
  applicationName: "Marble",
  authors: [{ name: "Combat Créatif" }],
  openGraph: {
    title: "Marble — Document your training.",
    description:
      "A training journal designed by Combat Créatif. No coaches. No notifications. No noise.",
    siteName: "Marble",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Marble — a training journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marble — Document your training.",
    description:
      "A training journal designed by Combat Créatif. No coaches. No notifications. No noise.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4eee4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={hanken.variable}>
      <body className="min-h-screen overflow-x-hidden">
        <ScrollProvider>{children}</ScrollProvider>
      </body>
    </html>
  );
}
