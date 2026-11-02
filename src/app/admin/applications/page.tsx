"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ApplicationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/featured");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-bounce">
        <Sparkles className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Mengalihkan ke Layanan Unggulan Daerah...
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Menu Aplikasi Terintegrasi telah diperbarui menjadi Layanan Unggulan Daerah untuk mengelola
        dan memilih layanan prioritas pada portal publik.
      </p>
      <Link
        href="/admin/featured"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-colors"
      >
        <span>Buka Layanan Unggulan Daerah Sekarang</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
