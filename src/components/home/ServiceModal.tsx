import { DigitalService } from "@/types";
import { X, ExternalLink, Building2, User, Folder, Calendar, Phone, Mail, Globe } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceModalProps {
  service: DigitalService | null;
  isOpen: boolean;
  onClose: () => void;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  color?: "blue" | "indigo" | "violet" | "sky" | "slate";
}) => {
  const colorMap = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-500/10",   icon: "text-blue-600 dark:text-blue-400"   },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", icon: "text-indigo-600 dark:text-indigo-400" },
    violet: { bg: "bg-violet-50 dark:bg-violet-500/10", icon: "text-violet-600 dark:text-violet-400" },
    sky:    { bg: "bg-sky-50 dark:bg-sky-500/10",     icon: "text-sky-600 dark:text-sky-400"     },
    slate:  { bg: "bg-slate-100 dark:bg-slate-700/50", icon: "text-slate-500 dark:text-slate-400" },
  };
  const c = colorMap[color];
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-xl ${c.bg} shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{value || "-"}</div>
      </div>
    </div>
  );
};

export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!service) return null;

  const hasUrl = service.url && service.url !== "#" && service.url !== "-";
  const hasEmail = service.contactEmail && service.contactEmail !== "Tidak ditemukan";
  const hasPhone = service.contactPhone && service.contactPhone !== "Tidak ditemukan";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            className="relative bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/40 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Gradient accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            {/* Header */}
            <div className="px-6 pt-7 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <Badge status={service.status} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {service.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{service.agency}</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Description */}
              <div className="px-6 py-5">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-slate-100 dark:border-slate-800" />

              {/* Info Grid */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Folder}    label="Kategori"          value={service.category}   color="blue"   />
                <InfoRow icon={Building2} label="Perangkat Daerah"  value={service.agency}     color="indigo" />
                <InfoRow icon={User}      label="Pengelola"         value={service.manager}    color="violet" />
                <InfoRow icon={Calendar}  label="Pembaruan Terakhir" value={service.lastUpdated || "01 Jan 2024"} color="sky" />
                {hasEmail && (
                  <InfoRow icon={Mail}   label="Email Bantuan"     value={service.contactEmail!} color="slate" />
                )}
                {hasPhone && (
                  <InfoRow icon={Phone}  label="No. Telepon / WA"  value={service.contactPhone!} color="slate" />
                )}
              </div>

              {/* URL Preview Strip */}
              {hasUrl && (
                <div className="mx-6 mb-5 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{service.url}</span>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {hasUrl ? (
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Buka Aplikasi</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3 px-4 rounded-xl font-semibold cursor-not-allowed">
                  <span>Tautan Tidak Tersedia</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
