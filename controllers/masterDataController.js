// /controllers/masterDataController.js
const db = require('../config/db');

// Dapatkan semua peran
exports.getAllRoles = async (req, res) => {
    try {
        const [roles] = await db.query("SELECT * FROM roles ORDER BY id");
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data peran', error: error.message });
    }
};

// Dapatkan semua klasifikasi
exports.getAllClassifications = async (req, res) => {
    try {
        const [classifications] = await db.query("SELECT * FROM classifications ORDER BY name");
        res.json(classifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data klasifikasi', error: error.message });
    }
};

// Dapatkan semua sub-klasifikasi
exports.getAllSubClassifications = async (req, res) => {
    try {
        const [subClassifications] = await db.query("SELECT * FROM sub_classifications ORDER BY name");
        res.json(subClassifications);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data sub-klasifikasi', error: error.message });
    }
};
