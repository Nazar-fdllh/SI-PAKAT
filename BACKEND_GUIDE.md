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

# Kunci Rahasia Google reCAPTCHA v2
RECAPTCHA_SECRET_KEY=MASUKKAN_KUNCI_RAHASIA_ANDA_DISINI

# Konfigurasi Email untuk Reset Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email-anda@gmail.com
EMAIL_PASS=password-aplikasi-anda
```

#### `server.js` (File Utama)

File ini menginisialisasi server Express, menerapkan middleware, dan menghubungkan semua rute.

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');

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

#### `/controllers/authController.js`

```javascript
// /controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
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
(Sama seperti versi sebelumnya, sudah mencakup logika `last_login_at`)

#### `/controllers/assetController.js`

```javascript
// /controllers/assetController.js
const db = require('../config/db');

// Helper function to safely handle undefined or empty values for SQL queries
const safe = (v) => (v === undefined || v === '' ? null : v);

// Helper function to manage child table data
const manageChildAsset = async (connection, classificationId, assetId, data) => {
    const childTableMap = {
        1: { name: 'human_resource_details', fields: ['personnel_name', 'employee_id_number', 'function', 'position'] },
        2: { name: 'supporting_facility_details', fields: ['specification', 'condition', 'last_maintenance_date', 'next_maintenance_date', 'capacity'] },
        3: { name: 'hardware_details', fields: ['brand', 'model', 'serial_number', 'specification', 'condition'] },
        4: { name: 'software_details', fields: ['application_name', 'vendor', 'status', 'version'] },
        5: { name: 'data_information_details', fields: ['storage_format', 'validity_period', 'sensitivity_level', 'storage_location_detail', 'retention_policy', 'last_backup_date'] },
    };

    const tableInfo = childTableMap[classificationId];
    if (!tableInfo) return;

    const { name: tableName, fields: validFields } = tableInfo;

    const childData = {};
    for (const field of validFields) {
        if (data[field] !== undefined) {
            childData[field] = data[field];
        }
    }
    
    // **FIX**: Only proceed if there's actual data for the child table.
    if (Object.keys(childData).filter(key => childData[key]).length === 0) return;

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
    try {
        // Prefix 'AST' for "ASET"
        const prefix = "AST";
        const [rows] = await db.query(`SELECT asset_code FROM assets WHERE asset_code LIKE '${prefix}-%' ORDER BY id DESC LIMIT 1`);
        
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

// ... (getAllAssets, getAssetById, getAssetWithDetailsById) ...

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

// ... (deleteAsset, getAllRoles, getAllClassifications, etc.) ...
// Kode lainnya tetap sama
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
const { validateTextOnly } = require('../middlewares/validationMiddleware');

router.use(verifyToken);
const userValidation = validateTextOnly(['username']);

router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userValidation, logActivity('Membuat Pengguna Baru'), userController.createUser);
router.delete('/:id', isAdmin, logActivity('Menghapus Pengguna'), userController.deleteUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userValidation, logActivity('Memperbarui Profil'), userController.updateUser);

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
const { validateTextOnly } = require('../middlewares/validationMiddleware');

const assetValidation = validateTextOnly([
    'asset_name', 'identification_of_existence', 'owner',
    'personnel_name', 'function', 'position'
]);

router.get('/roles', [verifyToken], assetController.getAllRoles);
router.get('/classifications', [verifyToken], assetController.getAllClassifications);
router.get('/sub-classifications', [verifyToken], assetController.getAllSubClassifications);

router.get('/', [verifyToken], assetController.getAllAssets);
router.get('/next-code', [verifyToken, isAssetManager], assetController.getNextAssetCode);
router.get('/details/:id', [verifyToken], assetController.getAssetWithDetailsById); 
router.get('/:id', [verifyToken], assetController.getAssetById);

router.post('/', [verifyToken, isAssetManager, assetValidation, logActivity('Membuat Aset Baru')], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager, assetValidation, logActivity('Memperbarui Aset')], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager, logActivity('Menghapus Aset')], assetController.deleteAsset);

module.exports = router;
```
---
## 4. Sinkronisasi Database Otomatis (Penting!)
Pastikan Anda sudah menjalankan perintah SQL untuk menambahkan `ON DELETE CASCADE` ke *foreign key* tabel-tabel anak. Ini akan membuat penghapusan data menjadi otomatis dan aman, ditangani langsung oleh database. Jika belum, lihat panduan sebelumnya untuk perintah SQL yang diperlukan.
