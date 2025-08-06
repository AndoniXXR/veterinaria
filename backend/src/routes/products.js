const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  uploadProductImage
} = require('../controllers/productController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { productValidations, handleValidationErrors } = require('../utils/validators');
const { uploadProductImage: uploadMiddleware, processImageUpload, handleUploadError } = require('../middleware/upload');
const { secureImageUpload, processSecureUpload, handleSecureUploadError } = require('../middleware/secureUpload');

const router = express.Router();

// Public routes
router.get('/', 
  getProducts
);

router.get('/:id', 
  getProduct
);

// Admin routes - USANDO UPLOAD SEGURO
router.post('/', 
  requireAuth,
  requireRole(['ADMIN']),
  secureImageUpload('products'),  // ✅ Upload seguro contra path traversal
  processSecureUpload,            // ✅ Procesamiento seguro
  productValidations.create,
  handleValidationErrors,
  createProduct
);

router.put('/:id', 
  requireAuth,
  requireRole(['ADMIN']),
  secureImageUpload('products'),  // ✅ Upload seguro contra path traversal
  processSecureUpload,            // ✅ Procesamiento seguro  
  productValidations.update,
  handleValidationErrors,
  updateProduct
);

router.delete('/:id', 
  requireAuth,
  requireRole(['ADMIN']),
  deleteProduct
);

router.put('/:id/stock', 
  requireAuth,
  requireRole(['ADMIN']),
  updateProductStock
);

router.post('/:id/image', 
  requireAuth,
  requireRole(['ADMIN']),
  secureImageUpload('products'),  // ✅ Upload seguro contra path traversal
  processSecureUpload,            // ✅ Procesamiento seguro
  uploadProductImage
);

// Error handling middleware - USANDO HANDLER SEGURO
router.use(handleSecureUploadError);

module.exports = router;