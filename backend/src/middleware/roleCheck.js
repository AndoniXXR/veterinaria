const { prisma } = require('../config/database');

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    console.log('🔐 Role check:', { 
      userRole, 
      allowedRoles, 
      hasAccess: allowedRoles.includes(userRole) 
    });

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log('❌ Role check failed');
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to access this resource'
        }
      });
    }

    console.log('✅ Role check passed');
    next();
  };
};

const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id || req.params.petId;

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        return next();
      }

      let resource;
      let isOwner = false;

      switch (resourceType) {
        case 'pet':
          resource = await prisma.pet.findUnique({
            where: { id: resourceId },
            select: { ownerId: true }
          });
          isOwner = resource && resource.ownerId === userId;
          break;

        case 'appointment':
          resource = await prisma.appointment.findUnique({
            where: { id: resourceId },
            select: { userId: true, veterinarianId: true }
          });
          isOwner = resource && (
            resource.userId === userId || 
            (req.user.role === 'VETERINARIAN' && resource.veterinarianId === userId)
          );
          break;

        case 'diagnosis':
          resource = await prisma.diagnosis.findUnique({
            where: { id: resourceId },
            include: {
              pet: { select: { ownerId: true } },
              veterinarian: { select: { id: true } }
            }
          });
          isOwner = resource && (
            resource.pet.ownerId === userId ||
            (req.user.role === 'VETERINARIAN' && resource.veterinarian.id === userId)
          );
          break;

        case 'order':
          resource = await prisma.order.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          isOwner = resource && resource.userId === userId;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_RESOURCE_TYPE',
              message: 'Invalid resource type for ownership check'
            }
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `${resourceType} not found`
          }
        });
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_RESOURCE_OWNER',
            message: `You do not have access to this ${resourceType}`
          }
        });
      }

      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error checking resource ownership'
        }
      });
    }
  };
};

const requireVeterinarianOrOwner = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const petId = req.params.petId;

    // Admin can access everything
    if (userRole === 'ADMIN') {
      return next();
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true }
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

    // Owner can access their pet's data
    if (pet.ownerId === userId) {
      return next();
    }

    // Veterinarian can access if they have treated the pet
    if (userRole === 'VETERINARIAN') {
      const hasAppointment = await prisma.appointment.findFirst({
        where: {
          petId: petId,
          veterinarianId: userId,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      });

      if (hasAppointment) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have access to this pet\'s information'
      }
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error checking access permissions'
      }
    });
  }
};

const requireSameUserOrAdmin = (req, res, next) => {
  const requestedUserId = req.params.id || req.params.userId;
  const currentUserId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'ADMIN' || requestedUserId === currentUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'ACCESS_DENIED',
      message: 'You can only access your own information'
    }
  });
};

module.exports = {
  requireRole,
  requireOwnership,
  requireVeterinarianOrOwner,
  requireSameUserOrAdmin
};