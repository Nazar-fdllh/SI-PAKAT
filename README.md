# SI-PAKAT Digital: Sistem Informasi Pengelolaan Keamanan Aset TIK

SI-PAKAT adalah aplikasi web lengkap yang dirancang untuk membantu organisasi mengelola, menilai, dan memantau keamanan aset Teknologi Informasi dan Komunikasi (TIK) secara terpusat dan efisien.

Aplikasi ini dibangun dengan arsitektur modern yang memisahkan frontend dan backend, memastikan skalabilitas dan kemudahan pemeliharaan.

## Masalah yang Diselesaikan

-   **Inventaris Aset yang Tercecer**: Menyediakan satu sumber kebenaran untuk semua aset TIK, dari server fisik hingga data digital.
-   **Penilaian Risiko Subjektif**: Menstandarkan proses penilaian keamanan aset menggunakan 5 kriteria untuk menghasilkan klasifikasi nilai yang objektif (Tinggi, Sedang, Rendah).
-   **Kebutuhan Audit & Pelaporan**: Mempercepat proses audit dengan menyediakan laporan yang dapat difilter dan dicetak secara profesional.
-   **Jejak Audit (Forensik)**: Mencatat semua aktivitas penting pengguna untuk memastikan akuntabilitas dan keamanan sistem.

## Fitur Utama

-   **Dasbor Analitik**: Visualisasi ringkas mengenai distribusi, nilai, dan statistik aset TIK.
-   **Manajemen Inventaris Aset (CRUD)**: Siklus hidup penuh pengelolaan aset, mulai dari pembuatan, pembaruan, hingga penghapusan.
-   **Penilaian Keamanan Aset**: Penilaian risiko berdasarkan 5 kriteria (Kerahasiaan, Integritas, Ketersediaan, Keaslian, Non-repudiasi).
-   **Pusat Pelaporan**: Hasilkan laporan aset yang dapat difilter berdasarkan kategori dan nilai aset, lengkap dengan format siap cetak.
-   **Manajemen Pengguna & Peran**: Kelola akun pengguna dan tetapkan peran (Administrator, Manajer Aset, Auditor) dengan hak akses yang berbeda.
-   **Log Aktivitas Forensik**: Lacak semua perubahan dan aktivitas penting dalam sistem, bahkan untuk pengguna yang telah dihapus.
-   **Autentikasi Aman**: Sistem login berbasis JWT (JSON Web Token), lengkap dengan fitur lupa/reset password melalui email dan perlindungan CAPTCHA.

## Arsitektur & Teknologi

SI-PAKAT menggunakan arsitektur **Client-Server** modern.

-   **Frontend**:
    -   **Framework**: Next.js 14+ dengan App Router
    -   **Bahasa**: TypeScript
    -   **UI**: React, ShadCN UI, Tailwind CSS
    -   **Grafik**: Recharts
-   **Backend**:
    -   **Runtime**: Node.js
    -   **Framework**: Express.js
    -   **Bahasa**: JavaScript (ES6+)
-   **Database**:
    -   **Sistem**: MySQL
    -   **Driver**: `mysql2/promise`
-   **Komunikasi**:
    -   REST API dengan otentikasi **JSON Web Token (JWT)**.

## Struktur Folder & Modul Utama

Berikut adalah penjelasan singkat tentang direktori dan file terpenting dalam proyek ini.

### Frontend (`/src`)

```
/src
├── /app/                  # Halaman & Rute (Next.js App Router)
│   ├── /(app)/            # Rute yang dilindungi autentikasi (dasbor, aset, dll.)
│   ├── /login/            # Halaman Login
│   └── /print/            # Layout khusus untuk halaman cetak laporan
├── /components/           # Komponen React yang dapat digunakan kembali
│   ├── /assets/           # Komponen terkait aset (tabel, form, dialog)
│   ├── /users/            # Komponen terkait pengguna
│   ├── /dashboard/        # Komponen untuk halaman dasbor (grafik, statistik)
│   └── /ui/               # Komponen UI dasar dari ShadCN (Button, Card, dll.)
├── /lib/                  # Logika inti, definisi tipe, dan helper
│   ├── actions.ts         # Server Actions (login, logout)
│   ├── data.ts            # Fungsi untuk fetch data dari API backend
│   ├── definitions.ts     # Definisi tipe data TypeScript (User, Asset, dll.)
│   └── session.ts         # Logika untuk mengelola sesi pengguna dari JWT
└── /hooks/                # Custom React Hooks (useSession, useDebounce)
```

### Backend (dijelaskan dalam `BACKEND_GUIDE.md`)

```
/si-pakat-backend
├── /config/               # Konfigurasi (koneksi database)
│   └── db.js
├── /controllers/          # Logika bisnis (memproses request & response)
│   ├── authController.js
│   └── assetController.js
├── /middlewares/          # Fungsi middleware (autentikasi, validasi, logging)
│   ├── authMiddleware.js  # Verifikasi JWT
│   └── activityLogger.js  # Pencatat aktivitas
├── /routes/               # Definisi endpoint API
│   ├── authRoutes.js
│   └── assetRoutes.js
└── server.js              # Titik masuk utama server Express.js
```
