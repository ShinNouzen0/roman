# Portal Layanan Digital Pemerintah Kabupaten Bekasi

Website ini berfungsi sebagai portal akses terpadu untuk berbagai aplikasi dan layanan digital yang dimiliki oleh Pemerintah Kabupaten Bekasi. Aplikasi ini dibangun sebagai prototype (rancangan awal) dengan menggunakan arsitektur modern yang memisahkan UI dan Data Layer sehingga siap untuk diintegrasikan dengan REST API di masa mendatang.

## Teknologi yang Digunakan
- **Framework**: [Next.js](https://nextjs.org/) (React.js) dengan App Router
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animasi & Interaksi**: [Framer Motion](https://www.framer.com/motion/)

## Struktur Utama Folder
```text
/src
 ├── /app                  # Next.js App Router (Halaman Utama)
 │    ├── page.tsx         # Halaman Beranda (Daftar Layanan, Pencarian, Filter)
 │    ├── layout.tsx       # Root layout (Navbar & Footer)
 │    ├── globals.css      # Styling global dan Tailwind base
 │    └── /perangkat-daerah
 │         └── page.tsx    # Halaman daftar layanan berdasarkan OPD
 ├── /components           # Komponen UI Reusable
 │    ├── Navbar.tsx       # Navigasi utama
 │    ├── Footer.tsx       # Footer portal
 │    ├── ServiceCard.tsx  # Card untuk menampilkan layanan
 │    ├── ServiceModal.tsx # Modal detail layanan
 │    └── Badge.tsx        # Indikator status layanan
 ├── /data                 # Mock Data sementara
 │    └── mockData.ts      # Data JSON 12+ aplikasi (Dummy)
 ├── /services             # Layer API (Terpisah dari UI komponen)
 │    └── api.ts           # Service untuk mengambil data (Get services)
 └── /types                # Definisi TypeScript Interfaces
      └── index.ts         # Interface DigitalService dll.
```

## Arsitektur Data & Integrasi API
Saat ini, aplikasi menggunakan data dummy/mock data (dapat dilihat di `src/data/mockData.ts`). Komponen UI tidak mengambil data secara langsung dari file data ini. Sebaliknya, komponen UI menggunakan service terpisah di `src/services/api.ts`.

Nantinya, apabila REST API dari Diskominfosantik sudah tersedia, Anda hanya perlu mengubah `src/services/api.ts` agar melakukan *fetch* ke URL API sebenarnya (misalnya `fetch("https://api.bekasikab.go.id/services")`). Tidak ada komponen UI yang perlu diubah.

## Fitur Utama Prototype
1. **Search**: Mencari layanan berdasarkan nama, deskripsi, atau pengelola.
2. **Filter Kategori**: Mengelompokkan aplikasi sesuai kategori tertentu (Administrasi, Kepegawaian, Pelayanan Publik, dll).
3. **Filter Perangkat Daerah (OPD)**: Melihat layanan yang khusus dikelola oleh suatu instansi/dinas.
4. **Modal Detail Layanan**: Menampilkan deskripsi lengkap suatu aplikasi sebelum diarahkan keluar.
5. **External Redirect**: Mengarahkan pengguna (membuka tab baru) ke URL layanan aplikasi yang sebenarnya saat menekan tombol "Buka Aplikasi".
6. **Dark Mode / Light Mode**: Mendukung preferensi mode terang maupun gelap.
7. **Responsive Design**: Tampilan yang optimal untuk Desktop, Tablet, dan Mobile.

## Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan prototype ini di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) versi terbaru.

### 2. Instalasi Dependensi
Jalankan perintah ini di dalam folder utama project:
```bash
npm install
```

### 3. Menjalankan Development Server
```bash
npm run dev
```

### 4. Buka di Browser
Akses URL berikut:
```text
http://localhost:3000
```
Untuk menghentikan server, tekan `Ctrl + C` di terminal.
