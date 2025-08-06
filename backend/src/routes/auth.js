const express = require('express');
const { register, login, refreshToken, logout, getProfile, forgotPassword, validateResetToken, resetPassword, updateProfilePhoto, removeProfilePhoto, getAllUsers, getUserStats } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { authValidation } = require('../middleware/validation');
const { userValidations, handleValidationErrors } = require('../utils/validators');
const { uploadProfilePhoto, processImageUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Password reset routes added

// Public routes
router.post('/register', 
  ...authValidation.register,
  register
);

router.post('/login', 
  ...authValidation.login,
  login
);

router.post('/refresh', refreshToken);

// Password reset routes
router.post('/forgot-password',
  userValidations.forgotPassword,
  handleValidationErrors,
  forgotPassword
);

router.post('/validate-reset-token',
  userValidations.validateResetToken,
  handleValidationErrors,
  validateResetToken
);

router.post('/reset-password',
  userValidations.resetPassword,
  handleValidationErrors,
  resetPassword
);

// Test route to verify server reload
router.get('/test-forgot', (req, res) => {
  res.json({ success: true, message: 'Forgot password routes are loaded' });
});

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/profile', requireAuth, getProfile);
router.post('/profile/photo', 
  requireAuth,
  uploadProfilePhoto,
  processImageUpload('users'),
  updateProfilePhoto
);
router.delete('/profile/photo', 
  requireAuth,
  removeProfilePhoto
);

// Admin routes
router.get('/admin/users', 
  requireAuth, 
  requireRole(['ADMIN']), 
  getAllUsers
);

router.get('/admin/stats', 
  requireAuth, 
  requireRole(['ADMIN']), 
  getUserStats
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;