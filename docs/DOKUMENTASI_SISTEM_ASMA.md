# DOKUMENTASI SPESIFIKASI & REKAYASA PERANGKAT LUNAK
## SISTEM INFORMASI ASPIRASI MAHASISWA (ASMA)
### UIN Syarif Hidayatullah Jakarta

---

## DAFTAR ISI
1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Functional Requirements (Kebutuhan Fungsional)](#2-functional-requirements-kebutuhan-fungsional)
3. [Use Case Diagram & Spesifikasi Use Case](#3-use-case-diagram--spesifikasi-use-case)
4. [Activity Diagram (Diagram Aktivitas)](#4-activity-diagram-diagram-aktivitas)
5. [Sequence Diagram (Diagram Urutan)](#5-sequence-diagram-diagram-urutan)
6. [Entity Relationship Diagram (ERD) & Kamus Data](#6-entity-relationship-diagram-erd--kamus-data)
7. [Arsitektur Keamanan & Deployment](#7-arsitektur-keamanan--deployment)

---

## 1. Gambaran Umum Sistem

**ASMA (Aspirasi Mahasiswa)** adalah platform web resmi civitas akademika UIN Syarif Hidayatullah Jakarta yang dirancang untuk menyampaikan aspirasi, keluhan, kritik, dan saran konstruktif dari mahasiswa kepada pihak universitas secara aman, transparan, terstruktur, dan akuntabel.

### Karakteristik Utama Sistem:
* **Multi-Level Scope Routing**: Aspirasi dapat dialamatkan secara presisi ke tingkat **Jurusan/Program Studi**, **Fakultas**, maupun **Tingkat Universitas (Rektorat)**.
* **Dual Privacy Mode**: Mendukung mode **Transparan** (identitas pelapor terbuka) dan mode **Anonim** (identitas mahasiswa disensor 100% oleh sistem di sisi peninjau).
* **Multi-Evidence Support**: Pengunggahan berkas bukti hingga 5 file (maks. 10MB/file: JPG, PNG, PDF, WEBP) dengan validasi *magic bytes* dan integrasi tautan berkas cloud (Google Drive).
* **Self-Service Aspiration Management**: Mahasiswa dapat membatalkan/menghapus aspirasinya sendiri yang baru dibuat dengan proteksi ketat Anti-IDOR.
* **Enterprise-Grade Session Security**:
  * Pembatasan sesi login simultan maksimal **2 perangkat aktif** per akun (mekanisme FIFO Eviction otomatis).
  * Fitur **Auto-Logout setelah 1 jam inaktivitas** dengan sinkronisasi antar-tab dan modal peringatan pada menit ke-58.
  * Wajib perbarui password default pada login pertama dengan 6 kriteria keamanan kata sandi.

### Stack Teknologi:
* **Frontend & Backend**: Next.js 15 (App Router, Server Actions, Dynamic API Handlers) & React 19
* **Database & ORM**: PostgreSQL (Supabase Connection Pooler) & Prisma ORM v6
* **Autentikasi & Enkripsi**: Stateless Signed JWT (`jose` HS256), Bcrypt.js (Salt Rounds 10)
* **Styling & UI**: Tailwind CSS, Lucide React
* **Infrastruktur Deployment**: Vercel Serverless Hosting

---

## 2. Functional Requirements (Kebutuhan Fungsional)

Tabel berikut mendefinisikan kebutuhan fungsional sistem ASMA dengan klasifikasi prioritas:
* **High (H)**: Fitur inti yang wajib ada dan krusial untuk operasional sistem.
* **Medium (M)**: Fitur pendukung integritas dan kemudahan tata kelola.
* **Low (L)**: Fitur pelengkap estetika dan kenyamanan tambahan.

### 2.1 Modul Autentikasi & Keamanan Sesi (AUTH)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-AUTH-01** | Sistem harus mengotentikasi pengguna menggunakan NIM (Mahasiswa), NIP (Dosen/Akademisi), atau Username (Admin) beserta password yang telah di-hash dengan Bcrypt. | Mahasiswa, Akademisi, Admin | **H** |
| **FR-AUTH-02** | Sistem harus membatasi sesi login maksimal **2 perangkat aktif** secara bersamaan per akun pengguna. Jika perangkat ke-3 login, sistem secara otomatis mencabut (*evict*) sesi pada perangkat terlama (FIFO). | Semua Pengguna | **H** |
| **FR-AUTH-03** | Sistem harus memantau aktivitas pengguna dan secara otomatis melakukan *logout* jika pengguna tidak melakukan aktivitas (*idle*) selama **1 jam (60 menit)**, disertai modal countdown pada menit ke-58 dan sinkronisasi antar-tab. | Semua Pengguna | **H** |
| **FR-AUTH-04** | Sistem harus mendeteksi penggunaan password default sistem (`Uin<NIM/NIP>`) dan mewajibkan pengguna mengganti password sesuai 6 kriteria keamanan (minimal 8 karakter, huruf besar, huruf kecil, angka, simbol, tanpa spasi), dengan opsi tunda (*Nanti*). | Semua Pengguna | **H** |
| **FR-AUTH-05** | Sistem harus menerapkan *Rate Limiting* anti *brute-force* pada endpoint login (maksimal 10 percobaan gagal per 5 menit per alamat IP). | Publik / Pengguna | **H** |
| **FR-AUTH-06** | Sistem harus menyediakan fitur *Logout* aman yang menghapus cookie sesi browser (`asma_session`) dan menghapus data sesi perangkat dari tabel `UserSession` di database. | Semua Pengguna | **H** |

### 2.2 Modul Pengajuan Aspirasi (ASP)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-ASP-01** | Sistem harus menyediakan formulir pengajuan aspirasi terpadu (1 halaman) yang mencakup: Judul, Deskripsi, Kategori Pengaduan, Jenjang Wewenang Tujuan (Jurusan, Fakultas, Universitas), serta Tanggal & Waktu Kejadian. | Mahasiswa | **H** |
| **FR-ASP-02** | Sistem harus menyediakan opsi privasi: **Mode Transparan** (Nama & NIM terbuka) dan **Mode Anonim** (Nama, NIM, dan email otomatis disensor oleh sistem menjadi `Mahasiswa (Anonim)` di sisi peninjau). | Mahasiswa | **H** |
| **FR-ASP-03** | Sistem harus mendukung pengunggahan multi-lampiran bukti fisik hingga maksimal **5 file** dengan ukuran maksimal **10 MB per file** untuk format berkas JPG, PNG, PDF, dan WEBP. | Mahasiswa | **H** |
| **FR-ASP-04** | Sistem harus memverifikasi keaslian tipe berkas yang diunggah menggunakan validasi *deep magic bytes* (file signature) di sisi server untuk mencegah serangan ekstensi palsu atau executable upload. | Sistem | **H** |
| **FR-ASP-05** | Sistem harus menyediakan input tautan penyimpanan cloud (Google Drive / OneDrive) opsional sebagai bukti tambahan tanpa batas kapasitas lokal. | Mahasiswa | **M** |
| **FR-ASP-06** | Sistem harus menghasilkan Kode Tiket unik berformat `ASP-YYYY-XXXXXX` (contoh: `ASP-2026-004812`) secara otomatis saat aspirasi berhasil disubmit. | Sistem | **H** |

### 2.3 Modul Pelacakan Publik (TRK)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-TRK-01** | Sistem harus menyediakan antarmuka pencarian publik untuk melacak status aspirasi hanya dengan memasukkan Kode Tiket tanpa harus login. | Publik / Mahasiswa | **H** |
| **FR-TRK-02** | Sistem harus menampilkan timeline progres visual perjalanan aspirasi (Diterima $\rightarrow$ Diproses $\rightarrow$ Ditindaklanjuti $\rightarrow$ Selesai), riwayat catatan petugas, dan tanggapan resmi. | Publik / Mahasiswa | **H** |
| **FR-TRK-03** | Sistem harus menyensor informasi identitas pelapor pada hasil pencarian publik jika aspirasi tersebut diajukan dengan mode anonim. | Sistem | **H** |

### 2.4 Modul Dasbor Mahasiswa (MHS)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-MHS-01** | Sistem harus menampilkan daftar seluruh aspirasi pribadi yang pernah diajukan oleh mahasiswa yang sedang login beserta status terkininya. | Mahasiswa | **H** |
| **FR-MHS-02** | Sistem harus menyediakan fitur pencarian kata kunci dan penyaringan (*filtering*) aspirasi berdasarkan status (`DITERIMA`, `DIPROSES`, `DITINDAKLANJUTI`, `SELESAI`). | Mahasiswa | **M** |
| **FR-MHS-03** | Mahasiswa harus dapat melihat modal detail lengkap aspirasi miliknya termasuk berkas bukti lampiran, tautan Google Drive, dan tanggapan pejabat peninjau. | Mahasiswa | **H** |
| **FR-MHS-04** | Mahasiswa harus dapat membatalkan / menghapus aspirasi buatannya sendiri (*Self-Service Delete*) dengan modal konfirmasi dan proteksi Anti-IDOR (hanya pemilik sah yang dapat menghapus). | Mahasiswa | **H** |
| **FR-MHS-05** | Sistem harus menghapus seluruh berkas lampiran fisik pada storage saat aspirasi dihapus. | Sistem | **H** |

### 2.5 Modul Dasbor Akademisi / Dosen Peninjau (AKAD)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-AKAD-01** | Sistem harus menyaring dan menampilkan daftar aspirasi yang masuk sesuai tingkat wewenang akun akademisi yang bersangkutan (`JURUSAN`, `FAKULTAS`, atau `UNIVERSITAS`). | Akademisi | **H** |
| **FR-AKAD-02** | Akademisi harus dapat meninjau rincian aspirasi, mengunduh bukti lampiran, dan membuka tautan Google Drive pelapor. | Akademisi | **H** |
| **FR-AKAD-03** | Akademisi harus dapat memperbarui status aspirasi secara bertahap (`DITERIMA` $\rightarrow$ `DIPROSES` $\rightarrow$ `DITINDAKLANJUTI` $\rightarrow$ `SELESAI`) disertai catatan progres penanganan. | Akademisi | **H** |
| **FR-AKAD-04** | Akademisi harus dapat menuliskan dan mempublikasikan tanggapan resmi (*Official Response*) yang dapat dibaca oleh mahasiswa pelapor. | Akademisi | **H** |

### 2.6 Modul Dasbor Administrator (ADM)

| Kode FR | Deskripsi Kebutuhan Fungsional | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-ADM-01** | Sistem harus menampilkan ringkasan metrik statistik real-time: total pengguna, total aspirasi masuk, persentase penyelesaian, serta sebaran kategori dan tingkat jenjang. | Admin | **H** |
| **FR-ADM-02** | Admin dapat melakukan manajemen akun pengguna (Create, Read, Update, Delete) untuk role Mahasiswa, Akademisi, dan Admin. | Admin | **H** |
| **FR-ADM-03** | Admin dapat melakukan import massal (*Bulk Import*) data civitas akademika menggunakan format file CSV atau Excel. | Admin | **M** |
| **FR-ADM-04** | Admin dapat melakukan reset password akun pengguna yang lupa kata sandi kembali ke format default sistem. | Admin | **M** |

---

## 3. Use Case Diagram & Spesifikasi Use Case

### 3.1 Diagram Use Case Sistem

```mermaid
flowchart LR
    subgraph Aktor
        M["Mahasiswa"]
        A["Akademisi / Dosen"]
        ADM["Administrator"]
        P["Publik / Tamu"]
    end

    subgraph "Sistem ASMA UIN Jakarta"
        UC1(["UC-01: Autentikasi & Kelola Sesi"])
        UC2(["UC-02: Ajukan Aspirasi Baru"])
        UC3(["UC-03: Lacak Status Tiket"])
        UC4(["UC-04: Kelola & Hapus Aspirasi Mandiri"])
        UC5(["UC-05: Verifikasi & Tindak Lanjut Aspirasi"])
        UC6(["UC-06: Beri Tanggapan Resmi"])
        UC7(["UC-07: Kelola Master Pengguna & Bulk Import"])
        UC8(["UC-08: Pantau Statistik & Metrik Kampus"])
    end

    M --> UC1
    M --> UC2
    M --> UC3
    M --> UC4

    A --> UC1
    A --> UC5
    A --> UC6

    ADM --> UC1
    ADM --> UC4
    ADM --> UC5
    ADM --> UC7
    ADM --> UC8

    P --> UC3
```

### 3.2 Spesifikasi Naratif Use Case

#### Use Case UC-02: Mengajukan Aspirasi Baru
* **Aktor Utama**: Mahasiswa
* **Deskripsi**: Mahasiswa menyampaikan aspirasi/laporan permasalahan perkuliahan atau fasilitas ke unit terkait.
* **Pre-kondisi**: Mahasiswa telah login ke sistem.
* **Post-kondisi**: Aspirasi tercatat dengan status `DITERIMA` dan kode tiket `ASP-YYYY-XXXXXX` diterbitkan.
* **Alur Utama (Main Flow)**:
  1. Mahasiswa membuka halaman form pengajuan aspirasi (`/ajukan`).
  2. Mahasiswa mengisi judul, deskripsi kejadian, kategori, jenjang wewenang (Jurusan/Fakultas/Universitas), tanggal, dan jam kejadian.
  3. Mahasiswa memilih mode pelaporan: **Transparan** atau **Anonim**.
  4. Mahasiswa melampirkan berkas bukti (1 - 5 file: JPG, PNG, PDF, WEBP maks 10MB) dan/atau memasukkan tautan Google Drive.
  5. Mahasiswa menekan tombol **"Kirim Aspirasi Sekarang"**.
  6. Sistem memvalidasi input, memeriksa *magic bytes* berkas, menyimpan data ke Supabase, dan menerbitkan tiket.
  7. Sistem mengarahkan mahasiswa ke halaman sukses penyerahan tiket (`/ajukan/sukses/[ticketCode]`).

#### Use Case UC-04: Menghapus Aspirasi Mandiri
* **Aktor Utama**: Mahasiswa (Pemilik Tiket) atau Admin
* **Deskripsi**: Menghapus aspirasi yang keliru atau dibatalkan oleh mahasiswa itu sendiri.
* **Pre-kondisi**: Mahasiswa login dan memiliki aspirasi pada dasbornya.
* **Alur Utama**:
  1. Mahasiswa membuka Dasbor Mahasiswa (`/dashboard/mahasiswa`).
  2. Mahasiswa mengklik tombol **Hapus** pada kartu aspirasi yang ingin dibatalkan.
  3. Sistem menampilkan modal konfirmasi penghapusan permanen.
  4. Mahasiswa mengonfirmasi dengan menekan tombol **"Hapus Aspirasi"**.
  5. Sistem menjalankan verifikasi Anti-IDOR (`user_id === session.id`).
  6. Sistem menghapus relasi lampiran, status log, respons, record aspirasi dari database, serta berkas fisik terkait.
  7. Sistem memperbarui antarmuka dasbor dan menampilkan toast sukses.

---

## 4. Activity Diagram (Diagram Aktivitas)

### 4.1 Activity Diagram: Pengajuan Aspirasi oleh Mahasiswa

```mermaid
flowchart TD
    Start([Mulai]) --> AksesForm[Buka Halaman /ajukan]
    AksesForm --> IsiForm[Isi Judul, Deskripsi, Kategori, Jenjang & Waktu]
    IsiForm --> PilihMode{Pilih Mode Identitas}
    PilihMode -- "Pakai Nama Saya" --> ModeTransparan[Set is_anonymous = false]
    PilihMode -- "Kirim Anonim" --> ModeAnonim[Set is_anonymous = true]
    
    ModeTransparan --> InputBukti[Unggah Berkas Bukti & Input Link GDrive]
    ModeAnonim --> InputBukti
    
    InputBukti --> Submit[Klik Kirim Aspirasi]
    Submit --> ValServer{Validasi Server}
    
    ValServer -- Gagal --> TampilError[Tampilkan Pesan Validasi Form]
    TampilError --> IsiForm
    
    ValServer -- Berkas Valid --> CheckMagicBytes{Validasi Magic Bytes Berkas}
    CheckMagicBytes -- Bukan JPG/PNG/PDF/WEBP Asli --> TolakBerkas[Tolak: File signature tidak valid]
    TolakBerkas --> InputBukti
    
    CheckMagicBytes -- Lolos --> SimpanStorage[Simpan Berkas ke Upload Storage / Data URI]
    SimpanStorage --> GenerateTiket[Generate Kode Tiket ASP-YYYY-XXXXXX]
    GenerateTiket --> SimpanDB[(Simpan Aspirasi & StatusLog ke Supabase)]
    SimpanDB --> RedirectSukses[Arahkan ke Halaman Sukses dengan Kode Tiket]
    RedirectSukses --> End([Selesai])
```

### 4.2 Activity Diagram: Pembatasan Maksimal 2 Perangkat (Concurrent Device Limit)

```mermaid
flowchart TD
    Start([Pengguna Melakukan Login]) --> CekKredensial{Kredensial Valid?}
    CekKredensial -- Tidak --> GagalLogin[Tampilkan Error Kredensial Salah]
    GagalLogin --> EndGagal([Selesai])
    
    CekKredensial -- Ya --> QuerySesi[(Query Sesi Aktif di UserSession)]
    QuerySesi --> HitungSesi{Jumlah Sesi Aktif >= 2?}
    
    HitungSesi -- "Ya (Sudah 2 Perangkat)" --> EvictOldest[Cari & Hapus Sesi Terlama / FIFO]
    EvictOldest --> HapusDBSesi[(Delete Oldest Record di UserSession)]
    HapusDBSesi --> BuatSesiBaru
    
    HitungSesi -- "Tidak (< 2 Perangkat)" --> BuatSesiBaru[Generate session_id / JTI Baru]
    
    BuatSesiBaru --> SimpanSesiDB[(Insert Sesi Baru ke UserSession)]
    SimpanSesiDB --> TerbitkanJWT[Sign JWT dengan session_id & Set Cookie asma_session]
    TerbitkanJWT --> BukaDasbor[Arahkan ke Dasbor Pengguna]
    
    subgraph "Perangkat Terlama yang Dicabut (Kicked Out)"
        DeviceLama[Perangkat 1 Mengakses Web / Ganti Tab] --> PingMe[Request ke /api/auth/me]
        PingMe --> CheckSessionDB{session_id Masih Ada di DB?}
        CheckSessionDB -- Tidak Ditemukan --> ClearCookie[Hapus Cookie asma_session]
        ClearCookie --> RedirectLimit[Redirect ke /login?reason=device_limit]
        RedirectLimit --> TampilBannerLimit[Tampilkan Banner: Batas Maksimal 2 Perangkat Tercapai]
    end
    
    BukaDasbor --> End([Selesai])
```

### 4.3 Activity Diagram: Pemantauan Inaktivitas 1 Jam (Auto-Logout)

```mermaid
flowchart TD
    Start([Pengguna Membuka Web dalam Kondisi Login]) --> InitListener[Inisialisasi Event Listener: Mouse, Keyboard, Scroll, Touch]
    InitListener --> SetTimestamp[Simpan asma_last_activity = Date.now di LocalStorage]
    
    SetTimestamp --> LoopCheck{Interval Cek Setiap 2-5 Detik}
    LoopCheck --> HitungElapsed[Hitung: elapsed = Date.now - asma_last_activity]
    
    HitungElapsed --> CekAktivitas{Ada Input Pengguna?}
    CekAktivitas -- Ya --> ResetTimer[Update asma_last_activity = Date.now]
    ResetTimer --> TutupModalJikaAda[Tutup Modal Peringatan jika Terbuka]
    TutupModalJikaAda --> LoopCheck
    
    CekAktivitas -- Tidak --> CekDurasi{Kondisi Durasi Idle}
    CekDurasi -- "elapsed >= 58 Menit (Sisa 2 Menit)" --> TampilModalWarning[Tampilkan Modal Countdown: Sesi Akan Berakhir]
    TampilModalWarning --> CekTombol{Pengguna Klik 'Tetap Masuk'?}
    CekTombol -- Ya --> ResetTimer
    CekTombol -- Tidak --> CekDurasi
    
    CekDurasi -- "elapsed >= 60 Menit (1 Jam)" --> ExecLogout[Panggil API /api/auth/logout]
    ExecLogout --> ClearStorage[Hapus asma_last_activity dari LocalStorage]
    ClearStorage --> RedirectInactivity[Redirect ke /login?reason=inactivity]
    RedirectInactivity --> End([Selesai])
```

---

## 5. Sequence Diagram (Diagram Urutan)

### 5.1 Sequence Diagram: Pengajuan Aspirasi Baru oleh Mahasiswa

```mermaid
sequenceDiagram
    autonumber
    actor M as Mahasiswa
    participant FE as Frontend (/ajukan)
    participant API as API Route (/api/aspirations)
    participant VAL as File Validator (Magic Bytes)
    participant PRISMA as Prisma Client
    participant DB as PostgreSQL (Supabase)

    M->>FE: Isi Form & Unggah Berkas Bukti (Maks 5 File)
    M->>FE: Klik "Kirim Aspirasi Sekarang"
    FE->>API: POST /api/aspirations (Multipart FormData)
    
    API->>API: Verifikasi Sesi Pengguna (JWT Session Cookie)
    alt Sesi Tidak Valid
        API-->>FE: 401 Unauthorized
        FE-->>M: Tampilkan Redirect Login
    else Sesi Valid
        API->>VAL: Validasi Buffer Tiap Berkas
        VAL-->>API: Status Valid (MIME: jpg/png/pdf/webp)
        
        API->>API: Generate Unique File Names & Ticket Code (ASP-2026-XXXXXX)
        API->>PRISMA: prisma.aspiration.create(...)
        PRISMA->>DB: INSERT into "Aspiration", "Attachment", "StatusLog"
        DB-->>PRISMA: Records Berhasil Dibuat
        PRISMA-->>API: Data Aspirasi & Kode Tiket
        
        API-->>FE: 201 Created { ticket_code: "ASP-2026-004812" }
        FE-->>M: Redirect ke /ajukan/sukses/ASP-2026-004812
    end
```

### 5.2 Sequence Diagram: Manajemen Batas 2 Perangkat Aktif (Device Limit Eviction)

```mermaid
sequenceDiagram
    autonumber
    actor D3 as Device 3 (Perangkat Baru)
    participant API as Auth API (/api/auth/login)
    participant SESS as Session Manager (session.ts)
    participant DB as PostgreSQL (Supabase)
    actor D1 as Device 1 (Perangkat Terlama)

    Note over D1,DB: Akun saat ini aktif di Device 1 dan Device 2 (Total = 2)
    
    D3->>API: POST /api/auth/login (NIM & Password)
    API->>DB: Verifikasi Kredensial Pengguna
    DB-->>API: Kredensial Valid
    
    API->>SESS: createSessionForUser(user, request)
    SESS->>DB: SELECT * FROM "UserSession" WHERE user_id = user.id ORDER BY created_at ASC
    DB-->>SESS: Ditemukan 2 Sesi Aktif [Device 1, Device 2]
    
    SESS->>DB: DELETE FROM "UserSession" WHERE id = Device 1 (FIFO Eviction)
    DB-->>SESS: Device 1 Berhasil Dihapus
    
    SESS->>DB: INSERT INTO "UserSession" (Device 3, session_id_baru)
    DB-->>SESS: Sesi Device 3 Tersimpan
    
    SESS-->>API: Return Token Baru dengan session_id_baru
    API-->>D3: 200 OK + Set-Cookie (Device 3 Berhasil Masuk)
    
    Note over D1,DB: Device 1 Mencoba Melakukan Aktivitas
    D1->>API: GET /api/auth/me (Membawa Cookie Device 1)
    API->>DB: SELECT FROM "UserSession" WHERE token_id = session_id_device_1
    DB-->>API: Record Tidak Ditemukan (Sudah Ter-evict)
    
    API-->>D1: 401 Unauthorized { reason: "device_limit" } + Clear Cookie
    D1->>D1: Redirect ke /login?reason=device_limit
    D1-->>D1: Tampilkan Banner: Sesi Dicabut karena Login di Perangkat Lain
```

### 5.3 Sequence Diagram: Tindak Lanjut & Tanggapan Resmi oleh Akademisi

```mermaid
sequenceDiagram
    autonumber
    actor A as Akademisi / Dosen
    participant FE as Dashboard (/dashboard/akademisi)
    participant API as API Route (/api/aspirations/[ticketCode])
    participant DB as PostgreSQL (Supabase)
    actor M as Mahasiswa (Pelapor)

    A->>FE: Buka Tiket Aspirasi & Tinjau Berkas Bukti
    A->>FE: Pilih Status "DIPROSES" / "DITINDAKLANJUTI" + Tulis Catatan
    A->>FE: Ketik Tanggapan Resmi ke Mahasiswa
    A->>FE: Klik "Simpan Perubahan & Tanggapan"
    
    FE->>API: PATCH /api/aspirations/[ticketCode]
    API->>API: Cek Role & Scope Level Akademisi
    API->>DB: UPDATE "Aspiration" SET current_status = status_baru
    API->>DB: INSERT INTO "StatusLog" (status, note, updated_by_name)
    API->>DB: INSERT INTO "Response" (responder_id, response_text)
    DB-->>API: Database Berhasil Diperbarui
    
    API-->>FE: 200 OK (Data Berhasil Disimpan)
    FE-->>A: Tampilkan Notifikasi Sukses
    
    Note over M,DB: Mahasiswa Melacak Tiketnya
    M->>FE: Akses Halaman Lacak (/lacak?ticket=ASP-2026-004812)
    FE->>DB: Query Status Terkini, StatusLog, dan Response
    DB-->>FE: Riwayat Lengkap & Pesan Akademisi
    FE-->>M: Tampilkan Status Terkini & Tanggapan Resmi di Timeline
```

---

## 6. Entity Relationship Diagram (ERD) & Kamus Data

### 6.1 Diagram ERD Relasional

```mermaid
erDiagram
    User ||--o{ UserSession : "has (max 2 active)"
    User ||--o{ Aspiration : "submits"
    User ||--o{ Response : "writes"
    Category ||--o{ Aspiration : "categorizes"
    Aspiration ||--o{ Attachment : "contains (max 5)"
    Aspiration ||--o{ StatusLog : "tracks"
    Aspiration ||--o{ Response : "receives"

    User {
        String id PK "UUID"
        String nim_nip UK "NIM / NIP / Username"
        String name "Nama Lengkap Civitas"
        String email UK "Email resmi UIN"
        String password_hash "Bcrypt Salted Hash"
        Role role "MAHASISWA | AKADEMISI | ADMIN"
        TargetLevel scope_level "JURUSAN | FAKULTAS | UNIVERSITAS"
        Boolean must_change_pwd "Default password flag"
        DateTime created_at "Timestamp pembuatan"
        DateTime updated_at "Timestamp pembaruan"
    }

    UserSession {
        String id PK "UUID"
        String user_id FK "Relasi ke User"
        String token_id UK "Unique Session Identifier (JTI)"
        String device_info "Browser & OS Summary"
        String ip_address "IP Address Pengguna"
        DateTime last_active "Waktu aktivitas terakhir"
        DateTime created_at "Waktu login"
    }

    Category {
        Int id PK "Autoincrement"
        String category_name UK "Nama Kategori Pengaduan"
        String description "Keterangan Kategori"
    }

    Aspiration {
        String id PK "UUID"
        String ticket_code UK "Format: ASP-YYYY-XXXXXX"
        String user_id FK "Relasi ke User Pelapor"
        Int category_id FK "Relasi ke Category"
        String title "Judul Keluhan / Aspirasi"
        String description "Deskripsi Rinci Peristiwa"
        TargetLevel target_level "JURUSAN | FAKULTAS | UNIVERSITAS"
        AspirationStatus current_status "DITERIMA | DIPROSES | DITINDAKLANJUTI | SELESAI"
        DateTime incident_date "Tanggal Kejadian"
        String incident_time "Waktu Kejadian (contoh: 13:30 WIB)"
        Boolean is_anonymous "Flag Mode Anonim (true/false)"
        String drive_link "URL Berkas Cloud Tambahan"
        DateTime created_at "Timestamp Pengajuan"
        DateTime updated_at "Timestamp Pembaruan"
    }

    Attachment {
        String id PK "UUID"
        String aspiration_id FK "Relasi ke Aspiration"
        String file_name "Nama Asli Berkas Sanitasi"
        String file_path "Jalur Storage Berkas / Data URI"
        String file_type "MIME Type (image/jpeg, etc)"
        Int file_size "Ukuran berkas dalam bytes (Maks 10MB)"
        DateTime uploaded_at "Timestamp Pengunggahan"
    }

    StatusLog {
        String id PK "UUID"
        String aspiration_id FK "Relasi ke Aspiration"
        AspirationStatus status "Status Tahapan"
        String note "Catatan Perkembangan Penanganan"
        String updated_by_name "Nama Petugas / Sistem"
        DateTime changed_at "Waktu Perubahan Status"
    }

    Response {
        String id PK "UUID"
        String aspiration_id FK "Relasi ke Aspiration"
        String responder_id FK "Relasi ke User Penanggap"
        String response_text "Isi Tanggapan Resmi"
        DateTime responded_at "Waktu Tanggapan Diberikan"
    }
```

### 6.2 Kamus Data & Batasan Atribut (Data Dictionary)

1. **`User`**:
   * `nim_nip`: `VARCHAR(50)`, Unique, Not Null. Kunci pencarian otentikasi utama.
   * `role`: Enum (`MAHASISWA`, `AKADEMISI`, `ADMIN`).
   * `scope_level`: Enum Nullable (`JURUSAN`, `FAKULTAS`, `UNIVERSITAS`).
   * `must_change_pwd`: `BOOLEAN`, Default `true`. Mengontrol kemunculan modal ganti kata sandi.

2. **`UserSession`**:
   * `token_id`: `VARCHAR(255)`, Unique, Not Null, Indexed. Mengaitkan payload JWT secara *stateful* ke database untuk menegakkan batas **2 perangkat aktif**.
   * `device_info`: `VARCHAR(255)`. Menyimpan informasi ringkas perangkat (misal: `Chrome (Windows PC)`).

3. **`Aspiration`**:
   * `ticket_code`: `VARCHAR(32)`, Unique, Not Null, Indexed. Kode pelacakan publik (format `ASP-YYYY-XXXXXX`).
   * `is_anonymous`: `BOOLEAN`, Default `false`. Menentukan apakah nama mahasiswa disamarkan pada API peninjau dan publik.
   * `drive_link`: `TEXT`, Nullable. Menampung URL tautan Google Drive / OneDrive.

4. **`Attachment`**:
   * `file_size`: `INTEGER`. Dibatasi maksimal 10.485.760 bytes (10 MB).
   * `file_path`: `TEXT`. Menyimpan direktori berkas aman atau fallback Base64 Data URI untuk kompatibilitas lingkungan Serverless Read-Only.

---

## 7. Arsitektur Keamanan & Deployment

```
[ Klien Mahasiswa / Dosen ]
            │
            ▼ (HTTPS / TLS 1.3)
   [ Vercel Edge Network ]
            │
            ├─► Middleware.ts (JWT Route Protection & Role Boundary)
            │
            ├─► Next.js 15 Serverless Lambdas
            │       ├─► Safe JWT Secret Fallback (Non-blocking build)
            │       ├─► Deep Magic Bytes Signature Validator (Anti-RCE)
            │       ├─► Anti-IDOR Authorization Guard
            │       └─► Inactivity & Multi-Device Session Controller
            │
            ▼ (Encrypted PostgreSQL Pooler TCP Port 5432 / 6543)
  [ Supabase Cloud Database (Singapore - ap-southeast-1) ]
            ├─► User & UserSession Tables (Max 2 Concurrent Devices)
            ├─► Aspiration & Attachment Tables
            └─► StatusLog & Response Tables
```

### Jaminan Keamanan Sistem:
1. **Perlindungan Terhadap Ancaman IDOR (Insecure Direct Object Reference)**:
   Penghapusan aspirasi diverifikasi ketat di level API:
   ```ts
   if (session.role === 'MAHASISWA' && aspiration.user_id !== session.id) {
     return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
   }
   ```
2. **Perlindungan Ekstensi Berkas Palsu**:
   Validasi pengunggahan tidak mempercayai header browser (`Content-Type`), melainkan membaca langsung *byte signature* awal berkas biner (contoh: `FF D8 FF` untuk JPEG, `89 50 4E 47` untuk PNG, `%PDF` untuk PDF).
3. **Pemisahan Perangkat Bersih (FIFO Device Revocation)**:
   Setiap kali pengguna login dari perangkat ketiga, *record* sesi tertua dihapus dari PostgreSQL, menyebabkan perangkat lama langsung ter-logout saat melakukan navigasi berikutnya.

---
*Dokumen ini disusun sebagai acuan formal analisis, perancangan, dan pengembangan sistem perangkat lunak ASMA UIN Syarif Hidayatullah Jakarta.*
