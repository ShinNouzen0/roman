"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  Users,
  Layers,
  ChevronDown,
} from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
  activeType: "Semua" | "Layanan Publik" | "Administrasi Pemerintahan";
  onSelectType: (type: "Semua" | "Layanan Publik" | "Administrasi Pemerintahan") => void;
  typeCounts?: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  activeType,
  onSelectType,
  typeCounts = {},
}: CategoryFilterProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide gradient arrows
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = scrollContainerRef.current?.querySelector(
      `[data-category="${selectedCategory}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedCategory]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 280;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Filter categories inside modal
  const modalCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isCategoryModalOpen || isTypeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCategoryModalOpen, isTypeModalOpen]);

  const serviceTypes = [
    {
      id: "Semua" as const,
      label: "Semua Layanan",
      description: "Seluruh aplikasi publik & administrasi digital",
      icon: Layers,
      color: "blue",
    },
    {
      id: "Layanan Publik" as const,
      label: "Layanan Publik",
      description: "Layanan untuk masyarakat umum & warga",
      icon: Users,
      color: "emerald",
    },
    {
      id: "Administrasi Pemerintahan" as const,
      label: "Administrasi Pemerintahan",
      description: "Layanan internal OPD & aparatur daerah",
      icon: Building2,
      color: "indigo",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-10 px-2 sm:px-4">
      {/* ========================================================================= */}
      {/* MOBILE ONLY: 2 POP-UP BUTTONS IN 1 ROW (DUA POP UP DALAM SATU TAMPILAN) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2 mb-3.5 md:hidden">
        {/* Pop-Up Button 1: Tipe Layanan */}
        <button
          onClick={() => setIsTypeModalOpen(true)}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 shadow-sm active:scale-[0.98] ${
            activeType !== "Semua"
              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-950 dark:text-blue-200 ring-1 ring-blue-400/40"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                activeType !== "Semua"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tipe Layanan
              </span>
              <span className="block text-xs font-bold truncate">
                {activeType}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* Pop-Up Button 2: Kategori Layanan */}
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 shadow-sm active:scale-[0.98] ${
            selectedCategory !== "Semua"
              ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400/40"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                selectedCategory !== "Semua"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Kategori
              </span>
              <span className="block text-xs font-bold truncate">
                {selectedCategory}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* HORIZONTAL BAR: PILLS SCROLL (Works on both Mobile & Desktop) */}
      {/* ========================================================================= */}
      <div className="relative flex items-center gap-2">
        {/* Desktop Filter Button (hidden on mobile since mobile has the 2 top buttons) */}
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className={`hidden md:flex flex-shrink-0 items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm ${
            selectedCategory !== "Semua"
              ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/25 ring-2 ring-blue-400/40"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-blue-300"
          }`}
          title="Buka semua kategori dalam pop-up"
        >
          <SlidersHorizontal className="w-4 h-4 text-current" />
          <span>Filter Kategori</span>
          {selectedCategory !== "Semua" && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* Desktop Separator Divider */}
        <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0" />

        {/* Desktop Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-36 z-10 p-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Scrollable Pills */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1.5 px-0.5 scroll-smooth w-full"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const count = categoryCounts[category];
            return (
              <button
                key={category}
                data-category={category}
                onClick={() => onSelectCategory(category)}
                className={`flex-shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                }`}
              >
                <span>{category}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-blue-700/80 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 z-10 p-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
            aria-label="Scroll ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POP-UP MODAL 1: TIPE LAYANAN (Bottom Sheet on Mobile, Modal on Desktop) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTypeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10"
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Pilih Tipe Layanan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter aplikasi berdasarkan peruntukan pengguna
                  </p>
                </div>
                <button
                  onClick={() => setIsTypeModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="p-4 sm:p-6 space-y-3">
                {serviceTypes.map((item) => {
                  const isSelected = activeType === item.id;
                  const Icon = item.icon;
                  const count = typeCounts[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectType(item.id);
                        setIsTypeModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm"
                          : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{item.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {count !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-medium text-slate-600 dark:text-slate-300">
                            {count}
                          </span>
                        )}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "border border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsTypeModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/25"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* POP-UP MODAL 2: KATEGORI LAYANAN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Mobile Drag Indicator */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Pilih Kategori Layanan
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter aplikasi berdasarkan bidang urusan ({categories.length - 1} kategori tersedia)
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Category Input */}
              <div className="p-4 sm:p-6 pb-2 border-b border-slate-50 dark:border-slate-800/60">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama kategori..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Grid */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
                {modalCategories.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">Tidak ada kategori yang cocok dengan &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modalCategories.map((category) => {
                      const isSelected = selectedCategory === category;
                      const count = categoryCounts[category];
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            onSelectCategory(category);
                            setIsCategoryModalOpen(false);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-500/70 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm"
                              : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "border border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-sm truncate">{category}</span>
                          </div>

                          {count !== undefined && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                                isSelected
                                  ? "bg-indigo-200/80 dark:bg-indigo-800/60 text-indigo-800 dark:text-indigo-200"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    onSelectCategory("Semua");
                    setIsCategoryModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Kategori
                </button>

                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
