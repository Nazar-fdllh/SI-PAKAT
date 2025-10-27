
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

Buat folder proyek baru, inisialisasi `npm`, dan instal dependensi yang diperlukan.

```bash
mkdir si-pakat-backend
cd si-pakat-backend
npm init -y
npm install express mysql2 jsonwebtoken bcryptjs cors dotenv
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

File ini menginisialisasi server Express, menerapkan middleware, dan menghubungkan semua rute.

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

const isAdmin = checkRole(['Administrator']);
const isAssetManager = checkRole(['Administrator', 'Manajer Aset']);
const isAuditor = checkRole(['Administrator', 'Auditor']);

module.exports = { isAdmin, isAssetManager, isAuditor, checkRole };
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

### `/routes/authRoutes.js`

```javascript
// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

module.exports = router;
```

---

### `/controllers/userController.js`

Logika CRUD lengkap untuk entitas Pengguna. Semua operasi tulis dilindungi hanya untuk Admin.

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

### `/routes/userRoutes.js`

Semua endpoint di sini memerlukan verifikasi token dan peran Administrator.

```javascript
// /routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Terapkan middleware untuk semua rute di file ini
router.use(verifyToken, isAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
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

### `/routes/assetRoutes.js`

Rute ini diproteksi, hanya Manajer Aset dan Admin yang bisa melakukan operasi tulis (POST, PUT, DELETE). Semua pengguna terautentikasi bisa membaca data.

```javascript
// /routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAssetManager } = require('../middlewares/roleMiddleware');

// Semua role terautentikasi bisa melihat aset
router.get('/', [verifyToken], assetController.getAllAssets);
router.get('/:id', [verifyToken], assetController.getAssetById);

// Hanya Manajer Aset & Admin yang bisa melakukan operasi tulis
router.post('/', [verifyToken, isAssetManager], assetController.createAsset);
router.put('/:id', [verifyToken, isAssetManager], assetController.updateAsset);
router.delete('/:id', [verifyToken, isAssetManager], assetController.deleteAsset);

module.exports = router;
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

### `/routes/reportRoutes.js`

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

**Catatan Penting:**
*   **Password Hashing**: Contoh di atas sudah menggunakan `bcryptjs` untuk meng-hash password saat membuat user dan membandingkannya saat login. Ini adalah praktik keamanan yang sangat penting.
*   **Username vs Name**: Di `authController`, `username` dari database di-alias sebagai `name` untuk konsistensi dengan token JWT dan frontend.

---

    
    