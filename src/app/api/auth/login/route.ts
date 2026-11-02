import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAdminCredentials } from "@/lib/server/auth";
import { createSignedToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, rememberMe = true } = body;

    const validation = await validateAdminCredentials(identifier, password);
    if (!validation.success || !validation.user) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error || "Autentikasi gagal. Silakan periksa kembali kredensial Anda.",
        },
        { status: 401 }
      );
    }

    const user = validation.user;
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days vs 1 day
    const exp = Math.floor(Date.now() / 1000) + maxAge;

    // Create cryptographically signed token
    const token = await createSignedToken({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      agency: user.agency,
      exp,
    });

    const response = NextResponse.json({
      success: true,
      user,
      token,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 1. Critical Security: Set HttpOnly, tamper-proof signed token cookie
    response.cookies.set("spbe_admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // 2. Set synced session metadata cookie
    response.cookies.set("spbe_admin_session", JSON.stringify(user), {
      httpOnly: false, // Accessible by UI client for fast hydrated state
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // 3. Set role cookie for informational UI display
    response.cookies.set("spbe_admin_role", user.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal pada server saat memproses login.",
      },
      { status: 500 }
    );
  }
}
