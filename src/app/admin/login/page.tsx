"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import {
  saveCurrentAdmin,
  addAuditLog,
} from "@/services/serviceStore";
import clsx from "clsx";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMsg("Mohon lengkapi username/email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsLoading(false);
        setErrorMsg(
          data.message ||
            "Autentikasi gagal. Silakan periksa kembali kredensial Anda."
        );
        return;
      }

      // Establish active session with multi-tier persistence for UI instant hydration
      const activeAdmin = {
        name: data.user.agency || data.user.name,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        agency: data.user.agency || data.user.name,
      };
      saveCurrentAdmin(activeAdmin, rememberMe);

      // Log real audit action
      addAuditLog({
        action: "STATUS_CHANGE",
        entity: "USER",
        entityId: data.user.id,
        details: `Sesi login aktif: @${data.user.username} (${data.user.role})`,
        performedBy: activeAdmin.name,
      });

      setSuccessMsg(`Autentikasi berhasil! Selamat datang, ${activeAdmin.name}.`);

      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const redirectUrl = params?.get("redirect") || "/admin";

      setTimeout(() => {
        router.push(redirectUrl);
      }, 700);
    } catch {
      setIsLoading(false);
      setErrorMsg("Gagal terhubung ke server autentikasi. Silakan periksa koneksi Anda.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden text-slate-100">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md z-10 my-8">
        {/* Top Link back to public portal */}
        <div className="mb-6 flex justify-between items-center text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Portal Publik</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>SPBE Cloud v2.0</span>
          </div>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl p-6 sm:p-8"
        >
          {/* Header & Logos */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-5 shadow-inner">
              <img
                src="/logos/logo-pemda.png"
                alt="Logo Pemkab Bekasi"
                className="h-9 w-auto object-contain filter drop-shadow"
              />
              <div className="h-6 w-px bg-slate-700" />
              <img
                src="/logos/logo-spbe.png"
                alt="Logo SPBE"
                className="h-8 w-auto object-contain brightness-110 drop-shadow"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Masuk Panel Admin
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Sistem Manajemen Layanan Digital & Data SPBE Pemerintah Kabupaten Bekasi
            </p>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Username / Email Kedinasan
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin_kominfo atau email@bekasikab.go.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-300"
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Kata sandi akun Anda dikelola di menu Pengaturan Sistem (Manajemen Akun Admin OPD)."
                    )
                  }
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Bantuan Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-400">Ingat sesi saya</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all",
                isLoading
                  ? "bg-blue-600/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Security badge at bottom */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Koneksi Aman Terenkripsi SSL • Diskominfosantik</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
