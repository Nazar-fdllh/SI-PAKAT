# Panduan Lengkap Backend Express.js untuk SI-PAKAT

Dokumen ini berisi panduan lengkap untuk membuat backend RESTful API menggunakan Express.js dan MySQL untuk aplikasi SI-PAKAT.

## 1. Teknologi yang Digunakan

- **Node.js**: Lingkungan eksekusi untuk JavaScript di sisi server.
- **Express.js**: Kerangka kerja web untuk Node.js.
- **MySQL**: Sistem manajemen basis data relasional.
- **mysql2**: Driver MySQL untuk Node.js yang lebih cepat dan mendukung Promise.
- **JSON Web Token (JWT)**: Untuk autentikasi dan otorisasi berbasis token.
- **bcryptjs**: Untuk hashing (enkripsi) password.
- **cors**: Middleware untuk mengaktifkan Cross-Origin Resource Sharing.
- **dotenv**: Untuk mengelola variabel lingkungan dari file `.env`.
- **nodemailer**: Untuk mengirim email (fitur reset password).
- **axios**: Untuk verifikasi CAPTCHA.

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
|-- /middlewares
|   |-- authMiddleware.js
|   |-- roleMiddleware.js
|   |-- activityLogger.js
|   |-- captchaMiddleware.js  # BARU
|   `-- validationMiddleware.js # BARU
|-- /routes
|   |-- authRoutes.js
|   |-- userRoutes.js
|   |-- assetRoutes.js
|   `-- reportRoutes.js
|-- .env
|-- package.json
`-- server.js
```

## 3. Implementasi Kode

---

### **File di Root Proyek**

#### `.env`

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=si_pakat_db
PORT=3001
JWT_SECRET=kunci-rahasia-yang-sangat-aman

# Kunci Rahasia Google reCAPTCHA v2
RECAPTCHA_SECRET_KEY=MASUKKAN_KUNCI_RAHASIA_ANDA_DISINI

# Konfigurasi Email untuk Reset Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email-anda@gmail.com
EMAIL_PASS=password-aplikasi-anda
```

---

### **Folder `middlewares`**

#### `/middlewares/captchaMiddleware.js` (BARU)

```javascript
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

#### `/middlewares/validationMiddleware.js` (BARU)

```javascript
const textOnlyRegex = /^[A-Za-z\s]+$/;

exports.validateTextOnly = (fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field] && !textOnlyRegex.test(req.body[field])) {
                return res.status(400).json({
                    message: `Input tidak valid. Field '${field}' hanya boleh berisi huruf dan spasi.`
                });
            }
        }
        next();
    };
};
```

---

### **Folder `controllers`**

#### `/controllers/authController.js` (Update)

Tambahkan fungsi `forgotPassword` dan `resetPassword`.

```javascript
// /controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Fungsi login yang sudah ada
exports.login = async (req, res, next) => { // Tambahkan 'next' untuk chaining middleware
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
        
        // Simpan data user ke request untuk logger
        req.userId = user.id;

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: token
        });
        
        // Panggil next() agar activityLogger bisa berjalan
        next();

    } catch (error) {
        res.status(500).json({ message: "Error server internal.", error: error.message });
    }
};

// Konfigurasi Nodemailer
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
            return res.status(200).json({ message: "Jika email Anda terdaftar, Anda akan menerima link reset password." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await db.execute('INSERT INTO password_resets (email, token) VALUES (?, ?)', [email, token]);

        const resetLink = `http://localhost:9002/reset-password?token=${token}`;

        await transporter.sendMail({
            from: `"SI-PAKAT Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Password Akun SI-PAKAT",
            html: `<p>Klik link ini untuk mereset password Anda: <a href="${resetLink}">${resetLink}</a>. Link ini kedaluwarsa dalam 1 jam.</p>`,
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
        
        req.userId = userRows[0].id; // Set userId untuk logger
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

#### `/controllers/assetController.js` (Update)

Tambahkan fungsi `getNextAssetCode`.

```javascript
// /controllers/assetController.js
const db = require('../config/db');

// ... fungsi-fungsi lainnya (getAllAssets, getAssetById, dll) ...

// ========================= GET NEXT ASSET CODE =========================
exports.getNextAssetCode = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT asset_code FROM assets ORDER BY id DESC LIMIT 1");
        
        let nextCode = "AST-0001"; // Default jika belum ada aset
        if (rows.length > 0) {
            const lastCode = rows[0].asset_code;
            const parts = lastCode.split('-');
            const lastNumber = parseInt(parts[1], 10);
            const nextNumber = lastNumber + 1;
            nextCode = `AST-${String(nextNumber).padStart(4, '0')}`;
        }
        
        res.json({ next_code: nextCode });

    } catch (error) {
        res.status(500).json({ 
            message: 'Gagal membuat kode aset baru', 
            error: error.message 
        });
    }
};

// ... sisa controller ...
```

---

### **Folder `routes`**

#### `/routes/authRoutes.js` (Update)

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

#### `/routes/userRoutes.js` (Update)

Terapkan `validateTextOnly`.

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');
const { validateTextOnly } = require('../middlewares/validationMiddleware');

router.use(verifyToken);

// Terapkan validasi untuk field 'username'
const userValidation = validateTextOnly(['username']);

router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userValidation, logActivity('Membuat Pengguna Baru'), userController.createUser);
router.delete('/:id', isAdmin, logActivity('Menghapus Pengguna'), userController.deleteUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userValidation, logActivity('Memperbarui Profil'), userController.updateUser);

module.exports = router;
```

#### `/routes/assetRoutes.js` (Update)

Tambahkan rute `GET /next-code` dan terapkan validasi teks.

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAssetManager } = require('../middlewares/roleMiddleware');
const { logActivity } = require('../middlewares/activityLogger');
const { validateTextOnly } = require('../middlewares/validationMiddleware');

const assetValidation = validateTextOnly([
    'asset_name', 'identification_of_existence', 'owner',
    'personnel_name', 'function', 'position'
]);

// --- Master Data Routes ---
router.get('/roles', [verifyToken], assetController.getAllRoles);
router.get('/classifications', [verifyToken], assetController.getAllClassifications);
router.get('/sub-classifications', [verifyToken], assetController.getAllSubClassifications);

// --- Asset CRUD Routes ---
router.get('/', [verifyToken], assetController.getAllAssets);

// Rute baru untuk mendapatkan kode aset berikutnya
router.get('/next-code', [verifyToken, isAssetManager], assetController.getNextAssetCode);

router.get('/details/:id', [verifyToken], assetController.getAssetWithDetailsById); 
router.get('/:id', [verifyToken], assetController.getAssetById);

router.post('/', [verifyToken, isAssetManager, assetValidation, logActivity('Membuat Aset Baru')], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager, assetValidation, logActivity('Memperbarui Aset')], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager, logActivity('Menghapus Aset')], assetController.deleteAsset);

module.exports = router;
```
