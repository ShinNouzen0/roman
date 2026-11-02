"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Layers,
  Globe,
  Building2,
  Tag,
  Mail,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Users,
} from "lucide-react";
import { DigitalService } from "@/types";
import clsx from "clsx";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Partial<DigitalService>) => void;
  initialData?: DigitalService | null;
  categories: string[];
  agencies: string[];
  lockedAgency?: string;
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  agencies,
  lockedAgency,
}: ServiceFormModalProps) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<Partial<DigitalService>>({
    name: "",
    description: "",
    url: "",
    serviceType: "Layanan Publik",
    category: categories[0] || "Administrasi & Umum",
    agency: lockedAgency || agencies[0] || "Diskominfosantik",
    status: "active",
    contactEmail: "",
    logo: "/logos/default.png",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        agency: lockedAgency || initialData.agency || agencies[0] || "Diskominfosantik",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        url: "",
        serviceType: "Layanan Publik",
        category: categories[0] || "Administrasi & Umum",
        agency: lockedAgency || agencies[0] || "Diskominfosantik",
        status: "active",
        contactEmail: "",
        logo: "/logos/default.png",
      });
    }
    setErrors({});
  }, [initialData, isOpen, categories, agencies, lockedAgency]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Nama layanan wajib diisi.";
    if (!formData.description?.trim()) newErrors.description = "Deskripsi layanan wajib diisi.";
    if (!formData.url?.trim()) {
      newErrors.url = "URL aplikasi layanan wajib diisi.";
    } else if (!formData.url.startsWith("http://") && !formData.url.startsWith("https://")) {
      newErrors.url = "URL harus diawali dengan http:// atau https://";
    }
    if (!formData.category?.trim()) newErrors.category = "Kategori wajib dipilih.";
    if (!formData.agency?.trim()) newErrors.agency = "OPD pengelola wajib dipilih.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEditing ? "Edit Layanan SPBE" : "Tambah Layanan Baru"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEditing
                    ? "Perbarui informasi, klasifikasi tipe layanan, dan status operasional"
                    : "Daftarkan layanan digital baru ke dalam katalog SPBE Kabupaten Bekasi"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Nama Layanan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Layanan Digital <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Bebas Denda PBB-P2 Online"
                className={clsx(
                  "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white outline-none transition-all",
                  errors.name
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Singkat Layanan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan fungsi utama layanan, manfaat bagi masyarakat/ASN, dan kegunaannya..."
                className={clsx(
                  "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white outline-none transition-all resize-none",
                  errors.description
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
                </p>
              )}
            </div>

            {/* URL Aplikasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Aplikasi / Portal Web <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://layanan.bekasikab.go.id"
                  className={clsx(
                    "w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white outline-none transition-all",
                    errors.url
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.url && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.url}
                </p>
              )}
            </div>

            {/* Pilihan Tipe Layanan Digital (Segmented Visual Cards) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tipe Layanan SPBE <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sinkron dengan Tab Portal Publik
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi 1: Layanan Publik */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, serviceType: "Layanan Publik" })
                  }
                  className={clsx(
                    "relative p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                    formData.serviceType === "Layanan Publik"
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/25 shadow-sm"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      formData.serviceType === "Layanan Publik"
                        ? "bg-sky-600 text-white shadow-md shadow-sky-500/30"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Layanan Publik
                      </span>
                      {formData.serviceType === "Layanan Publik" && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Untuk masyarakat umum, warga, & pelaku usaha di Kab. Bekasi
                    </p>
                  </div>
                </button>

                {/* Opsi 2: Administrasi Pemerintahan */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      serviceType: "Administrasi Pemerintahan",
                    })
                  }
                  className={clsx(
                    "relative p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                    formData.serviceType === "Administrasi Pemerintahan"
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/25 shadow-sm"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      formData.serviceType === "Administrasi Pemerintahan"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Administrasi Pemerintahan
                      </span>
                      {formData.serviceType === "Administrasi Pemerintahan" && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Internal OPD, tata kelola birokrasi, G2G, & aparatur ASN
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Status Operasional */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional Layanan
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "maintenance" | "development" | "inactive",
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="active">🟢 Aktif (Berjalan Normal)</option>
                <option value="maintenance">🟡 Pemeliharaan (Maintenance)</option>
                <option value="development">🔵 Dalam Pengembangan</option>
                <option value="inactive">🔴 Tidak Aktif</option>
              </select>
            </div>

            {/* Grid 2 Cols: Kategori & OPD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Layanan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perangkat Daerah (OPD) Pengelola <span className="text-rose-500">*</span>
                  {lockedAgency && (
                    <span className="text-blue-600 dark:text-blue-400 font-normal ml-1 text-[11px]">
                      (Terkunci: {lockedAgency})
                    </span>
                  )}
                </label>
                <select
                  value={lockedAgency || formData.agency || ""}
                  disabled={Boolean(lockedAgency)}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  className={clsx(
                    "w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white outline-none transition-all",
                    lockedAgency
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700 font-medium"
                      : "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  )}
                >
                  {agencies.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kontak Email Helpdesk */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Helpdesk / Pengelola Layanan <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="helpdesk@bekasikab.go.id (opsional)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                {isEditing ? "Simpan Perubahan" : "Tambahkan Layanan"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
