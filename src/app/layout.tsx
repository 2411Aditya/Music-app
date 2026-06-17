import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sonora — Music Streaming",
  description: "A modern music streaming experience with zero-cost ephemeral audio pipeline. Discover, stream, and create playlists.",
  keywords: ["music", "streaming", "playlist", "audio", "sonora"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
