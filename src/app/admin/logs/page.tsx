"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Layers,
  Building2,
  Settings,
  RefreshCw,
  X,
  ShieldCheck,
  Calendar,
  Award,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useAuditLogs, AuditLogItem, useCurrentAdmin } from "@/services/serviceStore";
import clsx from "clsx";

export default function AdminLogsPage() {
  const router = useRouter();
  const { logs, clearLogs } = useAuditLogs();
  const { isSuperAdmin, currentAdmin } = useCurrentAdmin();

  // Automatic RBAC redirect for non-superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/admin?unauthorized=1");
    }
  }, [isSuperAdmin, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const todayCount = logs.filter((l) => l.timestamp.startsWith(todayStr)).length;
    const statusChanges = logs.filter((l) => l.action === "STATUS_CHANGE").length;
    const mutations = logs.filter((l) => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length;

    return {
      total: logs.length,
      today: todayCount,
      statusChanges,
      mutations,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    return logs.filter((log) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchUser = log.performedBy.toLowerCase().includes(q);
        const matchId = log.entityId?.toLowerCase().includes(q);
        if (!matchDetails && !matchUser && !matchId) return false;
      }

      // Action Filter
      if (selectedAction !== "all" && log.action !== selectedAction) {
        return false;
      }

      // Entity Filter
      if (selectedEntity !== "all" && log.entity !== selectedEntity) {
        return false;
      }

      // Timeframe Filter
      if (selectedTimeframe !== "all") {
        const logTime = new Date(log.timestamp).getTime();
        if (selectedTimeframe === "today" && now - logTime > oneDay) return false;
        if (selectedTimeframe === "week" && now - logTime > sevenDays) return false;
        if (selectedTimeframe === "custom") {
          if (selectedDate) {
            const logDate = log.timestamp.split("T")[0];
            if (logDate !== selectedDate) return false;
          }
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedAction, selectedEntity, selectedTimeframe, selectedDate]);

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Tidak ada log aktivitas untuk diekspor.");
      return;
    }

    const headers = ["ID", "Waktu", "Aksi", "Entitas", "Entity ID", "Detail Aktivitas", "Pelaksana"];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString("id-ID"),
      l.action,
      l.entity,
      l.entityId || "-",
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.performedBy.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-logs-spbe-bekasikab-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("File CSV log aktivitas berhasil diunduh!");
  };

  const handleClearLogsConfirm = () => {
    clearLogs();
    setClearModalOpen(false);
    showToast("Seluruh riwayat audit log telah dibersihkan.");
  };

  // Helper formatting for action pill
  const getActionBadge = (action: AuditLogItem["action"]) => {
    switch (action) {
      case "STATUS_CHANGE":
        return {
          label: "STATUS CHANGE",
          color: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          icon: RefreshCw,
        };
      case "CREATE":
        return {
          label: "CREATE",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          icon: CheckCircle2,
        };
      case "UPDATE":
        return {
          label: "UPDATE",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          icon: Activity,
        };
      case "DELETE":
        return {
          label: "DELETE",
          color: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800",
          icon: Trash2,
        };
      default:
        return {
          label: action,
          color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
          icon: FileText,
        };
    }
  };

  const getEntityIcon = (entity: AuditLogItem["entity"]) => {
    switch (entity) {
      case "SERVICE":
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case "OPD":
        return <Building2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "SPBE":
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      case "FAQ":
        return <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />;
      case "SETTINGS":
        return <Settings className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Akses Terbatas: Khusus Super Administrator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Akun Anda ({currentAdmin.role} - {currentAdmin.agency}) tidak memiliki izin untuk melihat riwayat audit log dan aktivitas sistem.
        </p>
        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700/50 dark:border-slate-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Keamanan & Tata Kelola
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              Sistem Audit SPBE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Audit Log & Riwayat Aktivitas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Catatan jejak audit permanen setiap aksi perubahan data layanan, pembaruan status pemeliharaan, serta mutasi instansi OPD di Kabupaten Bekasi.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setClearModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Log Tercatat
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-slate-500">Peristiwa</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Tercatat aman di Local / Prisma</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aktivitas Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.today}
            </span>
            <span className="text-xs font-medium text-slate-500">Aksi</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Aktif memantau real-time</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ubah Status Layanan
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.statusChanges}
            </span>
            <span className="text-xs font-medium text-slate-500">Transisi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Termasuk Maintenance Switcher
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mutasi CRUD
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              {stats.mutations}
            </span>
            <span className="text-xs font-medium text-slate-500">Operasi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tambah, sunting, & hapus data
          </div>
        </motion.div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam detail aktivitas, nama layanan, pelaksana..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Tipe Aksi</option>
              <option value="STATUS_CHANGE">Perubahan Status</option>
              <option value="CREATE">Penambahan (CREATE)</option>
              <option value="UPDATE">Pembaruan (UPDATE)</option>
              <option value="DELETE">Penghapusan (DELETE)</option>
            </select>

            {/* Entity Filter */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Entitas</option>
              <option value="SERVICE">Layanan / Aplikasi</option>
              <option value="OPD">Perangkat Daerah (OPD)</option>
              <option value="SPBE">Evaluasi & Indeks SPBE</option>
              <option value="FAQ">Pusat Bantuan & FAQ</option>
              <option value="SYSTEM">Sistem / Database</option>
              <option value="SETTINGS">Pengaturan Portal</option>
            </select>

            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                if (e.target.value !== "custom") {
                  setSelectedDate("");
                }
              }}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Periode</option>
              <option value="today">Hari Ini (24 Jam)</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="custom">Pilih Tanggal Kalender (Spesifik &gt;7 Hari)</option>
            </select>

            {/* Date Picker Input when custom timeframe is chosen */}
            {selectedTimeframe === "custom" && (
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-xl border border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
                  title="Pilih tanggal riwayat aktivitas log"
                />
              </div>
            )}
          </div>
        </div>

        {/* Filter Feedback */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Menampilkan <b>{filteredLogs.length}</b> dari {logs.length} catatan audit
          </span>
          {(searchQuery || selectedAction !== "all" || selectedEntity !== "all" || selectedTimeframe !== "all" || selectedDate) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAction("all");
                setSelectedEntity("all");
                setSelectedTimeframe("all");
                setSelectedDate("");
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Catatan Log
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Tidak ada aktivitas yang sesuai dengan filter pencarian. Setiap perubahan status atau data yang Anda lakukan di menu admin akan langsung terekam di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-[160px]">Waktu Kejadian</th>
                  <th className="py-3.5 px-4 w-[150px]">Tipe Aksi</th>
                  <th className="py-3.5 px-4 w-[130px]">Entitas</th>
                  <th className="py-3.5 px-4">Deskripsi Rincian Aktivitas</th>
                  <th className="py-3.5 px-4 w-[200px]">Pelaksana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const dateObj = new Date(log.timestamp);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {dateObj.toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border",
                            badge.color
                          )}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {getEntityIcon(log.entity)}
                          <span>{log.entity}</span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                          {log.details}
                        </p>
                        {log.entityId && (
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">
                            Ref ID: {log.entityId}
                          </span>
                        )}
                      </td>

                      {/* Actor / Performed By */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-slate-200 dark:border-slate-700">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {log.performedBy}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Logs Confirmation Modal */}
      <AnimatePresence>
        {clearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClearModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Bersihkan Riwayat Audit Log?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Tindakan ini akan mengosongkan seluruh jejak riwayat aktivitas yang tersimpan. Data layanan dan OPD tetap aman dan tidak terpengaruh.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setClearModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleClearLogsConfirm}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 transition-all"
                >
                  Ya, Bersihkan Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
