const express = require('express');
const {
  createAppointment,
  getUserAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getVetAppointments,
  getVetCalendarAppointments,
  updateAppointmentStatus,
  getAppointmentTypes,
  getAvailableVeterinarians
} = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/auth');
const { requireRole, requireOwnership } = require('../middleware/roleCheck');
const { appointmentValidations, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Public routes (no role restriction)
router.get('/types', getAppointmentTypes);
router.get('/veterinarians', getAvailableVeterinarians);

// User routes
router.get('/', 
  requireRole(['USER']),
  getUserAppointments
);

router.post('/', 
  requireRole(['USER']),
  appointmentValidations.create,
  handleValidationErrors,
  createAppointment
);

// Veterinarian routes - Put most specific routes first BEFORE dynamic routes
router.get('/vet/calendar', 
  requireRole(['VETERINARIAN']),
  getVetCalendarAppointments
);

router.get('/vet/stats', 
  requireRole(['VETERINARIAN']),
  getVetAppointments // Reuse the same function for now
);

router.get('/vet/patients', 
  requireRole(['VETERINARIAN']),
  getVetAppointments // Reuse the same function for now
);

// General vet route - MUST come after specific routes
router.get('/vet', 
  requireRole(['VETERINARIAN']),
  (req, res, next) => {
    console.log('🎯 /appointments/vet route hit');
    next();
  },
  getVetAppointments
);

router.put('/vet/:id/status', 
  requireRole(['VETERINARIAN']),
  appointmentValidations.updateStatus,
  handleValidationErrors,
  updateAppointmentStatus
);

// Dynamic routes MUST come after specific routes
router.get('/:id', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  getAppointment
);

router.put('/:id', 
  requireRole(['USER']),
  requireOwnership('appointment'),
  appointmentValidations.update,
  handleValidationErrors,
  updateAppointment
);

router.delete('/:id', 
  requireRole(['USER']),
  requireOwnership('appointment'),
  cancelAppointment
);

module.exports = router;