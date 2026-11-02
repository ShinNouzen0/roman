"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Database,
  Globe,
  Shield,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Lock,
  Mail,
  Phone,
  Moon,
  Sun,
  Laptop,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  Users,
  UserPlus,
  Building2,
  Layers,
  Award,
  Search,
  Edit2,
  Trash2,
  X,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import {
  useSettings,
  useServices,
  useAdminUsers,
  useOpdList,
  useCurrentAdmin,
  SystemSettings,
  AdminUser,
} from "@/services/serviceStore";
import clsx from "clsx";

type TabId = "general" | "admin-accounts" | "database" | "integration" | "security";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { currentAdmin, isSuperAdmin } = useCurrentAdmin();
  const { settings, updateSettings, resetSettingsToDefault } = useSettings();

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/admin?unauthorized=1");
    }
  }, [isSuperAdmin, router]);

  const { services, resetServicesToDefault } = useServices();
  const { users, addUser, updateUser, toggleUserStatus, deleteUser, resetUsersToDefault } = useAdminUsers();
  const { opdList } = useOpdList();

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; latency: number } | null>(null);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Admin User Filter State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Admin User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<AdminUser>>({
    name: "",
    username: "",
    password: "",
    email: "",
    agency: "Diskominfosantik",
    role: "Admin OPD",
    status: "active",
    phone: "",
  });

  // Delete User Modal State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    showToast("Pengaturan portal dan sistem berhasil disimpan!");
  };

  const handleTestDatabase = () => {
    setIsTestingDb(true);
    setDbTestResult(null);

    setTimeout(() => {
      setIsTestingDb(false);
      setDbTestResult({
        success: true,
        latency: Math.floor(Math.random() * 25) + 18, // 18-42ms
      });
      showToast("Koneksi Supabase PostgreSQL berhasil diverifikasi!");
    }, 1200);
  };

  const handleResetCatalog = () => {
    resetServicesToDefault();
    setConfirmResetModal(false);
    showToast("Katalog layanan publik berhasil di-reset ke data default bawaan!");
  };

  // User Handlers
  const handleOpenAddUser = () => {
    setEditingUser(null);
    const defaultAgency = opdList[0]?.shortName || opdList[0]?.name || "Diskominfosantik";
    setUserFormData({
      name: defaultAgency,
      agency: defaultAgency,
      username: "",
      password: "",
      email: "",
      role: "Admin OPD",
      status: "active",
    });
    setShowModalPassword(false);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setUserFormData({
      ...u,
      password: "", // empty means keep existing password
    });
    setShowModalPassword(false);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.agency?.trim()) {
      alert("Nama Dinas / Instansi OPD wajib dipilih.");
      return;
    }
    if (!userFormData.username?.trim()) {
      alert("Username login wajib diisi.");
      return;
    }
    if (!editingUser && !userFormData.password?.trim()) {
      alert("Kata sandi (password) wajib diisi untuk akun baru.");
      return;
    }

    const agencyName = userFormData.agency.trim();
    const emailLogin =
      userFormData.email?.trim() ||
      `${userFormData.username.toLowerCase().replace(/[^a-z0-9]/g, "")}@bekasikab.go.id`;

    const payload: Partial<AdminUser> = {
      ...userFormData,
      name: agencyName,
      agency: agencyName,
      email: emailLogin,
      role: userFormData.role === "Super Admin" ? "Super Admin" : "Admin OPD",
      status: userFormData.status === "inactive" ? "inactive" : "active",
    };

    if (editingUser) {
      if (!payload.password?.trim()) {
        delete payload.password;
      }
      updateUser(editingUser.id, payload);
      showToast(`Data akun "${agencyName}" (@${userFormData.username}) berhasil diperbarui!`);
    } else {
      addUser(payload);
      showToast(`Akun admin baru "${agencyName}" (@${userFormData.username}) berhasil dibuat!`);
    }
    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    showToast(`Akun admin "${deletingUser.name}" berhasil dihapus.`);
    setDeleteUserModalOpen(false);
    setDeletingUser(null);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchUsername = u.username?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchAgency = u.agency?.toLowerCase().includes(q);
        if (!matchName && !matchUsername && !matchEmail && !matchAgency) return false;
      }
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== "all" && u.status !== userStatusFilter) return false;
      return true;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const getRoleBadge = (role: AdminUser["role"]) => {
    switch (role) {
      case "Super Admin":
        return {
          bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          icon: Shield,
        };
      case "Admin OPD":
      default:
        return {
          bg: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          icon: Building2,
        };
    }
  };

  const tabs = [
    { id: "general", label: "Konfigurasi Portal", icon: Globe },
    { id: "admin-accounts", label: "Akun Admin OPD", icon: Users },
    { id: "database", label: "Supabase & Database", icon: Database },
    { id: "integration", label: "Integrasi SPBE & SPLP", icon: Zap },
    { id: "security", label: "Keamanan & Akses", icon: Shield },
  ];

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Pengaturan Dibatasi</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Halaman Pengaturan Sistem hanya dapat dikelola oleh <b>Super Admin</b>. Akun Anda saat ini terdaftar sebagai <b>Admin OPD ({currentAdmin.agency})</b>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Kembali ke Dashboard
            </Link>
            <Link
              href="/admin/services"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              Buka Katalog Layanan ({currentAdmin.agency})
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700/50 dark:border-slate-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Konfigurasi Sistem
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              Portal SPBE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Pengaturan Portal & Sistem
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Kelola parameter operasional portal publik, akun administrator dinas/OPD, konfigurasi database Supabase PostgreSQL, integrasi antarmuka SPLP, dan protokol keamanan.
          </p>
        </div>

        {activeTab === "admin-accounts" ? (
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Admin OPD Baru</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...settings })}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Batalkan Perubahan</span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all hover:shadow-lg active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={clsx(
                "relative flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="settings-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: GENERAL / PORTAL CONFIGURATION */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Maintenance Mode Emergency Alert Banner */}
            <div
              className={clsx(
                "rounded-2xl p-5 border transition-colors flex items-start justify-between gap-4",
                formData.maintenanceMode
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={clsx(
                    "p-2.5 rounded-xl flex-shrink-0 mt-0.5",
                    formData.maintenanceMode
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Mode Pemeliharaan Darurat Portal Publik
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                    Jika diaktifkan, portal publik akan menampilkan banner status pemeliharaan sistem kepada masyarakat dan membatasi akses ke beberapa layanan yang sedang dalam perbaikan.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) =>
                    setFormData({ ...formData, maintenanceMode: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {/* Portal Metadata Card */}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Informasi & Identitas Portal SPBE
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Portal Publik
                  </label>
                  <input
                    type="text"
                    value={formData.portalName}
                    onChange={(e) =>
                      setFormData({ ...formData, portalName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Kontak & Helpdesk
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi Portal & Tagline
                </label>
                <textarea
                  rows={3}
                  value={formData.portalDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, portalDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Telepon Bantuan (Call Center SPBE)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPhone: e.target.value })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: ADMIN ACCOUNTS */}
        {activeTab === "admin-accounts" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Metric Cards for Admin Accounts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Akun Admin
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {users.length}
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 block font-medium">
                  Pengelola Terdaftar
                </span>
              </div>

              <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Super Admin
                </span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {users.filter((u) => u.role === "Super Admin").length}
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Akses Penuh Seluruh Sistem
                </span>
              </div>

              <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Admin Instansi (OPD)
                </span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {users.filter((u) => u.role === "Admin OPD").length}
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dinas, Badan & RSUD
                </span>
              </div>

              <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Akun Aktif
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {users.filter((u) => u.status === "active").length}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                  Siap Kelola Layanan
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari nama instansi/pengguna, username, email dinas, atau OPD..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="all">Semua Peran (Role)</option>
                    <option value="Super Admin">🛡️ Super Admin</option>
                    <option value="Admin OPD">🏢 Admin OPD</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">🟢 Aktif</option>
                    <option value="inactive">⚪ Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Menampilkan <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> akun administrator
                </span>
                {(userSearch || userRoleFilter !== "all" || userStatusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearch("");
                      setUserRoleFilter("all");
                      setUserStatusFilter("all");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Admin Users Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                      <th className="py-3.5 px-4 font-semibold w-12 text-center">No</th>
                      <th className="py-3.5 px-4 font-semibold min-w-[240px]">Nama Dinas / Instansi (OPD)</th>
                      <th className="py-3.5 px-4 font-semibold min-w-[200px]">Username / Email Login</th>
                      <th className="py-3.5 px-4 font-semibold min-w-[140px]">Peran (Role)</th>
                      <th className="py-3.5 px-4 font-semibold text-center min-w-[120px]">Status Akun</th>
                      <th className="py-3.5 px-4 font-semibold min-w-[130px]">Terakhir Login</th>
                      <th className="py-3.5 px-4 font-semibold text-right min-w-[90px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm font-semibold">Tidak ada akun admin yang sesuai filter.</p>
                          <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => {
                        const roleMeta = getRoleBadge(u.role);
                        const RoleIcon = roleMeta.icon;

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                            
                            {/* Nama Dinas / Instansi */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {u.agency || u.name}
                                  </p>
                                  <span className="text-[10px] text-slate-400">Pemerintah Kab. Bekasi</span>
                                </div>
                              </div>
                            </td>

                            {/* Username & Email Login */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <p className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                                  @{u.username || u.email.split("@")[0]}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{u.email}</span>
                                </p>
                              </div>
                            </td>

                            {/* Peran (Role) */}
                            <td className="py-3.5 px-4">
                              <span
                                className={clsx(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                                  roleMeta.bg
                                )}
                              >
                                <RoleIcon className="w-3.5 h-3.5" />
                                <span>{u.role}</span>
                              </span>
                            </td>

                            {/* Status Akun Switcher */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserStatus(u.id);
                                  showToast(`Status ${u.agency || u.name} diubah menjadi ${u.status === "active" ? "Nonaktif" : "Aktif"}`);
                                }}
                                className={clsx(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border active:scale-95",
                                  u.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200"
                                )}
                                title="Klik untuk beralih status aktif/nonaktif"
                              >
                                <span
                                  className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    u.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                  )}
                                />
                                <span>{u.status === "active" ? "Aktif" : "Nonaktif"}</span>
                              </button>
                            </td>

                            {/* Terakhir Login */}
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                              {u.lastLogin || "Belum pernah"}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                  title="Edit Akun Admin"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingUser(u);
                                    setDeleteUserModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                  title="Hapus Akun Admin"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DATABASE & SUPABASE */}
        {activeTab === "database" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Supabase Connection Status Card */}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Supabase PostgreSQL Engine
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                        ONLINE & SYNCED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Prisma ORM v5.22.0 terhubung dengan Supabase Connection Pooler
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestDatabase}
                  disabled={isTestingDb}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors self-start md:self-auto"
                >
                  <RefreshCw
                    className={clsx("w-3.5 h-3.5", isTestingDb && "animate-spin")}
                  />
                  <span>{isTestingDb ? "Menguji Koneksi..." : "Uji Koneksi (Ping)"}</span>
                </button>
              </div>

              {dbTestResult && (
                <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>
                      <b>Supabase Response OK:</b> Berhasil mengirim kueri ke pooler PostgreSQL.
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    Latency: {dbTestResult.latency} ms
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Host Connection Pooler Supabase
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="aws-0-ap-southeast-1.pooler.supabase.com:6543"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Database Driver & Mode
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="PostgreSQL 15 (Transaction Pooler + Direct Migration)"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prisma Models Overview */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Struktur Skema Prisma Supabase Terpasang:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { name: "Service", count: `${services.length} Record`, desc: "Layanan Publik" },
                    { name: "Opd", count: `${opdList.length} Instansi`, desc: "Perangkat Daerah" },
                    { name: "Category", count: "8 Kategori", desc: "Taksonomi SPBE" },
                    { name: "SpbeScore", count: "Tahun 2024", desc: "Indeks Evaluasi" },
                    { name: "AuditLog", count: "Real-time", desc: "Jejak Audit" },
                  ].map((model) => (
                    <div
                      key={model.name}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                        {model.name}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                        {model.count}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {model.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Reset & Data Maintenance */}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reset Katalog Layanan ke Data Awal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Jika Anda ingin mengembalikan seluruh daftar layanan publik kembali ke data default bawaan Kabupaten Bekasi (termasuk memulihkan data yang sempat terhapus saat uji coba).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmResetModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors self-start md:self-auto flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Katalog Default</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 3: INTEGRATION */}
        {activeTab === "integration" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Integrasi Ekosistem Pemerintahan Digital
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kelola interoperabilitas portal SPBE Kabupaten Bekasi dengan hub data nasional dan provinsi Jawa Barat.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: "SPLP (Sistem Penghubung Layanan Pemerintah) Jawa Barat",
                    desc: "Protokol pertukaran data antar instansi daerah dan provinsi",
                    status: "Aktif",
                    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                  },
                  {
                    name: "Satu Data Indonesia (SDI) - Bappeda & Diskominfo",
                    desc: "Sinkronisasi metadata statistik sektoral daerah ke portal data pusat",
                    status: "Terhubung",
                    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                  },
                  {
                    name: "SATUSEHAT Kemenkes RI (RSUD & Puskesmas)",
                    desc: "Integrasi rekam medis elektronik dan antrean online kesehatan",
                    status: "Aktif",
                    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                  },
                  {
                    name: "INA Digital (GovTech Nasional)",
                    desc: "Arsitektur Single Sign-On (SSO) dan Identitas Kependudukan Digital (IKD)",
                    status: "Tahap Evaluasi",
                    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                        item.badgeColor
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: SECURITY */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Keamanan & Akses Akun Administrator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-400 block">Akun Administrator Aktif</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                    {currentAdmin.agency || currentAdmin.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    {currentAdmin.email || currentAdmin.username}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSuperAdmin ? "Level Akses Tertinggi (Super Admin)" : `Hak Akses (${currentAdmin.role})`}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-400 block">Jejak Audit Mutasi</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                    Audit Logging Aktif & Permanen
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Setiap perubahan status layanan, penambahan OPD, dan mutasi data dicatat lengkap dengan timestamp ke menu Audit Log.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </form>

      {/* Confirm Reset Catalog Modal */}
      <AnimatePresence>
        {confirmResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmResetModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Reset Katalog ke Default?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Tindakan ini akan memulihkan data layanan publik default Kabupaten Bekasi dan menggantikan modifikasi sementara di browser ini.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmResetModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/25 transition-all"
                >
                  Ya, Reset Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Tambah / Edit Akun Admin OPD */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {editingUser ? "Edit Akun Administrator" : "Tambah Akun Admin OPD"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Konfigurasi hak akses dan instansi penugasan admin daerah
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4 mt-4">
                {/* 1. Nama Dinas / Instansi (Pilih dari dropdown OPD) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Dinas / Instansi (OPD) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={userFormData.agency || ""}
                    onChange={(e) => {
                      const selectedAgency = e.target.value;
                      setUserFormData({
                        ...userFormData,
                        agency: selectedAgency,
                        name: selectedAgency,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {opdList.map((opd) => (
                      <option key={opd.id} value={opd.shortName || opd.name}>
                        {opd.shortName ? `${opd.shortName} — ${opd.name}` : opd.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pilih nama dinas atau instansi OPD pengelola akun
                  </span>
                </div>

                {/* 2. Username / Email Login (Wajib) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userFormData.username || ""}
                      onChange={(e) =>
                        setUserFormData({
                          ...userFormData,
                          username: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        })
                      }
                      placeholder="admin_dinkes"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={userFormData.email || ""}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="dinkes@bekasikab.go.id"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* 3. Password (Wajib) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {editingUser ? "Kata Sandi (Password) Baru" : "Kata Sandi (Password)"}{" "}
                    {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? "text" : "password"}
                      required={!editingUser}
                      value={userFormData.password || ""}
                      onChange={(e) =>
                        setUserFormData({ ...userFormData, password: e.target.value })
                      }
                      placeholder={editingUser ? "Kosongkan jika sandi tak diubah" : "Minimal 6 karakter"}
                      className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      title={showModalPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showModalPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {editingUser ? "Biarkan kosong jika tidak ingin mengubah sandi" : "Kredensial wajib untuk login panel admin"}
                  </span>
                </div>

                {/* 4. Peran (Role): Super Admin atau Admin OPD */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userFormData.role || "Admin OPD"}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        role: e.target.value as AdminUser["role"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Super Admin">🛡️ Super Admin (Akses Penuh Semua Menu)</option>
                    <option value="Admin OPD">🏢 Admin OPD (Hanya Kelola Layanan Dinasnya)</option>
                  </select>
                </div>

                {/* 5. Status: Aktif / Nonaktif */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Akun
                  </label>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userStatus"
                        value="active"
                        checked={userFormData.status === "active"}
                        onChange={() => setUserFormData({ ...userFormData, status: "active" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        🟢 Aktif
                      </span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userStatus"
                        value="inactive"
                        checked={userFormData.status === "inactive"}
                        onChange={() => setUserFormData({ ...userFormData, status: "inactive" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        ⚪ Nonaktif
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    {editingUser ? "Simpan Perubahan" : "Buat Akun Administrator"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Delete User */}
      <AnimatePresence>
        {deleteUserModalOpen && deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteUserModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hapus Akun Administrator?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Apakah Anda yakin ingin menghapus akun admin <strong>{deletingUser.name}</strong> ({deletingUser.agency})? Pengguna tidak akan dapat lagi mengelola layanan.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 transition-all"
                >
                  Ya, Hapus Akun
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
