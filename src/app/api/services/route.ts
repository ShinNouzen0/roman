import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockServices } from "@/data/mockData";
import { DigitalService } from "@/types";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (services && services.length > 0) {
      const formatted: DigitalService[] = services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        serviceType: s.serviceType as "Layanan Publik" | "Administrasi Pemerintahan",
        category: s.category,
        agency: s.agency,
        manager: s.manager || undefined,
        logo: s.logo,
        url: s.url,
        status: s.status as "active" | "maintenance" | "inactive" | "development",
        users: s.users || undefined,
        lastUpdated: s.lastUpdated || undefined,
        contactEmail: s.contactEmail || undefined,
        contactPhone: s.contactPhone || undefined,
        isFeatured: s.isFeatured,
      }));
      return NextResponse.json({ success: true, data: formatted, source: "database" });
    }

    // Fallback if DB table is empty yet
    return NextResponse.json({ success: true, data: mockServices, source: "fallback" });
  } catch (error) {
    console.warn("Prisma services query fallback:", error);
    return NextResponse.json({ success: true, data: mockServices, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description = "",
      serviceType = "Layanan Publik",
      category = "Administrasi & Umum",
      agency = "Diskominfosantik",
      url = "#",
      status = "active",
      logo = "/logos/default.png",
      contactEmail = "-",
      contactPhone = "-",
      manager,
      users = "0",
      isFeatured = false,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama layanan wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.service.create({
      data: {
        name,
        description,
        serviceType,
        category,
        agency,
        url,
        status,
        logo,
        contactEmail,
        contactPhone,
        manager: manager || null,
        users,
        lastUpdated: "Baru saja",
        isFeatured: Boolean(isFeatured),
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entity: "SERVICE",
          entityId: created.id,
          details: `Layanan baru ditambahkan: "${created.name}" (${created.agency})`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat layanan" },
      { status: 500 }
    );
  }
}

