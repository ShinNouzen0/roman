"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@/app/globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentAdmin } from "@/services/serviceStore";
import { ShieldAlert, X } from "lucide-react";

const SENSITIVE_OPD_ROUTES = [
  "/admin/settings",
  "/admin/logs",
  "/admin/opd",
  "/admin/featured",
  "/admin/spbe",
  "/admin/applications",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentAdmin, isSuperAdmin, isAuthenticated } = useCurrentAdmin();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unauthorizedNotice, setUnauthorizedNotice] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Mount detection for client-side storage hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client-side Navigation Guard: Protect unauthenticated & RBAC routes
  useEffect(() => {
    if (!isMounted || isLoginPage) return;

    // 1. Unauthenticated check
    if (!isAuthenticated) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Sensitive route protection for Admin OPD
    const isSensitive = SENSITIVE_OPD_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isSensitive && !isSuperAdmin) {
      setUnauthorizedNotice(
        `Akses Ditolak (RBAC): Rute "${pathname}" hanya dapat diakses oleh Super Administrator. Anda telah dialihkan otomatis ke Dashboard.`
      );
      router.replace("/admin?unauthorized=1");
    }
  }, [pathname, isMounted, isAuthenticated, isSuperAdmin, isLoginPage, router]);

  // Handle URL query parameter ?unauthorized=1 from Edge Middleware or Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      if (search.get("unauthorized") === "1" && !unauthorizedNotice) {
        setUnauthorizedNotice(
          "Akses Ditolak (RBAC): Anda mencoba mengakses area sensitif tanpa hak akses Super Admin. Sistem keamanan SPBE mengalihkan Anda secara otomatis."
        );
      }
    }
  }, [pathname, unauthorizedNotice]);

  // If on login page, render children cleanly without the admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent flash of unauthorized or unauthenticated content while mounting
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memvalidasi sesi administratif...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-start transition-colors duration-300 overflow-x-hidden max-w-full">
      {/* Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        <AdminHeader
          isCollapsed={isCollapsed}
          onToggleDesktopSidebar={() => setIsCollapsed(!isCollapsed)}
          onToggleMobileSidebar={() => setMobileOpen(true)}
        />

        {/* Security / RBAC Interception Notice */}
        <AnimatePresence>
          {unauthorizedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-md"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-xs sm:text-sm">
                <p className="font-bold">Keamanan Navigasi Aktif</p>
                <p className="mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300">
                  {unauthorizedNotice}
                </p>
              </div>
              <button
                onClick={() => setUnauthorizedNotice(null)}
                className="p-1 rounded-lg text-amber-700 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full min-w-0"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
