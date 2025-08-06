const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  getAdminActionCounts
} = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Rutas del dashboard con permisos específicos
router.get('/stats', requireRole(['ADMIN', 'VETERINARIAN']), getDashboardStats);
router.get('/activity', requireRole(['ADMIN', 'VETERINARIAN']), getRecentActivity);
router.get('/action-counts', requireRole(['ADMIN']), getAdminActionCounts);

module.exports = router;