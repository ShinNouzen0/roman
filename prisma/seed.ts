import { PrismaClient } from "@prisma/client";
import { mockServices } from "../src/data/mockData.ts";
import { DEFAULT_OPD_LIST, DEFAULT_FAQS, DEFAULT_SETTINGS } from "../src/data/initialData.ts";
import { SERVER_ADMIN_USERS } from "../src/lib/server/auth.ts";
import { spbeAnnualData } from "../src/data/spbeData.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("🌱 SEEDING DATABASE SUPABASE: SPBE KABUPATEN BEKASI");
  console.log("==================================================");

  // 1. Seed Categories derived from mock services
  console.log("\n📁 [1/7] Menyuntikkan Kategori Layanan...");
  const categoriesSet = new Set<string>();
  mockServices.forEach((s) => {
    if (s.category) categoriesSet.add(s.category.trim());
  });

  let catIndex = 1;
  const categoriesList = Array.from(categoriesSet);
  for (const catName of categoriesList) {
    const slug = catName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.category.upsert({
      where: { slug },
      update: { name: catName, orderIndex: catIndex },
      create: {
        slug,
        name: catName,
        orderIndex: catIndex,
      },
    });
    catIndex++;
  }
  console.log(`✅ ${categoriesSet.size} Kategori berhasil disinkronkan.`);

  // 2. Seed OPDs (22 Instansi)
  console.log("\n🏢 [2/7] Menyuntikkan 22+ Instansi / Perangkat Daerah (OPD)...");
  for (const opd of DEFAULT_OPD_LIST) {
    await prisma.opd.upsert({
      where: { id: opd.id },
      update: {
        name: opd.name,
        shortName: opd.shortName,
        category: opd.category,
        headOfAgency: opd.headOfAgency || null,
        address: opd.address || null,
        email: opd.email || null,
        phone: opd.phone || null,
        website: opd.website || null,
        status: opd.status || "active",
        lastAudit: opd.lastAudit || "Hari ini",
      },
      create: {
        id: opd.id,
        name: opd.name,
        shortName: opd.shortName,
        category: opd.category,
        headOfAgency: opd.headOfAgency || null,
        address: opd.address || null,
        email: opd.email || null,
        phone: opd.phone || null,
        website: opd.website || null,
        status: opd.status || "active",
        lastAudit: opd.lastAudit || "Hari ini",
      },
    });
  }
  console.log(`✅ ${DEFAULT_OPD_LIST.length} OPD berhasil disinkronkan.`);

  // 3. Seed 101 Services
  console.log("\n🚀 [3/7] Menyuntikkan 101 Layanan Digital SPBE...");
  for (const srv of mockServices) {
    await prisma.service.upsert({
      where: { id: srv.id },
      update: {
        name: srv.name,
        description: srv.description,
        serviceType: srv.serviceType,
        category: srv.category,
        agency: srv.agency,
        manager: srv.manager || null,
        logo: srv.logo || "/logos/default.png",
        url: srv.url,
        status: srv.status || "active",
        users: srv.users || "0",
        lastUpdated: srv.lastUpdated || "Baru saja",
        contactEmail: srv.contactEmail || "-",
        contactPhone: srv.contactPhone || "-",
        isFeatured: Boolean(srv.isFeatured),
      },
      create: {
        id: srv.id,
        name: srv.name,
        description: srv.description,
        serviceType: srv.serviceType,
        category: srv.category,
        agency: srv.agency,
        manager: srv.manager || null,
        logo: srv.logo || "/logos/default.png",
        url: srv.url,
        status: srv.status || "active",
        users: srv.users || "0",
        lastUpdated: srv.lastUpdated || "Baru saja",
        contactEmail: srv.contactEmail || "-",
        contactPhone: srv.contactPhone || "-",
        isFeatured: Boolean(srv.isFeatured),
      },
    });
  }
  console.log(`✅ ${mockServices.length} Layanan berhasil disuntikkan.`);

  // 4. Seed Admin Users
  console.log("\n👤 [4/7] Menyuntikkan Akun Admin Pengelola...");
  for (const user of SERVER_ADMIN_USERS) {
    await prisma.adminUser.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        agency: user.agency,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin || null,
        phone: user.phone || null,
      },
      create: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        agency: user.agency,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin || null,
        phone: user.phone || null,
      },
    });
  }
  console.log(`✅ ${SERVER_ADMIN_USERS.length} Akun Admin berhasil disinkronkan.`);

  // 5. Seed FAQs
  console.log("\n❓ [5/7] Menyuntikkan Pertanyaan Umum (FAQ)...");
  for (const faq of DEFAULT_FAQS) {
    await prisma.faq.upsert({
      where: { id: faq.id },
      update: {
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
      },
      create: {
        id: faq.id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
      },
    });
  }
  console.log(`✅ ${DEFAULT_FAQS.length} FAQ berhasil disinkronkan.`);

  // 6. Seed SPBE Annual Records
  console.log("\n📊 [6/7] Menyuntikkan Rekam Historis Indeks SPBE...");
  for (const spbe of spbeAnnualData) {
    await prisma.spbeRecord.upsert({
      where: { tahun: spbe.tahun },
      update: {
        indeks: spbe.indeks,
        predikat: spbe.predikat,
        aspectScores: spbe.aspectScores,
        domainScores: spbe.domainScores,
      },
      create: {
        tahun: spbe.tahun,
        indeks: spbe.indeks,
        predikat: spbe.predikat,
        aspectScores: spbe.aspectScores,
        domainScores: spbe.domainScores,
      },
    });
  }
  console.log(`✅ ${spbeAnnualData.length} Rekam Tahunan SPBE berhasil disinkronkan.`);

  // 7. Seed System Settings
  console.log("\n⚙️ [7/7] Menyuntikkan Pengaturan Sistem Awal...");
  await prisma.systemSetting.upsert({
    where: { key: "general" },
    update: { value: DEFAULT_SETTINGS as any },
    create: { key: "general", value: DEFAULT_SETTINGS as any },
  });
  console.log("✅ Pengaturan sistem berhasil disinkronkan.");

  console.log("\n==================================================");
  console.log("🎉 SEMUA DATA (101 Layanan, 22 OPD, Admin, SPBE, FAQ) SUKSES DI-SEED!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
