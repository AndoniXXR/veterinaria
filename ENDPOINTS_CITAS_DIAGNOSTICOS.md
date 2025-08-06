# Endpoints para Citas y Diagnósticos

## Controlador de Citas

```javascript
// backend/src/controllers/appointmentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear nueva cita (USER)
const createAppointment = async (req, res) => {
  try {
    const { petId, date, reason } = req.body;
    const userId = req.user.id;

    // Validar que la mascota pertenece al usuario
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
          message: 'Mascota no encontrada'
        }
      });
    }

    // Validar fecha futura
    const appointmentDate = new Date(date);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'La fecha debe ser futura'
        }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        petId,
        userId,
        date: appointmentDate,
        reason,
        status: 'PENDING'
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
      message: 'Cita creada exitosamente'
    });

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Listar citas del usuario (USER)
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
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Actualizar cita (USER - solo si está PENDING)
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
          message: 'Cita no encontrada o no modificable'
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
            message: 'La fecha debe ser futura'
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
      message: 'Cita actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Cancelar cita (USER)
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
          message: 'Cita no encontrada o no cancelable'
        }
      });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error cancelando cita:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Obtener citas del veterinario (VETERINARIAN)
const getVetAppointments = async (req, res) => {
  try {
    const veterinarianId = req.user.id;
    const { date, status } = req.query;

    const where = { 
      OR: [
        { veterinarianId },
        { veterinarianId: null, status: 'PENDING' } // Citas sin asignar
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
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error obteniendo citas veterinario:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Actualizar estado de cita (VETERINARIAN)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const veterinarianId = req.user.id;

    const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Estado inválido'
        }
      });
    }

    const updateData = { status };
    
    // Si el veterinario confirma la cita, se asigna automáticamente
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
      message: 'Estado de cita actualizado'
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  updateAppointment,
  cancelAppointment,
  getVetAppointments,
  updateAppointmentStatus
};
```

## Controlador de Diagnósticos

```javascript
// backend/src/controllers/diagnosisController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear diagnóstico (VETERINARIAN)
const createDiagnosis = async (req, res) => {
  try {
    const { petId, description, prescription, appointmentId } = req.body;
    const veterinarianId = req.user.id;

    // Validar que la mascota existe
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
          message: 'Mascota no encontrada'
        }
      });
    }

    // Si se proporciona appointmentId, validar que la cita existe y está completada
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment || appointment.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_APPOINTMENT',
            message: 'La cita debe estar completada para crear un diagnóstico'
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
        files: []
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
      message: 'Diagnóstico creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Obtener historial médico de mascota (USER - solo sus mascotas, VETERINARIAN/ADMIN - todas)
const getPetDiagnoses = async (req, res) => {
  try {
    const { petId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verificar acceso a la mascota
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
          message: 'Mascota no encontrada'
        }
      });
    }

    // Verificar permisos
    if (req.user.role === 'USER' && pet.owner.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'No tienes acceso a esta mascota'
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
    console.error('Error obteniendo diagnósticos:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Actualizar diagnóstico (VETERINARIAN - solo el que lo creó)
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
          message: 'Diagnóstico no encontrado'
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
      message: 'Diagnóstico actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

// Agregar archivos al diagnóstico (VETERINARIAN)
const addDiagnosisFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { files } = req.body; // Array de URLs de Cloudinary
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
          message: 'Diagnóstico no encontrado'
        }
      });
    }

    const updatedFiles = [...diagnosis.files, ...files];

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: { files: updatedFiles }
    });

    res.json({
      success: true,
      data: { files: updatedFiles },
      message: 'Archivos agregados exitosamente'
    });

  } catch (error) {
    console.error('Error agregando archivos:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

module.exports = {
  createDiagnosis,
  getPetDiagnoses,
  updateDiagnosis,
  addDiagnosisFiles
};
```

## Rutas

```javascript
// backend/src/routes/appointments.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const {
  createAppointment,
  getUserAppointments,
  updateAppointment,
  cancelAppointment,
  getVetAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const router = express.Router();

// Rutas para usuarios
router.post('/', requireAuth, requireRole(['USER']), createAppointment);
router.get('/', requireAuth, requireRole(['USER']), getUserAppointments);
router.put('/:id', requireAuth, requireRole(['USER']), updateAppointment);
router.delete('/:id', requireAuth, requireRole(['USER']), cancelAppointment);

// Rutas para veterinarios
router.get('/vet', requireAuth, requireRole(['VETERINARIAN']), getVetAppointments);
router.put('/vet/:id/status', requireAuth, requireRole(['VETERINARIAN']), updateAppointmentStatus);

module.exports = router;
```

```javascript
// backend/src/routes/diagnosis.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const {
  createDiagnosis,
  getPetDiagnoses,
  updateDiagnosis,
  addDiagnosisFiles
} = require('../controllers/diagnosisController');

const router = express.Router();

// Rutas para veterinarios
router.post('/', requireAuth, requireRole(['VETERINARIAN']), createDiagnosis);
router.put('/:id', requireAuth, requireRole(['VETERINARIAN']), updateDiagnosis);
router.post('/:id/files', requireAuth, requireRole(['VETERINARIAN']), addDiagnosisFiles);

// Rutas para usuarios (ver historial de sus mascotas)
router.get('/pet/:petId', requireAuth, requireRole(['USER', 'VETERINARIAN', 'ADMIN']), getPetDiagnoses);

module.exports = router;
```

## Ejemplos de Uso

### Crear Cita
```bash
POST /api/appointments
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "petId": "pet_12345",
  "date": "2024-02-15T10:00:00Z",
  "reason": "Revisión general"
}
```

### Crear Diagnóstico
```bash
POST /api/diagnosis
Authorization: Bearer <vet_token>
Content-Type: application/json

{
  "petId": "pet_12345",
  "appointmentId": "appointment_67890",
  "description": "Mascota presenta síntomas de...",
  "prescription": "Antibiótico cada 8 horas por 7 días"
}
```