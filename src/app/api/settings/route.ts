import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/data/initialData";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "general" },
    });

    if (setting && setting.value) {
      return NextResponse.json({ success: true, data: setting.value, source: "database" });
    }

    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS, source: "fallback" });
  } catch (error) {
    console.warn("Prisma settings query fallback:", error);
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS, source: "fallback" });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const saved = await prisma.systemSetting.upsert({
      where: { key: "general" },
      update: { value: body },
      create: { key: "general", value: body },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "SETTINGS",
          details: "Konfigurasi sistem portal SPBE diperbarui",
          performedBy: "Super Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: saved.value });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}

