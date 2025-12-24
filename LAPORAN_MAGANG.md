
# **LAPORAN KEGIATAN PRAKTIK KERJA LAPANGAN**

# **PERANCANGAN DAN IMPLEMENTASI SISTEM INFORMASI PENGELOLAAN KEAMANAN ASET TIK (SI-PAKAT)**

**(Studi Kasus: Dinas Komunikasi dan Informatika Provinsi Kalimantan Selatan)**

<br>

Laporan ini Disusun untuk Memenuhi Salah Satu Syarat Kelulusan Mata Kuliah Praktik Kerja Lapangan

<br>
<br>
<br>

**Disusun Oleh:**

**[NAMA LENGKAP MAHASISWA]**

**[NIM MAHASISWA]**

<br>
<br>
<br>
<br>

**PROGRAM STUDI [NAMA PROGRAM STUDI]**

**JURUSAN [NAMA JURUSAN]**

**[NAMA PERGURUAN TINGGI]**

**[KOTA]**

**[TAHUN]**

---

## **LEMBAR PENGESAHAN**

**PERANCANGAN DAN IMPLEMENTASI SISTEM INFORMASI PENGELOLAAN KEAMANAN ASET TIK (SI-PAKAT)**

<br>

Disusun Oleh:

**[NAMA LENGKAP MAHASISWA]**

**[NIM MAHASISWA]**

<br>

Telah diperiksa dan disetujui sebagai Laporan Praktik Kerja Lapangan
pada tanggal [Tanggal Persetujuan].

<br>
<br>

| Disetujui oleh: | |
| :--- | :--- |
| **Dosen Pembimbing** | **Pembimbing Lapangan** |
| | |
| _(Tanda Tangan)_ | _(Tanda Tangan)_ |
| | |
| **[Nama Lengkap Dosen Pembimbing]** | **[Nama Lengkap Pembimbing Lapangan]** |
| NIP. [NIP Dosen] | NIP. [NIP Pembimbing] |

<br>
<br>

| Mengetahui, |
| :--- |
| **Ketua Program Studi [Nama Program Studi]** |
| |
| _(Tanda Tangan)_ |
| |
| **[Nama Lengkap Ketua Program Studi]** |
| NIP. [NIP Kaprodi] |

---

## **RINGKASAN**

Praktik Kerja Lapangan (PKL) telah dilaksanakan di Dinas Komunikasi dan Informatika (DISKOMINFO) Provinsi Kalimantan Selatan, dengan fokus utama pada bidang persandian dan keamanan informasi. Kegiatan ini bertujuan untuk menerapkan pengetahuan teoritis dalam perancangan sistem informasi, khususnya untuk menyelesaikan masalah pengelolaan aset TIK yang belum terstandarisasi. Metode yang digunakan meliputi analisis kebutuhan, perancangan sistem menggunakan *Use Case* dan *Entity-Relationship Diagram (ERD)*, serta implementasi prototipe aplikasi berbasis web dengan arsitektur *client-server*. Hasil dari kegiatan ini adalah sebuah prototipe fungsional bernama SI-PAKAT (Sistem Informasi Pengelolaan Keamanan Aset TIK), yang mampu melakukan inventarisasi aset, penilaian risiko keamanan secara otomatis, manajemen pengguna berbasis peran, dan pembuatan laporan dinamis. Sistem ini diharapkan dapat meningkatkan efisiensi dan objektivitas dalam pengelolaan keamanan aset TIK di lingkungan DISKOMINFO Provinsi Kalsel.

**Kata Kunci**: Sistem Informasi, Keamanan Aset TIK, Penilaian Risiko, Manajemen Aset, Next.js, Express.js.

---

## **KATA PENGANTAR**

Puji syukur penulis panjatkan kehadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya, sehingga penulis dapat menyelesaikan kegiatan Praktik Kerja Lapangan (PKL) serta menyusun laporan ini dengan baik dan tepat waktu. Laporan ini disusun sebagai salah satu syarat untuk menyelesaikan mata kuliah PKL di Program Studi [Nama Program Studi], [Nama Perguruan Tinggi].

Kegiatan PKL dilaksanakan selama [Jumlah Bulan] bulan, terhitung sejak [Tanggal Mulai] hingga [Tanggal Selesai], di Dinas Komunikasi dan Informatika (DISKOMINFO) Provinsi Kalimantan Selatan. Penulis ditempatkan pada bidang yang menangani persandian dan keamanan informasi, di mana penulis mendapatkan kesempatan berharga untuk menganalisis, merancang, dan mengimplementasikan sebuah sistem informasi yang relevan dengan kebutuhan instansi.

Penyelesaian laporan ini tidak terlepas dari bantuan, bimbingan, dan dukungan dari berbagai pihak. Oleh karena itu, penulis ingin menyampaikan ucapan terima kasih yang tulus kepada:

1.  Bapak **[Nama Kepala Dinas]**, selaku Kepala Dinas Kominfo Provinsi Kalsel.
2.  Bapak **[Nama Pembimbing Lapangan]**, selaku pembimbing lapangan yang telah memberikan arahan dan wawasan praktis selama kegiatan magang.
3.  Bapak/Ibu **[Nama Dosen Pembimbing]**, selaku dosen pembimbing yang telah memberikan bimbingan dalam penyusunan laporan ini.
4.  Seluruh staf dan jajaran di lingkungan Dinas Kominfo Provinsi Kalsel atas kerja sama dan ilmu yang telah dibagikan.
5.  Kedua orang tua dan keluarga yang senantiasa memberikan dukungan moril dan materiil.

Penulis menyadari bahwa laporan ini masih memiliki banyak kekurangan. Oleh karena itu, kritik dan saran yang membangun sangat penulis harapkan untuk perbaikan di masa mendatang. Semoga laporan ini dapat memberikan manfaat bagi pembaca, instansi terkait, dan almamater.

<br>

[Kota], [Tanggal Penyusunan]

Penulis

---

## **DAFTAR ISI**

*   [Halaman Sampul & Pengesahan](#lembar-pengesahan)
*   [Ringkasan](#ringkasan)
*   [Kata Pengantar](#kata-pengantar)
*   [Daftar Isi](#daftar-isi)
*   [Daftar Gambar](#daftar-gambar)
*   [Daftar Tabel](#daftar-tabel)
*   **BAB I - PENDAHULUAN**
    *   [1.1 Latar Belakang](#11-latar-belakang)
    *   [1.2 Tujuan](#12-tujuan)
    *   [1.3 Manfaat](#13-manfaat)
    *   [1.4 Ruang Lingkup](#14-ruang-lingkup)
*   **BAB II - TINJAUAN PUSTAKA**
    *   [2.1 Profil Tempat Magang](#21-profil-tempat-magang)
    *   [2.2 Landasan Teori](#22-landasan-teori)
*   **BAB III - URAIAN KEGIATAN**
    *   [3.1 Aktivitas Magang](#31-aktivitas-magang)
    *   [3.2 Timeline Proyek](#32-timeline-proyek)
*   **BAB IV - HASIL DAN PEMBAHASAN**
    *   [4.1 Hasil Aktivitas Magang](#41-hasil-aktivitas-magang)
    *   [4.2 Hambatan dan Solusi](#42-hambatan-dan-solusi)
    *   [4.3 Tinjauan Keselamatan Kerja (K3)](#43-tinjauan-keselamatan-kerja-k3)
*   **BAB V - PENUTUP**
    *   [5.1 Kesimpulan](#51-kesimpulan)
    *   [5.2 Saran](#52-saran)
*   **DAFTAR PUSTAKA**
*   **LAMPIRAN**

---

## **DAFTAR GAMBAR**

*   [Gambar 2.1 Struktur Organisasi DISKOMINFO Provinsi Kalsel](#21-profil-tempat-magang)
*   [Gambar 4.1 Arsitektur Sistem SI-PAKAT](#41-hasil-aktivitas-magang)
*   [Gambar 4.2 Halaman Dasbor Aplikasi](#41-hasil-aktivitas-magang)
*   [Gambar 4.3 Halaman Manajemen Inventaris Aset](#41-hasil-aktivitas-magang)

---

## **DAFTAR TABEL**

*   [Tabel 3.1 Rincian Aktivitas Magang Mingguan](#31-aktivitas-magang)
*   [Tabel 3.2 Timeline Pelaksanaan Proyek](#32-timeline-proyek)
*   [Tabel 4.1 Deskripsi Peran Pengguna (Aktor)](#41-hasil-aktivitas-magang)
*   [Tabel 4.2 Deskripsi Use Case Sistem](#41-hasil-aktivitas-magang)

---

## **BAB I - PENDAHULUAN**

### **1.1 Latar Belakang**

Di era transformasi digital saat ini, keamanan informasi telah menjadi fondasi vital bagi keberlangsungan operasional institusi pemerintah. Dinas Komunikasi dan Informatika (DISKOMINFO) Provinsi Kalimantan Selatan, sebagai garda terdepan dalam pengelolaan infrastruktur digital pemerintah provinsi, bertanggung jawab untuk melindungi Aset Teknologi Informasi dan Komunikasi (TIK) dari berbagai ancaman. Aset TIK tidak hanya mencakup perangkat keras seperti server dan jaringan, tetapi juga perangkat lunak, data strategis, hingga sumber daya manusia yang mengelolanya. Pengelolaan aset yang tersebar dan penilaian risiko yang bersifat subjektif sering kali menjadi tantangan, menyebabkan kesulitan dalam memprioritaskan upaya pengamanan dan memenuhi standar audit. Menyadari kebutuhan ini, kegiatan magang difokuskan pada perancangan dan pengembangan sebuah solusi terpusat. Keterkaitan antara urgensi keamanan siber dan kompetensi di bidang rekayasa perangkat lunak menjadi alasan utama pemilihan topik "Sistem Informasi Pengelolaan Keamanan Aset TIK (SI-PAKAT)" sebagai kontribusi utama selama periode magang.

### **1.2 Tujuan**

Tujuan pelaksanaan Praktik Kerja Lapangan ini adalah sebagai berikut:

1.  **Tujuan Akademik**: Menerapkan konsep-konsep teoritis yang dipelajari selama perkuliahan, terutama dalam mata kuliah Rekayasa Perangkat Lunak, Basis Data, dan Keamanan Informasi, ke dalam sebuah proyek nyata di lingkungan kerja profesional.
2.  **Tujuan Teknis**: Merancang, membangun, dan mengimplementasikan prototipe sistem informasi (SI-PAKAT) yang mampu melakukan inventarisasi aset TIK, menstandarkan proses penilaian keamanan, dan menghasilkan laporan yang informatif.
3.  **Tujuan Pengembangan Diri**: Meningkatkan kemampuan *soft skill* seperti komunikasi, kerja sama tim, manajemen waktu, dan pemecahan masalah (*problem-solving*) dalam konteks lingkungan kerja di instansi pemerintah.

### **1.3 Manfaat**

Manfaat yang diharapkan dari kegiatan magang ini adalah:

1.  **Bagi Instansi (DISKOMINFO Provinsi Kalsel)**:
    *   Memperoleh sebuah prototipe sistem yang dapat dikembangkan lebih lanjut untuk menjadi alat bantu operasional dalam pengelolaan keamanan aset TIK.
    *   Mendapatkan cetak biru (blueprint) berupa dokumentasi desain sistem yang terstruktur sebagai dasar pengembangan di masa depan.
2.  **Bagi Mahasiswa**:
    *   Mendapatkan pengalaman praktis dalam siklus hidup pengembangan perangkat lunak, mulai dari analisis hingga implementasi.
    *   Memperdalam pemahaman tentang tantangan nyata di bidang keamanan informasi dan teknologi di sektor pemerintahan.
3.  **Bagi Perguruan Tinggi**:
    *   Meningkatkan relevansi kurikulum dengan kebutuhan industri dan pemerintahan melalui umpan balik dari pengalaman magang mahasiswa.
    *   Memperkuat hubungan kerja sama antara dunia akademik dan instansi pemerintah.

### **1.4 Ruang Lingkup**

Kegiatan magang ini memiliki ruang lingkup sebagai berikut:
1.  Fokus utama kegiatan adalah pada analisis kebutuhan, perancangan, dan pengembangan prototipe aplikasi **SI-PAKAT**.
2.  Fitur yang dikembangkan mencakup: manajemen pengguna dan peran, CRUD (Create, Read, Update, Delete) inventaris aset, sistem penilaian keamanan aset, dan pembuatan laporan.
3.  Teknologi yang digunakan terbatas pada arsitektur web dengan **Next.js** untuk frontend, **Express.js** untuk backend, dan **MySQL** sebagai database.
4.  Kegiatan tidak mencakup proses *deployment* (penyebaran) sistem ke server produksi atau pengujian keamanan sistem secara mendalam (*penetration testing*).

---

## **BAB II - TINJAUAN PUSTAKA**

### **2.1 Profil Tempat Magang**

**Dinas Komunikasi dan Informatika (DISKOMINFO) Provinsi Kalimantan Selatan** adalah lembaga pemerintah daerah yang bertugas merumuskan dan melaksanakan kebijakan di bidang komunikasi, informatika, statistik, dan persandian.

*   **Visi**: Terwujudnya Kalimantan Selatan sebagai gerbang ibukota negara yang maju dan berkelanjutan melalui infrastruktur digital yang andal dan aman.
*   **Misi**:
    1.  Meningkatkan tata kelola pemerintahan berbasis elektronik yang terintegrasi.
    2.  Menjamin keamanan informasi dan komunikasi di lingkungan pemerintah provinsi.
    3.  Menyediakan data dan statistik yang akurat untuk mendukung pengambilan kebijakan.
*   **Struktur Organisasi**:
    *(Di sini, Anda akan menempatkan bagan struktur organisasi DISKOMINFO, menyoroti bidang tempat Anda magang, misalnya Bidang Persandian dan Keamanan Informasi).*

    ```
    [Gambar 2.1 Struktur Organisasi DISKOMINFO Provinsi Kalsel]
    ```

    Penulis ditempatkan di Bidang Persandian dan Keamanan Informasi yang memiliki tugas pokok untuk memastikan kerahasiaan, integritas, dan ketersediaan informasi milik pemerintah provinsi. Tugas ini sangat relevan dengan proyek SI-PAKAT yang bertujuan untuk mengelola keamanan aset TIK, yang merupakan komponen fundamental dari keamanan informasi secara keseluruhan.

### **22. Landasan Teori**

1.  **Sistem Informasi**: Kombinasi dari teknologi informasi dan aktivitas orang yang menggunakan teknologi itu untuk mendukung operasi dan manajemen. Dalam konteks SI-PAKAT, sistem informasi berfungsi sebagai alat bantu untuk mengotomatisasi proses inventarisasi dan penilaian aset (Valacich & Schneider, 2018).

2.  **Keamanan Aset TIK**: Aset TIK adalah semua komponen teknologi yang memiliki nilai bagi organisasi, termasuk perangkat keras, perangkat lunak, data, dan personel. Keamanan aset adalah upaya untuk melindungi nilai aset tersebut dari berbagai risiko melalui penerapan kontrol keamanan. Lima pilar utama yang dinilai dalam SI-PAKAT (Kerahasiaan, Integritas, Ketersediaan, Keaslian, Non-repudiasi) merupakan standar de-facto dalam penilaian keamanan informasi (Whitman & Mattord, 2019).

3.  **Arsitektur Client-Server**: Model arsitektur di mana *client* (frontend aplikasi) bertugas untuk presentasi dan interaksi pengguna, sementara *server* (backend aplikasi) bertanggung jawab atas logika bisnis, pemrosesan data, dan akses ke database. Arsitektur ini memungkinkan pemisahan tanggung jawab (*separation of concerns*) yang jelas, membuat sistem lebih mudah dikelola dan diskalakan (Tanenbaum & Van Steen, 2017).

---

## **BAB III - URAIAN KEGIATAN**

### **3.1 Aktivitas Magang**

Kegiatan magang dilaksanakan secara terstruktur, dengan fokus pada penyelesaian proyek pengembangan aplikasi SI-PAKAT.

**Tabel 3.1 Rincian Aktivitas Magang Mingguan**

| Minggu Ke- | Aktivitas Utama | Keterangan |
| :--- | :--- | :--- |
| 1 | Orientasi dan Analisis Kebutuhan | Mempelajari alur kerja di DISKOMINFO, melakukan wawancara dengan pembimbing lapangan untuk mengidentifikasi masalah utama dalam pengelolaan aset. |
| 2-3 | Perancangan Sistem dan Database | Merancang *Use Case Diagram*, *Activity Diagram*, dan skema database (CDM, LDM, PDM). Mendesain arsitektur sistem *client-server*. |
| 4-6 | Pengembangan Backend | Implementasi REST API menggunakan Express.js, koneksi ke database MySQL, dan pembuatan *endpoint* untuk autentikasi dan CRUD pengguna. |
| 7-9 | Pengembangan Frontend | Implementasi antarmuka pengguna (UI) menggunakan Next.js dan ShadCN UI. Mengintegrasikan halaman manajemen pengguna dengan API backend. |
| 10-12 | Integrasi Fitur Utama Aset | Mengembangkan fitur CRUD Aset, formulir penilaian, dan mengintegrasikannya dengan backend. Memastikan logika perhitungan skor berjalan sesuai rencana. |
| 13-14 | Pengembangan Fitur Lanjutan | Membuat halaman dasbor dengan visualisasi data, halaman pelaporan dengan fungsionalitas cetak, dan halaman log aktivitas. |
| 15-16 | Pengujian, Finalisasi & Penyusunan Laporan | Melakukan pengujian fungsionalitas secara menyeluruh, memperbaiki bug, dan mulai menyusun draf Laporan Praktik Kerja Lapangan. |

### **3.2 Timeline Proyek**

**Tabel 3.2 Timeline Pelaksanaan Proyek**

| Tahapan | Minggu 1-4 | Minggu 5-8 | Minggu 9-12 | Minggu 13-16 |
| :--- | :---: | :---: | :---: | :---: |
| **1. Analisis & Desain** | ████ | | | |
| **2. Pengembangan Backend** | | ████ | | |
| **3. Pengembangan Frontend** | | | ████ | |
| **4. Integrasi & Pengujian** | | | | ████ |

---

## **BAB IV - HASIL DAN PEMBAHASAN**

### **4.1 Hasil Aktivitas Magang**

Hasil utama dari kegiatan Praktik Kerja Lapangan ini adalah sebuah prototipe aplikasi web fungsional bernama **SI-PAKAT** beserta dokumentasi teknisnya.

1.  **Prototipe Aplikasi SI-PAKAT**: Sebuah aplikasi berbasis web dengan arsitektur *client-server* yang memiliki fitur-fitur sebagai berikut:
    *   **Autentikasi Aman**: Sistem login dengan JWT, dilengkapi fitur lupa/reset password via email dan proteksi reCAPTCHA.
    *   **Manajemen Aset Komprehensif**: Fitur untuk menambah, melihat, mengedit, dan menghapus aset, dengan formulir dinamis yang menyesuaikan dengan kategori aset.
    *   **Penilaian Risiko Otomatis**: Sistem penilaian 5 kriteria yang secara otomatis menghitung total skor dan mengklasifikasikan nilai aset.
    *   **Manajemen Pengguna Berbasis Peran**: Terdapat 3 peran (Administrator, Manajer Aset, Auditor) dengan hak akses yang berbeda-beda.
    *   **Dasbor & Pelaporan**: Visualisasi data aset melalui grafik dan tabel, serta fitur untuk mencetak laporan inventaris.

2.  **Dokumentasi Sistem**:
    *   **Dokumentasi Desain Sistem (`SYSTEM_DESIGN.md`)**: Berisi analisis kebutuhan fungsional (Use Case) dan desain arsitektur sistem.
    *   **Dokumentasi Desain Database (`DATABASE_DESIGN.md`)**: Berisi model data konseptual, logis, dan fisik.
    *   **Panduan Integrasi (`FRONTEND_INTEGRATION_GUIDE.md`)**: Menjelaskan cara kerja komunikasi antara frontend dan backend.

Berikut adalah beberapa tampilan (screenshot) dari aplikasi yang telah dikembangkan:

*   **Arsitektur Sistem**:
    ```
    [Gambar 4.1 Arsitektur Sistem SI-PAKAT]
    ```

*   **Tampilan Antarmuka**:
    ```
    [Gambar 4.2 Halaman Dasbor Aplikasi]
    [Gambar 4.3 Halaman Manajemen Inventaris Aset]
    ```
*   **Contoh Tabel Peran dan Use Case**:

    **Tabel 4.1 Deskripsi Peran Pengguna (Aktor)**
    | Aktor | Deskripsi |
    | :--- | :--- |
    | **Administrator** | Peran dengan hak akses tertinggi. Mengelola konfigurasi sistem, pengguna, dan memiliki semua hak akses peran lain. |
    | **Manajer Aset** | Peran operasional utama yang bertanggung jawab atas siklus hidup aset, mulai dari penambahan, penilaian, hingga penghapusan. |
    | **Auditor** | Peran yang fokus pada pemantauan dan pelaporan. Memiliki hak akses untuk melihat data dan menghasilkan laporan untuk tujuan audit. |

    **Tabel 4.2 Deskripsi Use Case Sistem**
    | Aktor | Use Case | Deskripsi |
    | :--- | :--- | :--- |
    | Administrator | Mengelola Pengguna | Membuat, melihat, memperbarui, dan menghapus akun pengguna beserta perannya. |
    | Manajer Aset | Mengelola Inventaris Aset | Melakukan siklus hidup manajemen aset (CRUD). |
    | Auditor | Hasilkan Laporan | Menghasilkan laporan inventaris aset yang dapat difilter dan diformat untuk dicetak. |

### **4.2 Hambatan dan Solusi**

1.  **Hambatan Teknis**: Terjadi *error* `500 Internal Server Error` saat melakukan pembaruan penilaian aset dari halaman detail.
    *   **Analisis**: Masalah terjadi karena *backend controller* tidak menerima `classification_id` saat *payload* hanya berisi data skor, menyebabkan kegagalan dalam logika penentuan tabel anak.
    *   **Solusi**: Memodifikasi *controller* `updateAsset` di backend untuk secara proaktif mengambil `classification_id` dari database jika tidak tersedia di *request body*. Hal ini membuat API lebih tangguh terhadap *payload* yang parsial.

2.  **Hambatan Non-Teknis**: Kesulitan dalam menentukan detail spesifik untuk setiap kategori aset (misalnya, atribut apa saja yang penting untuk "Sarana Pendukung").
    *   **Analisis**: Kurangnya dokumentasi standar internal mengenai spesifikasi aset.
    *   **Solusi**: Melakukan diskusi proaktif dengan pembimbing lapangan untuk menyusun daftar atribut minimal yang paling relevan untuk setiap kategori, yang kemudian diimplementasikan dalam skema database dan formulir aplikasi.

### **4.3 Tinjauan Keselamatan Kerja (K3)**

Penerapan K3 selama magang di lingkungan perkantoran berbasis TI difokuskan pada aspek ergonomi dan kesehatan mata. Aktivitas yang dominan adalah bekerja di depan komputer selama berjam-jam.

*   **Penerapan**:
    1.  Mengatur posisi duduk yang tegak dengan kursi yang menopang punggung.
    2.  Memastikan posisi monitor sejajar dengan mata untuk menghindari ketegangan leher.
    3.  Menerapkan aturan "20-20-20": setiap 20 menit, melihat objek yang berjarak 20 kaki (sekitar 6 meter) selama 20 detik untuk mengurangi kelelahan mata.
    4.  Memastikan pencahayaan ruangan cukup dan tidak ada silau pada layar monitor.

---

## **BAB V - PENUTUP**

### **5.1 Kesimpulan**

Berdasarkan seluruh kegiatan Praktik Kerja Lapangan yang telah dilaksanakan, dapat ditarik kesimpulan sebagai berikut:
1.  Kegiatan magang telah berhasil menerapkan ilmu rekayasa perangkat lunak untuk menganalisis masalah nyata di DISKOMINFO Provinsi Kalsel dan merancang solusi berupa Sistem Informasi Pengelolaan Keamanan Aset TIK (SI-PAKAT).
2.  Sebuah prototipe aplikasi web fungsional dengan arsitektur *client-server* telah berhasil dikembangkan, mencakup fitur-fitur inti seperti manajemen aset, penilaian keamanan, manajemen pengguna, dan pelaporan, sesuai dengan tujuan teknis yang ditetapkan.
3.  Melalui proses pengembangan, penulis mendapatkan pengalaman praktis yang berharga dalam teknologi modern (Next.js, Express.js, MySQL) serta meningkatkan kemampuan analisis masalah dan manajemen proyek.

### **5.2 Saran**

1.  **Untuk Instansi (DISKOMINFO Provinsi Kalsel)**:
    *   Disarankan untuk melanjutkan pengembangan prototipe SI-PAKAT ini ke tahap produksi dengan menambahkan fitur-fitur lanjutan seperti notifikasi, alur persetujuan (*approval workflow*), dan integrasi dengan sistem lain yang sudah ada.
    *   Menyusun dokumentasi standar mengenai atribut untuk setiap jenis aset TIK akan sangat membantu dalam standardisasi data di masa depan.
2.  **Untuk Mahasiswa Berikutnya**:
    *   Disarankan untuk lebih proaktif dalam berkomunikasi dengan pembimbing lapangan untuk menggali kebutuhan dan tantangan yang ada.
    *   Fokus pada satu proyek utama dan menyelesaikannya dengan baik akan memberikan hasil yang lebih signifikan dibandingkan mengerjakan banyak tugas kecil.
