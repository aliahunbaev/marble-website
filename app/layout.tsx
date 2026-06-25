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
  title: "Marble — Document your training.",
  description:
    "Marble is a training journal for documenting and visualizing physical training. No coaches. No notifications. No noise. Join the waitlist.",
  applicationName: "Marble",
  authors: [{ name: "Combat Créatif" }],
  openGraph: {
    title: "Marble — Document your training.",
    description:
      "A training journal designed by Combat Créatif. No coaches. No notifications. No noise.",
    siteName: "Marble",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marble — Document your training.",
    description:
      "A training journal designed by Combat Créatif. No coaches. No notifications. No noise.",
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
