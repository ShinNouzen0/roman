"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  Building2,
  Blocks,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Layers,
  Check,
  ShieldAlert,
} from "lucide-react";
import { useServices, useOpdList, useCurrentAdmin } from "@/services/serviceStore";
import { DigitalService } from "@/types";
import Badge from "@/components/ui/Badge";
import clsx from "clsx";

export default function AdminFeaturedServicesPage() {
  const router = useRouter();
  const { services, toggleFeatured } = useServices();
  const { opdList } = useOpdList();
  const { isSuperAdmin, currentAdmin } = useCurrentAdmin();

  // Automatic RBAC redirect for non-superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/admin?unauthorized=1");
    }
  }, [isSuperAdmin, router]);

  // Simple filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "featured" | "unfeatured">("all");
  const [selectedAgency, setSelectedAgency] = useState<string>("all");

  // Pagination (12 cards per page: perfect 3x4 grid)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const featuredServices = useMemo(
    () => services.filter((s) => Boolean(s.isFeatured)),
    [services]
  );
  const totalCount = services.length;
  const featuredCount = featuredServices.length;
  const unfeaturedCount = totalCount - featuredCount;

  // Unique agency list for simple dropdown filter
  const uniqueAgencies = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.agency) set.add(s.agency);
    });
    return Array.from(set).sort();
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = srv.name?.toLowerCase().includes(q);
        const matchAgency = srv.agency?.toLowerCase().includes(q);
        const matchDesc = srv.description?.toLowerCase().includes(q);
        if (!matchName && !matchAgency && !matchDesc) return false;
      }

      // 2. Status Filter
      if (statusFilter === "featured" && !srv.isFeatured) return false;
      if (statusFilter === "unfeatured" && srv.isFeatured) return false;

      // 3. Agency Filter
      if (selectedAgency !== "all" && srv.agency !== selectedAgency) return false;

      return true;
    });
  }, [services, searchQuery, statusFilter, selectedAgency]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedAgency]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));

  // Paginated slice
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  // Toggle handler
  const handleToggle = (srv: DigitalService) => {
    toggleFeatured(srv.id);
    const willBeFeatured = !srv.isFeatured;
    showToast(
      willBeFeatured
        ? `Layanan "${srv.name}" sekarang aktif & tampil di portal publik!`
        : `Layanan "${srv.name}" dinonaktifkan dari portal publik.`
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Akses Terbatas: Super Administrator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Mengalihkan Anda secara otomatis ke Dashboard Admin...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/50 dark:border-slate-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Layanan Unggulan Daerah
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Atur layanan prioritas yang langsung tampil di halaman depan Portal Publik SPBE Kabupaten Bekasi. Cukup aktifkan tombol switch untuk memunculkan layanan.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Katalog:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {totalCount}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Unggulan Aktif:</span>
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {featuredCount}
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-colors"
          >
            <span>Lihat di Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 min-w-0">
        {/* Filter Switcher Tabs with horizontal scrollbar hide */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={clsx(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
              statusFilter === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("featured")}
            className={clsx(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
              statusFilter === "featured"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Unggulan ({featuredCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unfeatured")}
            className={clsx(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
              statusFilter === "unfeatured"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Bukan Unggulan ({unfeaturedCount})
          </button>
        </div>

        {/* Right Search & OPD Filter */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto flex-1 md:max-w-md justify-end min-w-0">
          {/* OPD Selector */}
          <div className="relative shrink-0 hidden sm:block max-w-[180px]">
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full py-2 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 font-medium cursor-pointer truncate"
            >
              <option value="all">Semua OPD</option>
              {uniqueAgencies.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Minimalist Cards */}
      {paginatedServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Blocks className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tidak ada layanan yang sesuai
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan tab filter di atas.
          </p>
          {(searchQuery || selectedAgency !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAgency("all");
                setStatusFilter("all");
              }}
              className="mt-4 px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          {paginatedServices.map((srv) => {
            const isFeatured = Boolean(srv.isFeatured);
            const isPublic = srv.serviceType === "Layanan Publik";

            return (
              <motion.div
                key={srv.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={clsx(
                  "relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs min-w-0 overflow-hidden",
                  isFeatured
                    ? "bg-white dark:bg-slate-900 border-emerald-500/50 dark:border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {/* Active indicator badge top-right */}
                {isFeatured && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>UNGGULAN AKTIF</span>
                  </div>
                )}

                {/* Top Content */}
                <div>
                  {/* Category & Service Type */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3 pr-24">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold truncate max-w-[130px]">
                      {srv.category}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-medium border",
                        isPublic
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50"
                          : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50"
                      )}
                    >
                      {srv.serviceType}
                    </span>
                  </div>

                  {/* Title & Agency */}
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs",
                        isFeatured
                          ? "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      <Blocks className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                        title={srv.name}
                      >
                        {srv.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate font-medium" title={srv.agency}>
                          {srv.agency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Bottom Toggle Control Bar */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        isFeatured
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-slate-300 dark:bg-slate-600"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-xs font-semibold",
                        isFeatured
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {isFeatured ? "Tampil di Portal (ON)" : "Tampil di Portal (OFF)"}
                    </span>
                  </div>

                  {/* Tactile iOS-Style Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(srv)}
                    className={clsx(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
                      isFeatured
                        ? "bg-emerald-600"
                        : "bg-slate-300 dark:bg-slate-700"
                    )}
                    role="switch"
                    aria-checked={isFeatured}
                    title={
                      isFeatured
                        ? "Klik untuk mematikan layanan dari halaman depan"
                        : "Klik untuk menampilkan layanan di halaman depan"
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        isFeatured ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Minimalist Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Menampilkan{" "}
            <strong className="text-slate-900 dark:text-white">
              {(currentPage - 1) * pageSize + 1}
            </strong>{" "}
            -{" "}
            <strong className="text-slate-900 dark:text-white">
              {Math.min(currentPage * pageSize, filteredServices.length)}
            </strong>{" "}
            dari{" "}
            <strong className="text-slate-900 dark:text-white">
              {filteredServices.length}
            </strong>{" "}
            layanan
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "w-8 h-8 rounded-xl font-bold text-xs transition-colors",
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
