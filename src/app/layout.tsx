import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal SPBE Kabupaten Bekasi",
  description: "Portal Sistem Pemerintah Berbasis Elektronik (SPBE) Kabupaten Bekasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AccessibilityWidget />
        </Providers>
      </body>
    </html>
  );
}
