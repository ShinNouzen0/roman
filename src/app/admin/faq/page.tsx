"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Layers,
  UserCircle,
  FileText,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpDown,
  Phone,
  Mail,
} from "lucide-react";
import clsx from "clsx";
import { useFaqs, FaqItem } from "@/services/serviceStore";
import Link from "next/link";

const CATEGORY_META: {
  [key: string]: { label: string; icon: any; color: string; badge: string };
} = {
  akun: {
    label: "Akun & Akses",
    icon: UserCircle,
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  layanan: {
    label: "Layanan Publik",
    icon: FileText,
    color: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  pengaduan: {
    label: "Pengaduan",
    icon: MessageSquare,
    color: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  teknis: {
    label: "Kendala Teknis",
    icon: Settings,
    color: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  lainnya: {
    label: "Lainnya",
    icon: HelpCircle,
    color: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

export default function AdminFaqPage() {
  const {
    faqs,
    addFaq,
    updateFaq,
    toggleFaqActive,
    deleteFaq,
    resetFaqsToDefault,
  } = useFaqs();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Expanded card state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [formData, setFormData] = useState<Omit<FaqItem, "id">>({
    category: "akun",
    question: "",
    answer: "",
    order: 1,
    isActive: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = faq.question.toLowerCase().includes(q);
        const matchA = faq.answer.toLowerCase().includes(q);
        if (!matchQ && !matchA) return false;
      }
      if (selectedCategory !== "all" && faq.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === "active" && !faq.isActive) return false;
      if (selectedStatus === "inactive" && faq.isActive) return false;
      return true;
    });
  }, [faqs, searchQuery, selectedCategory, selectedStatus]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = faqs.length;
    const active = faqs.filter((f) => f.isActive).length;
    const inactive = total - active;
    const categoriesCount = new Set(faqs.map((f) => f.category)).size;
    return { total, active, inactive, categoriesCount };
  }, [faqs]);

  // Handlers for Form
  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      category: "akun",
      question: "",
      answer: "",
      order: faqs.length + 1,
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 1,
      isActive: faq.isActive !== false,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Pertanyaan dan Jawaban wajib diisi!");
      return;
    }

    if (editingFaq) {
      updateFaq(editingFaq.id, {
        category: formData.category,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: Number(formData.order) || 1,
        isActive: formData.isActive,
      });
      showToast("FAQ berhasil diperbarui!");
    } else {
      addFaq({
        category: formData.category,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: Number(formData.order) || faqs.length + 1,
        isActive: formData.isActive,
      });
      showToast("FAQ baru berhasil ditambahkan!");
    }
    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingFaq) {
      deleteFaq(deletingFaq.id);
      setDeleteModalOpen(false);
      setDeletingFaq(null);
      showToast("FAQ berhasil dihapus!");
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
        </div>
        <div className="h-14 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Pusat Edukasi & Bantuan
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              Portal Publik SPBE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            Pusat Bantuan & FAQ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Kelola daftar pertanyaan umum, panduan akses akun, kanal pengaduan masyarakat, serta prosedur layanan publik digital Kabupaten Bekasi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/#faq"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            <span>Lihat di Portal Publik</span>
          </Link>

          <button
            onClick={() => {
              if (confirm("Kembalikan seluruh daftar FAQ ke versi bawaan sistem?")) {
                resetFaqsToDefault();
                showToast("Daftar FAQ berhasil direset!");
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
            title="Reset ke bawaan awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Bawaan</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah FAQ Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Pertanyaan FAQ
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-slate-500">Artikel Bantuan</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Tersinkronisasi ke portal publik
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              FAQ Aktif (Tampil)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.active}
            </span>
            <span className="text-xs font-medium text-slate-500">Dapat Dibaca Warga</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.inactive > 0 ? `${stats.inactive} pertanyaan disembunyikan` : "Semua aktif dipublikasi"}
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kategori Terdata
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.categoriesCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Kelompok Topik</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Akun, Layanan, Pengaduan, Teknis
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kontak Helpdesk
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              Call Center 112
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span>helpdesk@bekasikab.go.id</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pertanyaan atau kata kunci jawaban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Kategori</option>
            <option value="akun">Akun & Akses</option>
            <option value="layanan">Layanan Publik</option>
            <option value="pengaduan">Pengaduan</option>
            <option value="teknis">Kendala Teknis</option>
            <option value="lainnya">Lainnya</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Dipublikasi</option>
            <option value="inactive">Nonaktif (Draft)</option>
          </select>

          {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* FAQ Items List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
          <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak Ada FAQ Ditemukan
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Tidak ada pertanyaan yang sesuai dengan kata kunci atau filter saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, index) => {
            const meta = CATEGORY_META[faq.category] || CATEGORY_META.lainnya;
            const CategoryIcon = meta.icon;
            const isExpanded = expandedId === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={clsx(
                  "rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden shadow-sm",
                  !faq.isActive && "opacity-60 bg-slate-50/50 dark:bg-slate-900/40",
                  isExpanded
                    ? "border-blue-400 dark:border-blue-700 shadow-md"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {/* FAQ Header Row */}
                <div className="p-4 sm:p-5 flex items-start gap-4 justify-between">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <CategoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                            meta.badge
                          )}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Urutan: #{faq.order || index + 1}
                        </span>
                        {!faq.isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Disembunyikan
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </h3>

                      {!isExpanded && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleFaqActive(faq.id)}
                      className={clsx(
                        "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors",
                        faq.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                      )}
                      title={faq.isActive ? "Klik untuk menyembunyikan dari portal" : "Klik untuk menampilkan di portal"}
                    >
                      {faq.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-[11px]">
                        {faq.isActive ? "Aktif" : "Draft"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setDeletingFaq(faq);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Hapus FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-2 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Jawaban Lengkap:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah / Edit FAQ */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  {editingFaq ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}
                </h3>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
                {/* Category & Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kategori Pertanyaan
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                    >
                      <option value="akun">Akun & Akses</option>
                      <option value="layanan">Layanan Publik</option>
                      <option value="pengaduan">Pengaduan Masyarakat</option>
                      <option value="teknis">Kendala Teknis</option>
                      <option value="lainnya">Lainnya / Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Urutan Tampilan
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          order: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Pertanyaan (Question) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bagaimana cara membuat permohonan Kartu Keluarga online?"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, question: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jawaban Lengkap (Answer) *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan penjelasan detail langkah-langkah, syarat, atau kanal resmi terkait..."
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, answer: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Publikasikan langsung ke Portal Publik (Status: Aktif)
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
                  >
                    {editingFaq ? "Simpan Perubahan" : "Terbitkan FAQ"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteModalOpen && deletingFaq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Hapus Pertanyaan FAQ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 font-medium">
                &quot;{deletingFaq.question}&quot;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Pertanyaan ini tidak akan lagi muncul di halaman Pusat Bantuan portal publik.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  Hapus FAQ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
