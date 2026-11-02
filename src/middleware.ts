import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedToken } from "@/lib/auth";

// Sensitive routes restricted exclusively to Super Admin role
const RESTRICTED_OPD_ROUTES = [
  "/admin/settings",
  "/admin/logs",
  "/admin/opd",
  "/admin/featured",
  "/admin/spbe",
  "/admin/applications",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("spbe_admin_token")?.value;
  const payload = token ? await verifySignedToken(token) : null;

  // 1. Allow login page or public assets
  if (pathname === "/admin/login") {
    // If already authenticated with valid cryptographically verified token, redirect to /admin
    if (payload) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all administrative (/admin) routes
  if (pathname.startsWith("/admin")) {
    // Check if unauthenticated or token signature is invalid/tampered/expired
    if (!payload) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        // Clear invalid or tampered cookies
        response.cookies.delete("spbe_admin_token");
        response.cookies.delete("spbe_admin_session");
        response.cookies.delete("spbe_admin_role");
      }
      return response;
    }

    // 3. RBAC Enforcement: Determine role STRICTLY from verified cryptographic token payload
    const role = payload.role;
    const isRestrictedRoute = RESTRICTED_OPD_ROUTES.some(
      (restricted) => pathname === restricted || pathname.startsWith(`${restricted}/`)
    );

    if (isRestrictedRoute && role === "Admin OPD") {
      const redirectUrl = new URL("/admin", request.url);
      redirectUrl.searchParams.set("unauthorized", "1");
      redirectUrl.searchParams.set("blockedPath", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

