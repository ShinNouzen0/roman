"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Building2,
  Compass,
  FileText,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
  ShieldCheck,
  X,
  Award,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Katalog Layanan",
    href: "/admin/services",
    icon: Layers,
    badge: "101",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  {
    title: "Perangkat Daerah (OPD)",
    href: "/admin/opd",
    icon: Building2,
    badge: "45",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  {
    title: "Layanan Unggulan Daerah",
    href: "/admin/featured",
    icon: Sparkles,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  {
    title: "Evaluasi & Indeks SPBE",
    href: "/admin/spbe",
    icon: Award,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  {
    title: "Pusat Bantuan & FAQ",
    href: "/admin/faq",
    icon: HelpCircle,
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
  },
  {
    title: "Audit Log & Aktivitas",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "Pengaturan Sistem",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}

import {
  useServices,
  useOpdList,
  useSpbeData,
  useFaqs,
  useCurrentAdmin,
  DEFAULT_SPBE_DATA,
} from "@/services/serviceStore";

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { services } = useServices();
  const { opdList } = useOpdList();
  const { latestSpbe } = useSpbeData();
  const { faqs } = useFaqs();
  const { currentAdmin, isSuperAdmin } = useCurrentAdmin();

  // Calculate OPD services count for non-superadmin
  const targetAgency = currentAdmin.agency?.toLowerCase().trim() || "";
  const opdServicesCount = services.filter((s) => {
    const sAgency = s.agency?.toLowerCase().trim() || "";
    return (
      sAgency === targetAgency ||
      sAgency.includes(targetAgency) ||
      targetAgency.includes(sAgency)
    );
  }).length;

  const featuredCount = services.filter((s) => s.isFeatured).length;

  const navItems = ADMIN_NAV_ITEMS.map((item) => {
    if (item.href === "/admin/services") {
      return {
        ...item,
        badge: isSuperAdmin ? String(services.length) : String(opdServicesCount),
      };
    }
    if (item.href === "/admin/opd") {
      return { ...item, badge: String(opdList.length) };
    }
    if (item.href === "/admin/featured") {
      return { ...item, badge: String(featuredCount) };
    }
    if (item.href === "/admin/spbe") {
      return { ...item, badge: latestSpbe ? latestSpbe.indeks.toFixed(2) : (DEFAULT_SPBE_DATA[0]?.indeks ? DEFAULT_SPBE_DATA[0].indeks.toFixed(2) : "0.00") };
    }
    if (item.href === "/admin/faq") {
      return { ...item, badge: String(faqs.length) };
    }
    return item;
  });

  // RBAC: Super Admin gets all menus, Admin OPD only gets Dashboard, Services, and FAQ
  const allowedOpdRoutes = ["/admin", "/admin/services", "/admin/faq"];
  const visibleNavItems = navItems.filter((item) => {
    if (isSuperAdmin) return true;
    return allowedOpdRoutes.includes(item.href);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full max-h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none overflow-hidden">
      {/* Brand & Logo Header */}
      <div className="h-20 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-transparent dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-1.5 flex items-center justify-center transition-colors">
            <img
              src="/logos/logo-pemda.png"
              alt="Logo Kab. Bekasi"
              className="w-full h-full object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight truncate">
                    SPBE Command
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 rounded border border-blue-200/60 dark:border-blue-800/60">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Kabupaten Bekasi
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Database Connection Pill */}
      <div className="px-3 pt-3">
        <div
          className={clsx(
            "rounded-xl border transition-all duration-200 p-2.5 flex items-center",
            isCollapsed ? "justify-center" : "gap-2.5",
            "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
          )}
          title="Supabase PostgreSQL: Connected & Ready"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 relative">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="text-xs font-semibold tracking-tight truncate flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Supabase DB
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono">
                Online
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 min-h-0 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu Utama
          </div>
        )}

        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "group relative flex items-center rounded-xl transition-all duration-200 text-sm font-medium",
                isCollapsed
                  ? "justify-center p-3"
                  : "px-3.5 py-2.5 gap-3",
                isActive
                  ? "text-blue-700 dark:text-white font-semibold bg-blue-50/80 dark:bg-blue-900/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-active-pill"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={clsx(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={clsx(
                        "ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-full",
                        item.badgeColor || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Area: Back to Public Portal & Collapse Button */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0">
        {/* Link back to public portal */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "flex items-center rounded-xl p-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors",
            isCollapsed ? "justify-center" : "gap-2.5"
          )}
          title="Buka Portal Publik SPBE (Tab Baru)"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!isCollapsed && (
            <span className="truncate font-medium">Lihat Portal SPBE</span>
          )}
        </Link>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:flex justify-end pt-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-1.5 px-2 flex items-center justify-center gap-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
            title={isCollapsed ? "Perlebar Sidebar" : "Perkecil Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Ciutkan Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky, full height viewport, responsive width) */}
      <aside
        className={clsx(
          "hidden md:flex flex-col sticky top-0 h-screen max-h-screen z-30 transition-all duration-300 ease-in-out flex-shrink-0 self-start overflow-hidden",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay with Backdrop) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
