import Link from "next/link";
import { LayoutDashboard, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/#beranda" className="flex items-center gap-4 mb-6 inline-flex p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 transition-colors">
              <img 
                src="/logos/logo-pemda.png" 
                alt="Logo Pemerintah Kabupaten Bekasi" 
                className="h-10 md:h-12 w-auto object-contain"
              />
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <img 
                src="/logos/logo-spbe.png" 
                alt="Logo SPBE Kabupaten Bekasi" 
                className="h-8 md:h-10 w-auto object-contain dark:brightness-110 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
              />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              Sistem Pemerintahan Berbasis Elektronik (SPBE) untuk akses terpadu berbagai layanan digital Kabupaten Bekasi.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li><Link href="/#beranda" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Beranda</Link></li>
              <li><Link href="/#layanan" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Semua Layanan</Link></li>
              <li><Link href="/#perangkat-daerah" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Perangkat Daerah</Link></li>
              <li><Link href="/#tentang" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Tentang Portal</Link></li>
              <li><Link href="/#faq" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Bantuan & FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
                <span className="text-sm">Komplek Perkantoran Pemkab Bekasi, Desa Sukamahi, Kec. Cikarang Pusat</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Phone className="w-5 h-5 shrink-0 text-slate-400" />
                <span className="text-sm">(021) 89970696</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Mail className="w-5 h-5 shrink-0 text-slate-400" />
                <span className="text-sm">diskominfo@bekasikab.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Pemerintah Kabupaten Bekasi. Hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
