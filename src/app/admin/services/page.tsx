"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
  X,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { DigitalService } from "@/types";
import { useServices, useCurrentAdmin } from "@/services/serviceStore";
import ServiceFormModal from "@/components/admin/ServiceFormModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import clsx from "clsx";

export default function AdminServicesPage() {
  const {
    services,
    addService,
    updateService,
    updateServiceStatus,
    deleteService,
    resetServicesToDefault,
  } = useServices();

  const { currentAdmin, isSuperAdmin } = useCurrentAdmin();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<DigitalService | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<DigitalService | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // RBAC Filter: Super Admin sees all 101 services; Admin OPD strictly sees their agency's services
  const targetAgency = currentAdmin.agency?.toLowerCase().trim() || "";
  const accessibleServices = useMemo(() => {
    if (isSuperAdmin) return services;
    return services.filter((s) => {
      const sAgency = s.agency?.toLowerCase().trim() || "";
      return (
        sAgency === targetAgency ||
        sAgency.includes(targetAgency) ||
        targetAgency.includes(sAgency)
      );
    });
  }, [services, isSuperAdmin, targetAgency]);

  // Extract distinct categories & agencies for dropdowns from accessibleServices
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    accessibleServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }, [accessibleServices]);

  const agenciesList = useMemo(() => {
    const set = new Set<string>();
    accessibleServices.forEach((s) => {
      if (s.agency) set.add(s.agency);
    });
    return Array.from(set).sort();
  }, [accessibleServices]);

  // Dynamic Type Counts from accessibleServices
  const typeCounts = useMemo(() => {
    let publik = 0;
    let internal = 0;
    accessibleServices.forEach((s) => {
      if (s.serviceType === "Administrasi Pemerintahan") {
        internal++;
      } else {
        publik++;
      }
    });
    return {
      all: accessibleServices.length,
      publik,
      internal,
    };
  }, [accessibleServices]);

  const typeTabs = useMemo(
    () => [
      {
        id: "all" as const,
        label: "Semua Layanan",
        count: typeCounts.all,
        icon: Layers,
        color: "blue",
      },
      {
        id: "Layanan Publik" as const,
        label: "Layanan Publik",
        count: typeCounts.publik,
        icon: Users,
        color: "sky",
      },
      {
        id: "Administrasi Pemerintahan" as const,
        label: "Administrasi Pemerintahan",
        count: typeCounts.internal,
        icon: Building2,
        color: "purple",
      },
    ],
    [typeCounts]
  );

  // Filtered Services based on accessibleServices
  const filteredServices = useMemo(() => {
    return accessibleServices.filter((srv) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = srv.name?.toLowerCase().includes(q);
        const matchAgency = srv.agency?.toLowerCase().includes(q);
        const matchDesc = srv.description?.toLowerCase().includes(q);
        if (!matchName && !matchAgency && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== "all" && srv.category !== selectedCategory) {
        return false;
      }

      // Agency
      if (selectedAgency !== "all" && srv.agency !== selectedAgency) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && srv.status !== selectedStatus) {
        return false;
      }

      // Type
      if (selectedType !== "all" && srv.serviceType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [accessibleServices, searchQuery, selectedCategory, selectedAgency, selectedStatus, selectedType]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAgency, selectedStatus, selectedType]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredServices.length / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAgency("all");
    setSelectedStatus("all");
    setSelectedType("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedAgency !== "all" ||
    selectedStatus !== "all" ||
    selectedType !== "all";

  // CRUD Actions
  const handleOpenAddModal = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (service: DigitalService) => {
    setEditingService(service);
    setIsFormModalOpen(true);
  };

  const handleSaveService = (data: Partial<DigitalService>) => {
    if (editingService) {
      updateService(editingService.id, data);
      showToast(`Layanan "${data.name}" berhasil diperbarui.`);
    } else {
      const created = addService(data);
      showToast(`Layanan "${created.name}" berhasil ditambahkan.`);
    }
    setIsFormModalOpen(false);
  };

  // Quick Status Switcher (direct toggle from table)
  const handleQuickStatusChange = (
    id: string,
    newStatus: "active" | "maintenance" | "development" | "inactive"
  ) => {
    updateServiceStatus(id, newStatus);
    showToast(`Status layanan berhasil diubah menjadi ${newStatus}.`, "info");
  };

  // Delete
  const handleOpenDeleteModal = (service: DigitalService) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingService) return;
    deleteService(deletingService.id);
    showToast(`Layanan "${deletingService.name}" berhasil dihapus.`);
    setIsDeleteModalOpen(false);
    setDeletingService(null);
  };

  // Reset to original mock data
  const handleResetData = () => {
    if (confirm("Kembalikan data layanan ke data default SPBE (101 layanan asli)?")) {
      resetServicesToDefault();
      showToast("Data layanan berhasil di-reset ke data default katalog.", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={clsx(
              "fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md border",
              toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30"
                : "bg-blue-950/90 text-blue-300 border-blue-500/30"
            )}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Manajemen Katalog Layanan SPBE
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin
              ? "Kelola katalog lengkap 101 layanan digital Pemerintah Kabupaten Bekasi, perbarui status operasional, dan integrasikan tautan aplikasi."
              : `Kelola layanan digital terdaftar di bawah wewenang ${currentAdmin.agency}.`}
          </p>
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Instansi: {currentAdmin.agency}
              </span>
              <span className="text-xs text-slate-400">
                ({accessibleServices.length} layanan terdaftar)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperAdmin && (
            <button
              onClick={handleResetData}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              title="Reset ke data awal katalog (101 layanan)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Layanan Baru</span>
          </button>
        </div>
      </div>

      {/* Segmented Tabs: Tipe Layanan (Semua, Layanan Publik, Administrasi Pemerintahan) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm gap-1 overflow-x-auto max-w-full">
          {typeTabs.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={clsx(
                  "relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center gap-2.5 z-10 whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminServiceTypeTabPill"
                    className={clsx(
                      "absolute inset-0 rounded-xl shadow-md -z-10",
                      tab.id === "all"
                        ? "bg-blue-600 shadow-blue-500/25"
                        : tab.id === "Layanan Publik"
                        ? "bg-sky-600 shadow-sky-500/25"
                        : "bg-purple-600 shadow-purple-500/25"
                    )}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <tab.icon
                  className={clsx(
                    "w-4 h-4",
                    isActive
                      ? "text-white"
                      : tab.id === "Layanan Publik"
                      ? "text-sky-500"
                      : tab.id === "Administrasi Pemerintahan"
                      ? "text-purple-500"
                      : "text-blue-500"
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    "text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tersinkronisasi langsung dengan Katalog Publik Portal SPBE</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input (5 cols on lg) */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama layanan, OPD, deskripsi..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Semua Kategori ({categoriesList.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* OPD Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            {isSuperAdmin ? (
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer truncate"
              >
                <option value="all">Semua OPD Pengelola ({agenciesList.length})</option>
                {agenciesList.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 text-xs rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-semibold truncate">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                <span className="truncate">{currentAdmin.agency}</span>
              </div>
            )}
          </div>

          {/* Status Dropdown (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">🟢 Aktif</option>
              <option value="maintenance">🟡 Maintenance</option>
              <option value="development">🔵 Pengembangan</option>
              <option value="inactive">🔴 Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {filteredServices.length}
              </strong>{" "}
              dari {services.length} layanan terdaftar
            </span>

            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-[11px]">
                Filter Aktif
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 font-semibold w-12 text-center">No</th>
                <th className="py-3.5 px-4 font-semibold min-w-[240px]">Nama Layanan</th>
                <th className="py-3.5 px-4 font-semibold min-w-[170px]">Tipe Layanan</th>
                <th className="py-3.5 px-4 font-semibold min-w-[190px]">OPD Pengelola</th>
                <th className="py-3.5 px-4 font-semibold min-w-[130px]">Kategori</th>
                <th className="py-3.5 px-4 font-semibold min-w-[170px] text-center">
                  Status (Ubah Cepat)
                </th>
                <th className="py-3.5 px-4 font-semibold text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        Tidak ada layanan yang cocok
                      </p>
                      <p className="text-xs">
                        Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali semua layanan.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset Semua Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((srv, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={srv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {itemIndex}
                      </td>

                      {/* Nama & Deskripsi */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm block tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {srv.name}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md font-normal">
                            {srv.description}
                          </p>
                          {srv.url && (
                            <div className="pt-0.5">
                              <a
                                href={srv.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:underline inline-flex items-center gap-1 truncate max-w-[200px]"
                              >
                                <span>{srv.url.replace(/^https?:\/\//, "")}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tipe Layanan Badge */}
                      <td className="py-3.5 px-4">
                        {srv.serviceType === "Administrasi Pemerintahan" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/80 shadow-xs whitespace-nowrap">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>Adm. Pemerintahan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/90 dark:border-sky-800/80 shadow-xs whitespace-nowrap">
                            <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span>Layanan Publik</span>
                          </span>
                        )}
                      </td>

                      {/* OPD Pengelola */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[220px]" title={srv.agency}>
                            {srv.agency}
                          </span>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                          {srv.category}
                        </span>
                      </td>

                      {/* Quick Status Switcher */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={srv.status || "active"}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              srv.id,
                              e.target.value as "active" | "maintenance" | "development" | "inactive"
                            )
                          }
                          className={clsx(
                            "px-2.5 py-1 rounded-full text-xs font-semibold border outline-none transition-all cursor-pointer shadow-sm",
                            srv.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : srv.status === "maintenance"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : srv.status === "development"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          )}
                        >
                          <option value="active">🟢 Aktif</option>
                          <option value="maintenance">🟡 Maintenance</option>
                          <option value="development">🔵 Pengembangan</option>
                          <option value="inactive">🔴 Tidak Aktif</option>
                        </select>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(srv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit Data Layanan"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(srv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Hapus Layanan"
                            aria-label="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredServices.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Halaman <strong className="text-slate-900 dark:text-white">{currentPage}</strong> dari{" "}
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={clsx(
                  "p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors",
                  currentPage === 1
                    ? "opacity-40 cursor-not-allowed text-slate-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers preview */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }

                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={clsx(
                        "w-8 h-8 rounded-xl font-semibold text-xs transition-colors",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={clsx(
                  "p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors",
                  currentPage === totalPages
                    ? "opacity-40 cursor-not-allowed text-slate-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
                aria-label="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Add / Edit) */}
      <ServiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
        categories={categoriesList}
        agencies={agenciesList}
        lockedAgency={!isSuperAdmin ? currentAdmin.agency : undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        serviceName={deletingService?.name || ""}
      />
    </div>
  );
}
