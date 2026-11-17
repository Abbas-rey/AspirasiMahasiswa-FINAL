# Sistem Aspirasi Mahasiswa (ASMA) — UIN Syarif Hidayatullah Jakarta

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.3.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/OWASP%20Top%2010-2025%20Audited-success?style=for-the-badge&logo=shield)](https://owasp.org/)

**ASMA (Sistem Aspirasi Mahasiswa)** adalah platform web modern, aman, dan transparan yang dirancang khusus bagi civitas akademika **UIN Syarif Hidayatullah Jakarta**. Platform ini memfasilitasi mahasiswa dalam menyampaikan aspirasi, keluhan sarana/prasarana, saran kurikulum akademik, maupun kritik konstruktif langsung ke peninjau berwenang di tingkat **Jurusan/Program Studi**, **Fakultas**, maupun **Universitas**.

---

## 📌 Daftar Isi
1. [Evolusi Arsitektur](#-evolusi-arsitektur)
2. [Teknologi & Arsitektur Stack](#-teknologi--arsitektur-stack)
3. [Tangkapan Layar Antarmuka (UI Preview)](#-tangkapan-layar-antarmuka-ui-preview)
4. [Fitur Unggulan Berdasarkan Peran](#-fitur-unggulan-berdasarkan-peran)
5. [Implementasi Keamanan OWASP Top 10:2025](#-implementasi-keamanan-owasp-top-102025)
6. [Skema Basis Data (Prisma ORM)](#-skema-basis-data-prisma-orm)
7. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
8. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
9. [Akun Uji Coba Default](#-akun-uji-coba-default)
10. [Skrip Otomasi Lokal (Windows)](#-skrip-otomasi-lokal-windows)
11. [Lisensi & Penulis](#-lisensi--penulis)

---

## 🚀 Evolusi Arsitektur

Proyek ini bermula dari implementasi modul tugas praktik Rekayasa Perangkat Lunak (RPL) dengan fokus pada **FR-7** (*Akademisi memantau daftar aspirasi*). Dalam perkembangannya, sistem ini direkayasa ulang secara menyeluruh (*full-stack refactoring*) menjadi platform web produksi berstandar enterprise yang mencakup:

* **Frontend:** Beralih ke **Next.js 15 (App Router)** dan **React 19** dengan antarmuka modern, interaktif, responsif, dan ramah aksesibilitas.
* **Backend:** Menggunakan **Next.js Server Actions** dan **API Routes** yang terintegrasi secara ketat dengan **Prisma ORM** dan **PostgreSQL 18**.
* **Keamanan:** Menerapkan proteksi keamanan tingkat tinggi yang diaudit berdasarkan standar **OWASP Top 10:2025**.

---

## 🛠 Teknologi & Arsitektur Stack

* **Framework Inti:** [Next.js 15.1.7](https://nextjs.org/) (App Router, Server Actions, Server Components)
* **Library Antarmuka:** [React 19.0.0](https://react.dev/), [Tailwind CSS 3.4.17](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Icons)
* **Bahasa Pemrograman:** [TypeScript 5.7.3](https://www.typescriptlang.org/) (*Strict Mode*)
* **Basis Data & ORM:** [PostgreSQL 18](https://www.postgresql.org/) dengan [Prisma ORM 6.3.1](https://www.prisma.io/)
* **Autentikasi & Sesi:** Custom JWT menggunakan [`jose`](https://github.com/panva/jose) (`HS256`, HttpOnly, Secure, Lax Cookies) & [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js)
* **Validasi Skema:** [Zod 3.24.2](https://zod.dev/) & [React Hook Form 7.54.2](https://react-hook-form.com/)

---

## 📸 Tangkapan Layar Antarmuka (UI Preview)

Berikut adalah beberapa tampilan utama antarmuka pengguna pada sistem **ASMA**:

### 1. Halaman Beranda & Pelacakan Instan (Hero Section)
![Halaman Beranda ASMA](docs/images/01-hero-section.png)
> **Deskripsi:** Halaman utama (*Landing Page*) dirancang modern, elegan, dan informatif. Dilengkapi dengan bilah pencarian tiket instan (`ASP-2026-XXXXXX`) untuk pelacakan langsung tanpa login, tombol aksi pengajuan aspirasi baru, indikator metrik transparansi penanganan pengaduan (89.4% ditindaklanjuti dari ~25k civitas akademika aktif), serta kartu status interaktif alur penanganan laporan.

---

### 2. Pilihan Mode Transparansi & Privasi (Anonim Total)
![Mode Transparansi & Privasi](docs/images/02-mode-privasi.png)
> **Deskripsi:** Antarmuka pengajuan langkah pertama yang memberikan kebebasan dan rasa aman penuh kepada mahasiswa. Tersedia dua pilihan mode:
> - **Pakai Nama Saya (Transparan):** Identitas resmi (Nama & NIM) disertakan untuk memudahkan klarifikasi tindak lanjut langsung dari dosen/staf (cocok untuk administrasi akademik dan fasilitas perkuliahan harian).
> - **Kirim Anonim (Privasi 100%):** Sistem secara otomatis menyensor nama, NIM, dan email mahasiswa dari tampilan peninjau maupun publik. Dosen/peninjau hanya melihat label *Mahasiswa (Anonim)* untuk melindungi mahasiswa dari risiko intimidasi atau bias penilaian akademik.

---

### 3. Kategori Aspirasi Terstruktur
![Kategori Aspirasi Terstruktur](docs/images/03-kategori-aspirasi.png)
> **Deskripsi:** Sistem menyediakan 6 kanal kategori terstruktur: **Akademik** (KRS, kurikulum, ujian), **Dosen** (kedisiplinan, bimbingan tugas akhir), **Fasilitas** (AC, proyektor, lab komputer), **Administrasi** (tata usaha, legalisir, surat pengantar), **Sarana Prasarana** (musholla, toilet, parkir, kebersihan), dan **Lainnya**. Setiap kategori secara otomatis didisposisikan kepada pejabat peninjau yang berwenang sesuai tingkat wewenang (Jurusan, Fakultas, atau Universitas).

---

## 🌟 Fitur Unggulan Berdasarkan Peran

### 1. Mahasiswa (Pelapor)
* **Formulir Multi-Step Interaktif (3 Langkah):**
  * **Langkah 1:** Identitas Pengirim & Pilihan Mode Privasi (**Transparan** dengan nama/NIM resmi, atau **Anonim Total** untuk perlindungan identitas penuh).
  * **Langkah 2:** Rincian Aspirasi (Tingkat Tujuan: Jurusan/Fakultas/Universitas, Kategori, Judul, Tanggal, Waktu Kejadian, dan Deskripsi).
  * **Langkah 3:** Unggah Bukti Pendukung (Validasi berkas format JPG, PNG, atau PDF hingga 5MB) & Konfirmasi Ringkasan.
* **Kode Tiket Unik:** Format resmi `ASP-YYYY-XXXXXX` yang diterbitkan otomatis saat submit berhasil.
* **Dashboard Mahasiswa:** Memantau riwayat laporan sendiri, timeline status penanganan, dan tanggapan akademisi secara real-time.

### 2. Publik (Tanpa Perlu Login)
* **Pelacakan Status Aspirasi Terbuka:** Melacak progres penanganan laporan kapan saja secara publik melalui halaman `/lacak` cukup dengan memasukkan kode tiket resmi.

### 3. Akademisi (Dosen / Kaprodi / Dekanat)
* **Dashboard Peninjauan Berjenjang:** Memantau aspirasi yang masuk sesuai tingkat wewenang (*scope*) pengguna (Jurusan / Fakultas / Universitas).
* **Penyensoran Privasi Otomatis:** Jika aspirasi dikirim secara anonim, identitas mahasiswa disamarkan sepenuhnya menjadi `Anonim`.
* **Disposisi & Respon Resmi:** Memperbarui status penanganan (`DITERIMA`, `DIPROSES`, `DITINDAKLANJUTI`, `SELESAI`) disertai catatan progres dan tanggapan formal.

### 4. Administrator Pusat
* **Ringkasan Statistik Global:** Total aspirasi masuk, tingkat tindak lanjut, dan rasio penyelesaian.
* **Manajemen Pengguna (CRUD):** Tambah pengguna baru, ubah peran (*Role Assignment*), dan reset status password.
* **Bulk Import Pengguna:** Pendaftaran data massal mahasiswa/dosen secara cepat.

### 5. Penegakan Keamanan Password Default
* Pengguna yang pertama kali login menggunakan password bawaan sistem (`Uin<NIM/NIP>`) otomatis diwajibkan memperbarui kata sandi.
* **6 Kriteria Validasi Real-time:**
  1. Minimal 8 karakter
  2. Mengandung huruf besar (A-Z)
  3. Mengandung huruf kecil (a-z)
  4. Mengandung angka (0-9)
  5. Mengandung karakter simbol khusus (`!@#$%^&*` dsb.)
  6. **Tanpa spasi**
* Tombol **"Nanti"** tersedia bagi pengguna yang ingin menunda perubahan password dan langsung mengakses dashboard, dengan banner pengingat tetap aktif di dashboard.

---

## 🛡 Implementasi Keamanan OWASP Top 10:2025

| Kode OWASP | Kerentanan | Solusi & Mitigasi di ASMA |
| :--- | :--- | :--- |
| **A01:2025** | **Broken Access Control & IDOR** | Proteksi RBAC ganda di Next.js Middleware **dan** Server Actions / API Routes. Pengecekan kepemilikan data IDOR pada level database (user hanya dapat membaca/mengubah data miliknya atau sesuai scope wewenangnya). |
| **A02:2025** | **Security Misconfiguration** | Seluruh kredensial diisolasi via environment variables. File `.env` terdaftar di `.gitignore`. Headers keamanan HTTP aktif (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). |
| **A03:2025** | **Supply Chain Failures** | Dependensi dikunci pada versi stabil teruji, rutin diaudit melalui `npm audit`, bebas dari library usang berisiko tinggi. |
| **A04:2025** | **Cryptographic Failures** | Token JWT ditandatangani dengan algoritma `HS256` eksplisit via library `jose` dengan secret key minimal 32 karakter. Hashing password menggunakan `bcryptjs` dengan salt rounds teruji (10 rounds). |
| **A05:2025** | **Injection & File Upload** | Menggunakan Prisma ORM parameterized queries (bebas SQL Injection). Validasi upload berkas memeriksa **Magic Bytes (File Signature)** asli di server (mencegah manipulasi header/ekstensi), pembatasan 5MB, serta pengacakan nama file (UUID) untuk mencegah *Path Traversal*. |
| **A07:2025** | **Authentication Failures** | Cookie sesi disimpan dengan atribut `HttpOnly`, `SameSite: Lax`, dan `Secure` (pada production). Dilengkapi proteksi *rate-limiting* berbasis memori pada rute login untuk mencegah serangan brute-force. |
| **A10:2025** | **Mishandling Exceptional Conditions** | Penanganan blok `try-catch` terstandarisasi di semua endpoint tanpa membocorkan stack trace mentah atau database schema ke antarmuka client. |

---

## 🗄 Skema Basis Data (Prisma ORM)

```mermaid
erDiagram
    USER ||--o{ ASPIRATION : "mengajukan"
    USER ||--o{ RESPONSE : "menanggapi"
    CATEGORY ||--o{ ASPIRATION : "mengkategorikan"
    ASPIRATION ||--o{ ATTACHMENT : "memiliki"
    ASPIRATION ||--o{ STATUS_LOG : "mencatat"
    ASPIRATION ||--o{ RESPONSE : "menerima"

    USER {
        string id PK
        string nim_nip UK
        string name
        string email UK
        string password_hash
        enum role
        enum scope_level
        boolean must_change_pwd
    }

    ASPIRATION {
        string id PK
        string ticket_code UK
        string user_id FK
        int category_id FK
        enum target_level
        boolean is_anonymous
        string title
        text description
        datetime incident_date
        string incident_time
        enum current_status
    }

    CATEGORY {
        int id PK
        string category_name UK
        string description
    }

    ATTACHMENT {
        string id PK
        string aspiration_id FK
        string file_name
        string file_path
        string file_type
        int file_size
    }

    STATUS_LOG {
        string id PK
        string aspiration_id FK
        enum status
        string note
        string updated_by_name
        datetime changed_at
    }

    RESPONSE {
        string id PK
        string aspiration_id FK
        string responder_id FK
        text response_text
        datetime responded_at
    }
```

---

## 📂 Struktur Direktori Proyek

```text
WEB ASMA/
├── prisma/
│   ├── schema.prisma            # Skema deklaratif database PostgreSQL
│   └── seed.js                  # Skrip pengisian data awal (kategori & akun)
├── public/
│   └── uploads/                 # Direktori penyimpanan berkas bukti pendukung
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── ajukan/              # Halaman formulir pengajuan 3 langkah
│   │   ├── api/
│   │   │   ├── admin/           # Endpoint API manajemen pengguna & statistik
│   │   │   ├── aspirations/     # Endpoint pengajuan, detail, & pelacakan tiket
│   │   │   ├── auth/            # Endpoint login, logout, me, change-password
│   │   │   └── categories/      # Endpoint master data kategori
│   │   ├── dashboard/
│   │   │   ├── admin/           # Dashboard manajemen administrator
│   │   │   ├── akademisi/       # Dashboard review & tindak lanjut akademisi
│   │   │   └── mahasiswa/       # Dashboard riwayat & pemantauan mahasiswa
│   │   ├── lacak/               # Halaman publik pelacakan kode tiket
│   │   ├── login/               # Halaman autentikasi sistem
│   │   ├── layout.tsx           # Global layout & navigasi
│   │   └── page.tsx             # Halaman Beranda (Landing Page)
│   ├── components/              # Komponen modular UI (Navbar, Modal, Checklist)
│   └── lib/
│       ├── auth.ts              # Utilitas verifikasi & pembuatan JWT (jose)
│       ├── prisma.ts            # Singleton Prisma Client
│       └── utils.ts             # Validator password, magic bytes, formatting
├── .env.example                 # Contoh template konfigurasi environment
├── .gitignore                   # Aturan pengabaian file sensitif Git
├── next.config.mjs              # Konfigurasi Next.js & Security Headers
├── package.json                 # Manifest dependensi & skrip npm
├── start-app.bat                # Skrip Windows 1-klik untuk menjalankan server
├── start-db.bat                 # Skrip Windows 1-klik untuk menjalankan database
├── tailwind.config.ts           # Konfigurasi styling Tailwind CSS
└── tsconfig.json                # Konfigurasi TypeScript compiler
```

---

## 💻 Panduan Instalasi & Menjalankan

### Prasyarat Sistem
* [Node.js](https://nodejs.org/) versi `18.18.0` atau yang lebih baru (disarankan Node.js v20+)
* [PostgreSQL](https://www.postgresql.org/) versi `15` atau yang lebih baru (proyek ini dibangun di PostgreSQL 18)
* Paket manajer `npm`, `pnpm`, atau `yarn`

### 1. Kloning Repositori
```bash
git clone https://github.com/Abbas-rey/AspirasiMahasiswa-FINAL.git
cd AspirasiMahasiswa-FINAL
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (*Environment Variables*)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi database dan JWT Secret di dalam file `.env`:
```env
# Koneksi Database PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/asma_uin?schema=public"

# Kunci Rahasia JWT (Minimal 32 karakter acak yang aman)
JWT_SECRET="ganti_dengan_kunci_rahasia_acak_minimal_32_karakter_yang_sangat_kuat"

# URL Dasar Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Skema Basis Data & Seeding Data Awal
Jalankan migrasi skema Prisma ke database PostgreSQL Anda:
```bash
npx prisma db push
```
Lakukan *seeding* akun percontohan dan kategori bawaan:
```bash
node prisma/seed.js
```

### 5. Menjalankan Server Pengembangan (*Development*)
```bash
npm run dev
```
Akses aplikasi melalui browser di: **`http://localhost:3000`**

### 6. Menjalankan Server Produksi (*Production*)
```bash
npm run build
npm run start
```

---

## 🔑 Akun Uji Coba Default

Setelah menjalankan skrip `node prisma/seed.js`, akun-akun berikut tersedia untuk pengujian:

| Role | Nama Pengguna | NIM / NIP | Password Default | Akses Lingkup |
| :--- | :--- | :--- | :--- | :--- |
| **Mahasiswa** | Achmad Suva | `1251420044` | `Uin1251420044` | Pengajuan, Dashboard Mahasiswa |
| **Mahasiswa** | Fathia Rahma | `1251420001` | `Uin1251420001` | Pengajuan, Dashboard Mahasiswa |
| **Akademisi** | Dr. Husni Teja Sukmana | `197705152003121001` | `Uin197705152003121001` | Tingkat **Jurusan** |
| **Akademisi** | Prof. Dr. Lily Surayya Eka | `196908121994032001` | `Uin196908121994032001` | Tingkat **Fakultas** |
| **Akademisi** | Prof. Asep Saepudin Jahar | `196912161996031001` | `Uin196912161996031001` | Tingkat **Universitas** |
| **Admin** | Administrator Pusat | `admin` | `admin123` | Seluruh Dashboard Admin |

> **Catatan Keamanan:** Seluruh akun bawaan di atas memiliki status `must_change_pwd: true`. Sistem akan otomatis menampilkan modal panduan ganti password saat login pertama kali.

---

## ⚡ Skrip Otomasi Lokal (Windows)

Untuk mempermudah penggunaan di lingkungan sistem operasi Windows:
* **`start-db.bat`**: Menyalakan instance database engine PostgreSQL lokal pada port kustom (5433).
* **`start-app.bat`**: Menyalakan database PostgreSQL, membuka browser otomatis ke `http://localhost:3000`, dan menjalankan server Next.js secara simultan.

---

## 📄 Lisensi & Penulis

Proyek ini dikembangkan oleh **Kelompok Rekayasa Perangkat Lunak (RPL)**  
**Program Studi Teknik Informatika**, Fakultas Sains dan Teknologi  
**UIN Syarif Hidayatullah Jakarta (2026)**  
Dilisensikan di bawah lisensi terbuka [ISC / MIT License](LICENSE).
