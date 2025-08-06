# Sistema de Autenticación JWT

## Configuración JWT

### Utilidad JWT
```javascript
// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
```

### Utilidad Bcrypt
```javascript
// backend/src/utils/bcrypt.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
```

## Controlador de Autenticación

```javascript
// backend/src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validateEmail, validatePassword } = require('../utils/validators');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    // Validaciones
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Email inválido'
        }
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
        }
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Este email ya está registrado'
        }
      });
    }

    // Crear usuario
    const hashedPassword = await hashPassword(password);
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

    // Generar tokens
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
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email y contraseña son requeridos'
        }
      });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas'
        }
      });
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas'
        }
      });
    }

    // Generar tokens
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Respuesta (sin contraseña)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      },
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error interno del servidor'
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
          message: 'Refresh token requerido'
        }
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Buscar usuario
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
          message: 'Token inválido'
        }
      });
    }

    // Generar nuevo token
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
      message: 'Token renovado exitosamente'
    });

  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      }
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
```

## Middlewares de Autenticación

```javascript
// backend/src/middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de acceso requerido'
        }
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario actual
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

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        }
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      }
    });
  }
};

module.exports = { requireAuth };
```

```javascript
// backend/src/middleware/roleCheck.js
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tienes permisos para acceder a este recurso'
        }
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario accede a sus propios recursos
const requireOwnership = (resourceIdParam = 'id') => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const resourceId = req.params[resourceIdParam];

    // Solo validar si el usuario no es admin
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Aquí puedes agregar lógica específica según el recurso
    // Por ejemplo, verificar que la mascota pertenece al usuario
    if (req.baseUrl.includes('/pets')) {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const pet = await prisma.pet.findUnique({
        where: { id: resourceId }
      });

      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_RESOURCE_OWNER',
            message: 'No puedes acceder a este recurso'
          }
        });
      }
    }

    next();
  };
};

module.exports = { 
  requireRole, 
  requireOwnership 
};
```

## Rutas de Autenticación

```javascript
// backend/src/routes/auth.js
const express = require('express');
const { register, login, refreshToken, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', requireAuth, logout);

module.exports = router;
```

## Variables de Entorno

```env
# .env
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d
```

## Validadores

```javascript
// backend/src/utils/validators.js
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = {
  validateEmail,
  validatePassword
};
```

## Flujo de Autenticación

1. **Registro/Login**: Usuario envía credenciales
2. **Validación**: Server valida datos y contraseña
3. **Generación de tokens**: JWT access token (7d) + refresh token (30d)
4. **Respuesta**: User data + tokens
5. **Requests posteriores**: Cliente envía `Authorization: Bearer <token>`
6. **Middleware**: Verifica token y agrega `req.user`
7. **Renovación**: Cuando expira, usar refresh token para obtener nuevo access token