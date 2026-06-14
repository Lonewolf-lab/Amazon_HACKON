import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PersonaProvider } from "@/lib/persona";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Amazon ReLife AI — Every Product Deserves a Second Life",
  description:
    "AI second-life commerce: smart quality grading, a 5-way decision engine, next-best-owner matching, trust certification, and green credits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            '"Amazon Ember", system-ui, -apple-system, Arial, sans-serif',
        }}
        className="bg-[#F3F3F3] text-[#0F1111] antialiased"
      >
        <PersonaProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen bg-[#F3F3F3]">{children}</main>
            <CartDrawer />
          </CartProvider>
        </PersonaProvider>
      </body>
    </html>
  );
}
