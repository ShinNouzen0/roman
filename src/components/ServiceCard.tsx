import { DigitalService } from "@/types";
import { Building2, Info, ExternalLink, Blocks } from "lucide-react";
import Badge from "./Badge";

interface ServiceCardProps {
  service: DigitalService;
  onClick: (service: DigitalService) => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-800/80 rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 p-6 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden backdrop-blur-sm">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

      {/* Header section */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <Blocks className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <button 
          onClick={() => onClick(service)}
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors"
          title="Detail Informasi"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Content section */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {service.description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span className="truncate">{service.agency}</span>
          </div>
          <div className="flex items-center">
             <Badge status={service.status} />
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <a 
        href={service.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-blue-600 hover:text-white dark:bg-slate-700/50 dark:hover:bg-gradient-to-r dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:text-blue-400 dark:hover:text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span>Akses Layanan</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
      </a>
    </div>
  );
}
