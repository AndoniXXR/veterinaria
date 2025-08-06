const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * MIDDLEWARE DE UPLOAD SEGURO
 * Previene ataques de Path Traversal y otras vulnerabilidades de upload
 */

// Extensiones permitidas por tipo
const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx'],
  all: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
};

// MIME types permitidos (verificación real del contenido)
const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Función para sanitizar nombres de archivo
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }

  // Remover caracteres peligrosos y secuencias de path traversal
  let sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Solo alfanuméricos, punto, guión y underscore
    .replace(/\.{2,}/g, '_')          // Eliminar múltiples puntos (..)
    .replace(/^\.+|\.+$/g, '')       // Eliminar puntos al inicio y final
    .substring(0, 100);              // Limitar longitud

  // Asegurar que no esté vacío después de sanitización
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'unnamed_file';
  }

  return sanitized;
};

// Función para generar nombre único y seguro
const generateSecureFilename = (originalName) => {
  const sanitizedName = sanitizeFilename(originalName);
  const ext = path.extname(sanitizedName).toLowerCase();
  const nameWithoutExt = path.basename(sanitizedName, ext);
  
  // Generar ID único usando crypto
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  
  return `${nameWithoutExt}_${timestamp}_${uniqueId}${ext}`;
};

// Función para validar extensión
const validateFileExtension = (filename, allowedType = 'all') => {
  const ext = path.extname(filename).toLowerCase();
  const allowedExtensions = ALLOWED_EXTENSIONS[allowedType] || ALLOWED_EXTENSIONS.all;
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File extension ${ext} not allowed. Allowed: ${allowedExtensions.join(', ')}`);
  }
  
  return true;
};

// Función para validar MIME type
const validateMimeType = (mimetype, allowedType = 'all') => {
  const allowedMimes = ALLOWED_MIME_TYPES[allowedType] || ALLOWED_MIME_TYPES.all;
  
  if (!allowedMimes.includes(mimetype)) {
    throw new Error(`MIME type ${mimetype} not allowed. Allowed: ${allowedMimes.join(', ')}`);
  }
  
  return true;
};

// Función para validar y crear directorio seguro
const createSecureUploadDir = (baseDir, subDir = '') => {
  // Resolver paths absolutos para evitar path traversal
  const uploadsRoot = path.resolve(__dirname, '../../uploads');
  let targetDir;
  
  if (subDir) {
    // Sanitizar subdirectorio
    const sanitizedSubDir = subDir.replace(/[^a-zA-Z0-9_-]/g, '_');
    targetDir = path.resolve(uploadsRoot, sanitizedSubDir);
  } else {
    targetDir = uploadsRoot;
  }
  
  // CRÍTICO: Verificar que el directorio final está dentro de uploads
  if (!targetDir.startsWith(uploadsRoot)) {
    throw new Error('Invalid upload directory - path traversal detected');
  }
  
  // Crear directorio si no existe con permisos seguros
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { 
      recursive: true, 
      mode: 0o755  // rwxr-xr-x - solo owner puede escribir
    });
  }
  
  return targetDir;
};

// Storage seguro para Multer
const createSecureStorage = (subDir = 'temp') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        console.log('🛡️ Secure upload: Creating destination for:', subDir);
        
        const secureDir = createSecureUploadDir(null, subDir);
        console.log('✅ Secure directory created:', secureDir);
        
        cb(null, secureDir);
      } catch (error) {
        console.error('❌ Secure upload destination error:', error.message);
        cb(error);
      }
    },
    
    filename: (req, file, cb) => {
      try {
        console.log('🛡️ Secure upload: Processing filename for:', file.originalname);
        
        // Validar extensión y MIME type
        validateFileExtension(file.originalname);
        validateMimeType(file.mimetype);
        
        // Generar nombre seguro
        const secureFilename = generateSecureFilename(file.originalname);
        console.log('✅ Secure filename generated:', secureFilename);
        
        // Almacenar información original para logging
        req.originalFilename = file.originalname;
        req.secureFilename = secureFilename;
        
        cb(null, secureFilename);
      } catch (error) {
        console.error('❌ Secure upload filename error:', error.message);
        cb(error);
      }
    }
  });
};

// Filtro de archivos con validación doble
const createSecureFileFilter = (allowedType = 'all') => {
  return (req, file, cb) => {
    try {
      console.log('🛡️ Secure filter: Validating file:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      
      // Validar extensión
      validateFileExtension(file.originalname, allowedType);
      
      // Validar MIME type
      validateMimeType(file.mimetype, allowedType);
      
      console.log('✅ File validation passed');
      cb(null, true);
      
    } catch (error) {
      console.error('❌ File validation failed:', error.message);
      cb(new Error(`File validation failed: ${error.message}`), false);
    }
  };
};

// Configuraciones de upload seguro
const secureUploadConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB (reducido de 25MB)
    files: 5,                     // Máximo 5 archivos
    fieldSize: 1024,             // Límite de campos de form
    fieldNameSize: 100,          // Límite de nombre de campos
    fields: 10                   // Máximo 10 campos
  }
};

// Middleware de upload seguro para imágenes
const secureImageUpload = (subDir = 'images') => {
  return multer({
    storage: createSecureStorage(subDir),
    fileFilter: createSecureFileFilter('images'),
    ...secureUploadConfig
  }).single('image');
};

// Middleware de upload seguro para documentos
const secureDocumentUpload = (subDir = 'documents') => {
  return multer({
    storage: createSecureStorage(subDir),
    fileFilter: createSecureFileFilter('documents'),
    ...secureUploadConfig
  }).single('document');
};

// Middleware de upload seguro para múltiples archivos
const secureMultipleUpload = (fieldName = 'files', maxCount = 5, subDir = 'mixed') => {
  return multer({
    storage: createSecureStorage(subDir),
    fileFilter: createSecureFileFilter('all'),
    ...secureUploadConfig
  }).array(fieldName, maxCount);
};

// Middleware de post-procesamiento seguro
const processSecureUpload = (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }
    
    const files = req.files || [req.file];
    const processedFiles = [];
    
    for (const file of files) {
      // Verificar que el archivo fue guardado en ubicación segura
      const uploadsRoot = path.resolve(__dirname, '../../uploads');
      const resolvedPath = path.resolve(file.path);
      
      if (!resolvedPath.startsWith(uploadsRoot)) {
        throw new Error('File saved in insecure location - removing');
      }
      
      // Verificar que el archivo existe físicamente
      if (!fs.existsSync(resolvedPath)) {
        throw new Error('File was not saved properly');
      }
      
      // Generar URL segura
      const relativePath = path.relative(uploadsRoot, resolvedPath);
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      const secureUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
      
      processedFiles.push({
        secure_url: secureUrl,
        public_id: file.filename,
        original_filename: req.originalFilename || file.originalname,
        format: path.extname(file.originalname).substring(1),
        bytes: file.size,
        mimetype: file.mimetype,
        path: resolvedPath
      });
      
      // Log de seguridad
      console.log('🛡️ File processed securely:', {
        original: req.originalFilename || file.originalname,
        secure: file.filename,
        path: resolvedPath,
        size: file.size
      });
    }
    
    // Asignar archivos procesados
    if (req.file) {
      req.uploadedFile = processedFiles[0];
    } else {
      req.uploadedFiles = processedFiles;
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Secure upload processing error:', error.message);
    
    // Limpiar archivos en caso de error
    const files = req.files || (req.file ? [req.file] : []);
    files.forEach(file => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          console.log('🗑️ Cleaned up insecure file:', file.path);
        } catch (cleanupError) {
          console.error('❌ Error cleaning up file:', cleanupError.message);
        }
      }
    });
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'SECURE_UPLOAD_ERROR',
        message: 'File upload security validation failed'
      }
    });
  }
};

// Middleware para manejar errores de upload seguro
const handleSecureUploadError = (error, req, res, next) => {
  console.error('🚨 Secure upload error:', error.message);
  
  // Limpiar archivos temporales en caso de error
  const files = req.files || (req.file ? [req.file] : []);
  files.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError.message);
      }
    }
  });
  
  if (error instanceof multer.MulterError) {
    let message = 'Secure upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 10MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 5 files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name';
        break;
      default:
        message = error.message;
    }
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'SECURE_UPLOAD_ERROR',
        message
      }
    });
  }
  
  return res.status(400).json({
    success: false,
    error: {
      code: 'SECURE_UPLOAD_ERROR',
      message: error.message || 'File upload security validation failed'
    }
  });
};

module.exports = {
  secureImageUpload,
  secureDocumentUpload,
  secureMultipleUpload,
  processSecureUpload,
  handleSecureUploadError,
  sanitizeFilename,
  generateSecureFilename,
  validateFileExtension,
  validateMimeType,
  createSecureUploadDir
};