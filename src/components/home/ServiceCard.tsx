"use client";

import { motion } from "framer-motion";
import { DigitalService } from "@/types";
import { Building2, Info, ExternalLink, Blocks } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface ServiceCardProps {
  service: DigitalService;
  onClick: (service: DigitalService) => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (
    <motion.div
      className="h-full group relative flex flex-col justify-between bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-6 overflow-hidden backdrop-blur-sm"
      whileHover={{
        y: -7,
        scale: 1.015,
        boxShadow: "0 24px 50px -12px rgba(59, 130, 246, 0.18)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {/* Animated gradient top accent — slides in from left on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-350 rounded-t-full" />

      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-5 relative z-10">
        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center border border-blue-100/80 dark:border-slate-600 shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-md group-hover:shadow-blue-400/20 transition-all duration-500">
          <Blocks className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300" />
        </div>
        <button
          onClick={() => onClick(service)}
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-blue-900/30 p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 hover:shadow-sm"
          title="Detail Informasi"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xs sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug sm:leading-normal">
          {service.name}
        </h3>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2.5 sm:mb-4 leading-relaxed">
          {service.description}
        </p>

        <div className="space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-6">
          <div className="flex items-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 shrink-0" />
            <span className="truncate">{service.agency}</span>
          </div>
          <div className="flex items-center scale-90 sm:scale-100 origin-left">
            <Badge status={service.status} />
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-blue-600 hover:text-white dark:bg-slate-700/50 dark:hover:bg-gradient-to-r dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:text-blue-400 dark:hover:text-white py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-500/20"
      >
        <span>Akses Layanan</span>
        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </a>
    </motion.div>
  );
}
