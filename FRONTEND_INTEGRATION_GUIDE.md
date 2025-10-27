# Panduan Integrasi Frontend ke Backend SI-PAKAT

Dokumen ini adalah panduan teknis bagi tim frontend untuk menghubungkan aplikasi Next.js (frontend) dengan server Express.js (backend).

---

## 1. Konsep Dasar Integrasi

### a. Komunikasi via REST API
- **Arsitektur**: Frontend (Next.js) bertindak sebagai *client* dan backend (Express.js) sebagai *server*.
- **Metode**: Komunikasi terjadi melalui panggilan **REST API** menggunakan protokol HTTP. Frontend akan melakukan request (GET, POST, PUT, DELETE) ke endpoint yang disediakan oleh backend.
- **Base URL Backend**: Semua request API akan ditujukan ke sebuah URL dasar. Untuk memudahkan pengelolaan antara lingkungan development dan production, kita akan menggunakan **variabel lingkungan (environment variable)**.

### b. Penggunaan Variabel Lingkungan untuk URL API
Untuk menghindari hardcoding URL `http://localhost:3001` di banyak tempat, kita akan menggunakan variabel lingkungan.

1.  Buat file baru di root proyek frontend Anda bernama `.env.local`.
2.  Isi file tersebut dengan:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
    JWT_SECRET=kunci-rahasia-yang-sangat-aman
    ```
    **Penting**: `JWT_SECRET` harus sama persis dengan yang ada di file `.env` backend Anda.
3.  Kode di `src/lib/data.ts` dan `src/lib/actions.ts` telah diubah untuk menggunakan `process.env.NEXT_PUBLIC_API_BASE_URL`. Saat Anda men-deploy aplikasi ke production, Anda hanya perlu mengubah nilai variabel ini di pengaturan hosting Anda.

### c. Halaman/Komponen yang Memerlukan Integrasi
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
    -   Server Action `login` melakukan `fetch` ke endpoint backend `POST /api/auth/login`.
    -   Jika login di backend berhasil, backend akan mengembalikan **`accessToken`** (JWT).
    -   Server Action `login` menerima token ini dan menyimpannya di **HTTP-only cookie** pada browser pengguna.

2.  **Menggunakan Token untuk Request Berikutnya**:
    -   Saat frontend perlu mengakses endpoint yang terproteksi (seperti mengambil daftar aset), ia harus menyertakan token tersebut.
    -   Karena token disimpan di cookie, Next.js Server Components dan Server Actions dapat secara otomatis meneruskan cookie ini saat melakukan `fetch` ke backend.
    -   Fungsi `fetchFromApi` di `src/lib/data.ts` sudah diatur untuk secara otomatis menyertakan `Authorization: Bearer <TOKEN>` pada setiap request.

---

## 3. Bagian Frontend yang Perlu Diubah

Saat ini, sebagian besar frontend masih menggunakan data statis. Kita harus mengganti ini dengan panggilan API yang dinamis.

### a. `src/lib/actions.ts` (Untuk Autentikasi)

#### **Fungsi `login`**:
- **Sebelumnya**: Memvalidasi pengguna terhadap data statis.
- **Sesudah**: Melakukan `fetch` ke `POST {NEXT_PUBLIC_API_BASE_URL}/api/auth/login` dengan body berisi email/password. Jika berhasil, simpan `accessToken` yang diterima ke dalam cookie.

**Contoh Implementasi (`login` action):**
```typescript
// src/lib/actions.ts

export async function login(prevState: any, formData: FormData) {
  // ... validasi
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
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
      maxAge: 60 * 60 * 24, // 1 hari
      secure: process.env.NODE_ENV === 'production',
    });

  } catch (error) {
    return { message: 'Tidak dapat terhubung ke server.' };
  }
  revalidatePath('/');
  redirect('/dashboard');
}

// Fungsi logout juga diubah untuk menghapus cookie 'accessToken'
export async function logout() {
  cookies().delete('accessToken');
  redirect('/login');
}
```

### b. `src/lib/data.ts` (Untuk Pengambilan Data)

File ini adalah pusat untuk semua komunikasi data dengan backend.

- **Sebelumnya**: Mengimpor dan mengekspor data dummy.
- **Sesudah**: Berisi fungsi `fetchFromApi` yang menjadi wrapper untuk semua panggilan `fetch`. Fungsi ini secara otomatis menambahkan token otorisasi dan menangani error. Semua fungsi data (seperti `getAllAssets`, `getAllUsers`) sekarang memanggil `fetchFromApi`.

**Contoh Implementasi (`getAllAssets`):**
```typescript
// src/lib/data.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken(); // Mengambil token dari cookie
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        cache: 'no-store', // Penting untuk data dinamis
    });

    if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `Gagal mengambil data. Status: ${response.status}`;
        try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorMessage;
        } catch(e) {}
        throw new Error(errorMessage);
    }
    if (response.status === 204) return null as T;
    return response.json();
}

// --- Asset Data ---
export const getAllAssets = () => fetchFromApi<Asset[]>('/api/assets');
export const createAsset = (data: Partial<Asset>) => fetchFromApi<Asset>('/api/assets', { method: 'POST', body: JSON.stringify(data) });
// ...dan fungsi lainnya
```

### c. Penyesuaian Tampilan Berdasarkan Peran (`src/lib/session.ts`)

- **Sebelumnya**: Menggunakan data statis.
- **Sesudah**: Mekanisme ini sekarang ditenagai oleh `src/lib/session.ts` yang membaca dan memverifikasi JWT dari cookie.
    1.  Saat login, backend menyertakan `role` dan `name` di dalam payload JWT.
    2.  Di `src/lib/session.ts`, fungsi `getCurrentUser` mendekode JWT dari cookie `accessToken` untuk mendapatkan detail pengguna, termasuk perannya.
    3.  Komponen `SidebarNav` dan lainnya menggunakan `useSession()` hook untuk mendapatkan peran ini dan menampilkan/menyembunyikan menu atau tombol yang sesuai.

**Contoh Implementasi (`getCurrentUser` yang diperbarui):**
```typescript
// src/lib/session.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { User } from './definitions';

export async function getCurrentUser(): Promise<User | undefined> {
  const token = cookies().get('accessToken')?.value;
  if (!token) return undefined;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Payload dari backend: { id: 1, name: 'Admin Utama', role: 'Administrator', ... }
    const userName = payload.name as string;

    return {
      id: payload.id as number,
      name: userName,
      username: userName, // Backend menggunakan 'username'
      email: (payload.email as string) || `${userName.toLowerCase().replace(/ /g, '.')}@sipakat.com`,
      role_id: initialRoles.find(r => r.name === payload.role)?.id || 0,
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
-   [ ] **Variabel Lingkungan Frontend**:
    -   [ ] File `.env.local` telah dibuat di root proyek frontend.
    -   [ ] File tersebut berisi `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`.
    -   [ ] File tersebut juga berisi `JWT_SECRET` yang sama dengan backend.
-   [ ] **Login & Logout**:
    -   [ ] Halaman Login berhasil melakukan request ke `POST /api/auth/login`.
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
    -   [ ] Pesan error yang jelas ditampilkan jika API request gagal (misalnya, "Tidak dapat terhubung ke server backend" atau pesan error dari backend).
    -   [ ] Jika token tidak valid atau kedaluwarsa, pengguna secara otomatis diarahkan ke halaman login.

---
