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
  title: "Scribe — Pay the source behind the answer",
  description:
    "Scribe is a citation-based micropayment layer that pays creators, researchers, and publishers when AI answers use their work as grounding material.",
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
