const express = require('express');
const {
  createDiagnosis,
  getPetDiagnoses,
  getDiagnosis,
  updateDiagnosis,
  addDiagnosisFiles,
  getVetDiagnoses,
  updateDiagnosisStatus,
  getPetDiagnosisHistory
} = require('../controllers/diagnosisController');
const { requireAuth } = require('../middleware/auth');
const { requireRole, requireVeterinarianOrOwner } = require('../middleware/roleCheck');
const { diagnosisValidations, handleValidationErrors } = require('../utils/validators');
const { body } = require('express-validator');
const { uploadDiagnosisFiles, processMultipleImageUpload, processMultipleDocumentUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Veterinarian routes
router.post('/', 
  requireRole(['VETERINARIAN']),
  (req, res, next) => {
    console.log('🔍 BEFORE VALIDATION - Body:', req.body);
    console.log('🔍 BEFORE VALIDATION - Files:', req.files);
    next();
  },
  uploadDiagnosisFiles,
  processMultipleDocumentUpload('diagnosis'),
  (req, res, next) => {
    console.log('🔍 AFTER UPLOAD - Body:', req.body);
    console.log('🔍 AFTER UPLOAD - Files:', req.files);
    next();
  },
  diagnosisValidations.create,
  handleValidationErrors,
  createDiagnosis
);

router.put('/:id', 
  requireRole(['VETERINARIAN']),
  diagnosisValidations.update,
  handleValidationErrors,
  updateDiagnosis
);

router.post('/:id/files', 
  requireRole(['VETERINARIAN']),
  uploadDiagnosisFiles,
  processMultipleDocumentUpload('diagnosis'),
  addDiagnosisFiles
);

router.get('/vet/list', 
  requireRole(['VETERINARIAN']),
  getVetDiagnoses
);

router.get('/pending', 
  requireRole(['VETERINARIAN']),
  getVetDiagnoses // Reuse the same function for now
);

// Update diagnosis status
router.put('/:id/status', 
  requireRole(['VETERINARIAN']),
  body('status').isIn(['PENDING', 'REVIEWED', 'COMPLETED']).withMessage('Invalid status'),
  handleValidationErrors,
  updateDiagnosisStatus
);

// Get diagnosis history for a pet
router.get('/pet/:petId/history', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  (req, res, next) => {
    // If user is veterinarian or admin, allow access to all pets
    if (req.user.role === 'VETERINARIAN' || req.user.role === 'ADMIN') {
      return next();
    }
    // For regular users, check ownership
    return requireVeterinarianOrOwner(req, res, next);
  },
  getPetDiagnosisHistory
);

// User and veterinarian routes
router.get('/pet/:petId', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  (req, res, next) => {
    console.log('🔍 Diagnosis pet access check:', {
      petId: req.params.petId,
      userId: req.user.id,
      userRole: req.user.role
    });
    
    // If user is veterinarian or admin, allow access to all pets
    if (req.user.role === 'VETERINARIAN' || req.user.role === 'ADMIN') {
      console.log('✅ Veterinarian/Admin access granted');
      return next();
    }
    
    console.log('👤 User access - checking ownership');
    // For regular users, check ownership
    return requireVeterinarianOrOwner(req, res, next);
  },
  getPetDiagnoses
);

router.get('/:id', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  getDiagnosis
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;