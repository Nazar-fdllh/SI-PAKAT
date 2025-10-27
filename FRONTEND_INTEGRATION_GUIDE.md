# Panduan Integrasi Frontend ke Backend SI-PAKAT

Dokumen ini adalah panduan teknis bagi tim frontend untuk menghubungkan aplikasi Next.js (frontend) dengan server Express.js (backend).

---

## 1. Konsep Dasar Integrasi

### a. Komunikasi via REST API
- **Arsitektur**: Frontend (Next.js) bertindak sebagai *client* dan backend (Express.js) sebagai *server*.
- **Metode**: Komunikasi terjadi melalui panggilan **REST API** menggunakan protokol HTTP. Frontend akan melakukan request (GET, POST, PUT, DELETE) ke endpoint yang disediakan oleh backend.
- **Base URL Backend**: Semua request API akan ditujukan ke `http://localhost:3001`.

### b. Halaman/Komponen yang Memerlukan Integrasi
Berikut adalah pemetaan halaman/fitur di frontend yang harus berinteraksi dengan backend:

1.  **Login Pengguna**: `/login` (Komponen: `src/components/auth/login-form.tsx`).
2.  **Manajemen Aset (CRUD)**: `/assets` (Komponen: `src/components/assets/asset-table.tsx`, `asset-dialog.tsx`).
3.  **Detail & Penilaian Aset**: `/assets/[id]` (Komponen: `src/components/assets/asset-details.tsx`, `assessment-form.tsx`).
4.  **Manajemen Pengguna (CRUD)**: `/users` (Komponen: `src/components/users/user-table.tsx`, `user-dialog.tsx`).
5.  **Pelaporan**: `/reports` (Komponen: `src/app/(app)/reports/page.tsx`).
6.  **Profil Pengguna**: `/profile` (Komponen: `src/components/profile/profile-form.tsx`).
7.  **Dasbor**: `/dashboard` (Menampilkan statistik dari data aset).

---

## 2. Alur Autentikasi (JWT)

Ini adalah bagian paling krusial. Alur login dan penggunaan token harus diimplementasikan terlebih dahulu.

1.  **Proses Login**:
    -   Pengguna mengisi email dan password di `LoginForm`.
    -   Formulir memanggil Server Action `login` di `src/lib/actions.ts`.
    -   **[PERUBAHAN]** Server Action `login` harus diubah untuk melakukan `fetch` ke endpoint backend `POST /api/auth/login`.
    -   Jika login di backend berhasil, backend akan mengembalikan **`accessToken`** (JWT).
    -   Server Action `login` menerima token ini dan menyimpannya di **HTTP-only cookie** pada browser pengguna.

2.  **Menggunakan Token untuk Request Berikutnya**:
    -   Saat frontend perlu mengakses endpoint yang terproteksi (seperti mengambil daftar aset), ia harus menyertakan token tersebut.
    -   Karena token disimpan di cookie, Next.js Server Components dan Server Actions dapat secara otomatis meneruskan cookie ini saat melakukan `fetch` ke backend.
    -   Untuk request dari Client Components (menggunakan `useEffect`), kita perlu memastikan `fetch` dikonfigurasi untuk menyertakan kredensial (cookie).

---

## 3. Bagian Frontend yang Perlu Diubah

Saat ini, sebagian besar frontend masih menggunakan data statis dari `src/lib/data.ts`. Kita harus mengganti ini dengan panggilan API.

### a. `src/lib/actions.ts` (Untuk Autentikasi)

#### **Fungsi `login`**:
- **Sebelumnya**: Memvalidasi pengguna terhadap data statis `initialUsers`.
- **Sesudah**: Melakukan `fetch` ke `http://localhost:3001/api/auth/login` dengan method `POST` dan body berisi email/password. Jika berhasil, simpan `accessToken` yang diterima ke dalam cookie.

**Contoh Implementasi (`login` action):**
```javascript
// src/lib/actions.ts

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) { /* ... penanganan error validasi ... */ }

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { message: result.message || 'Login gagal.' };
    }

    // Simpan token ke cookie
    cookies().set('accessToken', result.accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari (sesuaikan dengan backend)
    });

  } catch (error) {
    return { message: 'Tidak dapat terhubung ke server.' };
  }

  redirect('/dashboard');
}

// Fungsi logout juga diubah untuk menghapus cookie 'accessToken'
export async function logout() {
  cookies().delete('accessToken');
  redirect('/login');
}
```

### b. `src/app/(app)/assets/page.tsx` (Manajemen Aset)

- **Sebelumnya**: Menggunakan `useState` dengan data dari `getEnrichedAssets()`.
- **Sesudah**:
    1.  Buat fungsi `fetchAssets` yang melakukan panggilan `GET /api/assets` dari Server Component (jika memungkinkan) atau dari `useEffect` di Client Component.
    2.  Panggilan `fetch` harus menyertakan token dari cookie.
    3.  Fungsi `handleSaveAsset` dan `handleDeleteAsset` harus diubah untuk melakukan request `POST`/`PUT` atau `DELETE` ke backend.

**Contoh Implementasi (Fetch di Client Component):**
```javascript
// src/app/(app)/assets/page.tsx (di dalam 'AssetsPage' component)

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Perlu install: npm install js-cookie @types/js-cookie

// ...

const [assets, setAssets] = useState<Asset[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function loadAssets() {
    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken'); // Ambil token dari cookie di client
      const response = await fetch('http://localhost:3001/api/assets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data aset');
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error(error);
      // Tampilkan pesan error ke pengguna
    } finally {
      setIsLoading(false);
    }
  }
  loadAssets();
}, []);

// handleSaveAsset perlu diubah untuk POST/PUT
const handleSaveAsset = async (assetData: Asset) => {
    const token = Cookies.get('accessToken');
    const isEditing = !!selectedAsset;
    const url = isEditing ? `http://localhost:3001/api/assets/${assetData.id}` : 'http://localhost:3001/api/assets';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assetData) // Pastikan payload sesuai
    });
    // ... handle response, refresh data, tutup dialog
};

// ... handleDeleteAsset juga diubah untuk DELETE
```

### c. `src/app/(app)/users/page.tsx` (Manajemen Pengguna)

Logikanya sangat mirip dengan halaman Aset. Ganti `initialUsers` dengan data dari `GET /api/users` menggunakan `useEffect` dan `fetch`. Fungsi untuk menambah, mengedit, dan menghapus pengguna juga harus diubah untuk memanggil endpoint backend yang sesuai.

### d. Penyesuaian Tampilan Berdasarkan Peran

- **Sebelumnya**: `useSession` mengambil data dari `SessionProvider` yang sumbernya dari `getCurrentUser` & `getCurrentRole` (`lib/session.ts`) yang membaca cookie `user_email`.
- **Sesudah**: Mekanisme ini sudah cukup baik, tetapi sumber data `role` harus didasarkan pada token JWT yang valid, bukan hanya dari email.
    1.  Saat login, backend menyertakan `role` di dalam payload JWT.
    2.  Di `lib/session.ts`, fungsi `getCurrentRole` harus diubah untuk membaca dan mendekode JWT dari cookie `accessToken` untuk mendapatkan peran pengguna yang sebenarnya.

**Contoh Implementasi (`getCurrentUser` yang diperbarui):**
```javascript
// src/lib/session.ts (perlu install 'jose': npm install jose)
import { jwtVerify } from 'jose';

export async function getCurrentUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return undefined;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // Backend harus menyertakan detail user di payload token
        // Contoh payload: { id: 1, name: 'Admin Utama', email: 'admin@...', role: 'Administrator' }
        return {
            id: payload.id as number,
            name: payload.name as string,
            email: payload.email as string,
            role: payload.role as string, // Atau sesuaikan dengan struktur payload Anda
        };
    } catch (e) {
        console.error('JWT verification failed:', e);
        return undefined;
    }
}
```

---

## 4. Checklist Akhir Integrasi

Gunakan daftar ini untuk memverifikasi bahwa semua bagian telah terintegrasi dengan benar.

-   [ ] **Setup Backend**: Pastikan server backend Express.js berjalan di `http://localhost:3001` tanpa error.
-   [ ] **Variabel Lingkungan**: Buat file `.env.local` di root frontend dan tambahkan `JWT_SECRET` yang sama dengan yang ada di backend.
-   [ ] **Login & Logout**:
    -   [ ] Halaman Login (`/login`) berhasil melakukan request ke `POST /api/auth/login`.
    -   [ ] `accessToken` dari backend berhasil disimpan di cookie setelah login.
    -   [ ] Pengguna dialihkan ke `/dashboard` setelah login berhasil.
    -   [ ] Tombol Logout menghapus cookie `accessToken` dan mengalihkan ke `/login`.
-   [ ] **Akses Terproteksi**:
    -   [ ] Halaman Aset (`/assets`) berhasil mengambil data dari `GET /api/assets` menggunakan token dari cookie.
    -   [ ] Halaman Pengguna (`/users`) berhasil mengambil data dari `GET /api/users`.
    -   [ ] Mencoba mengakses halaman tanpa login akan mengalihkan kembali ke `/login`.
-   [ ] **Fungsionalitas CRUD**:
    -   [ ] **Aset**: Tambah, Edit, dan Hapus aset berfungsi melalui panggilan API (`POST`, `PUT`, `DELETE` ke `/api/assets`).
    -   [ ] **Pengguna**: Tambah, Edit, dan Hapus pengguna berfungsi melalui panggilan API ke `/api/users`.
-   [ ] **Penyesuaian Peran (Role-based Access)**:
    -   [ ] Menu sidebar menyesuaikan tampilannya sesuai dengan peran pengguna (misalnya, 'Manajemen Pengguna' hanya untuk 'Administrator').
    -   [ ] Tombol 'Tambah Aset' atau 'Edit' disembunyikan untuk peran 'Auditor'.
-   [ ] **Pelaporan**:
    -   [ ] Halaman Laporan (`/reports`) berhasil memfilter dan membuka halaman cetak dengan data dari `GET /api/reports`.
-   [ ] **Penanganan Error**:
    -   [ ] Pesan error yang jelas ditampilkan jika API request gagal (misalnya, "Tidak dapat terhubung ke server" atau pesan error dari backend).
    -   [ ] Jika token tidak valid atau kedaluwarsa, pengguna secara otomatis diarahkan ke halaman login.

---
