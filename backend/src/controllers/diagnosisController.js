const { prisma } = require('../config/database');

const createDiagnosis = async (req, res) => {
  try {
    console.log('🏥 CREATE DIAGNOSIS - Raw body:', req.body);
    console.log('🏥 CREATE DIAGNOSIS - Files:', req.files);
    console.log('🏥 CREATE DIAGNOSIS - User:', req.user);
    
    const { petId, description, prescription, appointmentId } = req.body;
    const veterinarianId = req.user.id;
    let files = [];

    // Handle file uploads if present
    if (req.uploadedFiles) {
      files = req.uploadedFiles.map(file => file.secure_url);
    } else if (req.uploadedImages) {
      files = req.uploadedImages.map(img => img.secure_url);
    }

    // Validate pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
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

    // Validate appointment if provided
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_APPOINTMENT',
            message: 'Appointment not found'
          }
        });
      }
      
      // Allow diagnosis creation for confirmed or pending appointments
      if (appointment.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_APPOINTMENT',
            message: 'Cannot create diagnosis for cancelled appointment'
          }
        });
      }
    }

    const diagnosis = await prisma.diagnosis.create({
      data: {
        petId,
        veterinarianId,
        description,
        prescription,
        appointmentId,
        status: 'PENDING',
        files: files.length > 0 ? JSON.stringify(files) : null
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: diagnosis,
      message: 'Diagnosis created successfully'
    });

  } catch (error) {
    console.error('Create diagnosis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getPetDiagnoses = async (req, res) => {
  try {
    const { petId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify access to pet
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: { id: true }
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

    // Check permissions
    if (userRole === 'USER' && pet.owner.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have access to this pet'
        }
      });
    }

    const diagnoses = await prisma.diagnosis.findMany({
      where: { petId },
      include: {
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.diagnosis.count({
      where: { petId }
    });

    res.json({
      success: true,
      data: {
        diagnoses,
        pet: {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pet diagnoses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true
          }
        }
      }
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIAGNOSIS_NOT_FOUND',
          message: 'Diagnosis not found'
        }
      });
    }

    // Check permissions
    if (userRole === 'USER' && diagnosis.pet.owner.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have access to this diagnosis'
        }
      });
    }

    res.json({
      success: true,
      data: diagnosis
    });

  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, prescription } = req.body;
    const veterinarianId = req.user.id;

    const diagnosis = await prisma.diagnosis.findFirst({
      where: {
        id,
        veterinarianId
      }
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIAGNOSIS_NOT_FOUND',
          message: 'Diagnosis not found'
        }
      });
    }

    const updateData = {};
    if (description) updateData.description = description;
    if (prescription) updateData.prescription = prescription;

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        veterinarian: {
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
      data: updatedDiagnosis,
      message: 'Diagnosis updated successfully'
    });

  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const addDiagnosisFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const veterinarianId = req.user.id;

    if ((!req.uploadedFiles || req.uploadedFiles.length === 0) && 
        (!req.uploadedImages || req.uploadedImages.length === 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No files provided'
        }
      });
    }

    const diagnosis = await prisma.diagnosis.findFirst({
      where: {
        id,
        veterinarianId
      }
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIAGNOSIS_NOT_FOUND',
          message: 'Diagnosis not found'
        }
      });
    }

    let newFiles = [];
    if (req.uploadedFiles) {
      newFiles = req.uploadedFiles.map(file => file.secure_url);
    } else if (req.uploadedImages) {
      newFiles = req.uploadedImages.map(img => img.secure_url);
    }
    
    // Parse existing files from JSON string
    const existingFiles = diagnosis.files ? JSON.parse(diagnosis.files) : [];
    const updatedFiles = [...existingFiles, ...newFiles];

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: { files: JSON.stringify(updatedFiles) },
      select: {
        id: true,
        files: true
      }
    });

    res.json({
      success: true,
      data: { files: updatedFiles },
      message: 'Files added successfully'
    });

  } catch (error) {
    console.error('Add diagnosis files error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getVetDiagnoses = async (req, res) => {
  try {
    const veterinarianId = req.user.id;
    const { page = 1, limit = 10, petId } = req.query;

    const where = { veterinarianId };
    if (petId) where.petId = petId;

    const diagnoses = await prisma.diagnosis.findMany({
      where,
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.diagnosis.count({ where });

    res.json({
      success: true,
      data: {
        diagnoses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get vet diagnoses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Update diagnosis status
const updateDiagnosisStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const veterinarianId = req.user.id;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status'
        }
      });
    }

    // Verify diagnosis exists and belongs to veterinarian
    const existingDiagnosis = await prisma.diagnosis.findFirst({
      where: {
        id,
        veterinarianId
      }
    });

    if (!existingDiagnosis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIAGNOSIS_NOT_FOUND',
          message: 'Diagnosis not found'
        }
      });
    }

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: { status },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true
          }
        }
      }
    });

    // If diagnosis is completed, update appointment status
    if (status === 'COMPLETED' && updatedDiagnosis.appointmentId) {
      await prisma.appointment.update({
        where: { id: updatedDiagnosis.appointmentId },
        data: { status: 'COMPLETED' }
      });
    }

    res.json({
      success: true,
      data: updatedDiagnosis,
      message: 'Diagnosis status updated successfully'
    });

  } catch (error) {
    console.error('Update diagnosis status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Get diagnosis history for a pet (with status filtering)
const getPetDiagnosisHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify access to pet
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: { id: true }
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

    // Check permissions
    if (userRole === 'USER' && pet.owner.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have access to this pet'
        }
      });
    }

    const where = { petId };
    if (status) where.status = status;

    const diagnoses = await prisma.diagnosis.findMany({
      where,
      include: {
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            reason: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.diagnosis.count({ where });

    // Group by status for summary
    const statusCounts = await prisma.diagnosis.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: { petId }
    });

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        diagnoses,
        pet: {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed
        },
        statusSummary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pet diagnosis history error:', error);
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
  createDiagnosis,
  getPetDiagnoses,
  getDiagnosis,
  updateDiagnosis,
  addDiagnosisFiles,
  getVetDiagnoses,
  updateDiagnosisStatus,
  getPetDiagnosisHistory
};