// Server-Side Authentication & User Validation
// Strictly runs on the server (never bundled into client-side JS)

import { prisma } from "../prisma.ts";

export interface ServerAdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string; // Plaintext or hashed credentials kept exclusively on the server
  agency: string;
  role: "Super Admin" | "Admin OPD";
  status: "active" | "inactive";
  lastLogin?: string;
  phone?: string;
}

export interface SafeAdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  agency: string;
  role: "Super Admin" | "Admin OPD";
  status: "active" | "inactive";
  lastLogin?: string;
}

// Server-side authoritative fallback admin directory
export const SERVER_ADMIN_USERS: ServerAdminUser[] = [
  {
    id: "user-1",
    name: "Diskominfosantik",
    username: "admin_kominfo",
    email: "admin@bekasikab.go.id",
    passwordHash: "admin123",
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
    passwordHash: "admin123",
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
    passwordHash: "admin123",
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
    passwordHash: "admin123",
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
    passwordHash: "admin123",
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
    passwordHash: "admin123",
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
    passwordHash: "admin123",
    agency: "Disnaker",
    role: "Admin OPD",
    status: "active",
    lastLogin: "4 hari lalu",
  },
];

export interface AuthResult {
  success: boolean;
  user?: SafeAdminUser;
  error?: string;
}

/**
 * Validates login credentials strictly on server side.
 * Checks Prisma database (Supabase) first, then falls back to default authoritative directory.
 * Never exposes passwords to client.
 */
export async function validateAdminCredentials(
  identifier: string,
  passwordAttempt: string
): Promise<AuthResult> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPw = (passwordAttempt || "").trim();

  if (!cleanId || !cleanPw) {
    return {
      success: false,
      error: "Mohon lengkapi username/email dan kata sandi Anda.",
    };
  }

  // 1. Try finding user in Supabase via Prisma
  try {
    const dbUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: cleanId }, { email: cleanId }],
      },
    });

    if (dbUser) {
      if (dbUser.passwordHash !== cleanPw) {
        return {
          success: false,
          error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali.",
        };
      }

      if (dbUser.status === "inactive") {
        return {
          success: false,
          error:
            "Akun ini sedang dinonaktifkan oleh Administrator. Hubungi Super Admin untuk mengaktifkannya.",
        };
      }

      // Update lastLogin async
      try {
        await prisma.adminUser.update({
          where: { id: dbUser.id },
          data: { lastLogin: "Baru saja" },
        });
      } catch {
        // non-blocking
      }

      return {
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email,
          agency: dbUser.agency,
          role: dbUser.role as "Super Admin" | "Admin OPD",
          status: dbUser.status as "active" | "inactive",
          lastLogin: "Baru saja",
        },
      };
    }
  } catch (error) {
    // Database query failed or not configured, continue to fallback
  }

  // 2. Fallback to server authoritative directory
  const fallbackUser = SERVER_ADMIN_USERS.find(
    (u) =>
      u.username.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId
  );

  if (!fallbackUser) {
    return {
      success: false,
      error:
        "Akun tidak ditemukan. Pastikan Username atau Email sesuai dengan akun yang terdaftar.",
    };
  }

  // Validate password
  if (fallbackUser.passwordHash !== cleanPw) {
    return {
      success: false,
      error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali.",
    };
  }

  // Check account status
  if (fallbackUser.status === "inactive") {
    return {
      success: false,
      error:
        "Akun ini sedang dinonaktifkan oleh Administrator. Hubungi Super Admin untuk mengaktifkannya.",
    };
  }

  return {
    success: true,
    user: {
      id: fallbackUser.id,
      name: fallbackUser.name,
      username: fallbackUser.username,
      email: fallbackUser.email,
      agency: fallbackUser.agency,
      role: fallbackUser.role,
      status: fallbackUser.status,
      lastLogin: "Baru saja",
    },
  };
}
