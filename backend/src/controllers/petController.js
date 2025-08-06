const { prisma } = require('../config/database');
const { uploadImage } = require('../config/cloudinary');

const createPet = async (req, res) => {
  try {
    const { name, species, breed, age, weight, gender } = req.body;
    const userId = req.user.id;
    let photoUrl = null;

    // Handle photo upload if present
    if (req.uploadedImage) {
      photoUrl = req.uploadedImage.secure_url;
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        gender,
        photo: photoUrl,
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: pet,
      message: 'Pet created successfully'
    });

  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getUserPets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pets = await prisma.pet.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            appointments: true,
            diagnoses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.pet.count({
      where: { ownerId: userId }
    });

    res.json({
      success: true,
      data: {
        pets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getAllPets = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const userRole = req.user.role;

    // Only admins and veterinarians can access all pets
    if (!['ADMIN', 'VETERINARIAN'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    let whereClause = {};
    
    // Add search functionality
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { species: { contains: search, mode: 'insensitive' } },
          { breed: { contains: search, mode: 'insensitive' } },
          { owner: { name: { contains: search, mode: 'insensitive' } } }
        ]
      };
    }

    const pets = await prisma.pet.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        _count: {
          select: {
            appointments: true,
            diagnoses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.pet.count({ where: whereClause });

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getPet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = { id };
    
    // Non-admin users can only see their own pets
    if (userRole !== 'ADMIN') {
      whereClause.ownerId = userId;
    }

    const pet = await prisma.pet.findFirst({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        appointments: {
          include: {
            veterinarian: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 5
        },
        diagnoses: {
          include: {
            veterinarian: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
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

    res.json({
      success: true,
      data: pet
    });

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, breed, age, weight, gender, removePhoto } = req.body;
    const userId = req.user.id;

    console.log('Update pet request:', { id, removePhoto, hasUploadedImage: !!req.uploadedImage });

    // Check if pet exists and belongs to user
    const existingPet = await prisma.pet.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingPet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found'
        }
      });
    }

    const updateData = {
      name,
      species,
      breed,
      age: age ? parseInt(age) : null,
      weight: weight ? parseFloat(weight) : null,
      gender
    };

    // Handle photo logic
    if (req.uploadedImage) {
      // New photo uploaded
      updateData.photo = req.uploadedImage.secure_url;
      console.log('Setting new photo:', req.uploadedImage.secure_url);
    } else if (removePhoto === 'true' || removePhoto === true) {
      // User wants to remove existing photo
      updateData.photo = null;
      console.log('Removing existing photo');
      
      // Delete physical file if it exists
      if (existingPet.photo) {
        const fs = require('fs');
        const path = require('path');
        
        // Extract filename from URL
        const photoUrl = existingPet.photo;
        if (photoUrl.includes('/uploads/')) {
          const relativePath = photoUrl.split('/uploads/')[1];
          const filePath = path.join(__dirname, '../../uploads/', relativePath);
          
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log('Physical photo file deleted:', filePath);
            }
          } catch (fileError) {
            console.error('Error deleting photo file:', fileError);
            // Continue with database update even if file deletion fails
          }
        }
      }
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedPet,
      message: 'Pet updated successfully'
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if pet exists and belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id,
        ownerId: userId
      }
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

    await prisma.pet.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const uploadPetPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!req.uploadedImage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_IMAGE',
          message: 'No image provided'
        }
      });
    }

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

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: { photo: req.uploadedImage.secure_url },
      select: {
        id: true,
        name: true,
        photo: true
      }
    });

    res.json({
      success: true,
      data: updatedPet,
      message: 'Pet photo updated successfully'
    });

  } catch (error) {
    console.error('Upload pet photo error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

module.exports = {
  createPet,
  getUserPets,
  getAllPets,
  getPet,
  updatePet,
  deletePet,
  uploadPetPhoto
};