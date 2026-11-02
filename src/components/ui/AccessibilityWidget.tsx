"use client";

import { useState, useEffect } from "react";
import { Accessibility, Type, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedSize = localStorage.getItem("spbe-font-size");
    if (savedSize) {
      const size = parseFloat(savedSize);
      setFontSizeMultiplier(size);
      applyFontSize(size);
    }
  }, []);

  const applyFontSize = (multiplier: number) => {
    // Normal browser font size is usually 16px (100%)
    // By changing the root font size, all REM-based tailwind classes scale automatically!
    document.documentElement.style.fontSize = `${multiplier * 100}%`;
  };

  const handleIncrease = () => {
    const newSize = Math.min(fontSizeMultiplier + 0.1, 1.3); // Max 130%
    setFontSizeMultiplier(newSize);
    applyFontSize(newSize);
    localStorage.setItem("spbe-font-size", newSize.toString());
  };

  const handleDecrease = () => {
    const newSize = Math.max(fontSizeMultiplier - 0.1, 0.9); // Min 90%
    setFontSizeMultiplier(newSize);
    applyFontSize(newSize);
    localStorage.setItem("spbe-font-size", newSize.toString());
  };

  const handleReset = () => {
    setFontSizeMultiplier(1);
    document.documentElement.style.removeProperty("font-size");
    localStorage.removeItem("spbe-font-size");
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="absolute bottom-14 left-0 sm:bottom-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 w-60 sm:w-64 max-w-[calc(100vw-2rem)]"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700/80 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                <Accessibility className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Aksesibilitas
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60"
                aria-label="Tutup Menu Aksesibilitas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Ukuran Teks
                </p>
                <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={handleDecrease}
                    disabled={fontSizeMultiplier <= 0.9}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-xs disabled:opacity-40 transition-all active:scale-95"
                    title="Perkecil Teks"
                    aria-label="Perkecil Teks"
                  >
                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <Type className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-white mb-0.5" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {Math.round(fontSizeMultiplier * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={handleIncrease}
                    disabled={fontSizeMultiplier >= 1.3}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-xs disabled:opacity-40 transition-all active:scale-95"
                    title="Perbesar Teks"
                    aria-label="Perbesar Teks"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition-all active:scale-98 border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Pengaturan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 ring-2 ring-white/40 dark:ring-slate-800/60"
        title="Menu Aksesibilitas"
        aria-label="Buka Menu Aksesibilitas"
      >
        <Accessibility className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
    </div>
  );
}
