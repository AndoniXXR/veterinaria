const { prisma } = require('../config/database');

const createAppointment = async (req, res) => {
  try {
    const { petId, date, reason, veterinarianId, notes } = req.body;
    const userId = req.user.id;

    // Validate that pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
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

    // Validate future date
    const appointmentDate = new Date(date);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Date must be in the future'
        }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        petId,
        userId,
        date: appointmentDate,
        reason,
        status: 'PENDING',
        veterinarianId: veterinarianId || null,
        notes: notes || null
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photo: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photo: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.appointment.count({ where });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = { id };
    
    // Apply access restrictions based on role
    if (userRole === 'USER') {
      whereClause.userId = userId;
    } else if (userRole === 'VETERINARIAN') {
      whereClause.OR = [
        { veterinarianId: userId },
        { veterinarianId: null, status: 'PENDING' }
      ];
    }

    const appointment = await prisma.appointment.findFirst({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photo: true,
            age: true,
            weight: true,
            gender: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        diagnosis: {
          include: {
            veterinarian: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;
    const userId = req.user.id;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId,
        status: 'PENDING'
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found or cannot be modified'
        }
      });
    }

    const updateData = {};
    if (date) {
      const appointmentDate = new Date(date);
      if (appointmentDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Date must be in the future'
          }
        });
      }
      updateData.date = appointmentDate;
    }
    if (reason) updateData.reason = reason;

    const updatedAppointment = await prisma.appointment.update({
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
        }
      }
    });

    res.json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found or cannot be cancelled'
        }
      });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Veterinarian endpoints
const getVetAppointments = async (req, res) => {
  try {
    console.log('🏥 getVetAppointments called by user:', req.user.id, req.user.role);
    console.log('🔍 Query params:', req.query);
    
    const veterinarianId = req.user.id;
    const { date, status } = req.query;

    const where = { 
      OR: [
        { veterinarianId },
        { veterinarianId: null, status: 'PENDING' }
      ]
    };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photo: true,
            age: true,
            weight: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Get vet appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const veterinarianId = req.user.id;

    const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status'
        }
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    
    // If confirming, assign veterinarian
    if (status === 'CONFIRMED') {
      updateData.veterinarianId = veterinarianId;
    }

    const appointment = await prisma.appointment.update({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment status updated successfully'
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Get appointment types
const getAppointmentTypes = async (req, res) => {
  try {
    const appointmentTypes = [
      { 
        id: 'CONSULTATION', 
        value: 'CONSULTATION', 
        label: 'Consulta General', 
        duration: '30 min', 
        price: 275,
        description: 'Consulta médica general para revisión y diagnóstico'
      },
      { 
        id: 'VACCINATION', 
        value: 'VACCINATION', 
        label: 'Vacunación', 
        duration: '20 min', 
        price: 195,
        description: 'Aplicación de vacunas según calendario'
      },
      { 
        id: 'SURGERY', 
        value: 'SURGERY', 
        label: 'Cirugía', 
        duration: '2 horas', 
        price: 1550,
        description: 'Procedimientos quirúrgicos menores y mayores'
      },
      { 
        id: 'EMERGENCY', 
        value: 'EMERGENCY', 
        label: 'Emergencia', 
        duration: '45 min', 
        price: 620,
        description: 'Atención de urgencias médicas'
      },
      { 
        id: 'CHECKUP', 
        value: 'CHECKUP', 
        label: 'Revisión', 
        duration: '25 min', 
        price: 235,
        description: 'Chequeo preventivo y control de salud'
      },
      { 
        id: 'DENTAL', 
        value: 'DENTAL', 
        label: 'Dental', 
        duration: '1 hora', 
        price: 465,
        description: 'Limpieza dental y tratamientos odontológicos'
      }
    ];

    res.json({
      success: true,
      data: appointmentTypes
    });

  } catch (error) {
    console.error('Get appointment types error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Get available veterinarians
const getAvailableVeterinarians = async (req, res) => {
  try {
    const { date, appointmentType } = req.query;

    // Get all veterinarians
    const veterinarians = await prisma.user.findMany({
      where: {
        role: 'VETERINARIAN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true
      }
    });

    // If date is provided, check availability
    if (date) {
      const appointmentDate = new Date(date);
      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get existing appointments for that date
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: {
          veterinarianId: true,
          date: true
        }
      });

      // Count appointments per vet
      const vetAppointmentCount = {};
      existingAppointments.forEach(apt => {
        if (apt.veterinarianId) {
          vetAppointmentCount[apt.veterinarianId] = (vetAppointmentCount[apt.veterinarianId] || 0) + 1;
        }
      });

      // Add availability info to each vet
      veterinarians.forEach(vet => {
        const appointmentCount = vetAppointmentCount[vet.id] || 0;
        vet.availableSlots = Math.max(0, 8 - appointmentCount); // Assuming 8 slots per day
        vet.isAvailable = vet.availableSlots > 0;
      });

      // Sort by availability
      veterinarians.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.name.localeCompare(b.name); // Sort by name if same availability
      });
    } else {
      // If no date provided, sort by name
      veterinarians.forEach(vet => {
        vet.isAvailable = true;
        vet.availableSlots = 8;
      });
      veterinarians.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      data: veterinarians
    });

  } catch (error) {
    console.error('Get available veterinarians error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Calendar-specific endpoint for veterinarians
const getVetCalendarAppointments = async (req, res) => {
  try {
    console.log('📅 getVetCalendarAppointments called by user:', req.user.id, req.user.role);
    
    const veterinarianId = req.user.id;
    const { startDate, endDate } = req.query;

    let where = { 
      OR: [
        { veterinarianId },
        { veterinarianId: null, status: 'PENDING' }
      ]
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photo: true,
            age: true,
            weight: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        diagnosis: {
          select: {
            id: true,
            description: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Transform data for calendar format
    const calendarAppointments = appointments.map(appointment => ({
      ...appointment,
      // Add type based on reason or default to CONSULTATION
      type: determineAppointmentType(appointment.reason),
      // Ensure we have all required fields
      title: `${appointment.reason || 'Consulta'} - ${appointment.pet?.name || 'Mascota'}`,
      // Add computed fields
      hasDiagnosis: !!appointment.diagnosis
    }));

    res.json({
      success: true,
      data: calendarAppointments
    });

  } catch (error) {
    console.error('Get vet calendar appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Helper function to determine appointment type based on reason
const determineAppointmentType = (reason) => {
  if (!reason) return 'CONSULTATION';
  
  const reasonLower = reason.toLowerCase();
  
  if (reasonLower.includes('vacun') || reasonLower.includes('inmuniz')) {
    return 'VACCINATION';
  } else if (reasonLower.includes('cirug') || reasonLower.includes('operac')) {
    return 'SURGERY';
  } else if (reasonLower.includes('emergencia') || reasonLower.includes('urgenc')) {
    return 'EMERGENCY';
  } else if (reasonLower.includes('revision') || reasonLower.includes('chequeo') || reasonLower.includes('control')) {
    return 'CHECKUP';
  } else if (reasonLower.includes('dental') || reasonLower.includes('diente')) {
    return 'DENTAL';
  } else {
    return 'CONSULTATION';
  }
};

module.exports = {
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
};