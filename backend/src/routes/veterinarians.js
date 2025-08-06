const express = require('express');
const router = express.Router();
const veterinarianController = require('../controllers/veterinarianController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { uploadProfilePhoto } = require('../middleware/upload');

// Todas las rutas requieren autenticación de admin
router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// GET /api/veterinarians - Obtener todos los veterinarios
router.get('/', veterinarianController.getAllVeterinarians);

// POST /api/veterinarians - Crear nuevo veterinario
router.post('/', uploadProfilePhoto, veterinarianController.createVeterinarian);

// GET /api/veterinarians/:id - Obtener veterinario por ID
router.get('/:id', veterinarianController.getVeterinarianById);

// PUT /api/veterinarians/:id - Actualizar veterinario
router.put('/:id', uploadProfilePhoto, veterinarianController.updateVeterinarian);

// DELETE /api/veterinarians/:id - Eliminar veterinario
router.delete('/:id', veterinarianController.deleteVeterinarian);

// PATCH /api/veterinarians/:id/status - Cambiar estado del veterinario
router.patch('/:id/status', veterinarianController.toggleVeterinarianStatus);

module.exports = router;
