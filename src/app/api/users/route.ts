import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SAFE_DEFAULT_ADMIN_PROFILES } from "@/services/serviceStore";

export async function GET() {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        agency: true,
        role: true,
        status: true,
        lastLogin: true,
        phone: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (users && users.length > 0) {
      return NextResponse.json({ success: true, data: users, source: "database" });
    }

    return NextResponse.json({ success: true, data: SAFE_DEFAULT_ADMIN_PROFILES, source: "fallback" });
  } catch (error) {
    console.warn("Prisma users query fallback:", error);
    return NextResponse.json({ success: true, data: SAFE_DEFAULT_ADMIN_PROFILES, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      username,
      email,
      password = "admin123",
      agency,
      role = "Admin OPD",
      status = "active",
      phone,
    } = body;

    if (!name || !username || !email) {
      return NextResponse.json(
        { success: false, error: "Nama, username, dan email wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.adminUser.create({
      data: {
        name,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        passwordHash: password,
        agency: agency || name,
        role,
        status,
        phone: phone || null,
        lastLogin: "Baru saja terdaftar",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        agency: true,
        role: true,
        status: true,
        lastLogin: true,
        phone: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entity: "USER",
          entityId: created.id,
          details: `Akun administrator baru ditambahkan: "${created.name}" (${created.username})`,
          performedBy: "Super Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat akun admin" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID user wajib diisi" }, { status: 400 });
    }

    const dataToUpdate: any = { ...updates };
    if (password) {
      dataToUpdate.passwordHash = password;
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        agency: true,
        role: true,
        status: true,
        lastLogin: true,
        phone: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "USER",
          entityId: id,
          details: `Akun admin diperbarui: "${updated.name}" (${updated.username})`,
          performedBy: "Super Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui akun admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID user wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { id } });

    await prisma.adminUser.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          entity: "USER",
          entityId: id,
          details: `Akun admin "${existing?.name || id}" dihapus dari sistem`,
          performedBy: "Super Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Akun admin berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus akun admin" },
      { status: 500 }
    );
  }
}

