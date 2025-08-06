const express = require('express');
const { prisma } = require('../config/database');
const { 
  createPet, 
  getUserPets, 
  getAllPets,
  getPet, 
  updatePet, 
  deletePet, 
  uploadPetPhoto 
} = require('../controllers/petController');
const { requireAuth } = require('../middleware/auth');
const { requireRole, requireOwnership } = require('../middleware/roleCheck');
const { petValidations, handleValidationErrors } = require('../utils/validators');
const { uploadPetPhoto: uploadMiddleware, processImageUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all pets (for veterinarians/admins)
router.get('/all', 
  requireRole(['VETERINARIAN', 'ADMIN']),
  getAllPets
);

// Get user's pets
router.get('/', 
  requireRole(['USER', 'ADMIN']),
  getUserPets
);

// Create new pet
router.post('/', 
  requireRole(['USER']),
  uploadMiddleware,
  processImageUpload('pets'),
  petValidations.create,
  handleValidationErrors,
  createPet
);

// Get specific pet
router.get('/:id', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  requireOwnership('pet'),
  getPet
);

// Update pet
router.put('/:id', 
  requireRole(['USER']),
  requireOwnership('pet'),
  uploadMiddleware,
  processImageUpload('pets'),
  petValidations.update,
  handleValidationErrors,
  updatePet
);

// Delete pet
router.delete('/:id', 
  requireRole(['USER']),
  requireOwnership('pet'),
  deletePet
);

// Upload pet photo
router.post('/:id/photo', 
  requireRole(['USER']),
  requireOwnership('pet'),
  uploadMiddleware,
  processImageUpload('pets'),
  uploadPetPhoto
);

// Update pet photo (for veterinarians)
router.put('/:id/photo', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  uploadMiddleware,
  processImageUpload('pets'),
  uploadPetPhoto
);

// Delete pet photo
router.delete('/:id/photo', 
  requireRole(['USER', 'VETERINARIAN', 'ADMIN']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if pet exists
      let whereClause = { id };
      
      // If user is not veterinarian or admin, check ownership
      if (userRole !== 'VETERINARIAN' && userRole !== 'ADMIN') {
        whereClause.ownerId = userId;
      }

      const pet = await prisma.pet.findFirst({
        where: whereClause
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PET_NOT_FOUND',
            message: 'Pet not found'
          }
        });
      }

      // Update pet to remove photo
      const updatedPet = await prisma.pet.update({
        where: { id },
        data: { photo: null },
        select: {
          id: true,
          name: true,
          photo: true
        }
      });

      res.json({
        success: true,
        data: updatedPet,
        message: 'Pet photo removed successfully'
      });

    } catch (error) {
      console.error('Remove pet photo error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      });
    }
  }
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;