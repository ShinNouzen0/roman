import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("spbe_admin_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const payload = await verifySignedToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: payload.userId,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      agency: payload.agency,
    },
  });
}
