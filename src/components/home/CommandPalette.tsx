"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, ArrowRight } from "lucide-react";
import { DigitalService } from "@/types";

interface CommandPaletteProps {
  services: DigitalService[];
  onSelectService: (service: DigitalService) => void;
}

export default function CommandPalette({ services, onSelectService }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filteredServices = services
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.agency.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5); // Limit results for performance

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-24 z-40 bg-blue-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2 group"
      >
        <Command className="w-5 h-5" />
        <span className="text-sm font-semibold hidden group-hover:inline-block pr-1 transition-all">Pencarian Cepat</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari layanan atau instansi..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-lg"
                />
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded text-xs font-semibold">ESC</kbd>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {query.length > 0 && filteredServices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Tidak ada layanan yang ditemukan untuk &quot;{query}&quot;
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          onSelectService(service);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {service.agency}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
                
                {query.length === 0 && (
                  <div className="px-6 py-8 text-center text-slate-500 text-sm">
                    Ketik untuk mencari berbagai layanan dan aplikasi portal.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
