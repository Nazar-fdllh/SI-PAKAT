# Panduan Lengkap Backend Express.js untuk SI-PAKAT

Dokumen ini berisi panduan lengkap untuk membuat backend RESTful API menggunakan Express.js dan MySQL untuk aplikasi SI-PAKAT, termasuk fitur keamanan dan fungsionalitas lanjutan.

## 1. Teknologi yang Digunakan

- **Node.js**: Lingkungan eksekusi untuk JavaScript di sisi server.
- **Express.js**: Kerangka kerja web untuk Node.js.
- **MySQL**: Sistem manajemen basis data relasional.
- **mysql2/promise**: Driver MySQL untuk Node.js yang lebih cepat dan mendukung Promise.
- **JSON Web Token (JWT)**: Untuk autentikasi dan otorisasi berbasis token.
- **bcryptjs**: Untuk hashing (enkripsi) password.
- **cors**: Middleware untuk mengaktifkan Cross-Origin Resource Sharing.
- **dotenv**: Untuk mengelola variabel lingkungan dari file `.env`.
- **nodemailer**: Untuk mengirim email (fitur reset password).
- **axios**: Untuk verifikasi CAPTCHA sisi server.
- **node-cron**: Untuk menjadwalkan tugas otomatis (pengingat password).
- **dayjs**: Library untuk manipulasi dan perbandingan tanggal.

### Instalasi Dependensi Backend
Sebelum memulai, pastikan Anda telah menginisialisasi proyek Node.js (`npm init -y`) dan menginstal semua dependensi yang diperlukan. Jalankan perintah berikut di terminal, di dalam direktori backend Anda:
```bash
npm install express mysql2 jsonwebtoken bcryptjs cors dotenv nodemailer axios node-cron dayjs
```

## 2. Struktur Folder Proyek

```
/si-pakat-backend
|-- /config
|   |-- db.js
|-- /controllers
|   |-- authController.js
|   |-- userController.js
|   |-- assetController.js
|   `-- reportController.js
|-- /cron
|   `-- passwordReminder.js
|-- /middlewares
|   |-- authMiddleware.js
|   |-- roleMiddleware.js
|   |-- activityLogger.js
|   |-- captchaMiddleware.js
|   `-- validationMiddleware.js
|-- /routes
|   |-- authRoutes.js
|   |-- userRoutes.js
|   |-- assetRoutes.js
|   `-- reportRoutes.js
|-- .env
|-- package.json
`-- server.js
```

## 3. Implementasi Kode Lengkap

---

### **File di Root Proyek**

#### `.env`

File ini menyimpan kredensial dan konfigurasi sensitif. Pastikan untuk mengisi `RECAPTCHA_SECRET_KEY` dan konfigurasi email Anda.

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=si_pakat_db
PORT=3001
JWT_SECRET=kunci-rahasia-yang-sangat-aman

# Kunci Rahasia Google reCAPTCHA v2 (SECRET KEY)
RECAPTCHA_SECRET_KEY=6Lc00QksAAAAAJzjjULxr4kca5RuGptU2ANYP1gz

# Konfigurasi Email untuk Reset Password
# Catatan: Anda bisa menggunakan domain email Anda sendiri (cth: admin@sipakat.com).
# Pastikan EMAIL_HOST, PORT, USER, dan PASS sesuai dengan pengaturan SMTP dari penyedia email Anda.
# Contoh di bawah adalah untuk akun Gmail standar.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=muhammadnazarfadillah@gmail.com
EMAIL_PASS=uqzh nicb bwtl qrio
EMAIL_FROM="SI-PAKAT <noreply@kalselprov.go.id>"
```

#### `server.js` (File Utama)

File ini menginisialisasi server Express, menerapkan middleware, menghubungkan semua rute, dan menjalankan cron job.

```javascript
// server.js
require('dotenv').config(); // Pastikan ini ada di baris paling atas
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const bcrypt = require('bcryptjs');

// Import rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import dan jalankan cron job
require('./cron/passwordReminder');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute sementara untuk setup admin pertama kali
// Cukup akses http://localhost:3001/setup-admin di browser Anda SATU KALI.
app.get('/setup-admin', async (req, res) => {
    try {
        const adminEmail = 'admin@sipakat.com';
        const adminPassword = 'password123';
        const hashedAdminPassword = bcrypt.hashSync(adminPassword, 8);

        const [adminUsers] = await db.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (adminUsers.length > 0) {
            await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedAdminPassword, adminEmail]);
            res.status(200).send('Password admin utama telah di-reset. Hapus rute ini dari server.js setelah selesai.');
        } else {
            await db.execute(
                'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
                ['Admin Utama', adminEmail, hashedAdminPassword, 1]
            );
            res.status(201).send('Pengguna admin utama berhasil dibuat. Hapus rute ini dari server.js setelah selesai.');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal melakukan setup awal: ' + error.message);
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
```

---

### **Folder `config`**

#### `/config/db.js`

```javascript
// /config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('Berhasil terhubung ke database MySQL.');
        connection.release();
    })
    .catch(err => {
        console.error('Gagal terhubung ke database:', err);
    });

module.exports = pool;
```
---

### **Folder `cron`**

#### `/cron/passwordReminder.js`

File ini berisi logika untuk mengirim email pengingat ganti password. Di bawah ini ada dua versi: satu untuk pengujian dan satu untuk produksi. Salin-tempel **salah satu** versi di bawah ini ke dalam file `/cron/passwordReminder.js` Anda sesuai kebutuhan.

---

##### **Versi Uji Coba (Salin kode ini untuk testing)**
Versi ini akan berjalan **setiap menit** dan akan mencoba mengirim email ke **semua pengguna** yang ada di database. Ideal untuk memastikan konfigurasi email dan logika pengiriman sudah benar.

```javascript
// /cron/passwordReminder.js - VERSI UJI COBA
const cron = require('node-cron');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const crypto = require('crypto');

// Konfigurasi transporter email (sama seperti di authController)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Jadwal berjalan setiap menit untuk pengujian
cron.schedule('* * * * *', async () => {
  console.log('Menjalankan cron job pengingat password (MODE UJI COBA)...');
  try {
    const [users] = await db.query("SELECT username, email, created_at FROM users WHERE created_at IS NOT NULL");

    for (const user of users) {
      const createdAt = dayjs(user.created_at);
      
      // Kondisi ini diubah agar selalu ter-trigger saat pengujian.
      if (createdAt.isValid()) { 
        console.log(`(Uji Coba) Mencoba mengirim email pengingat ke ${user.email}`);
        
        // Buat token reset
        const token = crypto.randomBytes(32).toString('hex');
        await db.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [user.email, token]);

        // Buat link dengan token
        const resetLink = `http://localhost:9002/reset-password?token=${token}`;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: '🔒 UJI COBA: Saatnya Mengganti Password Akun Anda',
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0;">
              <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header -->
                <div style="background-color: #2563eb; color: #ffffff; text-align: center; padding: 20px 10px;">
                  <h1 style="margin: 0; font-size: 22px;">SI-PAKAT</h1>
                  <p style="margin: 5px 0 0; font-size: 14px;">Sistem Pengingat & Keamanan Akun Terpadu</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px;">
                  <h2 style="color: #333;">Halo ${user.username}, 👋</h2>
                  <p style="color: #555;">Ini adalah <strong>email uji coba</strong> dari sistem <strong>SI-PAKAT</strong>.</p>
                  <p style="color: #555;">
                    Jika Anda menerima email ini, berarti fitur pengingat penggantian password berfungsi dengan baik.
                    Akun Anda dibuat pada <strong style="color: #2563eb;">${createdAt.format('DD MMMM YYYY')}</strong>.
                  </p>
                  <p style="color: #555;">Silakan klik tombol di bawah untuk menguji proses penggantian password:</p>

                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetLink}" 
                      style="
                        background-color: #2563eb; 
                        color: #ffffff; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600;
                        display: inline-block;
                        transition: background-color 0.3s;
                      "
                    >
                      🔑 Ganti Password Sekarang
                    </a>
                  </div>

                  <p style="color: #777; font-size: 14px;">
                    ⏳ Tautan ini hanya berlaku selama <strong>1 jam</strong>. 
                    Email ini dikirim secara otomatis setiap menit selama mode uji coba aktif.
                  </p>

                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                  <p style="color: #333; margin-bottom: 5px;">Terima kasih,</p>
                  <p style="font-weight: bold; color: #2563eb;">Tim SI-PAKAT</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} SI-PAKAT. Semua hak dilindungi.
                </div>
              </div>
            </div>
          `
        });
      }
    }
    console.log('Cron job pengingat password (mode uji coba) selesai.');
  } catch (error) {
    console.error('Error saat menjalankan cron job pengingat password (mode uji coba):', error);
  }
});
```
---

##### **Versi Produksi (Salin kode ini untuk penggunaan sebenarnya)**
Versi ini akan berjalan **setiap hari pukul 00:00** dan hanya mengirim email kepada pengguna yang masa aktif akunnya telah mencapai kelipatan 3 bulan.

```javascript
// /cron/passwordReminder.js - VERSI PRODUKSI
const cron = require('node-cron');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const crypto = require('crypto');

// Konfigurasi transporter email (sama seperti di authController)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Jadwal berjalan setiap hari jam 00:00 untuk produksi
cron.schedule('0 0 * * *', async () => {
  console.log('Menjalankan cron job pengingat password (MODE PRODUKSI)...');
  try {
    const [users] = await db.query("SELECT username, email, created_at FROM users WHERE created_at IS NOT NULL");
    const now = dayjs();

    for (const user of users) {
      const createdAt = dayjs(user.created_at);
      const diffMonths = now.diff(createdAt, 'month');

      // Kirim email jika umur akun adalah kelipatan 3 bulan (dan bukan 0).
      if (diffMonths > 0 && diffMonths % 3 === 0) { 
        console.log(`Mengirim email pengingat 3 bulanan ke ${user.email}`);

        // Buat token reset
        const token = crypto.randomBytes(32).toString('hex');
        await db.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [user.email, token]);

        // Buat link dengan token
        const resetLink = `http://localhost:9002/reset-password?token=${token}`;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: '🔒 Pengingat Keamanan: Saatnya Mengganti Password Akun Anda',
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0;">
              <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header -->
                <div style="background-color: #2563eb; color: #ffffff; text-align: center; padding: 20px 10px;">
                  <h1 style="margin: 0; font-size: 22px;">SI-PAKAT</h1>
                  <p style="margin: 5px 0 0; font-size: 14px;">Sistem Pengingat & Keamanan Akun Terpadu</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px;">
                  <h2 style="color: #333;">Halo ${user.username}, 👋</h2>
                  <p style="color: #555;">Ini adalah pengingat keamanan otomatis dari sistem <strong>SI-PAKAT</strong>.</p>
                  <p style="color: #555;">
                    Untuk menjaga keamanan, kami menyarankan Anda untuk mengganti password secara berkala.
                    Akun Anda dibuat pada <strong style="color: #2563eb;">${createdAt.format('DD MMMM YYYY')}</strong> dan sekarang adalah waktu yang tepat untuk memperbarui keamanan Anda.
                  </p>
                  <p style="color: #555;">Silakan klik tombol di bawah untuk memulai proses penggantian password:</p>

                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetLink}" 
                      style="
                        background-color: #2563eb; 
                        color: #ffffff; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600;
                        display: inline-block;
                        transition: background-color 0.3s;
                      "
                    >
                      🔑 Ganti Password Sekarang
                    </a>
                  </div>

                  <p style="color: #777; font-size: 14px;">
                    ⏳ Tautan ini hanya berlaku selama <strong>1 jam</strong>. 
                    Jika Anda tidak meminta ini, Anda bisa mengabaikan email ini.
                  </p>

                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                  <p style="color: #333; margin-bottom: 5px;">Terima kasih,</p>
                  <p style="font-weight: bold; color: #2563eb;">Tim SI-PAKAT</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} SI-PAKAT. Semua hak dilindungi.
                </div>
              </div>
            </div>
          `
        });
      }
    }
    console.log('Cron job pengingat password (mode produksi) selesai.');
  } catch (error) {
    console.error('Error saat menjalankan cron job pengingat password (mode produksi):', error);
  }
});
```

---
### **Folder `middlewares`**

#### `/middlewares/authMiddleware.js`

```javascript
// /middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

    if (!token) {
        return res.status(403).send({ message: "Token tidak disediakan." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Tidak diotorisasi! Token tidak valid." });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

module.exports = { verifyToken };
```

#### `/middlewares/roleMiddleware.js`

```javascript
// /middlewares/roleMiddleware.js
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).send({ message: "Akses ditolak. Peran tidak memadai." });
        }
        next();
    };
};

const isAdmin = checkRole(['Administrator']);
const isAssetManager = checkRole(['Administrator', 'Manajer Aset']);
const isAuditor = checkRole(['Administrator', 'Auditor']);

module.exports = { isAdmin, isAssetManager, isAuditor, checkRole };
```

#### `/middlewares/activityLogger.js`

```javascript
// /middlewares/activityLogger.js
const db = require('../config/db');

const logActivity = (activityDescription) => {
  return (req, res, next) => {
    // Jalankan controller utama terlebih dahulu
    next();

    // Log aktivitas setelah respons dikirim
    res.on('finish', async () => {
        // Jangan log jika tidak ada user ID atau jika request gagal sebelum user teridentifikasi
        if (!req.userId || res.statusCode >= 400) return;

        try {
            const userId = req.userId;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];

            await db.execute(
                'INSERT INTO activity_logs (user_id, activity, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [userId, activityDescription, ipAddress, userAgent]
            );
        } catch (error) {
            console.error('Gagal mencatat aktivitas:', error);
        }
    });
  };
};

module.exports = { logActivity };
```

#### `/middlewares/captchaMiddleware.js`

```javascript
// /middlewares/captchaMiddleware.js
const axios = require('axios');

exports.verifyCaptcha = async (req, res, next) => {
    const token = req.body['g-recaptcha-response'];

    // Untuk pengembangan, token dummy bisa dilewati
    if (process.env.NODE_ENV !== 'production' && token === 'DUMMY_TOKEN_FOR_DEVELOPMENT') {
        return next();
    }
    
    if (!token) {
        return res.status(400).json({ message: "Verifikasi CAPTCHA diperlukan." });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
        );

        if (response.data.success) {
            next();
        } else {
            return res.status(400).json({ message: "Verifikasi CAPTCHA gagal." });
        }
    } catch (error) {
        console.error("CAPTCHA verification error:", error);
        return res.status(500).json({ message: "Error saat memverifikasi CAPTCHA." });
    }
};
```

#### `/middlewares/validationMiddleware.js`

```javascript
// /middlewares/validationMiddleware.js
const textAndNumberOnlyRegex = /^[A-Za-z0-9\s]+$/;

exports.validateTextAndNumberOnly = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field] && !textAndNumberOnlyRegex.test(req.body[field])) {
                return res.status(400).json({
                    message: `Input tidak valid. Field '${field}' hanya boleh berisi huruf, angka, dan spasi.`
                });
            }
        }
        next();
    };
};
```

---

### **Folder `controllers`**

#### `/controllers/authController.js`

```javascript
// /controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password harus diisi." });
    }

    try {
        const [rows] = await db.execute(
            'SELECT u.id, u.username as name, u.email, u.password, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Email tidak ditemukan." });
        }

        const user = rows[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: "Password salah." });
        }

        await db.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 86400 } // 24 jam
        );
        
        req.userId = user.id;

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: token
        });
        
        next(); // Panggil activityLogger

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error server internal.", error: error.message });
    }
};

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
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

        const token = crypto.randomBytes(32).toString('hex');
        await db.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [email, token]);

        // Ganti dengan URL frontend Anda
        const resetLink = `http://localhost:9002/reset-password?token=${token}`;

        await transporter.sendMail({
    from: `"SI-PAKAT Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔒 Reset Password Akun SI-PAKAT",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
            <div style="background-color: #2563eb; color: white; text-align: center; padding: 16px 0; font-size: 20px; font-weight: 600;">
                🔐 SI-PAKAT - Reset Password
            </div>
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Halo,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                    Kami menerima permintaan untuk mereset password akun Anda di <b>SI-PAKAT</b>.<br>
                    Silakan klik tombol di bawah ini untuk mengatur ulang password Anda:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        Reset Password
                    </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.5;">
                    Jika tombol di atas tidak berfungsi, Anda juga dapat membuka tautan berikut secara manual:<br>
                    <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
                </p>

                <p style="font-size: 13px; color: #999; margin-top: 30px;">
                    Link ini akan kedaluwarsa dalam <b>1 jam</b> demi keamanan akun Anda.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

                <p style="font-size: 12px; color: #aaa; text-align: center;">
                    Email ini dikirim secara otomatis oleh sistem SI-PAKAT.<br>
                    Mohon tidak membalas email ini.
                </p>
            </div>
        </div>
    </div>
    `,
});


        res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Gagal mengirim email reset." });
    }
};

exports.resetPassword = async (req, res, next) => {
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
        const [userRows] = await db.query('SELECT id FROM users WHERE email = ?', [resetRequest.email]);
        if (userRows.length === 0) {
             return res.status(404).json({ message: "Pengguna tidak ditemukan." });
        }
        
        req.userId = userRows[0].id;
        const hashedPassword = bcrypt.hashSync(password, 8);

        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetRequest.email]);
        await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);

        res.status(200).json({ message: "Password Anda telah berhasil direset. Silakan login." });
        next();

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Gagal mereset password." });
    }
};
```

#### `/controllers/userController.js`

```javascript
// /controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
          `SELECT u.id, u.username as name, u.email, r.name as role, u.role_id, u.last_login_at 
           FROM users u 
           JOIN roles r ON u.role_id = r.id`
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username as name, email, role_id, last_login_at FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail pengguna', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, email, password, role_id } = req.body;
    if (!username || !email || !password || !role_id) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role_id]
        );
        res.status(201).json({ id: result.insertId, username, email, role_id });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }
        res.status(500).json({ message: 'Gagal membuat pengguna', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { username, email, role_id, password } = req.body;
    const { id } = req.params;

    let query = 'UPDATE users SET username = ?, email = ?, role_id = ?';
    const params = [username, email, role_id];

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    try {
        await db.execute(query, params);
        res.json({ message: 'Pengguna berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pengguna', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
    }
};
```

#### `/controllers/assetController.js`

```javascript
// /controllers/assetController.js
const db = require('../config/db');

// Helper function untuk menangani nilai undefined atau kosong untuk query SQL
const safe = (v) => (v === undefined || v === '' ? null : v);

// Helper function untuk mengelola data tabel anak
const manageChildAsset = async (connection, classificationId, assetId, data) => {
    const childTableMap = {
        1: { name: 'human_resource_details', fields: ['personnel_name', 'employee_id_number', 'function', 'position'] },
        2: { name: 'supporting_facility_details', fields: ['specification', 'condition', 'last_maintenance_date', 'next_maintenance_date', 'capacity'] },
        3: { name: 'hardware_details', fields: ['brand', 'model', 'serial_number', 'specification', 'condition'] },
        4: { name: 'software_details', fields: ['application_name', 'vendor', 'status', 'version'] },
        5: { name: 'data_information_details', fields: ['storage_format', 'validity_period', 'sensitivity_level', 'storage_location_detail', 'retention_policy', 'last_backup_date'] },
    };

    const tableInfo = childTableMap[classificationId];
    if (!tableInfo) return; // Keluar jika bukan kategori yang memiliki tabel anak

    const { name: tableName, fields: validFields } = tableInfo;

    const childData = {};
    for (const field of validFields) {
        if (data[field] !== undefined) {
            childData[field] = data[field];
        }
    }
    
    // **FIX**: Hanya lanjutkan jika ada data aktual untuk tabel anak.
    // Ini mencegah error "column cannot be null" saat mengedit aset dari kategori lain.
    if (Object.keys(childData).filter(key => childData[key] !== undefined && childData[key] !== '' && childData[key] !== null).length === 0) return;

    const [existing] = await connection.query(`SELECT asset_id FROM ${tableName} WHERE asset_id = ?`, [assetId]);

    if (existing.length > 0) {
        // Update
        const fieldsToUpdate = Object.keys(childData).map(key => `\`${key}\` = ?`).join(', ');
        const params = Object.values(childData).map(safe);
        params.push(assetId);
        await connection.execute(`UPDATE ${tableName} SET ${fieldsToUpdate} WHERE asset_id = ?`, params);
    } else {
        // Insert
        childData.asset_id = assetId;
        const fields = Object.keys(childData).map(f => `\`${f}\``).join(', ');
        const placeholders = Object.keys(childData).map(() => '?').join(', ');
        const params = Object.values(childData).map(safe);
        await connection.execute(`INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`, params);
    }
};

// ========================= GET NEXT ASSET CODE =========================
exports.getNextAssetCode = async (req, res) => {
    const { classificationId } = req.query;

    if (!classificationId) {
        return res.status(400).json({ message: 'Classification ID diperlukan.' });
    }

    const prefixMap = {
        '1': 'PS', // SDM
        '2': 'SP', // Sarana Pendukung
        '3': 'PK', // Perangkat Keras
        '4': 'PL', // Perangkat Lunak
        '5': 'DI'  // Data & Informasi
    };

    const prefix = prefixMap[classificationId];
    if (!prefix) {
        return res.status(400).json({ message: 'Classification ID tidak valid.' });
    }

    try {
        const [rows] = await db.query(`SELECT asset_code FROM assets WHERE asset_code LIKE ? ORDER BY id DESC LIMIT 1`, [`${prefix}-%`]);
        
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastCode = rows[0].asset_code;
            const lastNumber = parseInt(lastCode.split('-')[1], 10);
            nextNumber = lastNumber + 1;
        }
        
        const nextCode = `${prefix}-${String(nextNumber).padStart(4, '0')}`;
        res.json({ next_code: nextCode });

    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat kode aset baru', error: error.message });
    }
};

// ========================= GET ALL ASSETS =========================
exports.getAllAssets = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id, a.asset_code, a.asset_name, a.classification_id, a.sub_classification_id, 
                a.identification_of_existence, a.location, a.owner, c.name AS category_name,
                aa.asset_value
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
            LEFT JOIN (
                SELECT asset_id, asset_value, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
                FROM asset_assessments
            ) aa ON a.id = aa.asset_id AND aa.rn = 1;
        `;
        const [assets] = await db.query(query);
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aset', error: error.message });
    }
};

// ========================= GET ASSET BY ID =========================
exports.getAssetById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                a.*, c.name as category_name, aa.asset_value, aa.total_score,
                aa.confidentiality_score, aa.integrity_score, aa.availability_score, 
                aa.authenticity_score, aa.non_repudiation_score
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
            LEFT JOIN (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
                FROM asset_assessments
            ) aa ON a.id = aa.asset_id AND aa.rn = 1
            WHERE a.id = ?;
        `;
        const [assets] = await db.query(query, [id]);
        if (assets.length === 0) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }
        res.json(assets[0]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail aset', error: error.message });
    }
};


// ========================= GET ASSET WITH DETAILS BY ID =========================
exports.getAssetWithDetailsById = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        const [assetRows] = await connection.query('SELECT * FROM assets WHERE id = ?', [id]);
        if (assetRows.length === 0) {
            return res.status(404).json({ message: "Aset tidak ditemukan" });
        }
        const asset = assetRows[0];

        const [assessmentRows] = await connection.query('SELECT * FROM asset_assessments WHERE asset_id = ? ORDER BY assessment_date DESC LIMIT 1', [id]);
        const latestAssessment = assessmentRows[0] || {};
        
        const childTableMap = {
            1: 'human_resource_details',
            2: 'supporting_facility_details',
            3: 'hardware_details',
            4: 'software_details',
            5: 'data_information_details',
        };
        
        let childDetails = {};
        const tableName = childTableMap[asset.classification_id];
        if (tableName) {
            const [childRows] = await connection.query(`SELECT * FROM ${tableName} WHERE asset_id = ?`, [id]);
            childDetails = childRows[0] || {};
        }

        const combinedAsset = { ...asset, ...latestAssessment, ...childDetails };
        res.json(combinedAsset);

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail lengkap aset', error: error.message });
    } finally {
        connection.release();
    }
};

// ========================= CREATE ASSET =========================
exports.createAsset = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner, assessed_by, confidentiality_score, integrity_score, availability_score, authenticity_score, non_repudiation_score } = req.body;
        
        const [assetResult] = await connection.execute(
            `INSERT INTO assets (asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [safe(asset_code), safe(asset_name), safe(classification_id), safe(sub_classification_id), safe(identification_of_existence), safe(location), safe(owner)]
        );
        const newAssetId = assetResult.insertId;

        await connection.execute(
            `INSERT INTO asset_assessments (asset_id, assessed_by, confidentiality_score, integrity_score, availability_score, authenticity_score, non_repudiation_score, assessment_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [newAssetId, safe(assessed_by), safe(confidentiality_score), safe(integrity_score), safe(availability_score), safe(authenticity_score), safe(non_repudiation_score), 'Penilaian awal saat pembuatan aset']
        );
        
        // Memanggil fungsi untuk mengelola tabel anak
        await manageChildAsset(connection, classification_id, newAssetId, req.body);

        await connection.commit();

        const [newAsset] = await connection.query('SELECT a.*, c.name as category_name FROM assets a LEFT JOIN classifications c ON a.classification_id = c.id WHERE a.id = ?', [newAssetId]);
        res.status(201).json(newAsset[0]);

    } catch (error) {
        await connection.rollback();
        console.error("Create Asset Error:", error);
        res.status(500).json({ message: 'Gagal menambah aset', error: error.message });
    } finally {
        connection.release();
    }
};

// ========================= UPDATE ASSET =========================
exports.updateAsset = async (req, res) => {
    const assetId = req.params.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner, assessed_by, confidentiality_score, integrity_score, availability_score, authenticity_score, non_repudiation_score, notes } = req.body;

        await connection.execute(
            `UPDATE assets SET asset_code = ?, asset_name = ?, classification_id = ?, sub_classification_id = ?, identification_of_existence = ?, location = ?, owner = ? WHERE id = ?`,
            [safe(asset_code), safe(asset_name), safe(classification_id), safe(sub_classification_id), safe(identification_of_existence), safe(location), safe(owner), assetId]
        );

        if (classification_id) {
            await manageChildAsset(connection, classification_id, assetId, req.body);
        }

        const hasNewAssessment = (confidentiality_score !== undefined || integrity_score !== undefined);
        if (hasNewAssessment) {
            await connection.execute(
                `INSERT INTO asset_assessments (asset_id, assessed_by, confidentiality_score, integrity_score, availability_score, authenticity_score, non_repudiation_score, assessment_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [assetId, safe(assessed_by), safe(confidentiality_score), safe(integrity_score), safe(availability_score), safe(authenticity_score), safe(non_repudiation_score), safe(notes) || 'Penilaian baru']
            );
        }

        await connection.commit();
        res.json({ message: 'Aset berhasil diperbarui' + (hasNewAssessment ? ' dan penilaian baru ditambahkan.' : '.') });
    } catch (error) {
        await connection.rollback();
        console.error("Update Asset Error:", error);
        res.status(500).json({ message: 'Gagal memperbarui aset', error: error.message });
    } finally {
        connection.release();
    }
};

// ========================= DELETE ASSET =========================
exports.deleteAsset = async (req, res) => {
    const { id } = req.params;
    try {
        // ON DELETE CASCADE di database akan menangani penghapusan terkait
        await db.execute('DELETE FROM assets WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus aset', error: error.message });
    }
};

// ========================= MASTER DATA =========================
exports.getAllRoles = async (req, res) => {
    try {
        const [roles] = await db.query('SELECT * FROM roles');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data peran', error: error.message });
    }
};

exports.getAllClassifications = async (req, res) => {
    try {
        const [classifications] = await db.query('SELECT * FROM classifications');
        res.json(classifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data klasifikasi', error: error.message });
    }
};

exports.getAllSubClassifications = async (req, res) => {
    try {
        const [subClassifications] = await db.query('SELECT * FROM sub_classifications');
        res.json(subClassifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data sub-klasifikasi', error: error.message });
    }
};
```

#### `/controllers/reportController.js`

```javascript
// /controllers/reportController.js
const db = require('../config/db');

exports.getReport = async (req, res) => {
    const { categoryId, asset_value } = req.query;

    let query = `
        SELECT 
            a.id, a.asset_code, a.asset_name, a.owner, c.name AS category_name,
            aa.asset_value
        FROM assets a
        LEFT JOIN classifications c ON a.classification_id = c.id
        LEFT JOIN (
            SELECT asset_id, asset_value, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
            FROM asset_assessments
        ) aa ON a.id = aa.asset_id AND aa.rn = 1
        WHERE 1=1
    `;
    const params = [];

    if (categoryId && categoryId !== 'all') {
        query += ' AND a.classification_id = ?';
        params.push(categoryId);
    }

    if (asset_value && asset_value !== 'Semua') {
        query += ' AND aa.asset_value = ?';
        params.push(asset_value);
    }

    try {
        const [reportData] = await db.query(query, params);
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghasilkan laporan', error: error.message });
    }
};
```

---

### **Folder `routes`**

#### `/routes/authRoutes.js`

```javascript
// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { logActivity } = require('../middlewares/activityLogger');
const { verifyCaptcha } = require('../middlewares/captchaMiddleware');

// Terapkan verifikasi CAPTCHA pada endpoint login
router.post('/login', verifyCaptcha, authController.login, logActivity('Login'));

// Rute untuk lupa dan reset password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword, logActivity('Reset Password'));

module.exports = router;
```

#### `/routes/userRoutes.js`

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');
const { validateTextAndNumberOnly } = require('../middlewares/validationMiddleware');

router.use(verifyToken);

// Middleware validasi untuk username
const userValidation = validateTextAndNumberOnly(['username']);

router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userValidation, logActivity('Membuat Pengguna Baru'), userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userValidation, logActivity('Memperbarui Profil'), userController.updateUser);
router.delete('/:id', isAdmin, logActivity('Menghapus Pengguna'), userController.deleteUser);


module.exports = router;
```

#### `/routes/assetRoutes.js`

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAssetManager } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');
const { validateTextAndNumberOnly } = require('../middlewares/validationMiddleware');

const assetValidation = validateTextAndNumberOnly([
    'asset_name', 'identification_of_existence', 'location', 'owner',
    'personnel_name', 'function', 'position', 'brand', 'model', 'condition',
    'application_name', 'vendor', 'status', 'version', 'capacity',
    'storage_format', 'sensitivity_level', 'storage_location_detail'
]);


// Rute untuk master data (harus di atas rute dinamis)
router.get('/roles', [verifyToken], assetController.getAllRoles);
router.get('/classifications', [verifyToken], assetController.getAllClassifications);
router.get('/sub-classifications', [verifyToken], assetController.getAllSubClassifications);
router.get('/next-code', [verifyToken, isAssetManager], assetController.getNextAssetCode);

// Rute detail (lebih spesifik) harus di atas rute /:id umum
router.get('/details/:id', [verifyToken], assetController.getAssetWithDetailsById); 

// Rute CRUD Aset
router.get('/', [verifyToken], assetController.getAllAssets);
router.get('/:id', [verifyToken], assetController.getAssetById);
router.post('/', [verifyToken, isAssetManager, assetValidation, logActivity('Membuat Aset Baru')], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager, assetValidation, logActivity('Memperbarui Aset')], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager, logActivity('Menghapus Aset')], assetController.deleteAsset);


module.exports = router;
```

#### `/routes/reportRoutes.js`

```javascript
// /routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const canAccessReports = checkRole(['Administrator', 'Auditor', 'Manajer Aset']);

router.get('/', [verifyToken, canAccessReports], reportController.getReport);

module.exports = router;
```

---
## 4. Sinkronisasi Database Otomatis (Penting!)
Pastikan Anda sudah menjalankan perintah SQL untuk menambahkan `ON DELETE CASCADE` ke *foreign key* tabel-tabel anak. Ini akan membuat penghapusan data menjadi otomatis dan aman, ditangani langsung oleh database. Jika belum, lihat panduan sebelumnya untuk perintah SQL yang diperlukan.

**PENTING**: Untuk fitur pengingat password, pastikan tabel `users` Anda memiliki kolom `created_at`. Jika belum ada, jalankan perintah ini:
`ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER password;`
```
ALTER TABLE `users` ADD COLUMN `last_login_at` TIMESTAMP NULL DEFAULT NULL AFTER `role_id`;
```


    