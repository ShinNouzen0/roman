export interface OpdItem {
  id: string;
  name: string;
  shortName: string;
  category: "Dinas" | "Badan" | "RSUD" | "Sekretariat" | "Kecamatan";
  headOfAgency?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  status: "active" | "maintenance" | "inactive";
  lastAudit?: string;
}

export interface FaqItem {
  id: string;
  category: "akun" | "layanan" | "pengaduan" | "teknis" | "lainnya" | string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettings {
  portalName: string;
  portalDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  supabaseConnected: boolean;
  supabaseUrl: string;
  autoSyncInterval: number;
  themeDefault: "system" | "light" | "dark";
}


// 22 OPD Items
export const DEFAULT_OPD_LIST: OpdItem[] = [
  {
    id: "opd-1",
    name: "Dinas Komunikasi, Informatika, Persandian dan Statistik",
    shortName: "Diskominfosantik",
    category: "Dinas",
    headOfAgency: "Drs. H. Yan Yan Akhmad Kurnia, M.Si",
    address: "Kompleks Perkantoran Pemkab Bekasi, Cikarang Pusat",
    email: "diskominfosantik@bekasikab.go.id",
    phone: "021-89970123",
    website: "https://diskominfosantik.bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
  {
    id: "opd-2",
    name: "Badan Pendapatan Daerah",
    shortName: "Bapenda",
    category: "Badan",
    headOfAgency: "Dra. Hj. Ani Gustini, M.M",
    address: "Jl. Sukamahi No. 1, Cikarang Pusat",
    email: "bapenda@bekasikab.go.id",
    phone: "021-89970456",
    website: "https://bapenda.bekasikab.go.id",
    status: "active",
    lastAudit: "1 jam lalu",
  },
  {
    id: "opd-3",
    name: "Dinas Kependudukan dan Pencatatan Sipil",
    shortName: "Disdukcapil",
    category: "Dinas",
    headOfAgency: "Carwinda, M.Si",
    address: "Kompleks Perkantoran Pemda Deltamas, Cikarang Pusat",
    email: "disdukcapil@bekasikab.go.id",
    phone: "021-89970789",
    website: "https://disdukcapil.bekasikab.go.id",
    status: "active",
    lastAudit: "Kemarin",
  },
  {
    id: "opd-4",
    name: "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
    shortName: "DPMPTSP",
    category: "Dinas",
    headOfAgency: "Drs. H. Zaki Zakaria",
    address: "Gedung Mall Pelayanan Publik (MPP) Lotte Grosir Cikarang",
    email: "dpmptsp@bekasikab.go.id",
    phone: "021-89970999",
    website: "https://dpmptsp.bekasikab.go.id",
    status: "active",
    lastAudit: "2 hari lalu",
  },
  {
    id: "opd-5",
    name: "Dinas Kesehatan",
    shortName: "Dinkes",
    category: "Dinas",
    headOfAgency: "dr. H. Alamsyah, M.Kes",
    address: "Jl. Ki Hajar Dewantara No. 1, Cikarang Utara",
    email: "dinkes@bekasikab.go.id",
    phone: "021-8901234",
    website: "https://dinkes.bekasikab.go.id",
    status: "active",
    lastAudit: "3 hari lalu",
  },
  {
    id: "opd-6",
    name: "RSUD Kabupaten Bekasi (Cibitung)",
    shortName: "RSUD Cibitung",
    category: "RSUD",
    headOfAgency: "dr. Arief Kurnia, MARS",
    address: "Jl. Raya Teuku Umar No. 200, Cibitung",
    email: "rsud@bekasikab.go.id",
    phone: "021-8832678",
    website: "https://rsud.bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
  {
    id: "opd-7",
    name: "Dinas Pendidikan",
    shortName: "Disdik",
    category: "Dinas",
    headOfAgency: "Imam Faturochman, ST, M.Si",
    address: "Kompleks Pemkab Bekasi Blok C, Cikarang Pusat",
    email: "disdik@bekasikab.go.id",
    phone: "021-89970333",
    website: "https://disdik.bekasikab.go.id",
    status: "active",
    lastAudit: "Minggu ini",
  },
  {
    id: "opd-8",
    name: "Badan Kepegawaian dan Pengembangan SDM",
    shortName: "BKPSDM",
    category: "Badan",
    headOfAgency: "Endin Samsudin, S.H, M.Si",
    address: "Gedung Bupati Lt. 2, Cikarang Pusat",
    email: "bkpsdm@bekasikab.go.id",
    phone: "021-89970111",
    website: "https://bkpsdm.bekasikab.go.id",
    status: "active",
    lastAudit: "Kemarin",
  },
  {
    id: "opd-9",
    name: "Dinas Sosial",
    shortName: "Dinsos",
    category: "Dinas",
    headOfAgency: "Drs. Hasan Basri",
    address: "Jl. Sukamahi No. 4, Cikarang Pusat",
    email: "dinsos@bekasikab.go.id",
    phone: "021-89970888",
    website: "https://dinsos.bekasikab.go.id",
    status: "active",
    lastAudit: "4 hari lalu",
  },
  {
    id: "opd-10",
    name: "Inspektorat Daerah",
    shortName: "Inspektorat",
    category: "Badan",
    headOfAgency: "Drs. MA. Supratman, M.Si",
    address: "Gedung Inspektorat, Cikarang Pusat",
    email: "inspektorat@bekasikab.go.id",
    phone: "021-89970222",
    website: "https://inspektorat.bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
  {
    id: "opd-11",
    name: "Dinas Ketahanan Pangan",
    shortName: "DKP",
    category: "Dinas",
    headOfAgency: "Ir. H. Abdur Rofiq, M.Si",
    address: "Kompleks Pemkab Bekasi Blok B, Cikarang Pusat",
    email: "dkp@bekasikab.go.id",
    phone: "021-89970555",
    website: "https://dkp.bekasikab.go.id",
    status: "active",
    lastAudit: "Kemarin",
  },
  {
    id: "opd-12",
    name: "Dinas Pemberdayaan Perempuan dan Perlindungan Anak",
    shortName: "DP3A",
    category: "Dinas",
    headOfAgency: "Dra. Ani Suryani, M.Si",
    address: "Kompleks Pemkab Bekasi, Cikarang Pusat",
    email: "dp3a@bekasikab.go.id",
    phone: "021-89970666",
    website: "https://dp3a.bekasikab.go.id",
    status: "active",
    lastAudit: "3 hari lalu",
  },
  {
    id: "opd-13",
    name: "Badan Penanggulangan Bencana Daerah",
    shortName: "BPBD",
    category: "Badan",
    headOfAgency: "Muchlis, S.Sos",
    address: "Jl. Industri No. 1, Cikarang Utara",
    email: "bpbd@bekasikab.go.id",
    phone: "021-8901199",
    website: "https://bpbd.bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
  {
    id: "opd-14",
    name: "Dinas Tenaga Kerja",
    shortName: "Disnaker",
    category: "Dinas",
    headOfAgency: "Drs. Edi Rochyadi, M.M",
    address: "Kompleks Perkantoran Pemkab Bekasi, Cikarang Pusat",
    email: "disnaker@bekasikab.go.id",
    phone: "021-89970777",
    website: "https://disnaker.bekasikab.go.id",
    status: "active",
    lastAudit: "2 hari lalu",
  },
  {
    id: "opd-15",
    name: "Dinas Koperasi dan Usaha Kecil Menengah",
    shortName: "Dinkop UKM",
    category: "Dinas",
    headOfAgency: "Dra. Hj. Iyan Priatna, M.Si",
    address: "Kompleks Pemkab Bekasi, Cikarang Pusat",
    email: "dinkopukm@bekasikab.go.id",
    phone: "021-89970889",
    website: "https://dinkopukm.bekasikab.go.id",
    status: "active",
    lastAudit: "1 minggu lalu",
  },
  {
    id: "opd-16",
    name: "Dinas Arsip dan Perpustakaan",
    shortName: "Disarpus",
    category: "Dinas",
    headOfAgency: "H. Dwi Sigit Andrian, S.E",
    address: "Jl. Ki Hajar Dewantara, Cikarang Utara",
    email: "disarpus@bekasikab.go.id",
    phone: "021-8902234",
    website: "https://disarpus.bekasikab.go.id",
    status: "active",
    lastAudit: "5 hari lalu",
  },
  {
    id: "opd-17",
    name: "Dinas Kebudayaan, Pemuda, dan Olahraga",
    shortName: "Disbudpora",
    category: "Dinas",
    headOfAgency: "Iman Nugraha, S.T, M.Si",
    address: "Stadion Wibawa Mukti, Cikarang Timur",
    email: "disbudpora@bekasikab.go.id",
    phone: "021-89970911",
    website: "https://disbudpora.bekasikab.go.id",
    status: "active",
    lastAudit: "4 hari lalu",
  },
  {
    id: "opd-18",
    name: "Dinas Perikanan",
    shortName: "Diskan",
    category: "Dinas",
    headOfAgency: "Ir. H. Agus Trihono, M.M",
    address: "Kompleks Pemkab Bekasi, Cikarang Pusat",
    email: "diskan@bekasikab.go.id",
    phone: "021-89970922",
    website: "https://diskan.bekasikab.go.id",
    status: "active",
    lastAudit: "Minggu ini",
  },
  {
    id: "opd-19",
    name: "Dinas Perindustrian",
    shortName: "Disperin",
    category: "Dinas",
    headOfAgency: "Drs. H. Karsinal, M.Si",
    address: "Kompleks Pemkab Bekasi, Cikarang Pusat",
    email: "disperin@bekasikab.go.id",
    phone: "021-89970933",
    website: "https://disperin.bekasikab.go.id",
    status: "active",
    lastAudit: "Kemarin",
  },
  {
    id: "opd-20",
    name: "RSUD Cabangbungin",
    shortName: "RSUD Cabangbungin",
    category: "RSUD",
    headOfAgency: "dr. Erni Herdiani",
    address: "Jl. Raya Cabangbungin, Desa Sindangsari, Cabangbungin",
    email: "rsudcabangbungin@bekasikab.go.id",
    phone: "021-89141234",
    website: "https://rsudcabangbungin.bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
  {
    id: "opd-21",
    name: "Bagian Pengadaan Barang dan Jasa",
    shortName: "Bagian PBJ",
    category: "Sekretariat",
    headOfAgency: "Khaerul Hamid, S.T",
    address: "Gedung Bupati Lt. 1, Kompleks Pemkab Bekasi",
    email: "pbj@bekasikab.go.id",
    phone: "021-89970944",
    website: "https://lpse.bekasikab.go.id",
    status: "active",
    lastAudit: "Kemarin",
  },
  {
    id: "opd-22",
    name: "Sekretariat Daerah Pemkab Bekasi",
    shortName: "Pemkab Bekasi",
    category: "Sekretariat",
    headOfAgency: "Drs. Dedy Supriyadi, M.M",
    address: "Gedung Bupati Kompleks Perkantoran Pemkab Bekasi, Cikarang Pusat",
    email: "setda@bekasikab.go.id",
    phone: "021-89970001",
    website: "https://bekasikab.go.id",
    status: "active",
    lastAudit: "Hari ini",
  },
];

// Default FAQs
export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "akun",
    question: "Apa itu Portal SPBE Kabupaten Bekasi?",
    answer:
      "Portal SPBE (Sistem Pemerintahan Berbasis Elektronik) adalah gerbang utama yang mengintegrasikan seluruh aplikasi dan layanan digital dari berbagai instansi (OPD) di lingkup Pemerintah Kabupaten Bekasi. Warga dapat menemukan semua layanan dari satu tempat terpusat.",
    order: 1,
    isActive: true,
  },
  {
    id: "faq-2",
    category: "akun",
    question: "Apakah saya harus membuat akun untuk menggunakan layanan?",
    answer:
      "Untuk mengakses informasi dasar, Anda tidak perlu membuat akun. Namun, untuk mengajukan permohonan spesifik atau menggunakan layanan administrasi (seperti Banpin, Pajak Daerah, dll), Anda mungkin diarahkan untuk masuk atau mendaftar di masing-masing aplikasi tersebut.",
    order: 2,
    isActive: true,
  },
  {
    id: "faq-3",
    category: "pengaduan",
    question: "Aplikasi apa yang harus saya gunakan untuk pengaduan?",
    answer:
      "Untuk pengaduan, Anda dapat menggunakan aplikasi Bebunge (Bekasi Nyambung Bae) atau SP4N Lapor yang tersedia di portal ini. Layanan tersebut memfasilitasi komunikasi dua arah antara masyarakat dan pemerintah daerah.",
    order: 3,
    isActive: true,
  },
  {
    id: "faq-4",
    category: "teknis",
    question: "Bagaimana jika link layanan tidak bisa diakses atau error?",
    answer:
      "Jika Anda menemukan link layanan yang rusak, sedang dalam perbaikan, atau mengalami kendala teknis, Anda dapat melaporkannya melalui kanal pengaduan resmi atau langsung menghubungi tim Diskominfosantik Kabupaten Bekasi.",
    order: 4,
    isActive: true,
  },
  {
    id: "faq-5",
    category: "layanan",
    question: "Ke mana saya bisa menghubungi jika masih mengalami kendala?",
    answer:
      "Anda dapat menghubungi Call Center 112 (bebas pulsa) atau mengirim email ke helpdesk@bekasikab.go.id. Layanan helpdesk tersedia pada hari kerja Senin-Jumat pukul 08.00-16.00 WIB.",
    order: 5,
    isActive: true,
  },
  {
    id: "faq-6",
    category: "layanan",
    question: "Apakah layanan di portal ini dipungut biaya?",
    answer:
      "Sebagian besar layanan administrasi dan publik yang disediakan oleh Pemerintah Kabupaten Bekasi bersifat gratis. Jika ada layanan yang memerlukan biaya (seperti retribusi atau pajak), hal itu akan dijelaskan secara transparan di dalam sistem layanan terkait.",
    order: 6,
    isActive: true,
  },
  {
    id: "faq-7",
    category: "teknis",
    question: "Bagaimana cara mengakses layanan digital dari perangkat seluler?",
    answer:
      "Seluruh layanan di portal SPBE dapat diakses melalui browser di perangkat seluler (smartphone/tablet). Beberapa layanan juga menyediakan aplikasi mobile yang dapat diunduh melalui Google Play Store atau Apple App Store.",
    order: 7,
    isActive: true,
  },
  {
    id: "faq-8",
    category: "lainnya",
    question: "Apakah data pribadi saya aman di portal ini?",
    answer:
      "Pemerintah Kabupaten Bekasi berkomitmen menjaga keamanan data pribadi pengguna sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP). Setiap layanan menerapkan enkripsi dan standar keamanan yang berlaku.",
    order: 8,
    isActive: true,
  },
];

// Default System Settings
export const DEFAULT_SETTINGS: SystemSettings = {
  portalName: "Portal Layanan Digital SPBE Kabupaten Bekasi",
  portalDescription:
    "Pusat Integrasi Layanan Publik & Administrasi Pemerintahan Berbasis Elektronik Terpadu",
  contactEmail: "diskominfosantik@bekasikab.go.id",
  contactPhone: "021-89970123",
  maintenanceMode: false,
  supabaseConnected: false,
  supabaseUrl: "https://your-project.supabase.co",
  autoSyncInterval: 5,
  themeDefault: "system",
};
