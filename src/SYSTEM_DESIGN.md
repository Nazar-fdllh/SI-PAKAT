# Dokumentasi Desain Sistem: SI-PAKAT

Dokumen ini menjelaskan desain fungsional dan teknis dari aplikasi SI-PAKAT (Sistem Informasi Pengelolaan Keamanan Aset TIK).

## 1. Analisis Kebutuhan Fungsional (Use Case)

Bagian ini menguraikan fungsionalitas sistem dari perspektif pengguna (aktor) berdasarkan diagram yang diberikan.

### 1.1. Daftar Aktor dan Use Case

**Aktor: Administrator**
*   Kelola Data Master
*   Kelola Pengguna & Role

**Aktor: Manajer Aset**
*   Kelola Konfigurasi Sistem
*   Kelola Data Aset
*   Lakukan Penilaian Aset

**Aktor: Auditor/Pimpinan**
*   Lihat Dasbor
*   Cetak Laporan

### 1.2. Deskripsi Use Case

| Aktor | Use Case | Deskripsi |
| :--- | :--- | :--- |
| **Administrator** | Kelola Data Master | Mengelola data referensi utama yang digunakan di seluruh sistem, seperti kategori dan sub-kategori aset. |
| | Kelola Pengguna & Role | Membuat, melihat, memperbarui, dan menghapus akun pengguna beserta peran (hak akses) mereka di dalam sistem. |
| **Manajer Aset** | Kelola Konfigurasi Sistem | Mengatur parameter dan ambang batas sistem, terutama yang berkaitan dengan skor penilaian untuk klasifikasi nilai aset (Tinggi, Sedang, Rendah). |
| | Kelola Data Aset | Melakukan siklus hidup manajemen aset secara penuh, termasuk membuat, melihat daftar, memperbarui detail, dan menghapus data aset (CRUD). |
| | Lakukan Penilaian Aset | Memasukkan skor untuk 5 kriteria keamanan (kerahasiaan, integritas, dll.) terhadap sebuah aset. Sistem akan otomatis menghitung total skor dan menentukan nilai asetnya. |
| **Auditor/Pimpinan** | Lihat Dasbor | Mengakses halaman utama yang menampilkan ringkasan statistik, grafik distribusi aset, dan daftar aset terbaru untuk pemantauan tingkat tinggi. |
| | Cetak Laporan | Menghasilkan laporan inventaris aset yang dapat difilter dan diformat secara profesional untuk keperluan audit atau pengambilan keputusan. |

### 1.3. Relasi Antar Use Case

*   **`<<include>>`**: `Kelola Data Aset` **mencakup** `Lakukan Penilaian Aset`. Ini berarti setiap kali aset baru dibuat atau detailnya diperbarui secara signifikan, proses penilaian keamanan adalah bagian yang tidak terpisahkan dari alur kerja tersebut.

---

## 2. Desain Arsitektur Sistem

### 2.1. Arsitektur High-Level

SI-PAKAT menggunakan arsitektur **Client-Server** dengan pemisahan yang jelas antara frontend dan backend.

```mermaid
graph TD
    subgraph "Pengguna"
        Client[Browser Web]
    end
    
    subgraph "Infrastruktur Cloud/Lokal"
        Frontend[Frontend Server <br> (Next.js)]
        Backend[Backend Server <br> (Express.js)]
        DB[(Database <br> MySQL)]
    end

    Client -- HTTPS Request --> Frontend
    Frontend -- REST API Call --> Backend
    Backend -- SQL Query --> DB
    DB -- SQL Response --> Backend
    Backend -- JSON Response --> Frontend
    Frontend -- HTML/JS/CSS --> Client
```

1.  **Client (Browser)**: Pengguna berinteraksi dengan antarmuka aplikasi yang dirender oleh server frontend.
2.  **Frontend Server (Next.js)**: Bertugas menyajikan antarmuka pengguna (UI), mengelola status sesi (cookie), dan berkomunikasi dengan backend melalui panggilan REST API. Sebagian besar logika UI dan interaksi awal terjadi di sini.
3.  **Backend Server (Express.js)**: Bertindak sebagai otak aplikasi. Menerima permintaan dari frontend, menerapkan logika bisnis (validasi, perhitungan skor, otorisasi), dan berinteraksi langsung dengan database.
4.  **Database (MySQL)**: Menyimpan semua data persisten, termasuk pengguna, aset, peran, log, dan riwayat penilaian.

### 2.2. Diagram Komponen & Tanggung Jawab

| Komponen/Modul | Teknologi | Tanggung Jawab Utama |
| :--- | :--- | :--- |
| **UI Components (`src/components`)** | React, ShadCN UI | Menyediakan elemen antarmuka yang dapat digunakan kembali seperti tabel, formulir, dialog, dan kartu. |
| **Routing & Layouts (`src/app`)** | Next.js App Router | Mendefinisikan struktur halaman, rute URL, dan tata letak aplikasi (termasuk sidebar dan header). Melindungi rute berdasarkan sesi pengguna. |
| **State Management (`src/hooks`)** | React Hooks, Context | Mengelola status sesi pengguna di sisi klien (`useSession`) dan status UI lainnya. |
| **API Client (`src/lib/data.ts`)** | Fetch API | Bertindak sebagai lapisan abstraksi untuk semua panggilan ke backend. Secara otomatis menyematkan token otorisasi (JWT) pada setiap permintaan. |
| **Server Actions (`src/lib/actions.ts`)**| Next.js | Menangani logika sisi server yang dipicu oleh interaksi formulir, seperti proses login dan logout, dengan aman mengelola cookie. |
| **API Endpoints (`/routes`)** | Express.js Router | Mendefinisikan semua rute REST API (misal: `/api/users`, `/api/assets`) dan menghubungkannya ke *controller* yang sesuai. |
| **Middleware (`/middlewares`)** | Express.js | Menerapkan logika lintas-fungsi seperti verifikasi token JWT (`authMiddleware`), pengecekan peran (`roleMiddleware`), dan pencatatan aktivitas (`activityLogger`). |
| **Business Logic (`/controllers`)** | Express.js | Berisi logika inti aplikasi: memproses data dari permintaan, berinteraksi dengan model data (database), dan menyiapkan respons. |
| **Database Connection (`/config/db.js`)** | `mysql2` | Mengelola koneksi dan *connection pool* ke database MySQL, memastikan koneksi yang efisien dan andal. |

### 2.3. Alur Data (Contoh: Menambah Aset Baru)

1.  **Pengguna (Manajer Aset)** menekan tombol "Tambah Aset" di UI.
2.  **Frontend (`AssetDialog`)** menampilkan formulir (`AssetForm.tsx`).
3.  Pengguna mengisi detail aset dan skor penilaian, lalu menekan "Simpan".
4.  **Frontend (`AssetTable`)** memanggil fungsi `handleSaveAsset`, yang kemudian memanggil `createAsset` dari `src/lib/data.ts`.
5.  **API Client (`data.ts`)** melakukan `fetch` dengan metode `POST` ke endpoint backend `/api/assets`. Token JWT dari cookie secara otomatis disertakan dalam *header* `Authorization`.
6.  **Backend (Express.js)** menerima permintaan di `/routes/assetRoutes.js`.
7.  **Middleware (`authMiddleware`)** memverifikasi JWT, memastikan pengguna valid.
8.  **Middleware (`roleMiddleware`)** memeriksa apakah peran pengguna adalah "Manajer Aset" atau "Administrator". Jika tidak, permintaan ditolak.
9.  **Controller (`assetController.js`)** menerima data aset.
10. **Controller** memulai transaksi database.
11. **Controller** memasukkan data dasar aset ke tabel `assets`.
12. **Controller** memasukkan data penilaian ke tabel `asset_assessments` dan data detail (misal: spesifikasi hardware) ke tabel anak yang relevan.
13. **Database (MySQL)** mengeksekusi *query* dan mengonfirmasi transaksi berhasil.
14. **Controller** mengirimkan respons JSON `201 Created` berisi data aset yang baru dibuat.
15. **Middleware (`activityLogger.js`)** mencatat aktivitas "Membuat Aset Baru" ke tabel `activity_logs` setelah respons berhasil dikirim.
16. **Frontend** menerima respons, menutup dialog, menampilkan notifikasi sukses, dan memuat ulang daftar aset untuk menampilkan data baru.
