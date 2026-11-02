import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_OPD_LIST } from "@/data/initialData";

export async function GET() {
  try {
    const list = await prisma.opd.findMany({
      orderBy: { name: "asc" },
    });

    if (list && list.length > 0) {
      return NextResponse.json({ success: true, data: list, source: "database" });
    }

    return NextResponse.json({ success: true, data: DEFAULT_OPD_LIST, source: "fallback" });
  } catch (error) {
    console.warn("Prisma OPD query fallback:", error);
    return NextResponse.json({ success: true, data: DEFAULT_OPD_LIST, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      shortName,
      category = "Dinas",
      headOfAgency,
      address,
      email,
      phone,
      website,
      status = "active",
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama OPD wajib diisi" }, { status: 400 });
    }

    const created = await prisma.opd.create({
      data: {
        name,
        shortName: shortName || name,
        category,
        headOfAgency: headOfAgency || null,
        address: address || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        status,
        lastAudit: "Hari ini",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entity: "OPD",
          entityId: created.id,
          details: `Perangkat Daerah baru ditambahkan: "${created.name}"`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambah OPD" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID OPD wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.opd.update({
      where: { id },
      data: {
        ...updates,
        lastAudit: "Hari ini",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "OPD",
          entityId: id,
          details: `Perubahan profil OPD: "${updated.name}"`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui OPD" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID OPD wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.opd.findUnique({ where: { id } });

    await prisma.opd.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          entity: "OPD",
          entityId: id,
          details: `OPD "${existing?.name || id}" dihapus dari sistem`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "OPD berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus OPD" },
      { status: 500 }
    );
  }
}

