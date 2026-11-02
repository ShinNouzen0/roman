"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSpbeData, useCurrentAdmin, useAuditLogs, getAdminInitials } from "@/services/serviceStore";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  isCollapsed: boolean;
  onToggleDesktopSidebar: () => void;
}

export default function AdminHeader({
  onToggleMobileSidebar,
  isCollapsed,
  onToggleDesktopSidebar,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { latestSpbe } = useSpbeData();
  const { currentAdmin, isSuperAdmin, logout } = useCurrentAdmin();
  const { logs } = useAuditLogs();

  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Derive human breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ title: "Dashboard", href: "/admin" }];

    return parts.map((part, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      let title = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === "admin") title = "Admin";
      if (part === "services") title = "Katalog Layanan";
      if (part === "opd") title = "Perangkat Daerah";
      if (part === "featured") title = "Layanan Unggulan Daerah";
      if (part === "applications") title = "Layanan Unggulan Daerah";
      if (part === "logs") title = "Audit Log";
      if (part === "settings") title = "Pengaturan";
      if (part === "spbe") title = "Evaluasi SPBE";
      if (part === "faq") title = "Pusat Bantuan & FAQ";
      return { title, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.href} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                  {isLast ? (
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs">
                      {crumb.title}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                    >
                      {crumb.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Center/Right: Quick Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari layanan, OPD, dokumen..."
              className="w-full pl-10 pr-12 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls: Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-5 h-5" />
              {logs.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Pemberitahuan Sistem
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {logs.length > 0
                          ? `${logs.length} aktivitas sesi tercatat`
                          : "Tidak ada pemberitahuan baru"}
                      </p>
                    </div>
                    {logs.length > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                        {logs.length} Baru
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Belum Ada Aktivitas Baru
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Aktivitas real (tambah/edit/hapus) di sesi ini akan muncul di sini.
                        </p>
                      </div>
                    ) : (
                      logs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3"
                        >
                          <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold",
                            log.action === "CREATE" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                            log.action === "UPDATE" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                            log.action === "DELETE" && "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
                            log.action === "STATUS_CHANGE" && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                          )}>
                            {log.action === "CREATE" ? "+" : log.action === "DELETE" ? "×" : "•"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {log.details}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Oleh: {log.performedBy}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />{" "}
                              {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {isSuperAdmin && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                      <Link
                        href="/admin/logs"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Lihat Semua Riwayat Aktivitas &rarr;
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Ubah Tema"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <div className={clsx(
                "w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-sm",
                isSuperAdmin
                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600"
                  : "bg-gradient-to-tr from-purple-600 to-pink-600"
              )}>
                {getAdminInitials(currentAdmin.agency || currentAdmin.name)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[140px] truncate" title={currentAdmin.agency || currentAdmin.name}>
                  {currentAdmin.agency || currentAdmin.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  {currentAdmin.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {currentAdmin.agency || currentAdmin.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentAdmin.email || currentAdmin.username}
                    </p>
                    <span className={clsx(
                      "inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider",
                      isSuperAdmin
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    )}>
                      {currentAdmin.role}
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <Link
                      href="/admin/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Pengaturan Akun
                    </Link>
                  )}

                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    Buka Portal Publik
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar (Logout)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
