"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Building2,
  Users,
  Award,
  Plus,
  RefreshCw,
  Download,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart3,
  Activity,
  Calendar,
  Sparkles,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import {
  useServices,
  useAuditLogs,
  useOpdList,
  useSpbeData,
  useCurrentAdmin,
} from "@/services/serviceStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";

// 7-day traffic data (Zero-dummy: diset 0 secara transparan jika data kunjungan belum tercatat secara real-time)
const TRAFFIC_DATA = [
  { day: "Senin", kunjungan: 0, aksesLayanan: 0 },
  { day: "Selasa", kunjungan: 0, aksesLayanan: 0 },
  { day: "Rabu", kunjungan: 0, aksesLayanan: 0 },
  { day: "Kamis", kunjungan: 0, aksesLayanan: 0 },
  { day: "Jumat", kunjungan: 0, aksesLayanan: 0 },
  { day: "Sabtu", kunjungan: 0, aksesLayanan: 0 },
  { day: "Minggu", kunjungan: 0, aksesLayanan: 0 },
];

export default function AdminDashboardPage() {
  const { services } = useServices();
  const { logs } = useAuditLogs();
  const { opdList } = useOpdList();
  const { latestSpbe, previousSpbe } = useSpbeData();
  const { currentAdmin } = useCurrentAdmin();
  const isSuperAdmin = currentAdmin.role === "Super Admin";

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trafficFilter, setTrafficFilter] = useState("7hari");

  const spbeDiff = previousSpbe ? latestSpbe.indeks - previousSpbe.indeks : 0;

  // RBAC: If Admin OPD, only show services belonging to their agency
  const accessibleServices = useMemo(() => {
    if (isSuperAdmin) return services;
    const targetAgency = (currentAdmin.agency || "").toLowerCase().trim();
    if (!targetAgency) return services;
    return services.filter((s) => {
      const sAgency = (s.agency || "").toLowerCase().trim();
      return (
        sAgency === targetAgency ||
        sAgency.includes(targetAgency) ||
        targetAgency.includes(sAgency)
      );
    });
  }, [services, isSuperAdmin, currentAdmin.agency]);

  const totalServices = accessibleServices.length;
  const activeCount = accessibleServices.filter((s) => s.status === "active").length;
  const activePct = totalServices > 0 ? Math.round((activeCount / totalServices) * 100) : 100;
  const recentServices = accessibleServices.slice(0, 5);

  // Dynamic category distribution computed from accessible services
  const categoryDistribution = useMemo(() => {
    if (!accessibleServices || accessibleServices.length === 0) return [];

    const counts: Record<string, number> = {};
    accessibleServices.forEach((s) => {
      const cat = s.category || "Lainnya";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => {
        const percentage = Math.round((count / accessibleServices.length) * 100);
        return {
          name,
          count,
          percentage,
          color: colors[index % colors.length],
        };
      });
  }, [accessibleServices]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20">
        {/* Decorative lighting & shapes */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isSuperAdmin
                  ? "Command Center SPBE Terintegrasi"
                  : `Portal Admin OPD - ${currentAdmin.agency || "Perangkat Daerah"}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isSuperAdmin
                ? "Selamat Datang, Administrator SPBE"
                : `Selamat Datang, Admin ${currentAdmin.agency || "OPD"}`}
            </h1>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              {isSuperAdmin
                ? "Pantau seluruh operasional pelayanan publik digital, performa OPD, serta aktivitas sistem Pemerintah Kabupaten Bekasi secara terpusat."
                : `Pantau dan kelola katalog layanan digital resmi milik ${currentAdmin.agency || "Perangkat Daerah Anda"} dalam ekosistem SPBE Kabupaten Bekasi.`}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Perbarui data"
            >
              <RefreshCw
                className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")}
              />
              <span>{isRefreshing ? "Menyegarkan..." : "Segarkan Data"}</span>
            </button>

            <Link
              href="/admin/services?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>+ Tambah Layanan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-0 max-w-full">
        <AdminStatCard
          title={isSuperAdmin ? "Total Layanan Publik" : `Layanan ${currentAdmin.agency || "OPD"}`}
          value={totalServices}
          subtitle={`${activePct}% Layanan Aktif (${activeCount} aktif)`}
          change={isSuperAdmin ? "Data Terpusat" : "Katalog OPD"}
          isPositive={true}
          icon={Layers}
          gradient="blue"
        />

        <AdminStatCard
          title="Kunjungan Portal"
          value="0"
          subtitle="0 sesi tercatat (Data real-time)"
          change="Sistem Siap Catat"
          isPositive={true}
          icon={Users}
          gradient="emerald"
        />

        <AdminStatCard
          title="Perangkat Daerah (OPD)"
          value={isSuperAdmin ? opdList.length : 1}
          subtitle={isSuperAdmin ? "100% Terdaftar di SPBE" : (currentAdmin.agency || "Perangkat Daerah")}
          change={isSuperAdmin ? "Semua Terhubung" : "Akun Terverifikasi"}
          isPositive={true}
          icon={Building2}
          gradient="violet"
        />

        <AdminStatCard
          title="Indeks SPBE Nasional"
          value={latestSpbe.indeks.toFixed(2)}
          subtitle={`Predikat ${latestSpbe.predikat} (Th. ${latestSpbe.tahun}) ⭐`}
          change={`${spbeDiff >= 0 ? "+" : ""}${spbeDiff.toFixed(2)} dari ${previousSpbe ? previousSpbe.tahun : "tahun lalu"}`}
          isPositive={spbeDiff >= 0}
          icon={Award}
          gradient="amber"
        />
      </div>

      {/* Middle Section: Traffic Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 max-w-full">
        {/* Traffic Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Tren Akses Layanan & Kunjungan
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Aktivitas kunjungan & akses layanan (0 sesi tercatat secara real-time)
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                onClick={() => setTrafficFilter("7hari")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  trafficFilter === "7hari"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                7 Hari
              </button>
              <button
                onClick={() => setTrafficFilter("30hari")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg transition-colors",
                  trafficFilter === "30hari"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                30 Hari
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKunjungan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAkses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>Kunjungan Portal: {payload[0]?.value?.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Akses Layanan: {payload[1]?.value?.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kunjungan"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorKunjungan)"
                />
                <Area
                  type="monotone"
                  dataKey="aksesLayanan"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAkses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Kunjungan Portal
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Akses Layanan Terhubung
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Pembaruan realtime</span>
          </div>
        </div>

        {/* Categories Distribution (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Kategori Layanan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribusi {totalServices} layanan berdasarkan sektor
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {categoryDistribution.length} Sektor
              </span>
            </div>

            <div className="space-y-4 my-4">
              {categoryDistribution.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={cat.name}>
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cat.count} <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={clsx("h-full rounded-full", cat.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/admin/services"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Kelola Seluruh Layanan</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Services Table & Audit Log Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 max-w-full">
        {/* Recent Services Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Layanan Publik Terkini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar 5 layanan yang paling sering diakses dan baru diperbarui
              </p>
            </div>
            <Link
              href="/admin/services"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Semua Layanan ({totalServices})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[550px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5 sm:px-6 font-semibold">Nama Layanan</th>
                  <th className="py-3 px-4 font-semibold">OPD Pengelola</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Kunjungan</th>
                  <th className="py-3 px-5 sm:px-6 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentServices.map((srv) => (
                  <tr
                    key={srv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-5 sm:px-6 font-medium text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-semibold">{srv.name}</span>
                        <span className="text-[11px] text-slate-400">{srv.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {srv.agency}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          srv.status === "active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : srv.status === "maintenance"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : srv.status === "development"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        )}
                      >
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            srv.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                        {srv.status === "active"
                          ? "Aktif"
                          : srv.status === "maintenance"
                          ? "Maintenance"
                          : srv.status === "development"
                          ? "Pengembangan"
                          : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {srv.users || "0"}
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={srv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Buka Aplikasi Layanan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/admin/services`}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          Kelola
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Timeline (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Aktivitas Terkini
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Live Log</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center my-auto">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Belum Ada Aktivitas Sesi
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                  Log hanya mencatat perubahan nyata (tambah, edit, hapus layanan) selama sesi aktif.
                </p>
              </div>
            ) : (
              <div className="relative pl-5 border-l border-slate-200 dark:border-slate-800 space-y-5 my-3">
                {logs.slice(0, 4).map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {act.performedBy}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {act.details}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(act.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {isSuperAdmin ? (
              <Link
                href="/admin/logs"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Buka Audit Log Lengkap</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/admin/services"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Kelola Layanan OPD</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
