const express = require('express');
const {
  getVeterinarianReports,
  exportVeterinarianReport,
  getReportHistory
} = require('../controllers/reportsController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de veterinario
router.use(requireAuth);
router.use(requireRole(['VETERINARIAN']));

// Rutas de reportes para veterinarios
router.get('/', getVeterinarianReports);
router.get('/export', exportVeterinarianReport);
router.get('/history', getReportHistory);

module.exports = router;