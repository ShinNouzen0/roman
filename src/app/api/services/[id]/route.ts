import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data layanan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      serviceType,
      category,
      agency,
      manager,
      logo,
      url,
      status,
      contactEmail,
      contactPhone,
      isFeatured,
    } = body;

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(serviceType && { serviceType }),
        ...(category && { category }),
        ...(agency && { agency }),
        ...(manager !== undefined && { manager }),
        ...(logo && { logo }),
        ...(url && { url }),
        ...(status && { status }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        lastUpdated: "Baru saja diperbarui",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "SERVICE",
          entityId: params.id,
          details: `Perubahan data layanan: "${updated.name}" (${updated.agency})`,
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
      { success: false, error: error.message || "Gagal memperbarui layanan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, isFeatured } = body;

    const updateData: any = {
      lastUpdated: "Baru saja diperbarui",
    };

    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
    });

    try {
      const details =
        status !== undefined
          ? `Status layanan "${updated.name}" diubah menjadi: ${status.toUpperCase()}`
          : `${updated.name} ${updated.isFeatured ? "ditambahkan ke" : "dihapus dari"} Layanan Unggulan`;

      await prisma.auditLog.create({
        data: {
          action: status !== undefined ? "STATUS_CHANGE" : "UPDATE",
          entity: "SERVICE",
          entityId: params.id,
          details,
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
      { success: false, error: error.message || "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          entity: "SERVICE",
          entityId: params.id,
          details: `Layanan "${existing.name}" (${existing.agency}) dihapus dari database`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Layanan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus layanan" },
      { status: 500 }
    );
  }
}

