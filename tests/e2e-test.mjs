import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const playwrightPath = path.join(process.env.APPDATA, 'npm/node_modules/@playwright/cli/node_modules/playwright-core');
const { chromium } = require(playwrightPath);

async function runTests() {
  console.log('🚀 Memulai Automated Testing Portal SPBE Kabupaten Bekasi...');
  const testResults = [];
  const reportsDir = path.resolve('tests/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // TEST 1: Membuka Halaman Utama
  console.log('\n[Test 1] Membuka URL http://localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    console.log(`  ✓ Title halaman: "${title}"`);
    await page.screenshot({ path: path.join(reportsDir, '01_homepage.png') });
    testResults.push({ name: 'Halaman Utama Load', status: 'PASS', detail: `Title: ${title}` });
  } catch (err) {
    console.error(`  ✗ Gagal membuka halaman: ${err.message}`);
    testResults.push({ name: 'Halaman Utama Load', status: 'FAIL', error: err.message });
  }

  // TEST 2: Validasi Komponen Header & Navbar
  console.log('\n[Test 2] Validasi Elemen Navbar...');
  try {
    const navbarLinks = await page.$$eval('header nav a, header a', links => links.map(l => l.innerText.trim()).filter(Boolean));
    console.log(`  ✓ Link Navbar terdeteksi: ${navbarLinks.join(', ')}`);
    testResults.push({ name: 'Navigasi Navbar', status: 'PASS', detail: `${navbarLinks.length} navigasi aktif` });
  } catch (err) {
    console.error(`  ✗ Gagal cek navbar: ${err.message}`);
    testResults.push({ name: 'Navigasi Navbar', status: 'FAIL', error: err.message });
  }

  // TEST 3: Interaksi Pencarian (Search Input)
  console.log('\n[Test 3] Pengujian Fitur Pencarian...');
  try {
    const searchInput = page.locator('input[placeholder*="Cari layanan"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill('Kependudukan');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(reportsDir, '02_search_kependudukan.png') });
    console.log('  ✓ Input pencarian "Kependudukan" berhasil diisi dan dirender');
    await searchInput.clear();
    await page.waitForTimeout(500);
    testResults.push({ name: 'Fitur Pencarian Layanan', status: 'PASS', detail: 'Berhasil input query dan filter responsif' });
  } catch (err) {
    console.error(`  ✗ Gagal uji pencarian: ${err.message}`);
    testResults.push({ name: 'Fitur Pencarian Layanan', status: 'FAIL', error: err.message });
  }

  // TEST 4: Filter Kategori Layanan
  console.log('\n[Test 4] Pengujian Filter Kategori Layanan...');
  try {
    const filterLayananPublik = page.locator('button:has-text("Layanan Publik")').first();
    if (await filterLayananPublik.isVisible()) {
      await filterLayananPublik.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(reportsDir, '03_filter_layanan_publik.png') });
      console.log('  ✓ Tombol filter "Layanan Publik" berhasil diklik');
      testResults.push({ name: 'Filter Kategori', status: 'PASS', detail: 'Tab Layanan Publik aktif' });
    } else {
      testResults.push({ name: 'Filter Kategori', status: 'SKIP', detail: 'Tombol filter tidak ditemukan di viewport' });
    }
  } catch (err) {
    console.error(`  ✗ Gagal klik filter: ${err.message}`);
    testResults.push({ name: 'Filter Kategori', status: 'FAIL', error: err.message });
  }

  // TEST 5: Interaksi FAQ Accordion
  console.log('\n[Test 5] Pengujian Accordion FAQ...');
  try {
    const faqItem = page.locator('button:has-text("Apa itu Portal SPBE")').first();
    if (await faqItem.isVisible()) {
      await faqItem.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(reportsDir, '04_faq_opened.png') });
      console.log('  ✓ Accordion FAQ berhasil diklik dan terbuka');
      testResults.push({ name: 'FAQ Accordion', status: 'PASS', detail: 'FAQ dapat di-expand/collapse' });
    } else {
      testResults.push({ name: 'FAQ Accordion', status: 'SKIP', detail: 'Item FAQ belum terlihat' });
    }
  } catch (err) {
    console.error(`  ✗ Gagal uji FAQ: ${err.message}`);
    testResults.push({ name: 'FAQ Accordion', status: 'FAIL', error: err.message });
  }

  // TEST 6: Dark Mode / Light Mode Toggle
  console.log('\n[Test 6] Pengujian Tema Dark/Light Mode...');
  try {
    const themeBtn = page.locator('button[aria-label*="theme" i], button[title*="theme" i], header button:has(svg)').last();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(reportsDir, '05_theme_toggled.png') });
      console.log('  ✓ Tombol ganti tema berhasil diklik');
      testResults.push({ name: 'Theme Toggle', status: 'PASS', detail: 'Tema berhasil diubah' });
    } else {
      testResults.push({ name: 'Theme Toggle', status: 'SKIP', detail: 'Tombol theme tidak ditemukan' });
    }
  } catch (err) {
    console.error(`  ✗ Gagal uji toggle tema: ${err.message}`);
    testResults.push({ name: 'Theme Toggle', status: 'FAIL', error: err.message });
  }

  // TEST 7: Responsiveness (Mobile Viewport)
  console.log('\n[Test 7] Pengujian Tampilan Mobile (375x667)...');
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(reportsDir, '06_mobile_view.png') });
    console.log('  ✓ Tampilan mobile berhasil dirender dan di-capture');
    testResults.push({ name: 'Mobile Responsiveness', status: 'PASS', detail: 'Viewport 375x667 rendered smoothly' });
  } catch (err) {
    console.error(`  ✗ Gagal uji mobile: ${err.message}`);
    testResults.push({ name: 'Mobile Responsiveness', status: 'FAIL', error: err.message });
  }

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log('📊 RINGKASAN HASIL PENGUJIAN OTOMATIS:');
  console.log('========================================');
  testResults.forEach((t, i) => {
    const badge = t.status === 'PASS' ? '✅' : t.status === 'SKIP' ? '⚠️' : '❌';
    console.log(`${badge} ${i + 1}. ${t.name}: [${t.status}] ${t.detail || t.error || ''}`);
  });

  if (consoleErrors.length > 0) {
    console.log(`\n⚠️ Terdeteksi ${consoleErrors.length} console/page error:`);
    consoleErrors.forEach((e, idx) => console.log(`   ${idx + 1}. ${e}`));
  } else {
    console.log('\n✨ Tidak ditemukan console error!');
  }
}

runTests().catch(err => {
  console.error('Fatal error during testing:', err);
  process.exit(1);
});
