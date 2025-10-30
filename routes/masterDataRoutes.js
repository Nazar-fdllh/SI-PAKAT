// /routes/masterDataRoutes.js
const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Terapkan middleware untuk semua rute di file ini, karena data ini
// seharusnya hanya bisa diakses oleh pengguna terautentikasi.
router.use(verifyToken);

router.get('/roles', masterDataController.getAllRoles);
router.get('/classifications', masterDataController.getAllClassifications);
router.get('/sub-classifications', masterDataController.getAllSubClassifications);

module.exports = router;
