"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import MaintenanceBanner from "@/components/layout/MaintenanceBanner";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#beranda");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll Progress indicator at the very top of screen
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 15);
      // Hide when scrolling DOWN past 90px, show when scrolling UP
      if (currentY > lastScrollY.current && currentY > 90) {
        setIsHidden(true);
        setMobileMenuOpen(false); // auto-close mobile menu on hide
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;

      // Update active hash based on scroll position
      const sections = ["faq", "spbe-history", "perangkat-daerah", "layanan", "beranda"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveHash(`#${section}`);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/#beranda", hash: "#beranda" },
    { name: "Layanan", path: "/#layanan", hash: "#layanan" },
    { name: "Perangkat Daerah", path: "/#perangkat-daerah", hash: "#perangkat-daerah" },
    { name: "Indeks SPBE", path: "/#spbe-history", hash: "#spbe-history" },
    { name: "Bantuan & FAQ", path: "/#faq", hash: "#faq" },
  ];

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <header
      className={clsx(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm shadow-blue-900/5"
          : "bg-transparent border-b border-transparent",
        isHidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <MaintenanceBanner />
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          {/* Logo & Brand */}
          <Link
            href="/#beranda"
            onClick={() => setActiveHash("#beranda")}
            className="flex items-center gap-2.5 sm:gap-3 bg-transparent dark:bg-slate-800/40 p-1.5 rounded-xl transition-transform hover:scale-[1.02] active:scale-95"
          >
            <img
              src="/logos/logo-pemda.png"
              alt="Logo Pemerintah Kabupaten Bekasi"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain rounded-md"
            />
            <div className="h-5 sm:h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
            <img
              src="/logos/logo-spbe.png"
              alt="Logo SPBE Kabupaten Bekasi"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = activeHash === link.hash;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setActiveHash(link.hash)}
                  className={clsx(
                    "relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-colors duration-200",
                    isActive
                      ? "text-blue-600 dark:text-blue-300 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute inset-0 bg-white dark:bg-slate-700/90 rounded-full shadow-xs border border-slate-200/60 dark:border-slate-600/60"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Search Trigger Button */}
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:scale-105 active:scale-95 shadow-2xs"
              title="Pencarian Cepat"
              aria-label="Pencarian Cepat"
            >
              <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300">Cari Cepat</span>
            </button>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 sm:p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-1">
              {/* Mobile Quick Search trigger */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 mb-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  Cari Layanan & Aplikasi...
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  Buka
                </span>
              </button>

              {navLinks.map((link) => {
                const isActive = activeHash === link.hash;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => {
                      setActiveHash(link.hash);
                      setMobileMenuOpen(false);
                    }}
                    className={clsx(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      isActive
                        ? "text-blue-600 bg-blue-50/90 dark:text-blue-400 dark:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <span>{link.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
