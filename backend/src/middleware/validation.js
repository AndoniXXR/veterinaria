const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para validar y sanitizar datos de entrada
 * Previene inyecciones y asegura integridad de datos
 */

// Validador de ID (UUID)
const validateId = () => [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
    .trim()
    .escape()
];

// Validador de email
const validateEmail = () => [
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail()
    .trim()
    .escape()
];

// Validador de texto general
const validateText = (field, minLength = 1, maxLength = 500) => [
  body(field)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} debe tener entre ${minLength} y ${maxLength} caracteres`)
    .trim()
    .escape()
];

// Validador de números
const validateNumber = (field, min = 0, max = 999999) => [
  body(field)
    .isNumeric()
    .withMessage(`${field} debe ser un número`)
    .toFloat()
    .custom((value) => {
      if (value < min || value > max) {
        throw new Error(`${field} debe estar entre ${min} y ${max}`);
      }
      return true;
    })
];

// Validador de queries de paginación
const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero mayor a 0')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100')
    .toInt()
];

// Validador de rango de fechas
const validateDateRange = () => [
  query('range')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango debe ser: 7d, 30d, 90d, o 1y')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const sanitizedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: typeof error.value === 'string' ? error.value.substring(0, 100) : error.value
    }));

    console.log('❌ Validation errors:', sanitizedErrors);
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Datos de entrada no válidos',
        details: sanitizedErrors
      }
    });
  }
  
  next();
};

// Validaciones específicas por endpoint
const authValidation = {
  register: [
    validateEmail(),
    validateText('name', 2, 100),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Contraseña debe incluir mayúscula, minúscula y número'),
    validateText('phone', 8, 20),
    validateText('address', 5, 200),
    handleValidationErrors
  ],
  
  login: [
    validateEmail(),
    body('password').notEmpty().withMessage('Contraseña es requerida'),
    handleValidationErrors
  ]
};

const petValidation = {
  create: [
    validateText('name', 2, 50),
    validateText('species', 2, 30),
    validateText('breed', 2, 50),
    validateNumber('age', 0, 50),
    validateNumber('weight', 0.1, 200),
    validateText('notes', 0, 1000),
    handleValidationErrors
  ]
};

const appointmentValidation = {
  create: [
    validateId('petId'),
    body('date')
      .isISO8601()
      .withMessage('Fecha debe ser válida (ISO8601)'),
    validateText('reason', 5, 200),
    validateText('notes', 0, 500),
    handleValidationErrors
  ]
};

const productValidation = {
  create: [
    validateText('name', 2, 100),
    validateText('description', 0, 1000),
    validateNumber('price', 0.01, 99999),
    validateNumber('stock', 0, 99999),
    body('category')
      .isIn(['Alimentos', 'Juguetes', 'Accesorios', 'Medicamentos', 'Higiene'])
      .withMessage('Categoría no válida'),
    handleValidationErrors
  ]
};

module.exports = {
  validateId,
  validateEmail,
  validateText,
  validateNumber,
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  authValidation,
  petValidation,
  appointmentValidation,
  productValidation
};