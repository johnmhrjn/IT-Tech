import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: {
    default: "ToyNest — Kids Toys Australia",
    template: "%s | ToyNest",
  },
  description:
    "Discover safe, fun, and age-appropriate kids' toys at ToyNest Australia. STEM toys, dolls, outdoor toys, and arts & crafts delivered to your door.",
  keywords: ["kids toys", "children toys", "toys australia", "educational toys", "STEM toys"],
  openGraph: {
    siteName: "ToyNest",
    locale: "en_AU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-[family-name:var(--font-nunito)]">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
