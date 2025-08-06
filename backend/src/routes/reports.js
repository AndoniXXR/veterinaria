const express = require('express');
const {
  getDashboardOverview,
  getFinancialReports,
  getClientReports,
  getOperationalReports,
  getClinicalReports,
  getServicesDistribution
} = require('../controllers/reportsController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// Rutas de reportes
router.get('/overview', getDashboardOverview);
router.get('/financial', getFinancialReports);
router.get('/clients', getClientReports);
router.get('/operational', getOperationalReports);
router.get('/clinical', getClinicalReports);
router.get('/services', getServicesDistribution);

module.exports = router;