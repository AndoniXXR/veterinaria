const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Simple CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: 1,
          limit: 12,
          total: products.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching products'
      }
    });
  }
});

// Auth routes - simplified for temp server
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'El usuario ya existe'
        }
      });
    }

    // Create user with plain password (temporary)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Plain password for temp server
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // Simple token (temporary)
    const token = `temp_token_${user.id}_${Date.now()}`;

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error creating user'
      }
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas'
        }
      });
    }

    // Simple token (temporary)
    const token = `temp_token_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error during login'
      }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Temp API running' });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`🚀 Temporary API server running on port ${PORT}`);
  console.log(`Products available at: http://localhost:${PORT}/api/products`);
});

module.exports = app;