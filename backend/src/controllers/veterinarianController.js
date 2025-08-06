const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('../utils/jwt');

const prisma = new PrismaClient();

const veterinarianController = {
  // Obtener todos los veterinarios
  getAllVeterinarians: async (req, res) => {
    try {
      console.log('🔍 Fetching all veterinarians...');
      
      const veterinarians = await prisma.user.findMany({
        where: {
          role: 'VETERINARIAN'
        },
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vetAppointments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`✅ Found ${veterinarians.length} veterinarians`);

      res.json({
        success: true,
        data: veterinarians.map(vet => ({
          ...vet,
          appointmentCount: vet._count.vetAppointments,
          _count: undefined
        }))
      });

    } catch (error) {
      console.error('❌ Error fetching veterinarians:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener veterinarios',
        error: error.message
      });
    }
  },

  // Crear nuevo veterinario
  createVeterinarian: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      console.log('📝 Creating new veterinarian:', { name, email });

      // Validar datos requeridos
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear el veterinario
      const veterinarian = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'VETERINARIAN',
          photo: req.file ? `/uploads/users/${req.file.filename}` : '🩺' // Emoji por defecto
        },
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          role: true,
          createdAt: true
        }
      });

      console.log('✅ Veterinarian created successfully:', veterinarian.id);

      res.status(201).json({
        success: true,
        message: 'Veterinario creado exitosamente',
        data: veterinarian
      });

    } catch (error) {
      console.error('❌ Error creating veterinarian:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear veterinario',
        error: error.message
      });
    }
  },

  // Obtener veterinario por ID
  getVeterinarianById: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('🔍 Fetching veterinarian by ID:', id);

      const veterinarian = await prisma.user.findFirst({
        where: {
          id: id,
          role: 'VETERINARIAN'
        },
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vetAppointments: true
            }
          }
        }
      });

      if (!veterinarian) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          ...veterinarian,
          appointmentCount: veterinarian._count.vetAppointments,
          _count: undefined
        }
      });

    } catch (error) {
      console.error('❌ Error fetching veterinarian:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener veterinario',
        error: error.message
      });
    }
  },

  // Actualizar veterinario
  updateVeterinarian: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      
      console.log('📝 Updating veterinarian:', id, { name, email });

      // Verificar que el veterinario existe
      const existingVet = await prisma.user.findFirst({
        where: {
          id: id,
          role: 'VETERINARIAN'
        }
      });

      if (!existingVet) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      // Verificar email único (si se está cambiando)
      if (email && email !== existingVet.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = await bcrypt.hash(password, 12);
      if (req.file) updateData.photo = `/uploads/users/${req.file.filename}`;

      // Actualizar veterinario
      const updatedVeterinarian = await prisma.user.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          role: true,
          updatedAt: true
        }
      });

      console.log('✅ Veterinarian updated successfully:', id);

      res.json({
        success: true,
        message: 'Veterinario actualizado exitosamente',
        data: updatedVeterinarian
      });

    } catch (error) {
      console.error('❌ Error updating veterinarian:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar veterinario',
        error: error.message
      });
    }
  },

  // Eliminar veterinario
  deleteVeterinarian: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Deleting veterinarian:', id);

      // Verificar que el veterinario existe
      const existingVet = await prisma.user.findFirst({
        where: {
          id: id,
          role: 'VETERINARIAN'
        }
      });

      if (!existingVet) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      // Verificar si tiene citas pendientes
      const pendingAppointments = await prisma.appointment.count({
        where: {
          veterinarianId: id,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (pendingAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el veterinario. Tiene ${pendingAppointments} citas pendientes o confirmadas.`
        });
      }

      // Eliminar veterinario
      await prisma.user.delete({
        where: { id: id }
      });

      console.log('✅ Veterinarian deleted successfully:', id);

      res.json({
        success: true,
        message: 'Veterinario eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error deleting veterinarian:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar veterinario',
        error: error.message
      });
    }
  },

  // Cambiar estado del veterinario (activar/desactivar)
  toggleVeterinarianStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      console.log('🔄 Toggling veterinarian status:', id, { isActive });

      const updatedVeterinarian = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { isActive: isActive },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true
        }
      });

      res.json({
        success: true,
        message: `Veterinario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedVeterinarian
      });

    } catch (error) {
      console.error('❌ Error toggling veterinarian status:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del veterinario',
        error: error.message
      });
    }
  }
};

module.exports = veterinarianController;
