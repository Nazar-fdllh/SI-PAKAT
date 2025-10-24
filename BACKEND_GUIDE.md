
# Panduan Backend SI-PAKAT dengan Express.js

Dokumen ini berisi panduan lengkap untuk membuat server backend menggunakan Express.js, MySQL, dan menyertakan dokumentasi API otomatis dengan Swagger.

## Struktur Folder Backend

Pastikan Anda membuat struktur folder dan file berikut di dalam direktori `si-pakat-backend`:

```
si-pakat-backend/
├── config/
│   ├── database.js
│   └── swaggerDef.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── assetController.js
│   └── reportController.js
├── middlewares/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── userModel.js
│   └── assetModel.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── assetRoutes.js
│   └── reportRoutes.js
├── .env
├── package.json
└── server.js
```

---

## Langkah 1: Inisialisasi Proyek dan Instalasi Dependensi

1.  Buka terminal, masuk ke direktori `si-pakat-backend`.
2.  Jalankan `npm init -y` untuk membuat file `package.json`.
3.  Jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan:

    ```bash
    npm install express mysql2 jsonwebtoken bcryptjs cors dotenv swagger-jsdoc swagger-ui-express
    ```

    Penting: Perintah ini harus dijalankan agar tidak terjadi error `module not found`.

---

## Langkah 2: Implementasi Kode

Salin dan tempel kode berikut ke dalam file yang sesuai.

### Folder: `config`

#### `config/database.js`
```javascript
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'si_pakat_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

#### `config/swaggerDef.js`
```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API SI-PAKAT Digital',
      version: '1.0.0',
      description: 'Dokumentasi RESTful API untuk Sistem Informasi Pengelolaan Keamanan Aset TIK (SI-PAKAT).',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik aset.' },
            asset_code: { type: 'string', description: 'Kode unik aset.' },
            asset_name: { type: 'string', description: 'Nama aset.' },
            classification_id: { type: 'integer', description: 'ID klasifikasi/kategori aset.' },
            sub_classification_id: { type: 'integer', nullable: true, description: 'ID sub-klasifikasi aset.' },
            identification_of_existence: { type: 'string', description: 'Identifikasi keberadaan (e.g., Fisik, Virtual).' },
            location: { type: 'string', description: 'Lokasi aset.' },
            owner: { type: 'string', description: 'Pemilik aset.' },
            category_name: { type: 'string', description: 'Nama kategori aset (dari join).' },
            asset_value: { type: 'string', enum: ['Tinggi', 'Sedang', 'Rendah', 'Belum Dinilai'], description: 'Nilai aset hasil penilaian terakhir.' },
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Path ke file-file API yang ingin Anda dokumentasikan
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
```

---
### Folder: `controllers`

#### `controllers/authController.js`
```javascript
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password harus diisi." });
    }

    const [users] = await userModel.findByEmail(email);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { login };
```

#### `controllers/userController.js`
```javascript
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const [users] = await userModel.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await userModel.findById(id);
    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await userModel.create({ username, email, password: hashedPassword, role_id });
    res.status(201).json({ id: result.insertId, username, email, role_id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id, password } = req.body;
    
    const updateData = { username, email, role_id };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const [result] = await userModel.update(id, updateData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.json({ message: "Pengguna berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await userModel.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
```

#### `controllers/assetController.js`
```javascript
const assetModel = require('../models/assetModel');

// Dapatkan semua aset
const getAllAssets = async (req, res) => {
  try {
    const [assets] = await assetModel.findAll();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Dapatkan aset berdasarkan ID
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [assets] = await assetModel.findById(id);
    if (assets.length === 0) {
      return res.status(404).json({ message: "Aset tidak ditemukan." });
    }
    res.json(assets[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buat aset baru
const createAsset = async (req, res) => {
  try {
    const [result] = await assetModel.create(req.body);
    const newAsset = { id: result.insertId, ...req.body };
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Perbarui aset
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await assetModel.update(id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aset tidak ditemukan." });
    }
    res.json({ message: "Aset berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Hapus aset
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await assetModel.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aset tidak ditemukan." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
```

#### `controllers/reportController.js`
```javascript
const assetModel = require('../models/assetModel');

const generateReport = async (req, res) => {
    try {
        const { categoryId, asset_value } = req.query;

        // Query dasar
        let query = `
            SELECT 
                a.id, 
                a.asset_code, 
                a.asset_name, 
                a.owner, 
                c.name AS category_name,
                (SELECT av.asset_value FROM assessments av WHERE av.asset_id = a.id ORDER BY av.assessment_date DESC LIMIT 1) AS asset_value
            FROM assets a
            LEFT JOIN classifications c ON a.classification_id = c.id
        `;

        const filters = [];
        const params = [];

        if (categoryId && categoryId !== 'all') {
            filters.push("a.classification_id = ?");
            params.push(categoryId);
        }
        
        // Subquery untuk filtering asset_value
        if (asset_value && asset_value !== 'Semua') {
            filters.push(`(SELECT av.asset_value FROM assessments av WHERE av.asset_id = a.id ORDER BY av.assessment_date DESC LIMIT 1) = ?`);
            params.push(asset_value);
        }

        if (filters.length > 0) {
            query += " WHERE " + filters.join(" AND ");
        }

        const [results] = await assetModel.query(query, params);
        res.json(results);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { generateReport };
```

---
### Folder: `middlewares`

#### `middlewares/authMiddleware.js`
```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  return next();
};

module.exports = verifyToken;
```

#### `middlewares/roleMiddleware.js`
```javascript
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have the required role." });
    }
    next();
  };
};

module.exports = checkRole;
```

---
### Folder: `models`

#### `models/userModel.js`
```javascript
const db = require('../config/database');

const findAll = () => {
  const query = `
    SELECT u.id, u.name, u.email, r.name AS role 
    FROM users u 
    JOIN roles r ON u.role_id = r.id
  `;
  return db.execute(query);
};

const findByEmail = (email) => {
  const query = `
    SELECT u.*, r.name as role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.email = ?
  `;
  return db.execute(query, [email]);
};

const findById = (id) => {
  const query = 'SELECT id, name, email, role_id FROM users WHERE id = ?';
  return db.execute(query, [id]);
};

const create = (user) => {
  const { username, email, password, role_id } = user;
  const query = 'INSERT INTO users (username, name, email, password, role_id) VALUES (?, ?, ?, ?, ?)';
  return db.execute(query, [username, username, email, password, role_id]); // 'name' diisi dgn 'username'
};

const update = (id, user) => {
  const { username, email, role_id, password } = user;
  let query = 'UPDATE users SET username = ?, name = ?, email = ?, role_id = ?';
  const params = [username, username, email, role_id];

  if (password) {
    query += ', password = ?';
    params.push(password);
  }

  query += ' WHERE id = ?';
  params.push(id);

  return db.execute(query, params);
};

const deleteUser = (id) => {
  const query = 'DELETE FROM users WHERE id = ?';
  return db.execute(query, [id]);
};

module.exports = {
  findAll,
  findByEmail,
  findById,
  create,
  update,
  delete: deleteUser,
};
```

#### `models/assetModel.js`
```javascript
const db = require('../config/database');

const query = (sql, params) => {
    return db.execute(sql, params);
};

const findAll = () => {
  const sql = `
    SELECT 
      a.id, 
      a.asset_code, 
      a.asset_name, 
      a.classification_id, 
      a.sub_classification_id,
      a.identification_of_existence,
      a.location,
      a.owner,
      c.name AS category_name,
      (SELECT av.asset_value FROM assessments av WHERE av.asset_id = a.id ORDER BY av.assessment_date DESC LIMIT 1) AS asset_value
    FROM assets a
    LEFT JOIN classifications c ON a.classification_id = c.id
  `;
  return db.execute(sql);
};

const findById = (id) => {
  const sql = 'SELECT * FROM assets WHERE id = ?';
  return db.execute(sql, [id]);
};

const create = (asset) => {
  const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner } = asset;
  const sql = 'INSERT INTO assets (asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner) VALUES (?, ?, ?, ?, ?, ?, ?)';
  return db.execute(sql, [asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner]);
};

const update = (id, asset) => {
  const { asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner } = asset;
  const sql = 'UPDATE assets SET asset_code = ?, asset_name = ?, classification_id = ?, sub_classification_id = ?, identification_of_existence = ?, location = ?, owner = ? WHERE id = ?';
  return db.execute(sql, [asset_code, asset_name, classification_id, sub_classification_id, identification_of_existence, location, owner, id]);
};

const deleteAsset = (id) => {
  const sql = 'DELETE FROM assets WHERE id = ?';
  return db.execute(sql, [id]);
};

module.exports = {
  query,
  findAll,
  findById,
  create,
  update,
  delete: deleteAsset,
};
```
---
### Folder: `routes`

#### `routes/authRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoint untuk autentikasi pengguna
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna untuk mendapatkan token akses
 *     tags: [Authentication]
 *     description: Endpoint untuk mengautentikasi pengguna dan mendapatkan token akses JWT. Endpoint ini tidak memerlukan token otorisasi.
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
 *                 example: admin@sipakat.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan data pengguna dan token akses.
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
 *         description: Bad Request - Email atau password tidak diisi.
 *       401:
 *         description: Unauthorized - Password salah.
 *       404:
 *         description: Not Found - Email tidak ditemukan.
 *       500:
 *         description: Server error.
 */
router.post('/login', authController.login);

module.exports = router;
```

#### `routes/userRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Middleware khusus untuk semua rute di file ini
const isAdmin = checkRole(['Administrator']);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen Pengguna (khusus Administrator)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Mendapatkan daftar semua pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua pengguna.
 *       403:
 *         description: Forbidden.
 */
router.get('/', [verifyToken, isAdmin], userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Mendapatkan detail pengguna berdasarkan ID
 *     tags: [Users]
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
 *         description: Detail pengguna.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */
router.get('/:id', [verifyToken, isAdmin], userController.getUserById);

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
 *         description: Pengguna berhasil dibuat.
 */
router.post('/', [verifyToken, isAdmin], userController.createUser);

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
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               password:
 *                 type: string
 *                 description: Opsional, isi jika ingin mengubah password.
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */
router.put('/:id', [verifyToken, isAdmin], userController.updateUser);

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
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pengguna berhasil dihapus.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */
router.delete('/:id', [verifyToken, isAdmin], userController.deleteUser);


module.exports = router;
```

#### `routes/assetRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Definisikan middleware untuk role
const canManageAssets = checkRole(['Administrator', 'Manajer Aset']);
const canViewAssets = checkRole(['Administrator', 'Manajer Aset', 'Auditor']);

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Manajemen Aset TIK
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Mendapatkan daftar semua aset
 *     tags: [Assets]
 *     description: Dapat diakses oleh Administrator, Manajer Aset, dan Auditor.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua aset.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 */
router.get('/', [verifyToken, canViewAssets], assetController.getAllAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Mendapatkan detail aset berdasarkan ID
 *     tags: [Assets]
 *     description: Dapat diakses oleh Administrator, Manajer Aset, dan Auditor.
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
 *         description: Detail aset.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Aset tidak ditemukan.
 */
router.get('/:id', [verifyToken, canViewAssets], assetController.getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Menambah aset baru
 *     tags: [Assets]
 *     description: Hanya dapat diakses oleh Administrator dan Manajer Aset.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       201:
 *         description: Aset berhasil dibuat.
 */
router.post('/', [verifyToken, canManageAssets], assetController.createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Memperbarui aset
 *     tags: [Assets]
 *     description: Hanya dapat diakses oleh Administrator dan Manajer Aset.
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
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       200:
 *         description: Aset berhasil diperbarui.
 *       404:
 *         description: Aset tidak ditemukan.
 */
router.put('/:id', [verifyToken, canManageAssets], assetController.updateAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Menghapus aset
 *     tags: [Assets]
 *     description: Hanya dapat diakses oleh Administrator dan Manajer Aset.
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
 *         description: Aset berhasil dihapus.
 *       404:
 *         description: Aset tidak ditemukan.
 */
router.delete('/:id', [verifyToken, canManageAssets], assetController.deleteAsset);

module.exports = router;
```

#### `routes/reportRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Pelaporan Aset
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Menghasilkan laporan aset dengan filter
 *     tags: [Reports]
 *     description: Menghasilkan laporan aset. Dapat difilter berdasarkan kategori dan nilai aset. Hanya dapat diakses oleh Administrator dan Auditor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori aset (contoh '2' atau 'all').
 *       - in: query
 *         name: asset_value
 *         schema:
 *           type: string
 *           enum: [Tinggi, Sedang, Rendah, Semua]
 *         description: Filter berdasarkan nilai klasifikasi aset.
 *     responses:
 *       200:
 *         description: Laporan berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   asset_code:
 *                     type: string
 *                   asset_name:
 *                     type: string
 *                   owner:
 *                     type: string
 *                   category_name:
 *                     type: string
 *                   asset_value:
 *                     type: string
 */
router.get('/', [verifyToken, checkRole(['Administrator', 'Auditor'])], reportController.generateReport);

module.exports = router;
```
---
### File Root

#### `.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=si_pakat_db
JWT_SECRET=rahasiabanget
```

#### `package.json`
(File ini akan dibuat otomatis oleh `npm init -y` dan diperbarui oleh `npm install`)

#### `server.js`
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerDef');

// Impor rute di bagian atas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rute utama
app.get('/', (req, res) => {
  res.send('API SI-PAKAT is running...');
});

// Gunakan rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);

// Sajikan dokumentasi Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
```

---

## Langkah 3: Jalankan Server

Setelah semua file dibuat dan diisi, jalankan server Anda dari terminal:

```bash
node server.js
```

Jika semuanya benar, Anda akan melihat pesan di konsol:
`Server is running on port 3001.`
`API documentation available at http://localhost:3001/api-docs`

Sekarang, buka browser Anda dan akses `http://localhost:3001/api-docs` untuk melihat dokumentasi API interaktif Anda.

  