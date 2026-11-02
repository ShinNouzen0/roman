import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PortalLayoutWrapper from "@/components/layout/PortalLayoutWrapper";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://spbe.bekasikab.go.id"),
  title: {
    default: "Portal SPBE Kabupaten Bekasi",
    template: "%s | Portal SPBE Kabupaten Bekasi",
  },
  description:
    "Portal resmi Sistem Pemerintahan Berbasis Elektronik (SPBE) Kabupaten Bekasi. Akses seluruh layanan digital, aplikasi publik, dan sistem administrasi pemerintah dalam satu platform yang terintegrasi, transparan, dan responsif.",
  keywords: [
    "SPBE", "Kabupaten Bekasi", "layanan digital", "e-government",
    "portal pemerintah", "aplikasi publik", "OPD Bekasi", "Diskominfosantik",
    "pelayanan publik", "digitalisasi pemerintahan",
  ],
  authors: [{ name: "Diskominfosantik Kabupaten Bekasi" }],
  creator: "Pemerintah Kabupaten Bekasi",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://spbe.bekasikab.go.id",
    siteName: "Portal SPBE Kabupaten Bekasi",
    title: "Portal SPBE Kabupaten Bekasi",
    description:
      "Portal resmi SPBE Kabupaten Bekasi — akses layanan digital, aplikasi publik, dan sistem administrasi dalam satu platform terintegrasi.",
    images: [
      {
        url: "/logos/logo-pemda.png",
        width: 1200,
        height: 630,
        alt: "Portal SPBE Kabupaten Bekasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal SPBE Kabupaten Bekasi",
    description:
      "Portal resmi SPBE Kabupaten Bekasi — akses layanan digital pemerintah dalam satu platform.",
    images: ["/logos/logo-pemda.png"],
  },
  robots: { index: true, follow: true },
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
          <PortalLayoutWrapper>
            {children}
          </PortalLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
