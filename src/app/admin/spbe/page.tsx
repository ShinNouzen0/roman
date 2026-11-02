"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Calendar,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  X,
  FileCheck2,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import {
  useSpbeData,
  SpbeAnnualRecord,
  DEFAULT_SPBE_DATA,
  useCurrentAdmin,
} from "@/services/serviceStore";
import { SPBE_ASPECTS, SPBE_DOMAINS } from "@/data/spbeData";
import Link from "next/link";

// Helper for predikat metadata
function getPredikatFromScore(score: number): { label: string; color: string; badge: string } {
  if (score >= 4.2) {
    return {
      label: "Memuaskan",
      color: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    };
  }
  if (score >= 3.5) {
    return {
      label: "Sangat Baik",
      color: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    };
  }
  if (score >= 2.6) {
    return {
      label: "Baik",
      color: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    };
  }
  if (score >= 1.8) {
    return {
      label: "Cukup",
      color: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    };
  }
  return {
    label: "Kurang",
    color: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  };
}

const PREDIKAT_OPTIONS = [
  "Memuaskan",
  "Sangat Baik",
  "Baik",
  "Cukup",
  "Kurang",
];

const DOMAIN_NAMES = [
  "Domain Kebijakan SPBE",
  "Domain Tata Kelola SPBE",
  "Domain Manajemen SPBE",
  "Domain Layanan SPBE",
];

export default function AdminSpbePage() {
  const router = useRouter();
  const { isSuperAdmin, currentAdmin } = useCurrentAdmin();

  // Automatic RBAC redirect for non-superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/admin?unauthorized=1");
    }
  }, [isSuperAdmin, router]);
  const {
    spbeData,
    latestSpbe,
    updateSpbeRecord,
    addSpbeRecord,
    deleteSpbeRecord,
    resetSpbeToDefault,
  } = useSpbeData();

  // Active Year Selection
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return spbeData[0]?.tahun || 2024;
  });

  // Keep selectedYear valid
  useEffect(() => {
    if (spbeData.length > 0 && !spbeData.some((d) => d.tahun === selectedYear)) {
      setSelectedYear(spbeData[0].tahun);
    }
  }, [spbeData, selectedYear]);

  // Current record being edited
  const currentRecord = useMemo(() => {
    return spbeData.find((d) => d.tahun === selectedYear) || spbeData[0] || DEFAULT_SPBE_DATA[0];
  }, [spbeData, selectedYear]);

  // Local Form State
  const [indeks, setIndeks] = useState<number>(currentRecord.indeks);
  const [predikat, setPredikat] = useState<string>(currentRecord.predikat);
  const [domainScores, setDomainScores] = useState<{ [key: string]: number }>(
    currentRecord.domainScores || {}
  );
  const [aspectScores, setAspectScores] = useState<number[]>([
    ...(currentRecord.aspectScores || [4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0]),
  ]);

  // Sync form state when active record changes
  useEffect(() => {
    if (currentRecord) {
      setIndeks(currentRecord.indeks);
      setPredikat(currentRecord.predikat);
      setDomainScores({ ...currentRecord.domainScores });
      setAspectScores([...currentRecord.aspectScores]);
    }
  }, [currentRecord]);

  // UI feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewYearModalOpen, setIsNewYearModalOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState<number>(new Date().getFullYear() + 1);
  const [cloneFromYear, setCloneFromYear] = useState<number>(currentRecord.tahun);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to calculate domain scores from aspects
  const handleAutoCalculateDomainsFromAspects = () => {
    const newDomains: { [key: string]: number } = {};
    SPBE_DOMAINS.forEach((dom) => {
      const scores = (dom.aspectIndices as readonly number[]).map(
        (idx) => aspectScores[idx] || 0
      );
      const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
      newDomains[dom.name] = parseFloat(avg.toFixed(2));
    });
    setDomainScores(newDomains);

    // Also auto-calculate composite index
    const domValues = Object.values(newDomains);
    const overallAvg = domValues.reduce((a, b) => a + b, 0) / (domValues.length || 1);
    const roundedIndex = parseFloat(overallAvg.toFixed(2));
    setIndeks(roundedIndex);
    setPredikat(getPredikatFromScore(roundedIndex).label);

    showToast("Domain & Indeks berhasil dihitung otomatis dari 8 aspek!");
  };

  // Helper to auto-calculate overall index from domains
  const handleAutoCalculateIndexFromDomains = () => {
    const domValues = Object.values(domainScores);
    if (domValues.length === 0) return;
    const avg = domValues.reduce((a, b) => a + b, 0) / domValues.length;
    const rounded = parseFloat(avg.toFixed(2));
    setIndeks(rounded);
    setPredikat(getPredikatFromScore(rounded).label);
    showToast(`Indeks Komposit dihitung: ${rounded} (${getPredikatFromScore(rounded).label})`);
  };

  // Save changes
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecord: SpbeAnnualRecord = {
      tahun: selectedYear,
      indeks: parseFloat(Number(indeks).toFixed(2)),
      predikat: predikat || getPredikatFromScore(indeks).label,
      domainScores: Object.fromEntries(
        Object.entries(domainScores).map(([k, v]) => [k, parseFloat(Number(v).toFixed(2))])
      ),
      aspectScores: aspectScores.map((v) => parseFloat(Number(v).toFixed(2))),
    };

    updateSpbeRecord(updatedRecord);
    showToast(`Nilai Evaluasi SPBE Tahun ${selectedYear} berhasil disimpan!`);
  };

  // Handle Add New Year
  const handleCreateNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || newYearInput < 2000 || newYearInput > 2100) {
      alert("Masukkan tahun evaluasi yang valid (contoh: 2025)");
      return;
    }
    if (spbeData.some((d) => d.tahun === newYearInput)) {
      alert(`Tahun evaluasi ${newYearInput} sudah ada dalam data!`);
      return;
    }

    const templateRecord = spbeData.find((d) => d.tahun === cloneFromYear) || currentRecord;
    const newRecord: SpbeAnnualRecord = {
      tahun: newYearInput,
      indeks: templateRecord.indeks,
      predikat: templateRecord.predikat,
      domainScores: { ...templateRecord.domainScores },
      aspectScores: [...templateRecord.aspectScores],
    };

    addSpbeRecord(newRecord);
    setSelectedYear(newYearInput);
    setIsNewYearModalOpen(false);
    showToast(`Tahun evaluasi ${newYearInput} berhasil ditambahkan!`);
  };

  // Handle Delete Year
  const handleDeleteActiveYear = () => {
    if (spbeData.length <= 1) {
      alert("Minimal harus ada 1 tahun evaluasi SPBE yang tersimpan.");
      return;
    }
    deleteSpbeRecord(selectedYear);
    setDeleteConfirmOpen(false);
    showToast(`Tahun evaluasi ${selectedYear} berhasil dihapus.`);
  };

  // Top Metric Highlights
  const highestDomain = useMemo(() => {
    if (!currentRecord?.domainScores) return { name: "-", score: 0 };
    let bestName = "-";
    let bestScore = -1;
    Object.entries(currentRecord.domainScores).forEach(([name, val]) => {
      if (val > bestScore) {
        bestScore = val;
        bestName = name;
      }
    });
    return { name: bestName.replace("Domain ", ""), score: bestScore };
  }, [currentRecord]);

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
          Akun Anda ({currentAdmin.role} - {currentAdmin.agency}) tidak memiliki izin untuk mengedit skor Evaluasi & Indeks SPBE Kabupaten Bekasi. Menu ini dikelola terpusat oleh Diskominfosantik.
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
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Evaluasi & Kematangan Digital
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              KemenPAN-RB
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            Evaluasi & Indeks SPBE Nasional
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Kelola capaian indeks komposit, predikat, nilai 4 domain, dan 8 aspek radar evaluasi SPBE Kabupaten Bekasi yang langsung tersinkronisasi ke portal publik.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-start xl:self-center">
          <Link
            href="/#spbe-history"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Lihat di Portal Publik</span>
          </Link>

          <button
            onClick={() => {
              if (confirm("Reset seluruh data evaluasi SPBE ke data default Kementerian?")) {
                resetSpbeToDefault();
                showToast("Data SPBE berhasil direset ke bawaan!");
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors whitespace-nowrap shadow-sm"
            title="Kembalikan data ke versi default"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Bawaan</span>
          </button>

          <button
            onClick={() => setIsNewYearModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Tambah Tahun Evaluasi</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Latest Index */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Indeks Terkini ({latestSpbe.tahun})
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {latestSpbe.indeks.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400">/ 5.00</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            <span className={clsx("px-2 py-0.5 rounded font-bold border text-[11px]", getPredikatFromScore(latestSpbe.indeks).badge)}>
              {latestSpbe.predikat}
            </span>
            <span className="text-slate-400">• KemenPAN-RB</span>
          </div>
        </div>

        {/* Card 2: Current Selected Year */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tahun Aktif Diedit
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {selectedYear}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Skor: {indeks.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Predikat: <b>{predikat}</b></span>
            {spbeData.length > 1 && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Total Recorded Years */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Riwayat Evaluasi
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {spbeData.length}
            </span>
            <span className="text-xs font-medium text-slate-500">Tahun Tersimpan</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Rentang {spbeData[spbeData.length - 1]?.tahun} — {spbeData[0]?.tahun}
          </div>
        </div>

        {/* Card 4: Highest Domain */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Domain Tertinggi ({selectedYear})
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {highestDomain.score.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400">/ 5.00</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
            {highestDomain.name}
          </div>
        </div>
      </div>

      {/* Year Selector Tabs */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Pilih Tahun:
          </span>
          {spbeData.map((record) => {
            const isSelected = record.tahun === selectedYear;
            return (
              <button
                key={record.tahun}
                onClick={() => setSelectedYear(record.tahun)}
                className={clsx(
                  "relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>Tahun {record.tahun}</span>
                <span
                  className={clsx(
                    "text-[10px] px-1.5 py-0.2 rounded font-semibold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {record.indeks.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsNewYearModalOpen(true)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tahun</span>
        </button>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* Section 1: Main Index & Predicate */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Indeks Komposit & Predikat SPBE ({selectedYear})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nilai utama yang tampil pada lingkaran besar nilai SPBE di beranda portal dan metrik dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoCalculateIndexFromDomains}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Hitung dari Rata-rata 4 Domain</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Input Nilai Indeks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Skor Indeks Komposit (0.00 - 5.00)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="any"
                  value={indeks}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === "" ? 0 : parseFloat(raw);
                    if (!isNaN(val)) {
                      setIndeks(Math.min(5, Math.max(0, val)));
                      setPredikat(getPredikatFromScore(val).label);
                    }
                  }}
                  required
                  className="w-full text-lg font-black tabular-nums px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  / 5.00
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Mengubah angka ini akan otomatis menyesuaikan visual lingkaran di beranda (mendukung desimal bebas seperti 3.84).
              </p>
            </div>

            {/* Input Predikat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Predikat KemenPAN-RB
              </label>
              <select
                value={predikat}
                onChange={(e) => setPredikat(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {PREDIKAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Kategori capaian resmi sesuai PermenPAN-RB No 59/2020.
              </p>
            </div>

            {/* Live Indicator Box */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Hasil Tampilan Publik
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {indeks.toFixed(2)}
                  </span>
                  <span className={clsx("text-xs font-bold", getPredikatFromScore(indeks).color)}>
                    ({predikat})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Domains Editor */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                4 Domain Evaluasi SPBE ({selectedYear})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mempengaruhi 4 kartu domain di bawah grafik lingkaran beranda utama.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoCalculateDomainsFromAspects}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sinkronkan Domain dari 8 Aspek di Bawah</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DOMAIN_NAMES.map((domainName, idx) => {
              const currentScore = domainScores[domainName] !== undefined ? domainScores[domainName] : 4.0;
              const pct = (currentScore / 5) * 100;
              const colors = [
                { bar: "bg-blue-600", text: "text-blue-600" },
                { bar: "bg-emerald-600", text: "text-emerald-600" },
                { bar: "bg-purple-600", text: "text-purple-600" },
                { bar: "bg-amber-600", text: "text-amber-600" },
              ][idx % 4];

              return (
                <div
                  key={domainName}
                  className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                        Domain {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {domainName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="any"
                        value={currentScore}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? 0 : parseFloat(raw);
                          if (!isNaN(val)) {
                            const clamped = Math.min(5, Math.max(0, val));
                            setDomainScores((prev) => ({
                              ...prev,
                              [domainName]: clamped,
                            }));
                          }
                        }}
                        className="w-20 text-right font-black tabular-nums text-sm px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">/ 5.00</span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.01"
                      value={currentScore}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDomainScores((prev) => ({
                          ...prev,
                          [domainName]: parseFloat(val.toFixed(2)),
                        }));
                      }}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>Capaian: {pct.toFixed(0)}%</span>
                      <span className={clsx("font-bold", colors.text)}>
                        {getPredikatFromScore(currentScore).label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: 8 Aspects Radar Editor */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                8 Aspek Evaluasi Radar SPBE ({selectedYear})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nilai masing-masing sudut pada diagram radar laba-laba 8 Aspek di seksi nilai SPBE.
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Skala Penilaian: <b>0.00</b> (Sangat Rendah) hingga <b>5.00</b> (Maksimum)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {SPBE_ASPECTS.map((aspectName, i) => {
              const val = aspectScores[i] !== undefined ? aspectScores[i] : 4.0;
              const pct = (val / 5) * 100;
              const pred = getPredikatFromScore(val);

              return (
                <div
                  key={aspectName}
                  className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between"
                >
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Aspek {i + 1}
                    </span>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug" title={aspectName}>
                      {aspectName}
                    </h5>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className={clsx("text-[11px] font-bold", pred.color)}>
                        {pred.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="any"
                          value={val}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const newScore = raw === "" ? 0 : parseFloat(raw);
                            if (!isNaN(newScore)) {
                              const clamped = Math.min(5, Math.max(0, newScore));
                              setAspectScores((prev) => {
                                const next = [...prev];
                                next[i] = clamped;
                                return next;
                              });
                            }
                          }}
                          className="w-16 text-right font-black tabular-nums text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">/5</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.01"
                      value={val}
                      onChange={(e) => {
                        const newScore = parseFloat(e.target.value);
                        setAspectScores((prev) => {
                          const next = [...prev];
                          next[i] = parseFloat(newScore.toFixed(2));
                          return next;
                        });
                      }}
                      className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-slate-700 rounded cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 z-20 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Semua perubahan akan langsung disimpan ke data store dan disinkronkan ke seluruh grafik portal.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (currentRecord) {
                  setIndeks(currentRecord.indeks);
                  setPredikat(currentRecord.predikat);
                  setDomainScores({ ...currentRecord.domainScores });
                  setAspectScores([...currentRecord.aspectScores]);
                  showToast("Perubahan form dibatalkan");
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Evaluasi Tahun {selectedYear}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal: Tambah Tahun Baru */}
      <AnimatePresence>
        {isNewYearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Tambah Tahun Evaluasi SPBE
                </h3>
                <button
                  onClick={() => setIsNewYearModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewYear} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tahun Evaluasi
                  </label>
                  <input
                    type="number"
                    min="2018"
                    max="2035"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(parseInt(e.target.value) || 2025)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Contoh: 2025"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Duplikasi Nilai Template Awal Dari
                  </label>
                  <select
                    value={cloneFromYear}
                    onChange={(e) => setCloneFromYear(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                  >
                    {spbeData.map((d) => (
                      <option key={d.tahun} value={d.tahun}>
                        Tahun {d.tahun} (Skor: {d.indeks.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nilai aspek dan domain tahun ini akan dijadikan titik awal untuk tahun baru.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewYearModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
                  >
                    Tambah Periode
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Konfirmasi Hapus Tahun */}
      <AnimatePresence>
        {deleteConfirmOpen && (
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
                Hapus Evaluasi SPBE {selectedYear}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Data capaian indeks, domain, dan aspek tahun {selectedYear} akan dihapus permanen dari riwayat portal publik.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteActiveYear}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  Ya, Hapus Tahun {selectedYear}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
