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
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-64"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-blue-600" />
                Aksesibilitas
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Ukuran Teks
                </p>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-1">
                  <button
                    onClick={handleDecrease}
                    disabled={fontSizeMultiplier <= 0.9}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                    title="Perkecil Teks"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <Type className="w-5 h-5 text-slate-800 dark:text-white mb-1" />
                    <span className="text-[10px] font-bold text-slate-500">
                      {Math.round(fontSizeMultiplier * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={handleIncrease}
                    disabled={fontSizeMultiplier >= 1.3}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                    title="Perbesar Teks"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Pengaturan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all"
        title="Menu Aksesibilitas"
      >
        <Accessibility className="w-6 h-6" />
      </button>
    </div>
  );
}
