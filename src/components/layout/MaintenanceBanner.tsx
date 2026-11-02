"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, Mail, X, ShieldAlert } from "lucide-react";
import { useSettings } from "@/services/serviceStore";

export default function MaintenanceBanner() {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.maintenanceMode || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white shadow-lg border-b border-amber-400/40"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide flex items-center gap-2 justify-center md:justify-start">
                  <span>Mode Pemeliharaan Sistem SPBE Aktif</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping hidden sm:inline-block" />
                </p>
                <p className="text-[11px] sm:text-xs text-amber-50 mt-0.5 leading-snug">
                  Portal publik dan beberapa layanan digital Kabupaten Bekasi sedang dalam pemeliharaan berkala untuk peningkatan kapasitas dan sinkronisasi data.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 text-xs">
              {settings.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{settings.contactPhone}</span>
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{settings.contactEmail}</span>
                </a>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Tutup banner pemberitahuan ini"
                aria-label="Tutup Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
