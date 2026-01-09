# Panduan Perbaikan Skema Database: Mengaktifkan ON DELETE CASCADE

Dokumen ini berisi perintah SQL yang diperlukan untuk memperbaiki skema database Anda. Masalah di mana detail aset tidak ikut terhapus saat aset induknya dihapus disebabkan oleh tidak adanya aturan `ON DELETE CASCADE` pada relasi *foreign key* di database Anda.

Backend aplikasi ini dirancang untuk mengandalkan database dalam menangani penghapusan berantai (cascading deletes) demi efisiensi dan integritas data.

## Langkah-langkah Perbaikan

Jalankan perintah SQL di bawah ini pada database `si_pakat_db` Anda. Anda dapat menjalankannya melalui phpMyAdmin, DBeaver, atau _client_ MySQL lainnya.

**Penting:** Perintah ini akan **menghapus constraint foreign key yang ada** dan **membuatnya kembali** dengan tambahan `ON DELETE CASCADE`. Ini adalah prosedur standar dan aman untuk dilakukan.

### 1. Perbaikan untuk Tabel `asset_assessments`

```sql
-- Hapus constraint yang lama (ganti nama 'fk_assessments_asset' jika berbeda)
ALTER TABLE `asset_assessments` DROP FOREIGN KEY `fk_assessments_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `asset_assessments` ADD CONSTRAINT `fk_assessments_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

### 2. Perbaikan untuk Tabel Detail SDM (`human_resource_details`)

```sql
-- Hapus constraint yang lama (ganti nama 'fk_hr_details_asset' jika berbeda)
ALTER TABLE `human_resource_details` DROP FOREIGN KEY `fk_hr_details_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `human_resource_details` ADD CONSTRAINT `fk_hr_details_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

### 3. Perbaikan untuk Tabel Detail Perangkat Keras (`hardware_details`)

```sql
-- Hapus constraint yang lama (ganti nama 'fk_hardware_details_asset' jika berbeda)
ALTER TABLE `hardware_details` DROP FOREIGN KEY `fk_hardware_details_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `hardware_details` ADD CONSTRAINT `fk_hardware_details_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

### 4. Perbaikan untuk Tabel Detail Perangkat Lunak (`software_details`)

```sql
-- Hapus constraint yang lama (ganti nama 'fk_software_details_asset' jika berbeda)
ALTER TABLE `software_details` DROP FOREIGN KEY `fk_software_details_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `software_details` ADD CONSTRAINT `fk_software_details_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

### 5. Perbaikan untuk Tabel Detail Sarana Pendukung (`supporting_facility_details`)

```sql
-- Hapus constraint yang lama (ganti nama 'fk_support_details_asset' jika berbeda)
ALTER TABLE `supporting_facility_details` DROP FOREIGN KEY `fk_support_details_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `supporting_facility_details` ADD CONSTRAINT `fk_support_details_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

### 6. Perbaikan untuk Tabel Detail Data & Informasi (`data_information_details`)

```sql
-- Hapus constraint yang lama (ganti nama 'fk_data_details_asset' jika berbeda)
ALTER TABLE `data_information_details` DROP FOREIGN KEY `fk_data_details_asset`;

-- Tambahkan constraint baru dengan ON DELETE CASCADE
ALTER TABLE `data_information_details` ADD CONSTRAINT `fk_data_details_asset`
  FOREIGN KEY (`asset_id`)
  REFERENCES `assets` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

**Catatan Penting:**
- Jika Anda tidak yakin dengan nama *constraint* yang ada, Anda bisa melihatnya di tab "Structure" -> "Relation view" di phpMyAdmin, atau menggunakan perintah `SHOW CREATE TABLE nama_tabel;` untuk melihat definisi lengkap tabel.
- Setelah menjalankan perintah-perintah di atas, coba hapus salah satu aset dari aplikasi. Anda akan melihat bahwa semua data terkait di tabel penilaian dan tabel detailnya akan ikut terhapus secara otomatis.
