"use client";

import { useState, useEffect, useCallback } from "react";
import { DigitalService } from "@/types";
export type { DigitalService };
import { mockServices } from "@/data/mockData";
import { SpbeAnnualRecord, spbeAnnualData } from "@/data/spbeData";
export type { SpbeAnnualRecord };

// Storage Keys
export const SERVICES_STORAGE_KEY = "spbe_admin_services_data";
export const AUDIT_LOGS_STORAGE_KEY = "spbe_admin_audit_logs_data";
export const OPD_STORAGE_KEY = "spbe_admin_opd_data";
export const SETTINGS_STORAGE_KEY = "spbe_admin_settings_data";
export const SPBE_STORAGE_KEY = "spbe_admin_spbe_data";
export const FAQ_STORAGE_KEY = "spbe_admin_faq_data";

// Custom Event Names for Real-Time Sync across components within the same tab
export const SERVICES_UPDATED_EVENT = "spbe:services_updated";
export const AUDIT_LOGS_UPDATED_EVENT = "spbe:audit_logs_updated";
export const OPD_UPDATED_EVENT = "spbe:opd_updated";
export const SETTINGS_UPDATED_EVENT = "spbe:settings_updated";
export const SPBE_UPDATED_EVENT = "spbe:spbe_updated";
export const FAQ_UPDATED_EVENT = "spbe:faq_updated";
export const ADMIN_USERS_STORAGE_KEY = "spbe_admin_users";
export const ADMIN_USERS_UPDATED_EVENT = "spbe:admin_users_updated";
export const CURRENT_ADMIN_STORAGE_KEY = "spbe_admin_user";
export const CURRENT_ADMIN_UPDATED_EVENT = "spbe:current_admin_updated";

export interface CurrentAdminInfo {
  name: string; // Nama Instansi / Dinas
  username: string; // Username login
  email: string; // Email login
  role: "Super Admin" | "Admin OPD";
  agency: string; // Perangkat Daerah (OPD)
}

export interface AuditLogItem {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  entity: "SERVICE" | "OPD" | "SYSTEM" | "SETTINGS" | "SPBE" | "FAQ" | "USER";
  entityId?: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string; // Nama Dinas/Instansi (misal: "Dinas Komunikasi, Informatika, Persandian dan Statistik")
  username: string; // Username untuk login (misal: "admin_kominfo")
  email: string; // Email login (misal: "dinkes@bekasikab.go.id")
  password?: string; // Kata sandi login
  nip?: string; // Opsional / legacy
  agency: string; // Instansi / Perangkat Daerah (OPD)
  role: "Super Admin" | "Admin OPD";
  status: "active" | "inactive";
  lastLogin?: string;
  phone?: string;
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

export interface SystemSettings {
  portalName: string;
  portalDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  supabaseConnected: boolean;
  supabaseUrl: string;
  autoSyncInterval: number; // in minutes
  themeDefault: "system" | "light" | "dark";
}

// Default initial audit logs (kosong secara default, hanya mencatat aktivitas sesi riil)
export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [];

// Default initial OPD list based on Kabupaten Bekasi administration (covers all 101 catalog services)
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

// Safe initial admin directory (profile metadata only - no credentials or passwords)
export const SAFE_DEFAULT_ADMIN_PROFILES: AdminUser[] = [
  {
    id: "user-1",
    name: "Diskominfosantik",
    username: "admin_kominfo",
    email: "admin@bekasikab.go.id",
    agency: "Diskominfosantik",
    role: "Super Admin",
    status: "active",
    lastLogin: "Baru saja",
  },
  {
    id: "user-2",
    name: "Disdukcapil",
    username: "admin_disdukcapil",
    email: "disdukcapil@bekasikab.go.id",
    agency: "Disdukcapil",
    role: "Admin OPD",
    status: "active",
    lastLogin: "2 jam lalu",
  },
  {
    id: "user-3",
    name: "Bapenda",
    username: "admin_bapenda",
    email: "bapenda@bekasikab.go.id",
    agency: "Bapenda",
    role: "Admin OPD",
    status: "active",
    lastLogin: "Kemarin",
  },
  {
    id: "user-4",
    name: "Dinas Kesehatan",
    username: "admin_dinkes",
    email: "dinkes@bekasikab.go.id",
    agency: "Dinas Kesehatan",
    role: "Admin OPD",
    status: "active",
    lastLogin: "3 hari lalu",
  },
  {
    id: "user-5",
    name: "DPMPTSP",
    username: "operator_dpmptsp",
    email: "dpmptsp@bekasikab.go.id",
    agency: "DPMPTSP",
    role: "Admin OPD",
    status: "active",
    lastLogin: "5 jam lalu",
  },
  {
    id: "user-6",
    name: "Inspektorat Daerah",
    username: "verifikator_spbe",
    email: "inspektorat@bekasikab.go.id",
    agency: "Inspektorat Daerah",
    role: "Admin OPD",
    status: "active",
    lastLogin: "1 hari lalu",
  },
  {
    id: "user-7",
    name: "Disnaker",
    username: "operator_disnaker",
    email: "disnaker@bekasikab.go.id",
    agency: "Disnaker",
    role: "Admin OPD",
    status: "active",
    lastLogin: "4 hari lalu",
  },
];

// Default System Settings
export const DEFAULT_SETTINGS: SystemSettings = {
  portalName: "Portal SPBE Kabupaten Bekasi",
  portalDescription:
    "Portal resmi Sistem Pemerintahan Berbasis Elektronik (SPBE) Kabupaten Bekasi. Akses seluruh layanan digital, aplikasi publik, dan sistem administrasi terintegrasi.",
  contactEmail: "spbe@bekasikab.go.id",
  contactPhone: "021-89970123",
  maintenanceMode: false,
  supabaseConnected: true,
  supabaseUrl: "https://aws-0-ap-southeast-1.pooler.supabase.com",
  autoSyncInterval: 15,
  themeDefault: "system",
};

// ============================================================================
// SERVICE STORE HELPERS
// ============================================================================

// Signature initial featured services for portal publik
const INITIAL_FEATURED_NAMES = [
  "banpin",
  "sapa 129",
  "bebunge",
  "bebeli",
  "csirt",
  "sp4n lapor",
  "geoportal",
  "splp",
  "mail bekasikab",
];

export function sanitizeServicesWithFeatured(list: DigitalService[]): DigitalService[] {
  return list.map((s) => {
    if (typeof s.isFeatured === "boolean") return s;
    const isFeat = INITIAL_FEATURED_NAMES.some((fn) =>
      s.name.toLowerCase().includes(fn)
    );
    return { ...s, isFeatured: isFeat };
  });
}

export function getStoredServices(): DigitalService[] {
  if (typeof window === "undefined") {
    return sanitizeServicesWithFeatured(mockServices);
  }
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeServicesWithFeatured(parsed);
      }
    }
  } catch (e) {
    console.warn("Error reading services from localStorage:", e);
  }
  return sanitizeServicesWithFeatured(mockServices);
}

export function saveStoredServices(services: DigitalService[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    // Dispatch local event for same-window components
    window.dispatchEvent(
      new CustomEvent(SERVICES_UPDATED_EVENT, { detail: services })
    );
  } catch (e) {
    console.error("Error saving services to localStorage:", e);
  }
}

export function toggleFeaturedService(id: string): DigitalService[] {
  const current = getStoredServices();
  const updated = current.map((s) =>
    s.id === id ? { ...s, isFeatured: !s.isFeatured } : s
  );
  saveStoredServices(updated);
  return updated;
}

export function addAuditLog(item: Omit<AuditLogItem, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    const existing: AuditLogItem[] = raw ? JSON.parse(raw) : [];
    // Sanitize any legacy dummy logs
    const realExisting = existing.filter(
      (log) => !["log-1", "log-2", "log-3", "log-4"].includes(log.id)
    );

    let activePerformer = item.performedBy;
    if (!activePerformer && typeof window !== "undefined") {
      try {
        const rawUser = sessionStorage.getItem(CURRENT_ADMIN_STORAGE_KEY);
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          activePerformer = parsed.name || parsed.agency || parsed.username;
        }
      } catch {}
    }
    if (!activePerformer) activePerformer = "Super Admin SPBE";

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...item,
      performedBy: activePerformer,
    };
    const updated = [newLog, ...realExisting].slice(0, 100); // keep last 100 logs
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(AUDIT_LOGS_UPDATED_EVENT, { detail: updated })
    );

    // Asynchronously log to database via API
    if (typeof fetch !== "undefined") {
      fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn("Failed to add audit log:", e);
  }
}

export function getStoredAuditLogs(): AuditLogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strict purge: remove all dummy logs
        const clean = parsed.filter(
          (log: AuditLogItem) =>
            !["log-1", "log-2", "log-3", "log-4"].includes(log.id)
        );
        if (clean.length !== parsed.length) {
          localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch (e) {
    console.warn("Failed to read audit logs:", e);
  }
  return [];
}

export function syncOpdWithServices(existingOpd: OpdItem[] = []): OpdItem[] {
  const uniqueItems = new Map<string, OpdItem>();

  // 1. Seed with DEFAULT_OPD_LIST first to guarantee full rich metadata
  DEFAULT_OPD_LIST.forEach((item) => uniqueItems.set(item.id, item));

  // 2. Overlay any existing items
  existingOpd.forEach((item) => uniqueItems.set(item.id, item));

  // 3. Extract all distinct agencies from stored services
  const services = getStoredServices();
  const rawAgencies = Array.from(new Set(services.map((s) => s.agency).filter(Boolean)));

  rawAgencies.forEach((agency) => {
    const cleanAgency = agency.trim();
    if (!cleanAgency) return;

    // Check if agency is already covered
    const exists = Array.from(uniqueItems.values()).some((opd) => {
      const matchShort =
        opd.shortName &&
        (opd.shortName.toLowerCase() === cleanAgency.toLowerCase() ||
          cleanAgency.toLowerCase().includes(opd.shortName.toLowerCase()) ||
          opd.shortName.toLowerCase().includes(cleanAgency.toLowerCase()));
      const matchName =
        opd.name &&
        (opd.name.toLowerCase() === cleanAgency.toLowerCase() ||
          cleanAgency.toLowerCase().includes(opd.name.toLowerCase()) ||
          opd.name.toLowerCase().includes(cleanAgency.toLowerCase()));
      return matchShort || matchName;
    });

    if (!exists) {
      let category: OpdItem["category"] = "Dinas";
      if (/badan/i.test(cleanAgency)) category = "Badan";
      else if (/rsud/i.test(cleanAgency)) category = "RSUD";
      else if (/bagian|setda|pemkab|sekretariat/i.test(cleanAgency)) category = "Sekretariat";
      else if (/kecamatan/i.test(cleanAgency)) category = "Kecamatan";

      const newId = `opd-dyn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newOpd: OpdItem = {
        id: newId,
        name: cleanAgency.length > 15 ? cleanAgency : `Dinas ${cleanAgency}`,
        shortName: cleanAgency.length <= 15 ? cleanAgency : cleanAgency.split(" ").map((w) => w[0]).join(""),
        category,
        headOfAgency: "Kepala " + cleanAgency,
        address: "Kabupaten Bekasi",
        email: `${cleanAgency.toLowerCase().replace(/[^a-z0-9]/g, "")}@bekasikab.go.id`,
        phone: "021-89970000",
        website: `https://${cleanAgency.toLowerCase().replace(/[^a-z0-9]/g, "")}.bekasikab.go.id`,
        status: "active",
        lastAudit: "Hari ini",
      };
      uniqueItems.set(newId, newOpd);
    }
  });

  return Array.from(uniqueItems.values());
}

export function getStoredOpd(): OpdItem[] {
  if (typeof window === "undefined") return DEFAULT_OPD_LIST;
  try {
    const raw = localStorage.getItem(OPD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_OPD_LIST.length) {
        return parsed;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically sync & upgrade stored OPD if old version with only 10 items
        const synced = syncOpdWithServices(parsed);
        saveStoredOpd(synced);
        return synced;
      }
    }
  } catch (e) {
    console.warn("Failed to read OPD list:", e);
  }
  const initial = syncOpdWithServices(DEFAULT_OPD_LIST);
  saveStoredOpd(initial);
  return initial;
}

export function saveStoredOpd(opdList: OpdItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPD_STORAGE_KEY, JSON.stringify(opdList));
    window.dispatchEvent(new CustomEvent(OPD_UPDATED_EVENT, { detail: opdList }));
  } catch (e) {
    console.error("Failed to save OPD list:", e);
  }
}

export function getStoredAdminUsers(): AdminUser[] {
  if (typeof window === "undefined") return SAFE_DEFAULT_ADMIN_PROFILES;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce presence of username and ensure NO password is ever stored or exposed
        return parsed.map((u: any) => {
          const { password: _p, ...safeUser } = u;
          return {
            ...safeUser,
            username: safeUser.username || safeUser.email?.split("@")[0] || `admin_${safeUser.id}`,
          };
        });
      }
    }
  } catch (e) {
    console.warn("Failed to read admin users:", e);
  }
  return SAFE_DEFAULT_ADMIN_PROFILES;
}

export function saveStoredAdminUsers(users: AdminUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(
      new CustomEvent(ADMIN_USERS_UPDATED_EVENT, { detail: users })
    );
  } catch (e) {
    console.error("Failed to save admin users:", e);
  }
}

export function getStoredSettings(): SystemSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn("Failed to read system settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: SystemSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: settings })
    );
    addAuditLog({
      action: "UPDATE",
      entity: "SETTINGS",
      details: "Pembaruan konfigurasi umum sistem portal SPBE",
      performedBy: "Admin Diskominfosantik",
    });
  } catch (e) {
    console.error("Failed to save system settings:", e);
  }
}

// ============================================================================
// REACT HOOKS FOR REAL-TIME REACTIVITY
// ============================================================================

/**
 * Hook to consume & mutate services reactive across ALL pages and tabs
 */
export function useServices() {
  const [services, setServices] = useState<DigitalService[]>(() =>
    sanitizeServicesWithFeatured(mockServices)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial sync from local storage
    setServices(getStoredServices());

    // Dynamic sync from Supabase Database via API
    setIsLoading(true);
    fetch("/api/services")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data);
          saveStoredServices(res.data);
        }
      })
      .catch((err) => {
        console.warn("DB services sync skipped, using cache:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 1. Listen for same-window / in-app updates
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DigitalService[]>;
      if (customEvent.detail) {
        setServices(customEvent.detail);
      } else {
        setServices(getStoredServices());
      }
    };

    // 2. Listen for cross-tab updates via storage event
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === SERVICES_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setServices(parsed);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(SERVICES_UPDATED_EVENT, handleLocalUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(SERVICES_UPDATED_EVENT, handleLocalUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const addService = useCallback(
    (data: Partial<DigitalService>): DigitalService => {
      const current = getStoredServices();
      const newService: DigitalService = {
        id: `srv-${Date.now()}`,
        name: data.name || "Layanan Baru",
        description: data.description || "",
        url: data.url || "#",
        serviceType: data.serviceType || "Layanan Publik",
        category: data.category || "Administrasi & Umum",
        agency: data.agency || "Diskominfosantik",
        status: data.status || "active",
        contactEmail: data.contactEmail || "-",
        contactPhone: data.contactPhone || "-",
        logo: data.logo || "/logos/default.png",
        lastUpdated: "Baru saja",
        users: "0",
      };
      const updated = [newService, ...current];
      saveStoredServices(updated);

      addAuditLog({
        action: "CREATE",
        entity: "SERVICE",
        entityId: newService.id,
        details: `Layanan publik baru ditambahkan: "${newService.name}" (${newService.agency})`,
        performedBy: "Admin Diskominfosantik",
      });

      // Persist to database via API
      if (typeof fetch !== "undefined") {
        fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newService),
        }).catch(() => {});
      }

      return newService;
    },
    []
  );

  const updateService = useCallback(
    (id: string, updates: Partial<DigitalService>): DigitalService | null => {
      const current = getStoredServices();
      let updatedItem: DigitalService | null = null;
      const updated = current.map((s) => {
        if (s.id === id) {
          updatedItem = {
            ...s,
            ...updates,
            lastUpdated: "Baru saja diperbarui",
          };
          return updatedItem;
        }
        return s;
      });

      if (updatedItem) {
        saveStoredServices(updated);
        addAuditLog({
          action: "UPDATE",
          entity: "SERVICE",
          entityId: id,
          details: `Perubahan data layanan: "${(updatedItem as DigitalService).name}"`,
          performedBy: "Admin Diskominfosantik",
        });

        // Persist to database via API
        if (typeof fetch !== "undefined") {
          fetch(`/api/services/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }).catch(() => {});
        }
      }

      return updatedItem;
    },
    []
  );

  const updateServiceStatus = useCallback(
    (
      id: string,
      status: "active" | "maintenance" | "development" | "inactive"
    ) => {
      const current = getStoredServices();
      let targetName = "";
      const updated = current.map((s) => {
        if (s.id === id) {
          targetName = s.name;
          return {
            ...s,
            status,
            lastUpdated: "Status diperbarui",
          };
        }
        return s;
      });

      saveStoredServices(updated);

      addAuditLog({
        action: "STATUS_CHANGE",
        entity: "SERVICE",
        entityId: id,
        details: `Status layanan "${targetName || id}" diubah menjadi: ${status.toUpperCase()}`,
        performedBy: "Admin Diskominfosantik",
      });

      // Persist to database via API
      if (typeof fetch !== "undefined") {
        fetch(`/api/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }).catch(() => {});
      }
    },
    []
  );

  const deleteService = useCallback((id: string): boolean => {
    const current = getStoredServices();
    const item = current.find((s) => s.id === id);
    const updated = current.filter((s) => s.id !== id);

    if (updated.length !== current.length) {
      saveStoredServices(updated);
      addAuditLog({
        action: "DELETE",
        entity: "SERVICE",
        entityId: id,
        details: `Layanan "${item?.name || id}" dihapus dari katalog SPBE`,
        performedBy: "Admin Diskominfosantik",
      });

      // Persist to database via API
      if (typeof fetch !== "undefined") {
        fetch(`/api/services/${id}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      return true;
    }
    return false;
  }, []);

  const toggleFeatured = useCallback((id: string) => {
    const updated = toggleFeaturedService(id);
    setServices(updated);
    const target = updated.find((s) => s.id === id);
    if (target) {
      addAuditLog({
        action: "UPDATE",
        entity: "SERVICE",
        entityId: id,
        details: `${target.name} ${target.isFeatured ? "ditambahkan ke" : "dihapus dari"} Layanan Unggulan Daerah`,
        performedBy: getCurrentAdmin().name,
      });

      // Persist to database via API
      if (typeof fetch !== "undefined") {
        fetch(`/api/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: target.isFeatured }),
        }).catch(() => {});
      }
    }
  }, []);

  const resetServicesToDefault = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SERVICES_STORAGE_KEY);
    }
    saveStoredServices(mockServices);
    addAuditLog({
      action: "UPDATE",
      entity: "SYSTEM",
      details: `Katalog layanan dikembalikan ke data default (${mockServices.length} layanan)`,
      performedBy: "Admin Diskominfosantik",
    });
  }, []);

  return {
    services,
    isLoading,
    addService,
    updateService,
    updateServiceStatus,
    deleteService,
    toggleFeatured,
    resetServicesToDefault,
  };
}

/**
 * Hook to consume audit logs in real-time
 */
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>(() => getStoredAuditLogs());

  useEffect(() => {
    setLogs(getStoredAuditLogs());

    // Fetch fresh logs from database via API
    fetch("/api/audit-logs")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLogs(res.data);
          if (typeof window !== "undefined") {
            localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(res.data));
          }
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      setLogs(getStoredAuditLogs());
    };

    window.addEventListener(AUDIT_LOGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(AUDIT_LOGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const clearLogs = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent(AUDIT_LOGS_UPDATED_EVENT));
    }
  }, []);

  return { logs, clearLogs };
}

/**
 * Hook to consume and manage OPD in real-time
 */
export function useOpdList() {
  const [opdList, setOpdList] = useState<OpdItem[]>(DEFAULT_OPD_LIST);
  const { services } = useServices();

  useEffect(() => {
    setOpdList(getStoredOpd());

    // Fetch fresh OPD list from database via API
    fetch("/api/opd")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setOpdList(res.data);
          saveStoredOpd(res.data);
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      setOpdList(getStoredOpd());
    };

    window.addEventListener(OPD_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(OPD_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Compute live service counts for each OPD
  const opdWithServiceCounts = opdList.map((opd) => {
    const count = services.filter((s) => {
      const matchShort =
        opd.shortName &&
        s.agency?.toLowerCase().includes(opd.shortName.toLowerCase());
      const matchName =
        s.agency?.toLowerCase().includes(opd.name.toLowerCase()) ||
        opd.name.toLowerCase().includes(s.agency?.toLowerCase());
      return matchShort || matchName;
    }).length;
    return {
      ...opd,
      serviceCount: count,
    };
  });

  const addOpd = useCallback((newOpd: Partial<OpdItem>) => {
    const current = getStoredOpd();
    const item: OpdItem = {
      id: `opd-${Date.now()}`,
      name: newOpd.name || "Perangkat Daerah Baru",
      shortName: newOpd.shortName || "",
      category: newOpd.category || "Dinas",
      headOfAgency: newOpd.headOfAgency || "-",
      address: newOpd.address || "Kabupaten Bekasi",
      email: newOpd.email || "-",
      phone: newOpd.phone || "-",
      website: newOpd.website || "",
      status: newOpd.status || "active",
      lastAudit: "Hari ini",
    };
    const updated = [item, ...current];
    saveStoredOpd(updated);

    addAuditLog({
      action: "CREATE",
      entity: "OPD",
      entityId: item.id,
      details: `OPD baru ditambahkan: "${item.name}" (${item.category})`,
      performedBy: "Admin Diskominfosantik",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).catch(() => {});
    }
  }, []);

  const updateOpd = useCallback((id: string, updates: Partial<OpdItem>) => {
    const current = getStoredOpd();
    const updated = current.map((o) => (o.id === id ? { ...o, ...updates } : o));
    saveStoredOpd(updated);

    addAuditLog({
      action: "UPDATE",
      entity: "OPD",
      entityId: id,
      details: `Pembaruan data instansi OPD "${updates.name || id}"`,
      performedBy: "Admin Diskominfosantik",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/opd", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      }).catch(() => {});
    }
  }, []);

  const deleteOpd = useCallback((id: string) => {
    const current = getStoredOpd();
    const target = current.find((o) => o.id === id);
    const updated = current.filter((o) => o.id !== id);
    saveStoredOpd(updated);

    addAuditLog({
      action: "DELETE",
      entity: "OPD",
      entityId: id,
      details: `Instansi OPD "${target?.name || id}" dihapus dari sistem`,
      performedBy: "Admin Diskominfosantik",
    });

    if (typeof fetch !== "undefined") {
      fetch(`/api/opd?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }, []);

  const syncWithServices = useCallback(() => {
    const current = getStoredOpd();
    const synced = syncOpdWithServices(current);
    saveStoredOpd(synced);
    setOpdList(synced);
    addAuditLog({
      action: "UPDATE",
      entity: "OPD",
      details: `Sinkronisasi dinamis seluruh OPD dari katalog layanan (${synced.length} OPD terhubung)`,
      performedBy: "Admin Diskominfosantik",
    });
    return synced;
  }, []);

  return {
    opdList: opdWithServiceCounts,
    addOpd,
    updateOpd,
    deleteOpd,
    syncWithServices,
  };
}

/**
 * Hook to consume & manage Admin and OPD user accounts in real-time
 */
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(() => getStoredAdminUsers());

  useEffect(() => {
    setUsers(getStoredAdminUsers());

    // Fetch fresh users from database via API
    fetch("/api/users")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setUsers(res.data);
          saveStoredAdminUsers(res.data);
        }
      })
      .catch(() => {});

    const handleUpdate = (e?: Event) => {
      const customEvent = e as CustomEvent<AdminUser[]>;
      if (customEvent?.detail) {
        setUsers(customEvent.detail);
      } else {
        setUsers(getStoredAdminUsers());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_USERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUsers(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(ADMIN_USERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(ADMIN_USERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addUser = useCallback((data: Partial<AdminUser>): AdminUser => {
    const current = getStoredAdminUsers();
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      name: data.name || (data.agency ? `Admin ${data.agency}` : "Admin Baru"),
      username: data.username || data.email?.split("@")[0] || `admin_${Date.now()}`,
      email: data.email || "admin@bekasikab.go.id",
      agency: data.agency || "Diskominfosantik",
      role: data.role || "Admin OPD",
      status: data.status || "active",
      lastLogin: "Belum pernah",
      phone: data.phone || "-",
    };
    const updated = [newUser, ...current];
    saveStoredAdminUsers(updated);
    setUsers(updated);

    addAuditLog({
      action: "CREATE",
      entity: "USER",
      entityId: newUser.id,
      details: `Akun admin baru dibuat: ${newUser.name} (@${newUser.username} - ${newUser.role})`,
      performedBy: "Super Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).catch(() => {});
    }

    return newUser;
  }, []);

  const updateUser = useCallback(
    (id: string, updates: Partial<AdminUser>): AdminUser | null => {
      const current = getStoredAdminUsers();
      let updatedUser: AdminUser | null = null;
      const updated = current.map((u) => {
        if (u.id === id) {
          const { password: _p, ...safeUpdates } = updates;
          updatedUser = {
            ...u,
            ...safeUpdates,
          };
          return updatedUser;
        }
        return u;
      });

      if (updatedUser) {
        saveStoredAdminUsers(updated);
        setUsers(updated);
        addAuditLog({
          action: "UPDATE",
          entity: "USER",
          entityId: id,
          details: `Perubahan akun admin: ${(updatedUser as AdminUser).name} (${(updatedUser as AdminUser).role})`,
          performedBy: "Super Admin SPBE",
        });

        if (typeof fetch !== "undefined") {
          fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...updates }),
          }).catch(() => {});
        }
      }

      return updatedUser;
    },
    []
  );

  const toggleUserStatus = useCallback((id: string) => {
    const current = getStoredAdminUsers();
    let newStatus: "active" | "inactive" = "active";
    let targetName = "";
    const updated = current.map((u) => {
      if (u.id === id) {
        newStatus = u.status === "active" ? "inactive" : "active";
        targetName = u.name;
        return { ...u, status: newStatus };
      }
      return u;
    });

    saveStoredAdminUsers(updated);
    setUsers(updated);

    addAuditLog({
      action: "STATUS_CHANGE",
      entity: "USER",
      entityId: id,
      details: `Status akun admin "${targetName}" diubah menjadi ${newStatus === "active" ? "Aktif" : "Nonaktif"}`,
      performedBy: "Super Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      }).catch(() => {});
    }
  }, []);

  const deleteUser = useCallback((id: string): boolean => {
    const current = getStoredAdminUsers();
    const target = current.find((u) => u.id === id);
    const updated = current.filter((u) => u.id !== id);

    if (updated.length !== current.length) {
      saveStoredAdminUsers(updated);
      setUsers(updated);
      addAuditLog({
        action: "DELETE",
        entity: "USER",
        entityId: id,
        details: `Akun admin "${target?.name || id}" dihapus dari sistem`,
        performedBy: "Super Admin SPBE",
      });

      if (typeof fetch !== "undefined") {
        fetch(`/api/users?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      return true;
    }
    return false;
  }, []);

  const resetUsersToDefault = useCallback(() => {
    saveStoredAdminUsers(SAFE_DEFAULT_ADMIN_PROFILES);
    setUsers(SAFE_DEFAULT_ADMIN_PROFILES);
    addAuditLog({
      action: "UPDATE",
      entity: "USER",
      details: "Daftar akun admin OPD direset ke data default",
      performedBy: "Super Admin SPBE",
    });
  }, []);

  return {
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    resetUsersToDefault,
  };
}

/**
 * Hook to consume & update system settings in real-time
 */
export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());

    // Fetch fresh settings from database via API
    fetch("/api/settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          saveStoredSettings(res.data);
        }
      })
      .catch(() => {});

    const handleUpdate = (e?: Event) => {
      const customEvent = e as CustomEvent<SystemSettings>;
      if (customEvent?.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getStoredSettings());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        setSettings(getStoredSettings());
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
    const current = getStoredSettings();
    const merged = { ...current, ...updates };
    saveStoredSettings(merged);
    setSettings(merged);

    if (typeof fetch !== "undefined") {
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      }).catch(() => {});
    }

    return merged;
  }, []);

  const resetSettingsToDefault = useCallback(() => {
    saveStoredSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }, []);

  return {
    settings,
    updateSettings,
    resetSettingsToDefault,
  };
}

export interface ApplicationStats {
  total: number;
  active: number;
  maintenance: number;
  development: number;
  g2c: number; // Layanan Masyarakat
  g2b: number; // Pelaku Usaha / Bisnis
  g2g: number; // Tata Kelola / Antar Instansi
  g2e: number; // Kepegawaian / ASN
}

/**
 * Hook to consume & manage SPBE Integrated Applications with classification & real-time sync
 */
export function useApplications() {
  const {
    services,
    isLoading,
    addService,
    updateService,
    updateServiceStatus,
    deleteService,
  } = useServices();

  // Compute application stats
  const stats: ApplicationStats = {
    total: services.length,
    active: services.filter((s) => s.status === "active").length,
    maintenance: services.filter((s) => s.status === "maintenance").length,
    development: services.filter((s) => s.status === "development").length,
    g2c: services.filter(
      (s) =>
        s.category?.includes("Kependudukan") ||
        s.category?.includes("Kesehatan") ||
        s.category?.includes("Sosial") ||
        s.category?.includes("Pendidikan")
    ).length,
    g2b: services.filter(
      (s) =>
        s.category?.includes("Pajak") ||
        s.category?.includes("Perizinan") ||
        s.category?.includes("Investasi")
    ).length,
    g2g: services.filter(
      (s) =>
        s.category?.includes("Administrasi") ||
        s.category?.includes("Perencanaan") ||
        s.serviceType?.includes("Internal")
    ).length,
    g2e: services.filter(
      (s) =>
        s.category?.includes("Kepegawaian") ||
        s.description?.toLowerCase().includes("asn") ||
        s.name?.toLowerCase().includes("bkpsdm")
    ).length,
  };

  return {
    applications: services,
    stats,
    isLoading,
    addApplication: addService,
    updateApplication: updateService,
    updateApplicationStatus: updateServiceStatus,
    deleteApplication: deleteService,
  };
}

// ============================================================================
// SPBE EVALUATION & INDEX STORE
// ============================================================================

export const DEFAULT_SPBE_DATA: SpbeAnnualRecord[] = [...spbeAnnualData];

export function getStoredSpbeData(): SpbeAnnualRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_SPBE_DATA;
  }
  try {
    const raw = localStorage.getItem(SPBE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.tahun - a.tahun);
      }
    }
  } catch (e) {
    console.warn("Failed to read SPBE data from localStorage:", e);
  }
  return DEFAULT_SPBE_DATA;
}

export function saveStoredSpbeData(data: SpbeAnnualRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const sorted = [...data].sort((a, b) => b.tahun - a.tahun);
    localStorage.setItem(SPBE_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(
      new CustomEvent(SPBE_UPDATED_EVENT, { detail: sorted })
    );
  } catch (e) {
    console.error("Failed to save SPBE data to localStorage:", e);
  }
}

export function useSpbeData() {
  const [spbeData, setSpbeData] = useState<SpbeAnnualRecord[]>(DEFAULT_SPBE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = useCallback(() => {
    setSpbeData(getStoredSpbeData());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reloadData();

    // Fetch fresh SPBE evaluation data from database via API
    fetch("/api/spbe")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSpbeData(res.data);
          saveStoredSpbeData(res.data);
        }
      })
      .catch(() => {});

    const handleCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<SpbeAnnualRecord[]>;
      if (customEvent.detail) {
        setSpbeData(customEvent.detail);
      } else {
        reloadData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SPBE_STORAGE_KEY) {
        reloadData();
      }
    };

    window.addEventListener(SPBE_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(SPBE_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [reloadData]);

  const updateSpbeRecord = useCallback((record: SpbeAnnualRecord) => {
    const current = getStoredSpbeData();
    const existingIndex = current.findIndex((item) => item.tahun === record.tahun);
    let updated: SpbeAnnualRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    updated.sort((a, b) => b.tahun - a.tahun);
    saveStoredSpbeData(updated);
    setSpbeData(updated);

    addAuditLog({
      action: "UPDATE",
      entity: "SPBE",
      entityId: String(record.tahun),
      details: `Pembaruan Evaluasi Indeks SPBE Tahun ${record.tahun}: Skor ${record.indeks.toFixed(2)} (${record.predikat})`,
      performedBy: "Super Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/spbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  }, []);

  const addSpbeRecord = useCallback((record: SpbeAnnualRecord) => {
    const current = getStoredSpbeData();
    const filtered = current.filter((item) => item.tahun !== record.tahun);
    const updated = [record, ...filtered].sort((a, b) => b.tahun - a.tahun);
    saveStoredSpbeData(updated);
    setSpbeData(updated);

    addAuditLog({
      action: "CREATE",
      entity: "SPBE",
      entityId: String(record.tahun),
      details: `Tahun evaluasi SPBE baru ditambahkan: Tahun ${record.tahun} (Skor ${record.indeks.toFixed(2)})`,
      performedBy: "Super Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/spbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  }, []);

  const deleteSpbeRecord = useCallback((tahun: number) => {
    const current = getStoredSpbeData();
    const updated = current.filter((item) => item.tahun !== tahun);
    saveStoredSpbeData(updated);
    setSpbeData(updated);

    addAuditLog({
      action: "DELETE",
      entity: "SPBE",
      entityId: String(tahun),
      details: `Tahun evaluasi SPBE ${tahun} dihapus dari riwayat`,
      performedBy: "Super Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/spbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  }, []);

  const resetSpbeToDefault = useCallback(() => {
    saveStoredSpbeData(DEFAULT_SPBE_DATA);
    setSpbeData(DEFAULT_SPBE_DATA);

    addAuditLog({
      action: "UPDATE",
      entity: "SPBE",
      details: "Data Evaluasi & Indeks SPBE direset ke nilai standar bawaan",
      performedBy: "Super Admin SPBE",
    });
  }, []);

  const latestSpbe = spbeData[0] || DEFAULT_SPBE_DATA[0];
  const previousSpbe = spbeData.find((s) => s.tahun === latestSpbe.tahun - 1) || spbeData[1];

  return {
    spbeData,
    latestSpbe,
    previousSpbe,
    isLoading,
    updateSpbeRecord,
    addSpbeRecord,
    deleteSpbeRecord,
    resetSpbeToDefault,
  };
}

// ============================================================================
// HELP & FAQ STORE
// ============================================================================

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "akun",
    question: "Apa itu Portal SPBE Kabupaten Bekasi?",
    answer:
      "Portal SPBE (Sistem Pemerintahan Berbasis Elektronik) adalah gerbang utama yang mengintegrasikan seluruh aplikasi dan layanan digital dari berbagai instansi (OPD) di lingkup Pemerintah Kabupaten Bekasi. Warga dapat menemukan semua layanan dari satu tempat terpusat.",
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    category: "akun",
    question: "Apakah saya harus membuat akun untuk menggunakan layanan?",
    answer:
      "Untuk mengakses informasi dasar, Anda tidak perlu membuat akun. Namun, untuk mengajukan permohonan spesifik atau menggunakan layanan administrasi (seperti Banpin, Pajak Daerah, dll), Anda mungkin diarahkan untuk masuk atau mendaftar di masing-masing aplikasi tersebut.",
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    category: "pengaduan",
    question: "Aplikasi apa yang harus saya gunakan untuk pengaduan?",
    answer:
      "Untuk pengaduan, Anda dapat menggunakan aplikasi Bebunge (Bekasi Nyambung Bae) atau SP4N Lapor yang tersedia di portal ini. Layanan tersebut memfasilitasi komunikasi dua arah antara masyarakat dan pemerintah daerah.",
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    category: "teknis",
    question: "Bagaimana jika link layanan tidak bisa diakses atau error?",
    answer:
      "Jika Anda menemukan link layanan yang rusak, sedang dalam perbaikan, atau mengalami kendala teknis, Anda dapat melaporkannya melalui kanal pengaduan resmi atau langsung menghubungi tim Diskominfosantik Kabupaten Bekasi.",
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    category: "layanan",
    question: "Ke mana saya bisa menghubungi jika masih mengalami kendala?",
    answer:
      "Anda dapat menghubungi Call Center 112 (bebas pulsa) atau mengirim email ke helpdesk@bekasikab.go.id. Layanan helpdesk tersedia pada hari kerja Senin-Jumat pukul 08.00-16.00 WIB.",
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    category: "layanan",
    question: "Apakah layanan di portal ini dipungut biaya?",
    answer:
      "Sebagian besar layanan administrasi dan publik yang disediakan oleh Pemerintah Kabupaten Bekasi bersifat gratis. Jika ada layanan yang memerlukan biaya (seperti retribusi atau pajak), hal itu akan dijelaskan secara transparan di dalam sistem layanan terkait.",
    order: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-7",
    category: "teknis",
    question: "Bagaimana cara mengakses layanan digital dari perangkat seluler?",
    answer:
      "Seluruh layanan di portal SPBE dapat diakses melalui browser di perangkat seluler (smartphone/tablet). Beberapa layanan juga menyediakan aplikasi mobile yang dapat diunduh melalui Google Play Store atau Apple App Store.",
    order: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-8",
    category: "lainnya",
    question: "Apakah data pribadi saya aman di portal ini?",
    answer:
      "Pemerintah Kabupaten Bekasi berkomitmen menjaga keamanan data pribadi pengguna sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP). Setiap layanan menerapkan enkripsi dan standar keamanan yang berlaku.",
    order: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getStoredFaqs(): FaqItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_FAQS;
  }
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.order - b.order);
      }
    }
  } catch (e) {
    console.warn("Failed to read FAQ from localStorage:", e);
  }
  return DEFAULT_FAQS;
}

export function saveStoredFaqs(faqs: FaqItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const sorted = [...faqs].sort((a, b) => a.order - b.order);
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(
      new CustomEvent(FAQ_UPDATED_EVENT, { detail: sorted })
    );
  } catch (e) {
    console.error("Failed to save FAQ to localStorage:", e);
  }
}

export function useFaqs() {
  const [faqs, setFaqs] = useState<FaqItem[]>(() => getStoredFaqs());
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = useCallback(() => {
    setFaqs(getStoredFaqs());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reloadData();

    // Fetch fresh FAQ data from database via API
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
          saveStoredFaqs(res.data);
        }
      })
      .catch(() => {});

    const handleCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<FaqItem[]>;
      if (customEvent.detail) {
        setFaqs(customEvent.detail);
      } else {
        reloadData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAQ_STORAGE_KEY) {
        reloadData();
      }
    };

    window.addEventListener(FAQ_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(FAQ_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [reloadData]);

  const addFaq = useCallback((data: Omit<FaqItem, "id">) => {
    const current = getStoredFaqs();
    const newFaq: FaqItem = {
      ...data,
      id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: data.order || current.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...current, newFaq].sort((a, b) => a.order - b.order);
    saveStoredFaqs(updated);
    setFaqs(updated);

    addAuditLog({
      action: "CREATE",
      entity: "FAQ",
      entityId: newFaq.id,
      details: `FAQ baru ditambahkan: "${newFaq.question.slice(0, 45)}..."`,
      performedBy: "Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      }).catch(() => {});
    }
  }, []);

  const updateFaq = useCallback((id: string, updates: Partial<FaqItem>) => {
    const current = getStoredFaqs();
    const updated = current.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    );
    saveStoredFaqs(updated);
    setFaqs(updated);

    const target = updated.find((item) => item.id === id);
    addAuditLog({
      action: "UPDATE",
      entity: "FAQ",
      entityId: id,
      details: `FAQ diperbarui: "${target?.question?.slice(0, 45) || id}"`,
      performedBy: "Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      }).catch(() => {});
    }
  }, []);

  const toggleFaqActive = useCallback((id: string) => {
    const current = getStoredFaqs();
    let newStatus = true;
    let targetQuestion = "";
    const updated = current.map((item) => {
      if (item.id === id) {
        newStatus = !item.isActive;
        targetQuestion = item.question;
        return { ...item, isActive: newStatus, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    saveStoredFaqs(updated);
    setFaqs(updated);

    addAuditLog({
      action: "STATUS_CHANGE",
      entity: "FAQ",
      entityId: id,
      details: `Status FAQ "${targetQuestion.slice(0, 35)}..." diubah menjadi ${newStatus ? "Aktif" : "Nonaktif"}`,
      performedBy: "Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      }).catch(() => {});
    }
  }, []);

  const deleteFaq = useCallback((id: string) => {
    const current = getStoredFaqs();
    const target = current.find((item) => item.id === id);
    const updated = current.filter((item) => item.id !== id);
    saveStoredFaqs(updated);
    setFaqs(updated);

    addAuditLog({
      action: "DELETE",
      entity: "FAQ",
      entityId: id,
      details: `FAQ dihapus: "${target?.question?.slice(0, 40) || id}"`,
      performedBy: "Admin SPBE",
    });

    if (typeof fetch !== "undefined") {
      fetch(`/api/faqs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }, []);

  const resetFaqsToDefault = useCallback(() => {
    saveStoredFaqs(DEFAULT_FAQS);
    setFaqs(DEFAULT_FAQS);

    addAuditLog({
      action: "UPDATE",
      entity: "FAQ",
      details: "Daftar Pusat Bantuan & FAQ direset ke nilai standar",
      performedBy: "Admin SPBE",
    });
  }, []);

  return {
    faqs,
    isLoading,
    addFaq,
    updateFaq,
    toggleFaqActive,
    deleteFaq,
    resetFaqsToDefault,
  };
}

// ============================================================================
// ============================================================================
// CURRENT ADMIN & RBAC MANAGEMENT HOOK
// ============================================================================

export const DEFAULT_CURRENT_ADMIN: CurrentAdminInfo = {
  name: "Diskominfosantik",
  username: "admin_kominfo",
  email: "admin@bekasikab.go.id",
  role: "Super Admin",
  agency: "Diskominfosantik",
};

export const ADMIN_TOKEN_KEY = "spbe_admin_token";
export const ADMIN_COOKIE_SESSION_KEY = "spbe_admin_session";
export const ADMIN_COOKIE_ROLE_KEY = "spbe_admin_role";

// Cookie helpers for SSR & Edge Middleware Synchronization
export function setAdminCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
  } catch (e) {
    console.warn("Failed to set cookie:", e);
  }
}

export function getAdminCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function removeAdminCookie(name: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (e) {
    console.warn("Failed to remove cookie:", e);
  }
}

/**
 * Validates whether an active, authenticated admin session exists in storage
 */
export function isAuthenticatedAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hasToken = Boolean(
      sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
      localStorage.getItem(ADMIN_TOKEN_KEY) ||
      getAdminCookie(ADMIN_TOKEN_KEY)
    );
    const hasUser = Boolean(
      sessionStorage.getItem(CURRENT_ADMIN_STORAGE_KEY) ||
      localStorage.getItem(CURRENT_ADMIN_STORAGE_KEY) ||
      getAdminCookie(ADMIN_COOKIE_SESSION_KEY)
    );
    return hasToken && hasUser;
  } catch {
    return false;
  }
}

/**
 * Derives a dynamic 2-character initials string from an agency or admin name
 * e.g., "Disdukcapil" -> "DI", "Dinas Kesehatan" -> "DK", "Badan Pendapatan Daerah" -> "BP"
 */
export function getAdminInitials(nameOrAgency?: string): string {
  if (!nameOrAgency) return "AD";
  const clean = nameOrAgency.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return clean.slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Retrieves the currently active admin session with multi-tier fallback:
 * 1. sessionStorage (active tab state)
 * 2. localStorage (preserved across tab/browser refresh)
 * 3. document.cookie (SSR & Edge Middleware synced)
 */
export function getCurrentAdmin(): CurrentAdminInfo {
  if (typeof window === "undefined") return DEFAULT_CURRENT_ADMIN;
  try {
    // 1. Try sessionStorage
    let raw = sessionStorage.getItem(CURRENT_ADMIN_STORAGE_KEY);

    // 2. Fallback to localStorage if sessionStorage is empty (e.g. after F5 or new tab)
    if (!raw) {
      raw = localStorage.getItem(CURRENT_ADMIN_STORAGE_KEY);
      if (raw) {
        sessionStorage.setItem(CURRENT_ADMIN_STORAGE_KEY, raw);
      }
    }

    // 3. Fallback to synced cookie
    if (!raw) {
      raw = getAdminCookie(ADMIN_COOKIE_SESSION_KEY);
      if (raw) {
        sessionStorage.setItem(CURRENT_ADMIN_STORAGE_KEY, raw);
        localStorage.setItem(CURRENT_ADMIN_STORAGE_KEY, raw);
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.role === "Super Admin" || parsed.role === "Admin OPD")) {
        const adminData: CurrentAdminInfo = {
          name: parsed.name || parsed.agency || "Diskominfosantik",
          username: parsed.username || "admin_kominfo",
          email: parsed.email || "admin@bekasikab.go.id",
          role: parsed.role,
          agency: parsed.agency || "Diskominfosantik",
        };

        // Ensure token & cookies are synced
        const existingToken =
          sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
          localStorage.getItem(ADMIN_TOKEN_KEY) ||
          getAdminCookie(ADMIN_TOKEN_KEY);

        if (existingToken) {
          sessionStorage.setItem(ADMIN_TOKEN_KEY, existingToken);
          localStorage.setItem(ADMIN_TOKEN_KEY, existingToken);
          setAdminCookie(ADMIN_TOKEN_KEY, existingToken, 7);
          setAdminCookie(ADMIN_COOKIE_SESSION_KEY, JSON.stringify(adminData), 7);
          setAdminCookie(ADMIN_COOKIE_ROLE_KEY, adminData.role, 7);
        }

        return adminData;
      }
    }
  } catch (e) {
    console.warn("Failed to get current admin:", e);
  }
  return DEFAULT_CURRENT_ADMIN;
}

/**
 * Persists the admin session across all storage tiers:
 * - sessionStorage (tab isolation)
 * - localStorage (persistence across F5 refresh & tab close)
 * - document.cookie (accessible by Next.js Edge Middleware)
 */
export function saveCurrentAdmin(admin: CurrentAdminInfo, rememberMe = true): void {
  if (typeof window === "undefined") return;
  try {
    const stringified = JSON.stringify(admin);

    // 1. Write to sessionStorage
    sessionStorage.setItem(CURRENT_ADMIN_STORAGE_KEY, stringified);

    // 2. Write to localStorage for persistent refresh tolerance
    if (rememberMe) {
      localStorage.setItem(CURRENT_ADMIN_STORAGE_KEY, stringified);
    }

    // 3. Ensure a persistent token exists
    let token =
      localStorage.getItem(ADMIN_TOKEN_KEY) ||
      sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
      getAdminCookie(ADMIN_TOKEN_KEY);

    if (!token) {
      token = `spbe_token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);

    // 4. Set cookies for Next.js Edge Middleware & SSR
    setAdminCookie(ADMIN_TOKEN_KEY, token, rememberMe ? 7 : 1);
    setAdminCookie(ADMIN_COOKIE_SESSION_KEY, stringified, rememberMe ? 7 : 1);
    setAdminCookie(ADMIN_COOKIE_ROLE_KEY, admin.role, rememberMe ? 7 : 1);

    // 5. Broadcast real-time sync event across application components
    window.dispatchEvent(
      new CustomEvent(CURRENT_ADMIN_UPDATED_EVENT, { detail: admin })
    );
  } catch (e) {
    console.error("Failed to save current admin:", e);
  }
}

/**
 * Cleanly clears all admin session credentials from every storage tier and cookies
 */
export function clearCurrentAdmin(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CURRENT_ADMIN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);

    removeAdminCookie(ADMIN_TOKEN_KEY);
    removeAdminCookie(ADMIN_COOKIE_SESSION_KEY);
    removeAdminCookie(ADMIN_COOKIE_ROLE_KEY);

    // Securely clear server-side HttpOnly cookies
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});

    window.dispatchEvent(
      new CustomEvent(CURRENT_ADMIN_UPDATED_EVENT, { detail: DEFAULT_CURRENT_ADMIN })
    );
  } catch (e) {
    console.error("Failed to clear current admin:", e);
  }
}

export function useCurrentAdmin() {
  const [currentAdmin, setCurrentAdminState] = useState<CurrentAdminInfo>(() =>
    getCurrentAdmin()
  );

  useEffect(() => {
    setCurrentAdminState(getCurrentAdmin());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setCurrentAdminState(e.detail);
      } else {
        setCurrentAdminState(getCurrentAdmin());
      }
    };

    window.addEventListener(CURRENT_ADMIN_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CURRENT_ADMIN_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const setCurrentAdmin = useCallback((admin: CurrentAdminInfo, rememberMe = true) => {
    saveCurrentAdmin(admin, rememberMe);
    setCurrentAdminState(admin);
  }, []);

  const logout = useCallback(() => {
    clearCurrentAdmin();
    setCurrentAdminState(DEFAULT_CURRENT_ADMIN);
  }, []);

  const switchAdminRole = useCallback(
    (role: "Super Admin" | "Admin OPD", agency?: string) => {
      const targetAgency =
        agency || (role === "Super Admin" ? "Diskominfosantik" : "Dinas Kesehatan");
      const updated: CurrentAdminInfo = {
        ...currentAdmin,
        role,
        agency: targetAgency,
        name: targetAgency,
        username: role === "Super Admin" ? "admin_kominfo" : `admin_${targetAgency.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      };
      saveCurrentAdmin(updated, true);
      setCurrentAdminState(updated);
    },
    [currentAdmin]
  );

  const isSuperAdmin = currentAdmin.role === "Super Admin";
  const authenticated = typeof window !== "undefined" ? isAuthenticatedAdmin() : false;

  return {
    currentAdmin,
    isSuperAdmin,
    isAuthenticated: authenticated,
    setCurrentAdmin,
    switchAdminRole,
    logout,
  };
}
