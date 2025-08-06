const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../services/emailService');
const { authValidation } = require('../middleware/validation');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'This email is already registered'
        }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        photo: true,
        createdAt: true
      }
    });

    // Generate tokens
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    // Generate tokens
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Response without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token required'
        }
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

    const newToken = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        user
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        photo: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log('🔍 FORGOT PASSWORD REQUEST:', req.body);
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log('👤 User lookup result:', user ? `Found: ${user.name} (${user.email})` : 'Not found');

    // Always return success to prevent email enumeration
    if (!user) {
      console.log('⚠️ Email not found in database, returning generic success message');
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send password reset email
    console.log(`📧 Attempting to send email to: ${email} with token: ${resetToken.substring(0, 10)}...`);
    try {
      const result = await sendPasswordResetEmail(email, resetToken, user.name);
      console.log(`✅ Password reset email sent successfully!`);
      console.log(`📨 Message ID: ${result.messageId}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Continue anyway to prevent email enumeration
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.uploadedImage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_IMAGE',
          message: 'No image uploaded'
        }
      });
    }

    // Update user's photo in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        photo: req.uploadedImage.secure_url
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        photo: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        user: updatedUser,
        image: req.uploadedImage
      },
      message: 'Profile photo updated successfully'
    });

  } catch (error) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const removeProfilePhoto = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { photo: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Remove photo file from disk if it exists
    if (user.photo) {
      const fs = require('fs');
      const path = require('path');
      
      // Extract filename from URL
      const photoUrl = user.photo;
      if (photoUrl.includes('/uploads/')) {
        const relativePath = photoUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../../uploads/', relativePath);
        
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Photo file deleted:', filePath);
          }
        } catch (fileError) {
          console.error('Error deleting photo file:', fileError);
          // Continue with database update even if file deletion fails
        }
      }
    }

    // Update user's photo to null in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        photo: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        photo: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profile photo removed successfully'
    });

  } catch (error) {
    console.error('Remove profile photo error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Admin endpoint to get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    const where = {};
    
    // Filter by role
    if (role && role !== 'all') {
      where.role = role;
    }
    
    // Filter by search term
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with their pet count
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        pets: {
          select: {
            id: true
          }
        },
        appointments: {
          where: {
            status: { in: ['COMPLETED', 'CONFIRMED'] }
          },
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Add computed fields
    const usersWithStats = users.map(user => ({
      ...user,
      petsCount: user.pets?.length || 0,
      appointmentsCount: user.appointments?.length || 0,
      pets: undefined, // Remove from response
      appointments: undefined // Remove from response
    }));

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    const roleStats = {};
    usersByRole.forEach(item => {
      roleStats[item.role] = item._count.id;
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        roleStats: {
          USER: roleStats.USER || 0,
          VETERINARIAN: roleStats.VETERINARIAN || 0,
          ADMIN: roleStats.ADMIN || 0
        },
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
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
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  forgotPassword,
  validateResetToken,
  resetPassword,
  updateProfilePhoto,
  removeProfilePhoto,
  getAllUsers,
  getUserStats
};