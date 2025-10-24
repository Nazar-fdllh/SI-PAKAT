
# Panduan Backend SI-PAKAT dengan Express.js

Dokumen ini berisi panduan lengkap untuk membuat server backend menggunakan Express.js dan MySQL.

## Struktur Folder Backend

Pastikan Anda membuat struktur folder dan file berikut di dalam direktori `si-pakat-backend`:

```
si-pakat-backend/
├── config/
│   └── database.js
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
    npm install express mysql2 jsonwebtoken bcryptjs cors dotenv
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

router.get('/', [verifyToken, isAdmin], userController.getAllUsers);
router.get('/:id', [verifyToken, isAdmin], userController.getUserById);
router.post('/', [verifyToken, isAdmin], userController.createUser);
router.put('/:id', [verifyToken, isAdmin], userController.updateUser);
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

router.get('/', [verifyToken, canViewAssets], assetController.getAllAssets);
router.get('/:id', [verifyToken, canViewAssets], assetController.getAssetById);
router.post('/', [verifyToken, canManageAssets], assetController.createAsset);
router.put('/:id', [verifyToken, canManageAssets], assetController.updateAsset);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
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
