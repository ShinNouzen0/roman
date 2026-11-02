import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { spbeAnnualData, SpbeAnnualRecord } from "@/data/spbeData";

export async function GET() {
  try {
    const list = await prisma.spbeRecord.findMany({
      orderBy: { tahun: "desc" },
    });

    if (list && list.length > 0) {
      const formatted: SpbeAnnualRecord[] = list.map((r) => ({
        tahun: r.tahun,
        indeks: r.indeks,
        predikat: r.predikat,
        aspectScores: r.aspectScores,
        domainScores: r.domainScores as { [domainName: string]: number },
      }));
      return NextResponse.json({ success: true, data: formatted, source: "database" });
    }

    return NextResponse.json({ success: true, data: spbeAnnualData, source: "fallback" });
  } catch (error) {
    console.warn("Prisma SPBE query fallback:", error);
    return NextResponse.json({ success: true, data: spbeAnnualData, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if body is an array of records (batch save)
    if (Array.isArray(body)) {
      for (const item of body) {
        if (item.tahun) {
          await prisma.spbeRecord.upsert({
            where: { tahun: item.tahun },
            update: {
              indeks: item.indeks,
              predikat: item.predikat,
              aspectScores: item.aspectScores,
              domainScores: item.domainScores,
            },
            create: {
              tahun: item.tahun,
              indeks: item.indeks,
              predikat: item.predikat,
              aspectScores: item.aspectScores,
              domainScores: item.domainScores,
            },
          });
        }
      }

      try {
        await prisma.auditLog.create({
          data: {
            action: "UPDATE",
            entity: "SPBE",
            details: "Data evaluasi indeks SPBE Kabupaten Bekasi berhasil diperbarui",
            performedBy: "Admin",
            timestamp: new Date().toISOString(),
          },
        });
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, message: "Data SPBE berhasil disimpan" });
    }

    const { tahun, indeks, predikat, aspectScores, domainScores } = body;
    if (!tahun) {
      return NextResponse.json({ success: false, error: "Tahun SPBE wajib diisi" }, { status: 400 });
    }

    const saved = await prisma.spbeRecord.upsert({
      where: { tahun },
      update: {
        indeks,
        predikat,
        aspectScores,
        domainScores,
      },
      create: {
        tahun,
        indeks,
        predikat,
        aspectScores,
        domainScores,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan data SPBE" },
      { status: 500 }
    );
  }
}

