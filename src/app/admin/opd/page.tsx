"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  Phone,
  Mail,
  MapPin,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useOpdList, OpdItem, useCurrentAdmin } from "@/services/serviceStore";
import clsx from "clsx";

export default function AdminOpdPage() {
  const router = useRouter();
  const { isSuperAdmin, currentAdmin } = useCurrentAdmin();
  const { opdList, addOpd, updateOpd, deleteOpd, syncWithServices } = useOpdList();

  // Automatic RBAC redirect for non-superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/admin?unauthorized=1");
    }
  }, [isSuperAdmin, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpd, setEditingOpd] = useState<OpdItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingOpd, setDeletingOpd] = useState<OpdItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<OpdItem>>({
    name: "",
    shortName: "",
    category: "Dinas",
    headOfAgency: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    status: "active",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSyncWithServices = () => {
    const synced = syncWithServices();
    showToast(`Sinkronisasi berhasil! ${synced.length} OPD terhubung dengan seluruh layanan.`);
  };

  // Filtered OPDs
  const filteredOpds = useMemo(() => {
    return opdList.filter((opd) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = opd.name?.toLowerCase().includes(q);
        const matchShort = opd.shortName?.toLowerCase().includes(q);
        const matchHead = opd.headOfAgency?.toLowerCase().includes(q);
        if (!matchName && !matchShort && !matchHead) return false;
      }
      if (selectedCategory !== "all" && opd.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "all" && opd.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [opdList, searchQuery, selectedCategory, selectedStatus]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingOpd(null);
    setFormData({
      name: "",
      shortName: "",
      category: "Dinas",
      headOfAgency: "",
      address: "",
      email: "",
      phone: "",
      website: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opd: OpdItem) => {
    setEditingOpd(opd);
    setFormData({ ...opd });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingOpd) {
      updateOpd(editingOpd.id, formData);
      showToast(`Data OPD "${formData.name}" berhasil diperbarui.`);
    } else {
      addOpd(formData);
      showToast(`OPD baru "${formData.name}" berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (opd: OpdItem) => {
    setDeletingOpd(opd);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingOpd) return;
    deleteOpd(deletingOpd.id);
    showToast(`OPD "${deletingOpd.name}" berhasil dihapus.`);
    setDeleteModalOpen(false);
    setDeletingOpd(null);
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
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Manajemen Perangkat Daerah (OPD)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar instansi, dinas, badan, dan unit kerja pelaksana SPBE Pemerintah Kabupaten Bekasi (tersinkronisasi dinamis dengan katalog layanan).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncWithServices}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all border border-slate-200/80 dark:border-slate-700 shadow-sm active:scale-95"
            title="Sinkronkan dinamis dari seluruh OPD unik pada 101 katalog layanan"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Sinkronkan Layanan</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah OPD Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase text-slate-400">Total OPD Terdaftar</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{opdList.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">100% Terintegrasi SPBE</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase text-slate-400">Dinas Daerah</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {opdList.filter((o) => o.category === "Dinas").length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pelayanan Langsung</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase text-slate-400">Badan & Lembaga</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {opdList.filter((o) => o.category === "Badan").length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pendapatan & Kepegawaian</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase text-slate-400">Layanan Aktif Terhubung</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {opdList.reduce((acc, o: any) => acc + (o.serviceCount || 0), 0)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Live Sync Real-Time</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama OPD, singkatan, pimpinan..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">Semua Kategori Instansi</option>
              <option value="Dinas">Dinas</option>
              <option value="Badan">Badan</option>
              <option value="RSUD">RSUD</option>
              <option value="Sekretariat">Sekretariat</option>
              <option value="Kecamatan">Kecamatan</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">🟢 Aktif</option>
              <option value="maintenance">🟡 Pemeliharaan</option>
              <option value="inactive">🔴 Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menampilkan <strong className="text-slate-900 dark:text-white">{filteredOpds.length}</strong> OPD
          </span>
          {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* OPD Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 font-semibold w-12 text-center">No</th>
                <th className="py-3.5 px-4 font-semibold min-w-[260px]">Nama Perangkat Daerah</th>
                <th className="py-3.5 px-4 font-semibold min-w-[130px]">Kategori</th>
                <th className="py-3.5 px-4 font-semibold min-w-[200px]">Pimpinan / Kepala OPD</th>
                <th className="py-3.5 px-4 font-semibold min-w-[120px] text-center">Layanan SPBE</th>
                <th className="py-3.5 px-4 font-semibold min-w-[160px]">Kontak & Website</th>
                <th className="py-3.5 px-4 font-semibold text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOpds.map((opd: any, idx) => (
                <tr
                  key={opd.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {opd.name}
                        </span>
                        {opd.shortName && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded border border-blue-200/50 dark:border-blue-800/50">
                            {opd.shortName}
                          </span>
                        )}
                      </div>
                      {opd.address && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-sm">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {opd.address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {opd.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {opd.headOfAgency || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/admin/services`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition-colors"
                      title="Lihat layanan OPD ini"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{opd.serviceCount || 0} Layanan</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {opd.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{opd.email}</span>
                        </div>
                      )}
                      {opd.website && (
                        <a
                          href={opd.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{opd.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(opd)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit OPD"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(opd)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus OPD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add / Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingOpd ? "Edit Data OPD" : "Tambah OPD Baru"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Instansi OPD *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dinas Ketahanan Pangan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Akronim / Singkatan
                    </label>
                    <input
                      type="text"
                      value={formData.shortName || ""}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="Contoh: Disketapang"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.category || "Dinas"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as OpdItem["category"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    >
                      <option value="Dinas">Dinas</option>
                      <option value="Badan">Badan</option>
                      <option value="RSUD">RSUD</option>
                      <option value="Sekretariat">Sekretariat</option>
                      <option value="Kecamatan">Kecamatan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kepala Instansi / Pimpinan
                  </label>
                  <input
                    type="text"
                    value={formData.headOfAgency || ""}
                    onChange={(e) => setFormData({ ...formData, headOfAgency: e.target.value })}
                    placeholder="Nama lengkap beserta gelar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kontak@bekasikab.go.id"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Website Resmi
                    </label>
                    <input
                      type="text"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Kantor
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat kantor dinas..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md active:scale-95"
                  >
                    {editingOpd ? "Simpan Perubahan" : "Tambahkan OPD"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hapus Data OPD?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Anda yakin ingin menghapus <strong>&ldquo;{deletingOpd?.name}&rdquo;</strong> dari sistem SPBE?
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
