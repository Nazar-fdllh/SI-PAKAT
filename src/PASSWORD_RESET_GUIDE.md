# Panduan Implementasi Lupa & Reset Password

Dokumen ini menjelaskan cara mengimplementasikan fungsionalitas lupa dan reset password di backend Express.js untuk aplikasi SI-PAKAT.

## 1. Skema Database

Pertama, Anda perlu membuat tabel baru untuk menyimpan token reset password. Jalankan perintah SQL berikut di database `si_pakat_db` Anda:

```sql
CREATE TABLE `password_resets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `token_UNIQUE` (`token` ASC));
```

**Penjelasan Tabel:**
- `email`: Email pengguna yang meminta reset.
- `token`: Token unik yang aman secara kriptografis.
- `created_at`: Timestamp kapan token dibuat. Kita akan menganggap token ini kedaluwarsa setelah 1 jam.

## 2. Instalasi Dependensi Backend

Backend memerlukan `nodemailer` untuk mengirim email dan `crypto` (modul bawaan Node.js) untuk menghasilkan token yang aman.

```bash
# Di dalam folder backend Anda (si-pakat-backend)
npm install nodemailer
npm install @types/nodemailer --save-dev
```

## 3. Konfigurasi Lingkungan (`.env`)

Tambahkan variabel berikut ke file `.env` di backend Anda. Gunakan kredensial email Anda (disarankan menggunakan "App Password" jika Anda menggunakan Gmail).

```env
# ... Variabel .env yang sudah ada ...

# Konfigurasi Email untuk Reset Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email-anda@gmail.com
EMAIL_PASS=password-aplikasi-anda
```

## 4. Implementasi Backend

### a. `authController.js` (Baru)

Tambahkan dua fungsi baru: `forgotPassword` dan `resetPassword`.

```javascript
// /controllers/authController.js

// ... fungsi login yang sudah ada ...
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Konfigurasi Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Tetap kirim respons sukses untuk tidak membocorkan email mana yang terdaftar
            return res.status(200).json({ message: "Jika email Anda terdaftar, Anda akan menerima link reset password." });
        }

        // Hasilkan token yang aman
        const token = crypto.randomBytes(32).toString('hex');
        await db.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [email, token]);

        const resetLink = `http://localhost:9002/reset-password?token=${token}`;

        // Kirim email
        await transporter.sendMail({
            from: `"SI-PAKAT Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Password Akun SI-PAKAT Anda",
            html: `
                <p>Halo,</p>
                <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p>
                <p>Klik link di bawah ini untuk mereset password Anda:</p>
                <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
                <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
            `,
        });

        res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Gagal mengirim email reset." });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT * FROM password_resets WHERE token = ? AND created_at > NOW() - INTERVAL 1 HOUR',
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Token tidak valid atau telah kedaluwarsa." });
        }

        const resetRequest = rows[0];
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Update password pengguna
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetRequest.email]);

        // Hapus token yang sudah digunakan
        await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);

        res.status(200).json({ message: "Password Anda telah berhasil direset. Silakan login." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Gagal mereset password." });
    }
};
```

### b. `authRoutes.js` (Update)

Tambahkan rute baru untuk fungsi yang baru dibuat.

```javascript
// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { logActivity } = require('../middlewares/activityLogger');
// const { verifyCaptcha } = require('../middlewares/captchaMiddleware'); // Jika CAPTCHA diimplementasikan

router.post('/login', /* verifyCaptcha, */ authController.login, logActivity('Login'));
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword, logActivity('Reset Password'));

module.exports = router;
```

Dengan langkah-langkah ini, fungsionalitas lupa dan reset password Anda sudah siap digunakan. Pastikan konfigurasi `.env` Anda sudah benar sebelum menjalankan backend.
