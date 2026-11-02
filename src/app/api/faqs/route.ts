import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FAQS } from "@/data/initialData";

export async function GET() {
  try {
    const list = await prisma.faq.findMany({
      orderBy: { order: "asc" },
    });

    if (list && list.length > 0) {
      return NextResponse.json({ success: true, data: list, source: "database" });
    }

    return NextResponse.json({ success: true, data: DEFAULT_FAQS, source: "fallback" });
  } catch (error) {
    console.warn("Prisma FAQ query fallback:", error);
    return NextResponse.json({ success: true, data: DEFAULT_FAQS, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category = "layanan", question, answer, order = 0, isActive = true } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Pertanyaan dan jawaban wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.faq.create({
      data: {
        category,
        question,
        answer,
        order: Number(order) || 0,
        isActive: Boolean(isActive),
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entity: "FAQ",
          entityId: created.id,
          details: `Pertanyaan baru ditambahkan: "${created.question}"`,
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
      { success: false, error: error.message || "Gagal membuat FAQ" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if bulk reorder
    if (Array.isArray(body)) {
      for (const item of body) {
        if (item.id) {
          await prisma.faq.update({
            where: { id: item.id },
            data: {
              ...(item.order !== undefined && { order: item.order }),
              ...(item.isActive !== undefined && { isActive: item.isActive }),
            },
          });
        }
      }
      return NextResponse.json({ success: true, message: "Urutan FAQ berhasil diperbarui" });
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID FAQ wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.faq.update({
      where: { id },
      data: updates,
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "FAQ",
          entityId: id,
          details: `FAQ diperbarui: "${updated.question}"`,
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
      { success: false, error: error.message || "Gagal memperbarui FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID FAQ wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.faq.findUnique({ where: { id } });

    await prisma.faq.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          entity: "FAQ",
          entityId: id,
          details: `FAQ dihapus: "${existing?.question || id}"`,
          performedBy: "Admin",
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "FAQ berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus FAQ" },
      { status: 500 }
    );
  }
}

