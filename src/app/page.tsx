"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Building2, Layers, ChevronLeft, ChevronRight, Activity, Clock } from "lucide-react";
import { getDigitalServices } from "@/services/api";
import { DigitalService } from "@/types";
import ServiceCard from "@/components/home/ServiceCard";
import ServiceModal from "@/components/home/ServiceModal";
import FaqSection from "@/components/home/FaqSection";
import SpbeHistory from "@/components/home/SpbeHistory";
import CategoryFilter from "@/components/home/CategoryFilter";
import CommandPalette from "@/components/home/CommandPalette";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import AnimatedNumber from "@/components/ui/AnimatedNumber";
export default function Home() {
  const [services, setServices] = useState<DigitalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for main search & category
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<"Semua" | "Layanan Publik" | "Administrasi Pemerintahan">("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  // State for OPD Section
  const [selectedOpd, setSelectedOpd] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<DigitalService | null>(null);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 400]);
  const yText = useTransform(scrollY, [0, 1000], [0, 200]);

  // Typewriter effect for KABUPATEN BEKASI
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    const fullText = "KABUPATEN BEKASI";
    let i = 0;
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayText(fullText.slice(0, i));
        if (i >= fullText.length) clearInterval(timer);
      }, 70);
      return () => clearInterval(timer);
    }, 900);
    return () => clearTimeout(delay);
  }, []);

  // Reset scroll to top on page load (always start at beranda)
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

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
        setError(null);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Gagal memuat data layanan. Periksa koneksi Anda dan coba lagi.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredByType = activeType === "Semua" ? services : services.filter(s => s.serviceType === activeType);
  const uniqueCategories = Array.from(new Set(filteredByType.map(s => s.category))).sort();
  const categories = ["Semua", ...uniqueCategories];
  const agencies = Array.from(new Set(filteredByType.map(s => s.agency))).sort();

  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === "Semua") {
      acc[cat] = filteredByType.length;
    } else {
      acc[cat] = filteredByType.filter(s => s.category === cat).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = {
    Semua: services.length,
    "Layanan Publik": services.filter(s => s.serviceType === "Layanan Publik").length,
    "Administrasi Pemerintahan": services.filter(s => s.serviceType === "Administrasi Pemerintahan").length,
  };

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
  const featuredNames = ["Banpin", "SAPA 129", "Bebunge", "Bebeli", "CSIRT", "SP4N Lapor", "Geoportal", "SPLP", "MAIL BEKASIKAB"];
  
  let opdServices = selectedOpd 
    ? filteredByType.filter(s => s.agency === selectedOpd)
    : filteredByType.filter(s => featuredNames.some(fn => s.name.toLowerCase().includes(fn.toLowerCase())));
    
  if (!selectedOpd && opdServices.length === 0) {
    opdServices = filteredByType.slice(0, 8); // fallback
  }

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
      <section id="beranda" className="relative pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 dark:from-[#0a0f1e] dark:via-slate-900 dark:to-[#0d1530] overflow-hidden">
        {/* Parallax Background Blobs */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-16 left-8 w-80 h-80 bg-blue-400/15 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 right-8 w-[420px] h-[420px] bg-indigo-400/15 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[700px] h-[360px] bg-blue-500/8 dark:bg-blue-500/18 rounded-full blur-[80px]" />
        </motion.div>
        
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.022] dark:opacity-[0.055] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        <motion.div 
          className="container mx-auto max-w-5xl text-center relative z-10"
          style={{ y: yText }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span variants={fadeInUp} className="inline-block px-5 py-2 mb-6 text-xs md:text-sm font-bold text-blue-700 bg-blue-100/80 rounded-full dark:bg-blue-900/60 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
            Selamat Datang di Portal Resmi
          </motion.span>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-3">
            <motion.span
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-block hover:scale-105 transition-transform duration-200 cursor-default"
            >
              Sistem
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="inline-block hover:scale-105 transition-transform duration-200 cursor-default"
            >
              Pemerintahan
            </motion.span>
            <br className="hidden md:block"/>
            <motion.span
              initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 relative"
            >
              Berbasis Elektronik
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-blue-600/0 via-blue-500 to-indigo-600/0"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.95, ease: "easeOut" }}
                style={{ transformOrigin: "center" }}
              />
            </motion.span>
          </motion.h1>

          {/* Thin separator between row 2 and row 3 */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent mx-auto mt-5"
            style={{ transformOrigin: "center" }}
          />

          {/* KABUPATEN BEKASI – same color family as row 1, typewriter effect */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 mb-6 flex items-center justify-center min-h-[3rem] md:min-h-[4rem]"
          >
            <span className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-[0.14em] md:tracking-[0.2em] text-slate-800 dark:text-white">
              {displayText}
            </span>
            {displayText.length < 16 && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.75, repeat: Infinity }}
                className="ml-1 text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-400 dark:text-slate-500"
              >
                |
              </motion.span>
            )}
          </motion.div>

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

      {/* Stats Section — Animated count-up + stagger cards */}
      <section className="py-14 bg-white dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/50 relative z-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto"
          >
            {([
              { label: "Aplikasi Aktif",    value: services.length,  suffix: "+", display: null, Icon: Activity,  topBg: "from-blue-500 to-blue-600",   iconBg: "bg-blue-100 dark:bg-blue-500/10",   iconColor: "text-blue-600 dark:text-blue-400"   },
              { label: "Perangkat Daerah", value: agencies.length,  suffix: "+", display: null, Icon: Building2, topBg: "from-indigo-500 to-indigo-600", iconBg: "bg-indigo-100 dark:bg-indigo-500/10", iconColor: "text-indigo-600 dark:text-indigo-400" },
              { label: "Kategori Layanan", value: 8,               suffix: "+", display: null, Icon: Layers,    topBg: "from-violet-500 to-violet-600", iconBg: "bg-violet-100 dark:bg-violet-500/10", iconColor: "text-violet-600 dark:text-violet-400" },
              { label: "Akses Transparan", value: 0,               suffix: "",  display: "24/7", Icon: Clock,   topBg: "from-sky-500 to-sky-600",     iconBg: "bg-sky-100 dark:bg-sky-500/10",     iconColor: "text-sky-600 dark:text-sky-400"     },
            ] as const).map((stat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="relative group p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient top accent that slides in on hover */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.topBg} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300`} />

                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 transition-all duration-300 ${stat.iconBg}`}>
                  <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>

                <div className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-1.5 tabular-nums">
                  {stat.display ?? <AnimatedNumber value={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
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

        {/* Tabs for Service Type (Desktop Only) */}
        <div className="hidden md:flex flex-wrap justify-center gap-4 mb-8">
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

        {/* Filter Categories (Horizontal Scrollable + Pop-up Modal) */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          activeType={activeType}
          onSelectType={setActiveType}
          typeCounts={typeCounts}
        />

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terjadi Kesalahan</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}

        {/* Loading State — Shimmer Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-[24px] border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-6 overflow-hidden">
                <div className="flex items-start justify-between mb-3 sm:mb-5">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-1 w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mb-5 w-1/2" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-20 mb-1" />
                <div className="mt-4 h-9 sm:h-11 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              </div>
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
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
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

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                  {opdServices.length > 0 ? (
                    opdServices.map((service) => (
                      <ServiceCard
                        key={`opd-${service.id}`}
                        service={service}
                        onClick={(s) => setSelectedService(s)}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-16 text-center"
                    >
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada layanan digital untuk instansi ini.</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Layanan akan ditambahkan saat tersedia.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record SPBE */}
      <SpbeHistory />

      {/* FAQ Section */}
      <FaqSection />

      {/* Command Palette for Quick Search */}
      <CommandPalette 
        services={services} 
        onSelectService={(s) => setSelectedService(s)} 
      />

      {/* Modal Detail */}
      <ServiceModal 
        service={selectedService} 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
      />
    </div>
  );
}
