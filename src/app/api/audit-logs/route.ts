import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.warn("Prisma audit logs fallback:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, entity, entityId, details, performedBy = "Admin" } = body;

    const log = await prisma.auditLog.create({
      data: {
        action: action || "UPDATE",
        entity: entity || "SYSTEM",
        entityId: entityId || null,
        details: details || "-",
        performedBy,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencatat audit log" },
      { status: 500 }
    );
  }
}

