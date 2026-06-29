import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/layout/motion-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const archivo = Archivo({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "Momentum — suivi d'habitudes",
  description: "Suis tes habitudes, seul ou avec tes amis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}