const { body, param, query, validationResult } = require('express-validator');

// Validadores de campos comunes
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email must be valid');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

const validatePhone = body('phone')
  .optional()
  .matches(/^[\+]?[1-9][\d]{0,15}$/)
  .withMessage('Phone number must be valid');

const validateId = param('id')
  .isLength({ min: 1 })
  .withMessage('ID is required');

// Validadores para mascotas
const validatePetName = body('name')
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage('Pet name must be between 1 and 50 characters');

const validateSpecies = body('species')
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage('Species is required and must be less than 50 characters');

const validateBreed = body('breed')
  .optional()
  .trim()
  .isLength({ max: 50 })
  .withMessage('Breed must be less than 50 characters');

const validateAge = body('age')
  .optional()
  .isInt({ min: 0, max: 30 })
  .withMessage('Age must be between 0 and 30 years');

const validateWeight = body('weight')
  .optional()
  .isFloat({ min: 0.1, max: 200 })
  .withMessage('Weight must be between 0.1 and 200 kg');

const validateGender = body('gender')
  .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
  .withMessage('Gender must be MALE, FEMALE, or UNKNOWN');

// Validadores para citas
const validateDate = body('date')
  .isISO8601()
  .withMessage('Date must be a valid ISO 8601 date')
  .custom((value) => {
    const appointmentDate = new Date(value);
    const now = new Date();
    if (appointmentDate <= now) {
      throw new Error('Date must be in the future');
    }
    return true;
  });

const validateReason = body('reason')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('Reason must be between 1 and 500 characters');

const validateAppointmentStatus = body('status')
  .isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
  .withMessage('Status must be PENDING, CONFIRMED, COMPLETED, or CANCELLED');

// Validadores para diagnósticos
const validateDescription = body('description')
  .trim()
  .isLength({ min: 10, max: 2000 })
  .withMessage('Description must be between 10 and 2000 characters');

const validatePrescription = body('prescription')
  .optional()
  .trim()
  .isLength({ max: 1000 })
  .withMessage('Prescription must be less than 1000 characters');

// Validadores para productos
const validateProductName = body('name')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('Product name must be between 1 and 100 characters');

const validatePrice = body('price')
  .custom((value) => {
    const price = parseFloat(value);
    if (isNaN(price) || price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    return true;
  });

const validateStock = body('stock')
  .custom((value) => {
    const stock = parseInt(value);
    if (isNaN(stock) || stock < 0) {
      throw new Error('Stock must be a non-negative integer');
    }
    return true;
  });

// Validadores para órdenes
const validateQuantity = body('quantity')
  .isInt({ min: 1 })
  .withMessage('Quantity must be at least 1');

const validateOrderStatus = body('status')
  .isIn(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  .withMessage('Status must be PENDING, PAID, SHIPPED, DELIVERED, or CANCELLED');

// Validadores de paginación
const validatePage = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('Page must be a positive integer');

const validateLimit = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Limit must be between 1 and 100');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ VALIDATION ERRORS:', {
      body: req.body,
      errors: errors.array()
    });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      }
    });
  }
  next();
};

// Conjuntos de validaciones para diferentes endpoints
const userValidations = {
  register: [validateEmail, validatePassword, validateName, validatePhone],
  login: [validateEmail, body('password').notEmpty().withMessage('Password is required')],
  updateProfile: [validateName, validatePhone],
  forgotPassword: [validateEmail],
  validateResetToken: [body('token').notEmpty().withMessage('Token is required')],
  resetPassword: [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ]
};

const petValidations = {
  create: [validatePetName, validateSpecies, validateBreed, validateAge, validateWeight, validateGender],
  update: [validatePetName, validateSpecies, validateBreed, validateAge, validateWeight, validateGender]
};

const appointmentValidations = {
  create: [
    validateDate, 
    validateReason, 
    body('petId').notEmpty().withMessage('Pet ID is required'),
    body('veterinarianId').optional().isString().withMessage('Veterinarian ID must be a string'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  update: [validateDate, validateReason],
  updateStatus: [validateAppointmentStatus]
};

const diagnosisValidations = {
  create: [validateDescription, validatePrescription, body('petId').notEmpty().withMessage('Pet ID is required')],
  update: [validateDescription, validatePrescription]
};

const productValidations = {
  create: [validateProductName, body('description').optional().trim(), validatePrice, validateStock],
  update: [validateProductName, body('description').optional().trim(), validatePrice, validateStock]
};

const orderValidations = {
  create: [body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty')],
  updateStatus: [validateOrderStatus]
};

module.exports = {
  // Validadores individuales
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateId,
  validatePage,
  validateLimit,
  
  // Conjuntos de validaciones
  userValidations,
  petValidations,
  appointmentValidations,
  diagnosisValidations,
  productValidations,
  orderValidations,
  
  // Middleware
  handleValidationErrors
};