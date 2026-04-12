import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulateur Freelance — Comparateur fiscal",
  description:
    "Comparez 5 statuts juridiques français · Micro, EI, EURL, SASU, Holding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={cn(jetbrains.variable, inter.variable)}
    >
      <body><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  );
}
