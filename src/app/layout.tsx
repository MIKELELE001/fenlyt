import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fenlyt — Affordable financial intelligence",
  description:
    "Fenlyt is a pay-per-query AI financial research assistant — token safety, wallet reputation, market sentiment, and asset briefs for cents, not a subscription.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell header={<Header />}>{children}</AppShell>
      </body>
    </html>
  );
}
