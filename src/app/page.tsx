"use client";

import { useState, useEffect } from "react";
import { Search, ArrowRight, Building2, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { getDigitalServices } from "@/services/api";
import { DigitalService } from "@/types";
import ServiceCard from "@/components/ServiceCard";
import ServiceModal from "@/components/ServiceModal";
import FaqSection from "@/components/FaqSection";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [services, setServices] = useState<DigitalService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for main search & category
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<"Semua" | "Layanan Publik" | "Administrasi Pemerintahan">("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua"); }}
              className="mt-6 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 px-6 py-2.5 rounded-full font-semibold hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
            >
              Reset Pencarian
            </button>
          </motion.div>
        )}

        {/* Paginated Grid Services */}
        {!loading && filteredServices.length > 0 && (
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {serviceChunks[currentPage - 1]?.map((service) => (
                  <div key={service.id}>
                    <ServiceCard 
                      service={service} 
                      onClick={(s) => setSelectedService(s)} 
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            {serviceChunks.length > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-14">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-40 disabled:hover:shadow-sm disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Sebelumnya
                </button>
                
                <div className="flex items-center gap-2">
                  {serviceChunks.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        currentPage === idx + 1 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(serviceChunks.length, p + 1))}
                  disabled={currentPage === serviceChunks.length}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-40 disabled:hover:shadow-sm disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all group"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Perangkat Daerah Section (Now SPA) */}
      <section id="perangkat-daerah" className="py-24 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 scroll-mt-16 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-12"
          >
            <div>
              <div className="inline-flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-2xl mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <img 
                  src="/logos/logo-pemda.png" 
                  alt="Logo Pemda Kabupaten Bekasi" 
                  className="w-12 h-12 md:w-14 md:h-14 object-contain"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Layanan Perangkat Daerah</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Jelajahi inovasi digital dan aplikasi spesifik dari setiap Organisasi Perangkat Daerah (OPD) di Kabupaten Bekasi.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Sidebar / Tabs for OPD */}
            <div className="w-full xl:w-80 shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden xl:sticky xl:top-24">
                <div className="p-5 bg-slate-50/50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold text-slate-900 dark:text-white">Daftar Instansi (OPD)</h3>
                </div>
                {/* Horizontal scroll on mobile, vertical on desktop */}
                <div className="flex xl:flex-col overflow-x-auto xl:overflow-y-auto max-h-[60vh] hide-scrollbar p-2">
                  <button
                    onClick={() => setSelectedOpd(null)}
                    className={`flex-shrink-0 xl:w-full text-left px-5 py-3.5 m-1 rounded-xl text-sm font-semibold transition-all ${
                      selectedOpd === null 
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    Sorotan Utama
                  </button>
                  {agencies.map(agency => {
                    const count = services.filter(s => s.agency === agency).length;
                    return (
                      <button
                        key={agency}
                        onClick={() => setSelectedOpd(agency)}
                        className={`flex-shrink-0 xl:w-full text-left px-5 py-3.5 m-1 rounded-xl text-sm font-medium transition-all flex justify-between items-center gap-4 ${
                          selectedOpd === agency 
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <span className="truncate">{agency}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                           selectedOpd === agency ? "bg-indigo-200/50 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* OPD Services Grid */}
            <div className="flex-1 min-w-0">
              <motion.div 
                key={selectedOpd || "all"} // Force re-render animation when OPD changes
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white truncate pr-4">
                    {selectedOpd ? selectedOpd : "Layanan Unggulan Daerah"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {opdServices.map((service) => (
                    <ServiceCard 
                      key={`opd-${service.id}`} 
                      service={service} 
                      onClick={(s) => setSelectedService(s)} 
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Section */}
      <section id="tentang" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Mewujudkan Smart City Bekasi</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Sistem Pemerintahan Berbasis Elektronik (SPBE) Kabupaten Bekasi dirancang untuk mengintegrasikan seluruh proses administrasi dan pelayanan publik ke dalam satu ekosistem digital.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
              Dengan pemanfaatan teknologi informasi dan komunikasi, kami bertujuan menghadirkan tata kelola pemerintahan yang bersih, efektif, transparan, serta memberikan pelayanan yang cepat dan terpercaya kepada seluruh lapisan masyarakat.
            </p>
            <a href="#layanan" className="inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white py-4 px-10 rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-slate-900/20 dark:shadow-white/10">
              Eksplorasi Layanan
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* Modal Detail */}
      <ServiceModal 
        service={selectedService} 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
      />
    </div>
  );
}
