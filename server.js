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
const masterDataRoutes = require('./routes/masterDataRoutes'); // Tambahkan ini

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
        const email = 'admin@sipakat.com';
        const password = 'password123';
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Periksa apakah admin sudah ada
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            // Jika sudah ada, update saja passwordnya menjadi yang sudah di-hash
             await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
             return res.status(200).send('Password pengguna admin yang sudah ada telah diperbarui (di-hash). Anda sekarang bisa login.');
        }

        // Jika belum ada, buat baru
        await db.execute(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            ['Admin Utama', email, hashedPassword, 1] // role_id 1 untuk Administrator
        );
        res.status(201).send('Pengguna admin berhasil dibuat. Silakan login dengan email: admin@sipakat.com dan password: password123. Hapus rute ini dari server.js setelah selesai.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal membuat pengguna admin: ' + error.message);
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
app.use('/api', masterDataRoutes); // Tambahkan ini

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
