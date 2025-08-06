const { verifyToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

const requireAuth = async (req, res, next) => {
  try {
    console.log('Auth middleware - URL:', req.url, 'Method:', req.method);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token required'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = verifyToken(token);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photo: true,
        phone: true,
        address: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Add user to request
    req.user = user;
    console.log('✅ Auth successful for user:', { id: user.id, role: user.role, name: user.name });
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    let errorMessage = 'Invalid token';
    if (error.message === 'Token expired') {
      errorMessage = 'Token expired';
    } else if (error.message === 'Invalid token') {
      errorMessage = 'Invalid token';
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: errorMessage
      }
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photo: true
      }
    });

    req.user = user || null;
    next();

  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};