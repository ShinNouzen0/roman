"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Search, 
  Layers, 
  UserCircle, 
  FileText, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle
} from "lucide-react";
import clsx from "clsx";

const faqCategories = [
  { id: "semua", label: "Semua", icon: Layers },
  { id: "akun", label: "Akun & Akses", icon: UserCircle },
  { id: "layanan", label: "Layanan", icon: FileText },
  { id: "pengaduan", label: "Pengaduan", icon: MessageSquare },
  { id: "teknis", label: "Teknis", icon: Settings },
  { id: "lainnya", label: "Lainnya", icon: HelpCircle },
];

const faqs = [
  {
    category: "akun",
    question: "Apa itu Portal SPBE Kabupaten Bekasi?",
    answer: "Portal SPBE (Sistem Pemerintahan Berbasis Elektronik) adalah gerbang utama yang mengintegrasikan seluruh aplikasi dan layanan digital dari berbagai instansi (OPD) di lingkup Pemerintah Kabupaten Bekasi. Warga dapat menemukan semua layanan dari satu tempat terpusat."
  },
  {
    category: "akun",
    question: "Apakah saya harus membuat akun untuk menggunakan layanan?",
    answer: "Untuk mengakses informasi dasar, Anda tidak perlu membuat akun. Namun, untuk mengajukan permohonan spesifik atau menggunakan layanan administrasi (seperti Banpin, Pajak Daerah, dll), Anda mungkin diarahkan untuk masuk atau mendaftar di masing-masing aplikasi tersebut."
  },
  {
    category: "pengaduan",
    question: "Aplikasi apa yang harus saya gunakan untuk pengaduan?",
    answer: "Untuk pengaduan, Anda dapat menggunakan aplikasi Bebunge (Bekasi Nyambung Bae) atau SP4N Lapor yang tersedia di portal ini. Layanan tersebut memfasilitasi komunikasi dua arah antara masyarakat dan pemerintah daerah."
  },
  {
    category: "teknis",
    question: "Bagaimana jika link layanan tidak bisa diakses atau error?",
    answer: "Jika Anda menemukan link layanan yang rusak, sedang dalam perbaikan, atau mengalami kendala teknis, Anda dapat melaporkannya melalui kanal pengaduan resmi atau langsung menghubungi tim Diskominfosantik Kabupaten Bekasi."
  },
  {
    category: "layanan",
    question: "Ke mana saya bisa menghubungi jika masih mengalami kendala?",
    answer: "Anda dapat menghubungi Call Center 112 (bebas pulsa) atau mengirim email ke helpdesk@bekasikab.go.id. Layanan helpdesk tersedia pada hari kerja Senin-Jumat pukul 08.00-16.00 WIB."
  },
  {
    category: "layanan",
    question: "Apakah layanan di portal ini dipungut biaya?",
    answer: "Sebagian besar layanan administrasi dan publik yang disediakan oleh Pemerintah Kabupaten Bekasi bersifat gratis. Jika ada layanan yang memerlukan biaya (seperti retribusi atau pajak), hal itu akan dijelaskan secara transparan di dalam sistem layanan terkait."
  },
  {
    category: "teknis",
    question: "Bagaimana cara mengakses layanan digital dari perangkat seluler?",
    answer: "Seluruh layanan di portal SPBE dapat diakses melalui browser di perangkat seluler (smartphone/tablet). Beberapa layanan juga menyediakan aplikasi mobile yang dapat diunduh melalui Google Play Store atau Apple App Store."
  },
  {
    category: "lainnya",
    question: "Apakah data pribadi saya aman di portal ini?",
    answer: "Pemerintah Kabupaten Bekasi berkomitmen menjaga keamanan data pribadi pengguna sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP). Setiap layanan menerapkan enkripsi dan standar keamanan yang berlaku."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "semua" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 scroll-mt-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          <a href="#beranda" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Beranda</a>
          <span className="mx-2">›</span>
          <span className="text-slate-700 dark:text-slate-300">Bantuan & FAQ</span>
        </div>

        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Pusat Bantuan & <span className="text-blue-600 dark:text-blue-400">FAQ</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Temukan jawaban atas pertanyaan yang paling sering diajukan seputar layanan SPBE Kabupaten Bekasi.
              </p>
            </div>
            
            {/* Decorative Chat Bubbles */}
            <div className="hidden md:flex items-center justify-center relative w-36 h-28 shrink-0">
              <div className="absolute top-0 right-4 w-20 h-14 bg-blue-600 rounded-2xl rounded-br-sm flex items-center justify-center shadow-lg shadow-blue-600/20">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="absolute bottom-0 left-4 w-22 h-12 bg-blue-500 rounded-2xl rounded-bl-sm flex items-center justify-center shadow-lg shadow-blue-500/20 px-4">
                <span className="text-white text-xl font-bold">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="pl-5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
              placeholder='Cari pertanyaan, misalnya "buat akun", "login", "pengaduan"...'
              className="flex-1 px-4 py-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm md:text-base"
            />
            <button className="m-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shrink-0">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {faqCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setOpenIndex(null); }}
                className={clsx(
                  "flex flex-col items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold transition-all shrink-0 min-w-[80px]",
                  selectedCategory === cat.id
                    ? "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"
                )}
              >
                <Icon className="w-5 h-5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Section Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Pertanyaan yang Sering Diajukan
          </h3>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 mb-14">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className={clsx(
                  "bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200",
                  openIndex === index 
                    ? "border-blue-300 dark:border-blue-500/40 shadow-sm" 
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={clsx(
                      "w-5 h-5 transition-transform duration-300 shrink-0",
                      openIndex === index 
                        ? "rotate-180 text-blue-600 dark:text-blue-400" 
                        : "text-slate-400"
                    )}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada pertanyaan ditemukan</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Coba ubah kata kunci atau kategori pencarian Anda.</p>
            </div>
          )}
        </div>

        {/* Contact Card */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Butuh bantuan lebih lanjut?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Tim kami siap membantu Anda.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a 
              href="https://api.whatsapp.com/send/?phone=6281313131967&text=Helpdesk+TIK&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Hubungi Kami</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">via WhatsApp</div>
              </div>
            </a>
            
            <a 
              href="mailto:spbe@bekasikab.go.id"
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Kirim Email</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">spbe@bekasikab.go.id</div>
              </div>
            </a>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Jam Operasional</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">08.00 - 16.00 WIB</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
