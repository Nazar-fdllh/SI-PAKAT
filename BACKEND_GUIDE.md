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

## 2. Struktur Folder Proyek

Untuk menjaga kode tetap modular dan mudah dikelola, gunakan struktur folder berikut:

```
/si-pakat-backend
|-- /config
|   |-- db.js               # Konfigurasi koneksi database
|-- /controllers
|   |-- authController.js     # Logika untuk login
|   |-- userController.js     # Logika CRUD untuk pengguna
|   |-- assetController.js    # Logika CRUD untuk aset dan data master
|   `-- reportController.js   # Logika untuk generate laporan
|-- /middlewares
|   |-- authMiddleware.js     # Middleware untuk verifikasi token JWT
|   `-- roleMiddleware.js     # Middleware untuk otorisasi berbasis peran
|-- /routes
|   |-- authRoutes.js         # Rute untuk endpoint autentikasi
|   |-- userRoutes.js         # Rute untuk endpoint pengguna
|   |-- assetRoutes.js        # Rute untuk endpoint aset dan data master
|   `-- reportRoutes.js       # Rute untuk endpoint laporan
|-- .env                    # File untuk menyimpan variabel lingkungan
|-- package.json
`-- server.js               # File utama server Express
```

## 3. Implementasi Kode Berdasarkan Folder

Berikut adalah contoh kode untuk setiap file dalam struktur proyek.

---

### **File di Root Proyek**

#### `.env`

File ini menyimpan kredensial dan konfigurasi sensitif. Sesuaikan dengan pengaturan Laragon atau server MySQL Anda. **Penting**: `DB_HOST` diubah menjadi `127.0.0.1` untuk menghindari masalah koneksi IPv6.

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=si_pakat_db
PORT=3001
JWT_SECRET=kunci-rahasia-yang-sangat-aman
```

#### `server.js` (File Utama)

File ini menginisialisasi server Express, menerapkan middleware, dan menghubungkan semua rute. Termasuk rute sementara untuk setup admin pertama kali.

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

        // Periksa apakah admin sudah ada
        const [adminUsers] = await db.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (adminUsers.length > 0) {
            await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedAdminPassword, adminEmail]);
            res.status(200).send('Password admin utama telah di-reset. Hapus rute ini dari server.js setelah selesai.');
        } else {
            await db.execute(
                'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
                ['Admin Utama', adminEmail, hashedAdminPassword, 1] // role_id 1 untuk Administrator
            );
            res.status(201).send('Pengguna admin utama berhasil dibuat. Hapus rute ini dari server.js setelah selesai.');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal melakukan setup awal: ' + error.message);
    }
});


// Routes
app.get('/', (req, res) => {
    res.send('API SI-PAKAT Berjalan...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
```

---

### **Folder `config`**

#### `/config/db.js`

Konfigurasi koneksi ke database MySQL menggunakan `mysql2/promise`.

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

Middleware untuk memverifikasi token JWT dari header `Authorization`.

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

Middleware untuk membatasi akses endpoint berdasarkan peran pengguna.

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

---

### **Folder `controllers`**

#### `/controllers/authController.js`

Logika untuk menangani login pengguna, memvalidasi kredensial, dan membuat token JWT.

```javascript
// /controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
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

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 86400 } // 24 jam
        );

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: token
        });

    } catch (error) {
        res.status(500).json({ message: "Error server internal.", error: error.message });
    }
};
```

#### `/controllers/userController.js`

Logika CRUD (Create, Read, Update, Delete) untuk entitas Pengguna.

```javascript
// /controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Dapatkan semua pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT u.id, u.username, u.username as name, u.email, u.role_id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
    }
};

// Dapatkan pengguna berdasarkan ID
exports.getUserById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT u.id, u.username, u.username as name, u.email, u.role_id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?", 
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
    }
};

// Buat pengguna baru
exports.createUser = async (req, res) => {
    const { username, email, password, role_id } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role_id]
        );
        res.status(201).json({ id: result.insertId, username, email, role_id });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah pengguna', error: error.message });
    }
};

// Update pengguna
exports.updateUser = async (req, res) => {
    const userIdToUpdate = req.params.id;
    const currentUserId = req.userId;
    const currentUserRole = req.userRole;

    // Cek otorisasi: pengguna bisa update diri sendiri, atau admin bisa update siapa saja
    if (Number(userIdToUpdate) !== Number(currentUserId) && currentUserRole !== 'Administrator') {
         return res.status(403).json({ message: 'Akses ditolak. Anda hanya bisa memperbarui profil Anda sendiri.' });
    }

    const { username, email, password, role_id } = req.body;
    let query = 'UPDATE users SET username = ?, email = ?';
    const params = [username, email];

    // Hanya admin yang bisa mengubah role_id
    if (currentUserRole === 'Administrator' && role_id) {
        query += ', role_id = ?';
        params.push(role_id);
    }
    
    // Jika password diisi, hash dan update
    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userIdToUpdate);

    try {
        await db.execute(query, params);
        res.json({ message: 'Pengguna berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pengguna', error: error.message });
    }
};

// Hapus pengguna
exports.deleteUser = async (req, res) => {
    const userIdToDelete = req.params.id;

    // Perlindungan: Jangan izinkan penghapusan Admin Utama (ID=1).
    if (Number(userIdToDelete) === 1) {
        return res.status(403).json({ message: 'Pengguna sistem ini tidak dapat dihapus.' });
    }
        
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Hapus semua catatan penilaian yang terkait dengan pengguna ini.
        await connection.execute(
            'DELETE FROM asset_assessments WHERE assessed_by = ?',
            [userIdToDelete]
        );
        
        // 2. Setelah penilaian dihapus, hapus pengguna asli.
        await connection.execute('DELETE FROM users WHERE id = ?', [userIdToDelete]);
        
        await connection.commit();
        res.status(204).send();

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
    } finally {
        connection.release();
    }
};
```

#### `/controllers/assetController.js`

Logika CRUD untuk Aset dan sekarang juga untuk mengambil data master.

```javascript
// /controllers/assetController.js
const db = require('../config/db');

// Helper function to safely handle undefined values for SQL queries
const safe = (v) => v === undefined ? null : v;

// Helper function to manage child table data
const manageChildAsset = async (connection, classificationId, assetId, data) => {
    const childTableMap = {
        1: { name: 'human_resource_details', fields: ['personnel_name', 'employee_id_number', 'function', 'unit', 'position', 'contact_info', 'contract_start_date', 'contract_end_date'] },
        2: { name: 'data_information_details', fields: ['storage_format', 'validity_period', 'sensitivity_level', 'storage_location_detail', 'retention_policy', 'last_backup_date'] },
        3: { name: 'hardware_details', fields: ['brand', 'model', 'serial_number', 'specification', 'condition', 'purchase_date', 'warranty_end_date'] },
        4: { name: 'software_details', fields: ['application_name', 'vendor', 'status', 'version', 'license_key', 'installation_date', 'expiration_date'] },
        5: { name: 'supporting_facility_details', fields: ['specification', 'condition', 'last_maintenance_date', 'next_maintenance_date', 'capacity'] },
    };

    const tableInfo = childTableMap[classificationId];
    if (!tableInfo) return; // Exit if classification has no child table

    const { name: tableName, fields: validFields } = tableInfo;

    // Extract only the relevant fields for the child table from the request body
    const childData = {};
    for (const field of validFields) {
        if (data[field] !== undefined) {
            childData[field] = data[field];
        }
    }
    
    // If no child data is present in the request body, do nothing
    if (Object.keys(childData).length === 0) return;

    // Check if a record already exists for this asset
    const [existing] = await connection.query(`SELECT asset_id FROM ${tableName} WHERE asset_id = ?`, [assetId]);

    if (existing.length > 0) {
        // Update existing record
        const fieldsToUpdate = Object.keys(childData).map(key => `${key} = ?`).join(', ');
        const params = [...Object.values(childData).map(safe), assetId];
        await connection.execute(`UPDATE ${tableName} SET ${fieldsToUpdate} WHERE asset_id = ?`, params);
    } else {
        // Insert new record
        childData.asset_id = assetId; // Add the foreign key
        const fields = Object.keys(childData).join(', ');
        const placeholders = Object.keys(childData).map(() => '?').join(', ');
        const params = Object.values(childData).map(safe);
        await connection.execute(`INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`, params);
    }
};


// ========================= GET ALL ASSETS =========================
exports.getAllAssets = async (req, res) => {
    try {
        const [assets] = await db.query(`
            SELECT 
                a.*, 
                c.name as category_name,
                (SELECT aa.asset_value 
                 FROM asset_assessments aa 
                 WHERE aa.asset_id = a.id 
                 ORDER BY aa.assessment_date DESC 
                 LIMIT 1) as asset_value
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
        `);
        res.json(assets);
    } catch (error) {
        res.status(500).json({ 
            message: 'Gagal mengambil data aset', 
            error: error.message 
        });
    }
};

// ========================= GET ASSET BY ID =========================
exports.getAssetById = async (req, res) => {
    try {
        const [asset] = await db.query(`
            SELECT 
                a.*, 
                c.name as category_name,
                aa.asset_value,
                aa.total_score,
                aa.confidentiality_score,
                aa.integrity_score,
                aa.availability_score,
                aa.authenticity_score,
                aa.non_repudiation_score
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
            LEFT JOIN (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
                FROM asset_assessments
            ) aa ON a.id = aa.asset_id AND aa.rn = 1
            WHERE a.id = ?
        `, [req.params.id]);

        if (asset.length === 0) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }
        res.json(asset[0]);
    } catch (error) {
        res.status(500).json({ 
            message: 'Gagal mengambil data aset', 
            error: error.message 
        });
    }
};

// ========================= CREATE ASSET =========================
exports.createAsset = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { 
            asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, 
            location, owner, assessed_by, confidentiality_score, integrity_score, availability_score, 
            authenticity_score, non_repudiation_score
        } = req.body;

        // 1. Insert ke tabel assets
        const [assetResult] = await connection.execute(
            `INSERT INTO assets (
                asset_code, asset_name, classification_id, sub_classification_id, 
                identification_of_existence, location, owner
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                safe(asset_code), safe(asset_name), safe(classification_id), safe(sub_classification_id),
                safe(identification_of_existence), safe(location), safe(owner)
            ]
        );
        const newAssetId = assetResult.insertId;

        // 2. Insert ke tabel penilaian
        await connection.execute(
            `INSERT INTO asset_assessments (
                asset_id, assessed_by, confidentiality_score, integrity_score, availability_score,
                authenticity_score, non_repudiation_score, assessment_date, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                newAssetId, safe(assessed_by), safe(confidentiality_score), safe(integrity_score),
                safe(availability_score), safe(authenticity_score), safe(non_repudiation_score),
                'Penilaian awal saat pembuatan aset'
            ]
        );
        
        // 3. Insert ke tabel detail anak
        await manageChildAsset(connection, classification_id, newAssetId, req.body);

        await connection.commit();

        // Ambil kembali data yang baru dibuat
        const [newAsset] = await connection.query(`
            SELECT 
                a.*, 
                c.name as category_name,
                aa.asset_value,
                aa.total_score,
                aa.confidentiality_score,
                aa.integrity_score,
                aa.availability_score,
                aa.authenticity_score,
                aa.non_repudiation_score
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
            LEFT JOIN (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
                FROM asset_assessments
            ) aa ON a.id = aa.asset_id AND aa.rn = 1
            WHERE a.id = ?
        `, [newAssetId]);

        res.status(201).json(newAsset[0]);

    } catch (error) {
        await connection.rollback();
        console.error("Create Asset Error:", error);
        res.status(500).json({ 
            message: 'Gagal menambah aset dan penilaiannya', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// ========================= UPDATE ASSET =========================
exports.updateAsset = async (req, res) => {
    const assetId = req.params.id;
    const { 
        asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, 
        location, owner, assessed_by, confidentiality_score, integrity_score, availability_score, 
        authenticity_score, non_repudiation_score, notes
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // --- Update data aset utama ---
        const assetFields = { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner };
        const fieldsToUpdate = [];
        const params = [];

        for (const [key, value] of Object.entries(assetFields)) {
            if (value !== undefined) {
                fieldsToUpdate.push(`${key} = ?`);
                params.push(safe(value));
            }
        }

        if (fieldsToUpdate.length > 0) {
            // Validasi klasifikasi
            if (classification_id !== undefined && classification_id !== null) {
                const [checkClass] = await connection.query(
                    "SELECT id FROM classifications WHERE id = ?",
                    [classification_id]
                );
                if (checkClass.length === 0) {
                    throw new Error(`Klasifikasi dengan id=${classification_id} tidak ditemukan`);
                }
            }

            params.push(assetId);
            const query = `UPDATE assets SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            await connection.execute(query, params);
        }
        
        // --- Update data detail anak ---
        if (classification_id) {
            await manageChildAsset(connection, classification_id, assetId, req.body);
        }


        // --- Tambahkan penilaian baru jika skor dikirim ---
        const hasNewAssessment = (
            confidentiality_score !== undefined ||
            integrity_score !== undefined ||
            availability_score !== undefined ||
            authenticity_score !== undefined ||
            non_repudiation_score !== undefined
        );

        if (hasNewAssessment) {
            await connection.execute(
                `INSERT INTO asset_assessments (
                    asset_id, assessed_by, confidentiality_score, integrity_score, availability_score, 
                    authenticity_score, non_repudiation_score, assessment_date, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [
                    assetId, safe(assessed_by), safe(confidentiality_score), safe(integrity_score),
                    safe(availability_score), safe(authenticity_score), safe(non_repudiation_score),
                    safe(notes) || 'Penilaian baru'
                ]
            );
        }

        await connection.commit();
        res.json({ 
            message: 'Aset berhasil diperbarui' + (hasNewAssessment ? ' dan penilaian baru ditambahkan.' : '.') 
        });

    } catch (error) {
        await connection.rollback();
        console.error("Update Asset Error:", error);
        res.status(500).json({ 
            message: 'Gagal memperbarui aset', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// ========================= DELETE ASSET =========================
exports.deleteAsset = async (req, res) => {
    const assetId = req.params.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Hapus dari semua tabel anak yang mungkin
        await connection.execute('DELETE FROM hardware_details WHERE asset_id = ?', [assetId]);
        await connection.execute('DELETE FROM software_details WHERE asset_id = ?', [assetId]);
        await connection.execute('DELETE FROM data_information_details WHERE asset_id = ?', [assetId]);
        await connection.execute('DELETE FROM human_resource_details WHERE asset_id = ?', [assetId]);
        await connection.execute('DELETE FROM supporting_facility_details WHERE asset_id = ?', [assetId]);
        
        // Hapus dari tabel aset utama (ON DELETE CASCADE akan menangani penilaian)
        await connection.execute('DELETE FROM assets WHERE id = ?', [assetId]);

        await connection.commit();
        res.status(204).send();
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ 
            message: 'Gagal menghapus aset', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};


// ========================= MASTER DATA =========================
exports.getAllRoles = async (req, res) => {
    try {
        const [roles] = await db.query("SELECT * FROM roles ORDER BY id");
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data peran', error: error.message });
    }
};

exports.getAllClassifications = async (req, res) => {
    try {
        const [classifications] = await db.query("SELECT * FROM classifications ORDER BY name");
        res.json(classifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data klasifikasi', error: error.message });
    }
};

exports.getAllSubClassifications = async (req, res) => {
    try {
        const [subClassifications] = await db.query("SELECT * FROM sub_classifications ORDER BY name");
        res.json(subClassifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data sub-klasifikasi', error: error.message });
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

router.post('/login', authController.login);

module.exports = router;
```

#### `/routes/userRoutes.js`

Semua endpoint di sini memerlukan verifikasi token dan peran Administrator.

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Terapkan verifikasi token untuk semua rute pengguna
router.use(verifyToken);

// === RUTE KHUSUS ADMIN ===
// Hanya admin yang bisa melihat semua pengguna, membuat, dan menghapus
router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userController.createUser);
router.delete('/:id', isAdmin, userController.deleteUser);


// === RUTE PENGGUNA UMUM (TERAUTENTIKASI) ===
// Pengguna bisa melihat detail profil (termasuk miliknya sendiri)
// Admin juga bisa lewat sini
router.get('/:id', userController.getUserById);

// Pengguna bisa memperbarui profilnya sendiri
// Admin juga bisa memperbarui profil siapa pun
router.put('/:id', userController.updateUser);


module.exports = router;
```

#### `/routes/assetRoutes.js`

Rute ini sekarang juga menangani endpoint untuk data master.

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAssetManager } = require('../middlewares/roleMiddleware');

// --- Master Data Routes ---
// Semua role terautentikasi bisa mengambil data master
router.get('/roles', [verifyToken], assetController.getAllRoles);
router.get('/classifications', [verifyToken], assetController.getAllClassifications);
router.get('/sub-classifications', [verifyToken], assetController.getAllSubClassifications);

// --- Asset CRUD Routes ---
// Semua role terautentikasi bisa melihat aset
router.get('/', [verifyToken], assetController.getAllAssets);
// PENTING: Rute dengan parameter ID harus diletakkan setelah rute statis
router.get('/:id', [verifyToken], assetController.getAssetById);

// Hanya Manajer Aset & Admin yang bisa melakukan operasi tulis
router.post('/', [verifyToken, isAssetManager], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager], assetController.deleteAsset);

module.exports = router;
```

#### `/routes/reportRoutes.js`

Rute ini diproteksi, hanya Auditor dan Admin yang bisa mengakses.

```javascript
// /routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const canAccessReports = checkRole(['Administrator', 'Auditor']);

router.get('/', [verifyToken, canAccessReports], reportController.generateReport);

module.exports = router;
```

## 5. Menjalankan Backend

1.  Pastikan service Apache dan MySQL di Laragon sudah berjalan.
2.  Buka terminal di dalam folder `si-pakat-backend`.
3.  Jalankan perintah: `node server.js`
4.  Server backend Anda akan berjalan di `http://localhost:3001`.

Anda sekarang bisa menguji setiap endpoint menggunakan Postman atau mengintegrasikannya dengan frontend Next.js Anda.
---
