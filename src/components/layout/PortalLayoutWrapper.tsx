"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccessibilityWidget from "@/components/ui/AccessibilityWidget";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function PortalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Jika sedang berada di rute admin (/admin, /admin/login, dll),
  // jangan render Navbar, Footer, dan Widget publik portal.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AccessibilityWidget />
      <ScrollToTop />
    </>
  );
}
