import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/layout/motion-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#cb8b6a",
};

export const metadata: Metadata = {
  title: {
    default:  "Momentum",
    template: "%s — Momentum",
  },
  description: "Suis tes habitudes, seul ou avec tes amis.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type:        "website",
    locale:      "fr_FR",
    title:       "Momentum — suivi d'habitudes",
    description: "Suis tes habitudes, seul ou avec tes amis.",
    siteName:    "Momentum",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}