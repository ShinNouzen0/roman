import { DigitalService } from "@/types";
import { X, ExternalLink, Building2, User, Folder, Calendar, Phone, Mail } from "lucide-react";
import Badge from "./Badge";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceModalProps {
  service: DigitalService | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {service.name}
                </h2>
                <Badge status={service.status} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Deskripsi</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Folder className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Kategori</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.category}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Perangkat Daerah</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.agency}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Pengelola</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.manager || "-"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Pembaruan Terakhir</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.lastUpdated || "01 Jan 2024"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Email Bantuan</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.contactEmail || "helpdesk@bekasikab.go.id"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">No. Telepon / WA</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{service.contactPhone || "+62 813-1313-1967"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <a 
                href={service.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors shadow-sm"
              >
                <span>Buka Aplikasi</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
