# Panduan Menambahkan Proyek ke Akun GitHub Anda

Dokumen ini memberikan panduan langkah demi langkah untuk mengunggah (push) proyek SI-PAKAT ini dari lingkungan lokal Anda ke repositori baru di akun GitHub Anda.

## Prasyarat

1.  **Git Terinstal**: Pastikan Anda sudah menginstal Git di komputer Anda. Jika belum, unduh dan instal dari [git-scm.com](https://git-scm.com/).
2.  **Akun GitHub**: Anda harus memiliki akun GitHub. Jika belum, daftar di [github.com](https://github.com/).

---

## Langkah-langkah

### Langkah 1: Buat Repositori Baru di GitHub

1.  Buka situs [GitHub](https://github.com) dan login ke akun Anda.
2.  Di pojok kanan atas, klik ikon `+` dan pilih **"New repository"**.
3.  **Repository name**: Beri nama repositori Anda, misalnya `si-pakat-app`.
4.  **Description** (Opsional): Berikan deskripsi singkat tentang proyek Anda.
5.  Pilih **"Private"** jika Anda ingin repositori ini hanya bisa diakses oleh Anda dan kolaborator yang Anda undang. Pilih **"Public"** jika siapa saja bisa melihatnya.
6.  **Penting**: Jangan centang opsi "Add a README file", "Add .gitignore", atau "Choose a license". Proyek ini sudah memiliki file-file tersebut. Jika Anda tidak sengaja mencentangnya, ini akan membuat commit awal di remote, dan Anda harus menjalankan `git pull origin main` sebelum bisa melakukan `push`.
7.  Klik tombol **"Create repository"**.

Setelah itu, Anda akan diarahkan ke halaman repositori baru Anda yang masih kosong. Di sana, Anda akan melihat beberapa perintah. Kita akan menggunakan URL repositori dari bagian **"…or push an existing repository from the command line"**. URL-nya akan terlihat seperti ini:

```
https://github.com/NAMA_USER_ANDA/NAMA_REPO_ANDA.git
```

Salin URL tersebut untuk digunakan pada langkah berikutnya.

### Langkah 2: Inisialisasi dan Unggah Proyek dari Lokal

Buka terminal atau command prompt di direktori utama proyek SI-PAKAT Anda, lalu jalankan perintah-perintah berikut secara berurutan:

1.  **Inisialisasi Git:**
    Perintah ini akan membuat repositori Git baru di dalam folder proyek Anda.
    ```bash
    git init -b main
    ```

2.  **Tambahkan Semua File ke Staging Area:**
    Perintah ini akan menyiapkan semua file proyek untuk di-commit. Tanda titik (`.`) berarti "semua file dan folder di direktori saat ini".
    ```bash
    git add .
    ```

3.  **Buat Commit Pertama:**
    Commit adalah "snapshot" dari kode Anda pada satu waktu. Berikan pesan commit yang deskriptif.
    ```bash
    git commit -m "Initial commit: SI-PAKAT project setup"
    ```

4.  **Hubungkan Repositori Lokal ke Repositori GitHub:**
    Ganti `URL_REPO_ANDA` dengan URL yang Anda salin dari GitHub pada Langkah 1.
    ```bash
    git remote add origin URL_REPO_ANDA
    ```
    Contoh:
    ```bash
    git remote add origin https://github.com/NAMA_USER_ANDA/si-pakat-app.git
    ```

5.  **Unggah (Push) Kode Anda ke GitHub:**
    Perintah ini akan mengirim semua commit dari branch `main` di lokal Anda ke repositori `origin` (GitHub).
    ```bash
    git push -u origin main
    ```

### Mengatasi Error "non-fast-forward"

Jika Anda mendapatkan error yang menyebutkan `rejected` atau `non-fast-forward` saat melakukan `git push`, ini berarti ada commit di repositori GitHub yang tidak Anda miliki di komputer lokal Anda.

**Solusi:**
Sebelum melakukan `push`, Anda harus terlebih dahulu menarik perubahan dari GitHub dan menggabungkannya dengan pekerjaan lokal Anda.

1.  **Tarik perubahan dari remote:**
    ```bash
    git pull origin main
    ```

2.  **Setelah `pull` berhasil, coba `push` lagi:**
    ```bash
    git push origin main
    ```

Selesai! Sekarang, jika Anda me-refresh halaman repositori di GitHub, Anda akan melihat semua file proyek Anda sudah berhasil diunggah.
