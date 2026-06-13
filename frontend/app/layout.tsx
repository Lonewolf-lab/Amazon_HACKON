import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReLoop — AI-Powered Returns & Sustainable Resale",
  description:
    "Smart quality grading, green credits, and predictive return prevention for a circular retail loop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-muted/30">{children}</main>
      </body>
    </html>
  );
}
