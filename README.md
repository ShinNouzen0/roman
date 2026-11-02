# Portal Layanan Digital dan Dasbor Tata Kelola SPBE Kabupaten Bekasi

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

Platform terpadu Sistem Pemerintahan Berbasis Elektronik (SPBE) Pemerintah Kabupaten Bekasi yang mengintegrasikan seluruh katalog layanan digital publik, administrasi pemerintahan daerah, dan dasbor tata kelola berbasis peran (*Role-Based Access Control* / RBAC).

---

## 📌 Deskripsi Proyek

Aplikasi ini dirancang sebagai solusi satu pintu (*single point of access*) bagi masyarakat Kabupaten Bekasi dan aparatur pemerintah daerah:

1. **Portal Publik (*Citizen & Business Facing*)**:
   * Akses terpadu ke **101+ layanan digital** dari seluruh instansi/Perangkat Daerah (OPD).
   * Pencarian cerdas instan (*Smart Search & Command Palette* `Ctrl + K`).
   * Filter klasifikasi layanan: Layanan Publik (G2C), Bisnis (G2B), Tata Kelola Antar Instansi (G2G), dan Kepegawaian (G2E).
   * Visualisasi riwayat capaian indeks evaluasi SPBE tahunan (2021–2024).
   * Pusat bantuan, FAQ interaktif, widget aksesibilitas (kontras tinggi, pembesar teks), dan dukungan *Dark/Light Mode*.

2. **Dasbor Tata Kelola Admin (*RBAC-Protected Administration Panel*)**:
   * **Super Admin (Diskominfosantik)**: Kontrol penuh manajemen 101 layanan, status operasional (Aktif, Maintenance, Pengembangan), manajemen 22 OPD, data SPBE, FAQ, audit log aktivitas, dan pengelolaan akun admin instansi.
   * **Admin OPD (Perangkat Daerah)**: Panel mandiri bagi setiap dinas/instansi untuk mengelola dan memantau status aplikasi sektoral masing-masing.
   * Keamanan tingkat tinggi: Autentikasi server-side berbasis JWT bertanda tangan kriptografis Web Crypto API (HMAC-SHA256) dengan `HttpOnly` cookie dan proteksi Edge Middleware.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router & Server Components)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL Cloud)
* **Object-Relational Mapping (ORM)**: [Prisma ORM](https://www.prisma.io/)
* **Charts & Analytics**: [Recharts](https://recharts.org/)

---

## 📂 Struktur Direktori Utama

```text
├── prisma/
│   ├── schema.prisma       # Skema database relasional (Services, OPD, Users, FAQ, SPBE, Audit)
│   └── seed.ts             # Script seeding otomatis 101 layanan, 22 OPD, admin & riwayat SPBE
├── public/                 # Aset statis & logo instansi
├── src/
│   ├── app/
│   │   ├── admin/          # Dasbor Manajemen SPBE (Services, OPD, FAQ, SPBE, Users, Logs)
│   │   ├── api/            # Server API Routes (CRUD Services, OPD, Auth, FAQ, SPBE, Users)
│   │   ├── globals.css     # Tailwind CSS base styles & token warna
│   │   ├── layout.tsx      # Root layout & providers
│   │   └── page.tsx        # Halaman portal beranda publik
│   ├── components/
│   │   ├── admin/          # Komponen UI dasbor admin (Header, Sidebar, Modals, Forms)
│   │   ├── home/           # Komponen beranda publik (ServiceCard, Filter, FAQ, SPBE History)
│   │   ├── layout/         # Komponen layout (Navbar, Footer, MaintenanceBanner)
│   │   └── ui/             # Komponen visual (Badge, Accessibility, AnimatedNumber)
│   ├── data/
│   │   ├── initialData.ts  # Data rujukan instansi OPD, FAQ default, dan konfigurasi sistem
│   │   ├── mockData.ts     # Data awal 101 katalog aplikasi SPBE
│   │   └── spbeData.ts     # Rincian dimensi, domain, dan skor evaluasi SPBE
│   ├── lib/
│   │   ├── auth.ts         # JWT cryptographic signing & verification (Web Crypto API)
│   │   ├── prisma.ts       # Prisma Client singleton connection pool
│   │   └── server/auth.ts  # Server-side credential validation & user directory
│   ├── services/
│   │   ├── api.ts          # Abstraksi data layer client-to-server
│   │   └── serviceStore.ts # Centralized reactive store dengan sinkronisasi multi-tab & DB
│   ├── types/              # Definisi interface TypeScript
│   └── middleware.ts       # Proteksi route admin via Next.js Edge Middleware
├── .env.example            # Template variabel lingkungan
└── package.json            # Daftar dependensi & npm scripts
```

---

## 🚀 Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal:

### 1. Kloning Repositori & Masuk ke Folder Proyek
```bash
git clone https://github.com/username/portal-magang.git
cd portal-magang
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi sesuai kredensial Supabase dan rahasia token Anda:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="spbe_bekasikab_secure_secret_key_2026_jwt_token_987654321"
```

### 4. Sinkronisasi Skema Database & Seeding
Sinkronkan struktur tabel ke PostgreSQL Supabase dan suntikkan 101 data layanan:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses:
👉 **`http://localhost:3000`**

---

## 🔐 Kredensial Dasbor Admin (Demo Mode)

Untuk mengakses panel dasbor di `/admin/login`:

* **Super Admin (Diskominfosantik)**:
  * Username: `admin_kominfo` *(atau email: `admin@bekasikab.go.id`)*
  * Password: `admin123`
* **Admin OPD (Disdukcapil)**:
  * Username: `admin_disdukcapil` *(atau email: `disdukcapil@bekasikab.go.id`)*
  * Password: `admin123`

---

## 📄 Lisensi

Dikembangkan sebagai bagian dari inisiatif digitalisasi dan penguatan tata kelola SPBE Pemerintah Kabupaten Bekasi.
