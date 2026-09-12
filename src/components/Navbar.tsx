"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Moon, Sun, LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/#beranda" },
    { name: "Layanan", path: "/#layanan" },
    { name: "Perangkat Daerah", path: "/#perangkat-daerah" },
    { name: "Tentang", path: "/#tentang" },
    { name: "Bantuan & FAQ", path: "/#faq" },
  ];

  return (
    <header 
      className={clsx(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm" 
          : "bg-white dark:bg-slate-900 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/#beranda" className="flex items-center gap-3 bg-transparent dark:bg-slate-800/50 p-1.5 md:p-2 rounded-xl transition-colors">
            <img 
              src="/logos/logo-pemda.png" 
              alt="Logo Pemerintah Kabupaten Bekasi" 
              className="h-8 md:h-10 w-auto object-contain rounded-md"
            />
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <img 
              src="/logos/logo-spbe.png" 
              alt="Logo SPBE Kabupaten Bekasi" 
              className="h-7 md:h-9 w-auto object-contain dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={clsx(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.path 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "block px-3 py-3 rounded-lg text-base font-medium",
                  pathname === link.path 
                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
