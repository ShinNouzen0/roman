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
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  // State for OPD Section
  const [selectedOpd, setSelectedOpd] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<DigitalService | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, activeType]);

  // Reset category when type changes
  useEffect(() => {
    setSelectedCategory("Semua");
  }, [activeType]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDigitalServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredByType = activeType === "Semua" ? services : services.filter(s => s.serviceType === activeType);
  const categories = ["Semua", ...Array.from(new Set(filteredByType.map(s => s.category)))].sort();
  const agencies = Array.from(new Set(filteredByType.map(s => s.agency))).sort();

  // Filter for Main Services Section
  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      service.name.toLowerCase().includes(query) || 
      service.description.toLowerCase().includes(query) ||
      service.agency.toLowerCase().includes(query);
    const matchesType = activeType === "Semua" || service.serviceType === activeType;
    const matchesCategory = selectedCategory === "Semua" || service.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Chunking logic for slider of grids (8 items per slide)
  const chunkArray = (arr: DigitalService[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };
  const serviceChunks = chunkArray(filteredServices, 8);

  // Filter for OPD Section
  const opdServices = selectedOpd 
    ? filteredByType.filter(s => s.agency === selectedOpd)
    : filteredByType.slice(0, 8); // Just show top 8 if no OPD is selected

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="beranda" className="relative pt-32 pb-20 px-4 flex items-center justify-center min-h-[75vh] bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <motion.div 
          className="container mx-auto max-w-5xl text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span variants={fadeInUp} className="inline-block px-5 py-2 mb-6 text-xs md:text-sm font-bold text-blue-700 bg-blue-100/80 rounded-full dark:bg-blue-900/60 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
            Selamat Datang di Portal Resmi
          </motion.span>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Sistem Pemerintahan <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Berbasis Elektronik
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Akses seluruh layanan digital, aplikasi publik, dan sistem administrasi Kabupaten Bekasi dalam satu platform yang terintegrasi, transparan, dan responsif.
          </motion.p>

          {/* Search Box */}
          <motion.div variants={fadeInUp} className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan, aplikasi, atau perangkat daerah..."
              className="w-full pl-16 pr-6 py-5 rounded-full bg-white dark:bg-slate-800/80 backdrop-blur-md shadow-2xl shadow-blue-900/5 dark:shadow-none border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-base md:text-lg text-slate-900 dark:text-white transition-all placeholder:text-slate-400 hover:shadow-blue-900/10"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section with Hover Effects */}
      <section className="py-16 bg-white dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/50 relative z-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center max-w-6xl mx-auto"
          >
            {[
              { label: "Aplikasi Aktif", value: `${services.length}+` },
              { label: "Perangkat Daerah", value: `${agencies.length}+` },
              { label: "Kategori Layanan", value: "8+" },
              { label: "Akses Transparan", value: "24/7" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-300 group">
                <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300 origin-bottom">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Services Section */}
      <section id="layanan" className="py-24 px-4 container mx-auto scroll-mt-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Katalog Layanan Digital</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Temukan layanan publik dan administrasi berdasarkan kategori yang Anda butuhkan.
          </p>
        </motion.div>

        {/* Tabs for Service Type */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(["Semua", "Layanan Publik", "Administrasi Pemerintahan"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all shadow-sm ${
                activeType === type
                  ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:scale-105 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filter Categories (Tags) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800/80 rounded-2xl h-[280px] border border-slate-200 dark:border-slate-800"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Tidak Ada Layanan Ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Maaf, kami tidak dapat menemukan layanan dengan kata kunci &quot;<span className="font-semibold">{searchQuery}</span>&quot;.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("Semua"); }}
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
                  <div key={service.id} className="h-full">
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
                    const count = filteredByType.filter(s => s.agency === agency).length;
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
