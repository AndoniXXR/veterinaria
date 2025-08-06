const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  processPayment,
  confirmOrderPayment,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getSalesStats
} = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const { requireRole, requireSameUserOrAdmin } = require('../middleware/roleCheck');
const { orderValidations, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// User routes
router.get('/', 
  requireRole(['USER', 'ADMIN']),
  getUserOrders
);

router.post('/', 
  requireRole(['USER']),
  orderValidations.create,
  handleValidationErrors,
  createOrder
);

router.get('/:id', 
  requireRole(['USER', 'ADMIN']),
  getOrder
);

router.post('/:id/payment', 
  requireRole(['USER']),
  processPayment
);

router.post('/:id/confirm-payment', 
  requireRole(['USER']),
  confirmOrderPayment
);

router.delete('/:id', 
  requireRole(['USER']),
  cancelOrder
);

// Admin routes
router.get('/admin/all', 
  requireRole(['ADMIN']),
  getAllOrders
);

router.get('/admin/stats', 
  requireRole(['ADMIN']),
  getSalesStats
);

router.put('/admin/:id/status', 
  requireRole(['ADMIN']),
  orderValidations.updateStatus,
  handleValidationErrors,
  updateOrderStatus
);

module.exports = router;