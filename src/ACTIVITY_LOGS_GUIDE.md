# Panduan Implementasi Log Aktivitas Pengguna

Dokumen ini menjelaskan cara mengimplementasikan fitur log aktivitas di backend Express.js untuk aplikasi SI-PAKAT.

## 1. Skema Database

Pertama, pastikan Anda memiliki tabel `activity_logs` di database MySQL Anda. Jalankan perintah SQL berikut untuk membuatnya jika belum ada.

**PENTING**: Kami menambahkan kolom `username_snapshot` untuk tujuan forensik. Kolom ini akan menyimpan nama pengguna pada saat aktivitas terjadi, sehingga jejak audit tidak akan hilang meskipun akun pengguna dihapus dari sistem.

```sql
CREATE TABLE `activity_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `username_snapshot` VARCHAR(255) NULL COMMENT 'Stores the username at the time of activity for forensic purposes.',
  `activity` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_activity_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_activity_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
```
Jika Anda sudah memiliki tabel `activity_logs`, jalankan perintah `ALTER` berikut untuk menambahkan kolom baru:
```sql
ALTER TABLE `activity_logs` ADD COLUMN `username_snapshot` VARCHAR(255) NULL AFTER `user_id`;
```

## 2. Middleware Pencatatan Aktivitas

Buat file baru di backend Anda di `/middlewares/activityLogger.js`. File ini akan berisi middleware yang bertanggung jawab untuk menyimpan log ke database.

**`/middlewares/activityLogger.js`**
```javascript
const db = require('../config/db');

const logActivity = (activityDescription) => {
  return async (req, res, next) => {
    // Jalankan controller utama terlebih dahulu
    next();

    res.on('finish', async () => {
        // Jangan log jika tidak ada user ID (misalnya, error otorisasi)
        if (!req.userId) return;

        try {
            const userId = req.userId;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            // Ambil username langsung dari tabel users untuk snapshot
            const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
            const usernameSnapshot = userRows.length > 0 ? userRows[0].username : null;

            await db.execute(
                'INSERT INTO activity_logs (user_id, username_snapshot, activity, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
                [userId, usernameSnapshot, activityDescription, ipAddress, userAgent]
            );
        } catch (error) {
            console.error('Gagal mencatat aktivitas:', error);
        }
    });
  };
};

module.exports = { logActivity };
```

## 3. Integrasi Middleware ke Rute

Sekarang, kita perlu mengintegrasikan middleware `logActivity` ini ke dalam file-file rute yang relevan. Ini dilakukan dengan menambahkan `logActivity('Deskripsi Aktivitas')` sebagai salah satu middleware pada endpoint yang ingin Anda catat.

### a. `routes/authRoutes.js`
Catat aktivitas saat pengguna berhasil login.

```javascript
// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { logActivity } = require('../middlewares/activityLogger');

// Middleware log akan berjalan setelah login berhasil
router.post('/login', authController.login, logActivity('Login'));

module.exports = router;
```

### b. `routes/userRoutes.js`
Catat aktivitas pembuatan, pembaruan, dan penghapusan pengguna.

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');

router.use(verifyToken);

router.post('/', isAdmin, logActivity('Membuat Pengguna Baru'), userController.createUser);
router.put('/:id', logActivity('Memperbarui Profil'), userController.updateUser);
router.delete('/:id', isAdmin, logActivity('Menghapus Pengguna'), userController.deleteUser);
// ... rute lainnya
```

### c. `routes/assetRoutes.js`
Catat semua aktivitas CRUD pada aset.

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAssetManager } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');

// ... rute master data ...

router.post('/', [verifyToken, isAssetManager, logActivity('Membuat Aset Baru')], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager, logActivity('Memperbarui Aset')], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager, logActivity('Menghapus Aset')], assetController.deleteAsset);

// ... rute lainnya
```

Dengan implementasi ini, setiap kali endpoint yang ditentukan di atas diakses dengan sukses, sebuah baris baru akan secara otomatis ditambahkan ke tabel `activity_logs`, memberikan jejak audit yang jelas tentang siapa melakukan apa dan kapan.
