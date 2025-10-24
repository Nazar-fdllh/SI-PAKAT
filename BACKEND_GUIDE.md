
# Panduan Lengkap Backend Express.js untuk SI-PAKAT

Dokumen ini berisi panduan lengkap untuk membuat backend RESTful API menggunakan Express.js dan MySQL untuk aplikasi SI-PAKAT, termasuk integrasi dokumentasi API otomatis menggunakan Swagger.

## 1. Teknologi yang Digunakan

- **Node.js**: Lingkungan eksekusi untuk JavaScript di sisi server.
- **Express.js**: Kerangka kerja web untuk Node.js.
- **MySQL**: Sistem manajemen basis data relasional.
- **mysql2**: Driver MySQL untuk Node.js yang lebih cepat dan mendukung Promise.
- **JSON Web Token (JWT)**: Untuk autentikasi dan otorisasi berbasis token.
- **bcryptjs**: Untuk hashing (enkripsi) password.
- **cors**: Middleware untuk mengaktifkan Cross-Origin Resource Sharing.
- **dotenv**: Untuk mengelola variabel lingkungan dari file `.env`.
- **swagger-jsdoc & swagger-ui-express**: Untuk membuat dokumentasi API interaktif secara otomatis.

## 2. Struktur Folder Proyek

Untuk menjaga kode tetap modular dan mudah dikelola, gunakan struktur folder berikut:

```
/si-pakat-backend
|-- /config
|   |-- db.js               # Konfigurasi koneksi database
|   `-- swaggerDef.js       # Konfigurasi Swagger JSDoc
|-- /controllers
|   |-- authController.js     # Logika untuk login
|   |-- userController.js     # Logika CRUD untuk pengguna
|   |-- assetController.js    # Logika CRUD untuk aset
|   `-- reportController.js   # Logika untuk generate laporan
|-- /middlewares
|   |-- authMiddleware.js     # Middleware untuk verifikasi token JWT
|   `-- roleMiddleware.js     # Middleware untuk otorisasi berbasis peran
|-- /routes
|   |-- authRoutes.js         # Rute untuk endpoint autentikasi
|   |-- userRoutes.js         # Rute untuk endpoint pengguna
|   |-- assetRoutes.js        # Rute untuk endpoint aset
|   `-- reportRoutes.js       # Rute untuk endpoint laporan
|-- .env                    # File untuk menyimpan variabel lingkungan
|-- package.json
`-- server.js               # File utama server Express
```

## 3. Instalasi Dependensi

Buat folder proyek baru, inisialisasi `npm`, dan instal dependensi yang diperlukan. **Langkah ini penting untuk dijalankan** agar semua paket yang dibutuhkan tersedia.

```bash
mkdir si-pakat-backend
cd si-pakat-backend
npm init -y
npm install express mysql2 jsonwebtoken bcryptjs cors dotenv swagger-jsdoc swagger-ui-express
```

## 4. Implementasi Kode

Berikut adalah contoh kode untuk setiap file dalam struktur proyek.

---

### `.env`

Buat file ini di root proyek untuk menyimpan kredensial dan konfigurasi sensitif. Sesuaikan dengan pengaturan Laragon atau server MySQL Anda. **Penting**: `DB_HOST` diubah menjadi `127.0.0.1` untuk menghindari masalah koneksi IPv6.

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=si_pakat_db
PORT=3001
JWT_SECRET=kunci-rahasia-yang-sangat-aman
```

---

### `server.js` (File Utama)

File ini menginisialisasi server Express, menerapkan middleware, menghubungkan semua rute, dan menyajikan dokumentasi Swagger.

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDefinition = require('./config/swaggerDef');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Swagger
const specs = swaggerJsdoc(swaggerDefinition);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('API SI-PAKAT Berjalan... Buka /api-docs untuk melihat dokumentasi.');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Dokumentasi API tersedia di http://localhost:${PORT}/api-docs`);
});
```

---

### `/config/db.js`

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

### `/config/swaggerDef.js`

File ini mendefinisikan OpenAPI Spec untuk Swagger dan menunjuk ke file-file rute yang akan didokumentasikan.

```javascript
// /config/swaggerDef.js
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API SI-PAKAT',
            version: '1.0.0',
            description: 'Dokumentasi API untuk Sistem Informasi Pengelolaan Keamanan Aset TIK (SI-PAKAT)',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Server Development'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.js'], // Path ke file API yang ingin didokumentasikan
};

module.exports = options;
```

---

### `/middlewares/authMiddleware.js`

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

---

### `/middlewares/roleMiddleware.js`

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

module.exports = { checkRole };
```

---

### `/controllers/authController.js`

Logika untuk menangani login pengguna. Password di-hash menggunakan `bcryptjs`.

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
            { id: user.id, role: user.role, name: user.name },
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

---

### `/controllers/userController.js`

Logika CRUD lengkap untuk entitas Pengguna.

```javascript
// /controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Dapatkan semua pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT u.id, u.username as name, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
    }
};

// Dapatkan pengguna berdasarkan ID
exports.getUserById = async (req, res) => {
    try {
        const [user] = await db.query("SELECT id, username as name, email, role_id FROM users WHERE id = ?", [req.params.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.json(user[0]);
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
    const { username, email, password, role_id } = req.body;
    let query = 'UPDATE users SET username = ?, email = ?, role_id = ?';
    const params = [username, email, role_id];

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    try {
        await db.execute(query, params);
        res.json({ message: 'Pengguna berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pengguna', error: error.message });
    }
};

// Hapus pengguna
exports.deleteUser = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
    }
};
```

---

### `/controllers/assetController.js`

Logika CRUD lengkap untuk Aset.

```javascript
// /controllers/assetController.js
const db = require('../config/db');

// Mendapatkan semua aset dengan join untuk nama kategori dan nilai terbaru
exports.getAllAssets = async (req, res) => {
    try {
        const [assets] = await db.query(`
            SELECT 
                a.*, 
                c.name as category_name,
                (SELECT aa.asset_value FROM asset_assessments aa WHERE aa.asset_id = a.id ORDER BY aa.assessment_date DESC LIMIT 1) as asset_value
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
        `);
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aset', error: error.message });
    }
};

// Mendapatkan satu aset berdasarkan ID
exports.getAssetById = async (req, res) => {
    try {
        const [asset] = await db.query(`
            SELECT a.*, c.name as category_name 
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
            WHERE a.id = ?
        `, [req.params.id]);
        if (asset.length === 0) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }
        res.json(asset[0]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aset', error: error.message });
    }
};

// Menambah aset baru
exports.createAsset = async (req, res) => {
    const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO assets (asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah aset', error: error.message });
    }
};

// Memperbarui aset
exports.updateAsset = async (req, res) => {
    const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner } = req.body;
    try {
        await db.execute(
            'UPDATE assets SET asset_code = ?, asset_name = ?, classification_id = ?, sub_classification_id = ?, identification_of_existence = ?, location = ?, owner = ? WHERE id = ?',
            [asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner, req.params.id]
        );
        res.json({ message: 'Aset berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui aset', error: error.message });
    }
};

// Menghapus aset
exports.deleteAsset = async (req, res) => {
    try {
        await db.execute('DELETE FROM assets WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus aset', error: error.message });
    }
};
```

---

### `/controllers/reportController.js`

Logika untuk menghasilkan data laporan dengan filter dinamis.

```javascript
// /controllers/reportController.js
const db = require('../config/db');

exports.generateReport = async (req, res) => {
    const { categoryId, asset_value } = req.query;

    let query = `
        SELECT 
            a.id, a.asset_code, a.asset_name, a.owner,
            c.name as category_name,
            latest_aa.asset_value
        FROM assets a
        JOIN classifications c ON a.classification_id = c.id
        -- Join untuk mendapatkan penilaian terbaru
        LEFT JOIN (
            SELECT 
                asset_id, 
                asset_value,
                ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY assessment_date DESC) as rn
            FROM asset_assessments
        ) latest_aa ON a.id = latest_aa.asset_id AND latest_aa.rn = 1
    `;

    const params = [];
    const conditions = [];

    if (categoryId && categoryId !== 'all') {
        conditions.push('a.classification_id = ?');
        params.push(categoryId);
    }

    if (asset_value && asset_value !== 'Semua') {
        conditions.push('latest_aa.asset_value = ?');
        params.push(asset_value);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
        const [results] = await db.query(query, params);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghasilkan laporan', error: error.message });
    }
};

```

---

### `/routes/authRoutes.js`

Tambahkan komentar JSDoc untuk dokumentasi Swagger.

```javascript
// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API untuk autentikasi pengguna
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna ke sistem
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email pengguna
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password pengguna
 *             example:
 *               email: admin@sipakat.com
 *               password: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Email atau password tidak diisi
 *       401:
 *         description: Password salah
 *       404:
 *         description: Email tidak ditemukan
 *       500:
 *         description: Error server internal
 */
router.post('/login', authController.login);

module.exports = router;
```

---

### `/routes/userRoutes.js`

Rute untuk pengguna dengan dokumentasi Swagger. Semua endpoint di sini memerlukan verifikasi token dan peran Administrator.

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const isAdmin = checkRole(['Administrator']);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk manajemen pengguna (Hanya Administrator)
 */

// Terapkan middleware untuk semua rute di file ini
router.use(verifyToken, isAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Mengambil semua data pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua pengguna
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Tidak diotorisasi
 *       403:
 *         description: Akses ditolak
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Membuat pengguna baru
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pengguna berhasil dibuat
 *       500:
 *         description: Gagal membuat pengguna
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Mengambil detail pengguna berdasarkan ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID Pengguna
 *     responses:
 *       200:
 *         description: Detail pengguna
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Memperbarui data pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID Pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: "Opsional, isi jika ingin mengganti password"
 *               role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui
 *       500:
 *         description: Gagal memperbarui pengguna
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Menghapus pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID Pengguna
 *     responses:
 *       204:
 *         description: Pengguna berhasil dihapus
 *       500:
 *         description: Gagal menghapus pengguna
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

---

### `/routes/assetRoutes.js`

Rute ini diproteksi, hanya Manajer Aset dan Admin yang bisa melakukan operasi tulis (POST, PUT, DELETE). Semua pengguna terautentikasi bisa membaca data.

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const isAssetManager = checkRole(['Administrator', 'Manajer Aset']);

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: API untuk manajemen aset
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unik aset.
 *         asset_code:
 *           type: string
 *           description: Kode unik aset.
 *         asset_name:
 *           type: string
 *           description: Nama aset.
 *         classification_id:
 *           type: integer
 *           description: ID dari tabel klasifikasi.
 *         sub_classification_id:
 *           type: integer
 *           nullable: true
 *           description: ID dari tabel sub-klasifikasi.
 *         identification_of_existence:
 *           type: string
 *           description: Cara identifikasi keberadaan aset (cth. Fisik, Virtual).
 *         location:
 *           type: string
 *           description: Lokasi fisik atau logis dari aset.
 *         owner:
 *           type: string
 *           description: Pemilik atau penanggung jawab aset.
 *         category_name:
 *           type: string
 *           description: Nama kategori aset (dari join).
 *         asset_value:
 *           type: string
 *           enum: [Tinggi, Sedang, Rendah, Belum Dinilai]
 *           description: Nilai aset hasil penilaian terbaru.
 *       example:
 *         id: 15
 *         asset_code: "PL-001"
 *         asset_name": "Sistem Penyimpanan Cloud Diskominfo"
 *         classification_id": 4
 *         sub_classification_id": 7
 *         identification_of_existence": "Virtual"
 *         location": "Data Center Diskominfo Kalsel"
 *         owner": "Diskominfo"
 *         category_name": "Perangkat Lunak"
 *         asset_value": "Sedang"
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Mengambil semua data aset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua aset
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Tidak diotorisasi
 */
router.get('/', [verifyToken], assetController.getAllAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Mengambil detail aset berdasarkan ID
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail aset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Aset tidak ditemukan
 */
router.get('/:id', [verifyToken], assetController.getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Menambah aset baru (Hanya Admin/Manajer Aset)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset_code:
 *                 type: string
 *               asset_name:
 *                 type: string
 *               classification_id:
 *                 type: integer
 *               sub_classification_id:
 *                 type: integer
 *               identification_of_existence:
 *                 type: string
 *               location:
 *                 type: string
 *               owner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aset berhasil dibuat
 */
router.post('/', [verifyToken, isAssetManager], assetController.createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Memperbarui aset (Hanya Admin/Manajer Aset)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset_code:
 *                 type: string
 *               asset_name:
 *                 type: string
 *               classification_id:
 *                 type: integer
 *               sub_classification_id:
 *                 type: integer
 *               identification_of_existence:
 *                 type: string
 *               location:
 *                 type: string
 *               owner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Aset berhasil diperbarui
 */
router.put('/:id', [verifyToken, isAssetManager], assetController.updateAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Menghapus aset (Hanya Admin/Manajer Aset)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Aset berhasil dihapus
 */
router.delete('/:id', [verifyToken, isAssetManager], assetController.deleteAsset);

module.exports = router;
```
---

### `/routes/reportRoutes.js`

Rute ini diproteksi, hanya Auditor dan Admin yang bisa mengakses.

```javascript
// /routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API untuk menghasilkan laporan aset
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Menghasilkan laporan aset dengan filter (Hanya Admin/Auditor)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID kategori aset (opsional, 'all' untuk semua)
 *       - in: query
 *         name: asset_value
 *         schema:
 *           type: string
 *           enum: [Tinggi, Sedang, Rendah, Semua]
 *         description: Nilai klasifikasi aset (opsional, 'Semua' untuk semua)
 *     responses:
 *       200:
 *         description: Data laporan berhasil diambil
 *       403:
 *         description: Akses ditolak
 */
router.get('/', [verifyToken, checkRole(['Administrator', 'Auditor'])], reportController.generateReport);

module.exports = router;
```

## 5. Menjalankan Backend

1.  Pastikan service Apache dan MySQL di Laragon sudah berjalan.
2.  Buka terminal di dalam folder `si-pakat-backend`.
3.  Jalankan perintah instalasi dependensi jika belum: `npm install`
4.  Jalankan perintah untuk memulai server: `node server.js`
5.  Server backend Anda akan berjalan di `http://localhost:3001`.
6.  Buka browser dan akses `http://localhost:3001/api-docs` untuk melihat dan menguji dokumentasi API interaktif Anda.

Anda sekarang memiliki backend yang lengkap dengan dokumentasi API otomatis yang siap diintegrasikan dengan frontend Next.js Anda.

    