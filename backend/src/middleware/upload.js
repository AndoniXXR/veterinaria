const multer = require('multer');
const path = require('path');
const { uploadImage, uploadMultipleImages: uploadToCloudinary } = require('../config/cloudinary');

// Configuración de multer para almacenamiento permanente local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('🗂️  Multer destination called');
    console.log('req.route?.path:', req.route?.path);
    console.log('req.originalUrl:', req.originalUrl);
    
    // Determinar carpeta basada en el contexto
    let folder = path.join(__dirname, '../../uploads/temp/');
    
    if (req.route?.path?.includes('products') || req.originalUrl?.includes('products')) {
      folder = path.join(__dirname, '../../uploads/products/');
      console.log('📁 Using products folder');
    } else if (req.route?.path?.includes('users') || req.route?.path?.includes('profile') || req.originalUrl?.includes('users') || req.originalUrl?.includes('veterinarians')) {
      folder = path.join(__dirname, '../../uploads/users/');
      console.log('📁 Using users folder');
    } else if (req.route?.path?.includes('pets') || req.originalUrl?.includes('pets')) {
      folder = path.join(__dirname, '../../uploads/pets/');
      console.log('📁 Using pets folder');
    } else if (req.route?.path?.includes('diagnosis') || req.originalUrl?.includes('diagnosis')) {
      folder = path.join(__dirname, '../../uploads/diagnosis/');
      console.log('📁 Using diagnosis folder');
    } else {
      console.log('📁 Using temp folder (default)');
    }
    
    console.log('📂 Final folder path:', folder);
    
    // Crear directorio si no existe
    const fs = require('fs');
    if (!fs.existsSync(folder)) {
      console.log('📁 Creating folder:', folder);
      fs.mkdirSync(folder, { recursive: true });
    } else {
      console.log('📁 Folder already exists');
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    console.log('📝 Multer filename called');
    console.log('Original filename:', file.originalname);
    console.log('Field name:', file.fieldname);
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    
    console.log('📄 Generated filename:', finalFilename);
    cb(null, finalFilename);
  }
});

// Filtro de archivos para imágenes
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Filtro de archivos para documentos
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Configuraciones de multer
const uploadConfig = {
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 5 // Maximum 5 files
  }
};

// Middlewares de upload
const uploadSingleImage = multer({
  ...uploadConfig,
  fileFilter: imageFilter
}).single('image');

const uploadProfilePhoto = multer({
  ...uploadConfig,
  fileFilter: imageFilter
}).single('photo');

const uploadPetPhoto = multer({
  ...uploadConfig,
  fileFilter: imageFilter
}).single('photo');

const uploadProductImage = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: imageFilter
}).single('image');

const uploadDiagnosisFiles = multer({
  ...uploadConfig,
  fileFilter: documentFilter
}).array('files', 5);

const uploadMultipleImages = multer({
  ...uploadConfig,
  fileFilter: imageFilter
}).array('images', 10);

// Middleware para procesar subida local
const processImageUpload = (folder = 'general') => {
  return (req, res, next) => {
    console.log('ProcessImageUpload middleware called for folder:', folder);
    console.log('req.file:', !!req.file);
    console.log('req.body:', req.body);
    
    if (!req.file) {
      console.log('No file uploaded, continuing without image');
      return next();
    }

    try {
      console.log('Processing uploaded file:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });

      // Verificar que el archivo existe físicamente
      const fs = require('fs');
      if (!fs.existsSync(req.file.path)) {
        console.error('❌ File does not exist at path:', req.file.path);
        throw new Error('File was not saved properly');
      }
      console.log('✅ File exists at path:', req.file.path);

      // Generar URL local
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
      
      // Extraer la parte relativa del path después de 'uploads'
      const pathParts = req.file.path.split(path.sep);
      const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
      const relativePath = pathParts.slice(uploadsIndex).join('/');
      
      const imageUrl = `${baseUrl}/${relativePath}`;

      req.uploadedImage = {
        secure_url: imageUrl,
        public_id: req.file.filename,
        width: null,
        height: null,
        format: path.extname(req.file.originalname).substring(1),
        bytes: req.file.size
      };

      console.log('✅ Image processed successfully. URL:', imageUrl);
      console.log('✅ File should be accessible at:', req.file.path);
      
      // Verificar una vez más que el archivo existe antes de continuar
      if (!fs.existsSync(req.file.path)) {
        console.error('❌ File was deleted or moved after processing:', req.file.path);
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Error processing image upload:', error);
      
      // Limpiar archivo en caso de error
      if (req.file && req.file.path) {
        const fs = require('fs');
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error uploading image'
        }
      });
    }
  };
};

const processMultipleImageUpload = (folder = 'general') => {
  return async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      const results = await uploadToCloudinary(req.files, folder);
      req.uploadedImages = results;
      
      // Limpiar archivos temporales
      const fs = require('fs');
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      next();
    } catch (error) {
      console.error('Error processing multiple image upload:', error);
      
      // Limpiar archivos temporales en caso de error
      if (req.files) {
        const fs = require('fs');
        req.files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error uploading images'
        }
      });
    }
  };
};

// Middleware para procesar múltiples archivos de documentos (incluyendo PDFs)
const processMultipleDocumentUpload = (folder = 'diagnosis') => {
  return async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      // Crear URLs locales para todos los archivos
      const fileUrls = req.files.map(file => {
        const relativePath = path.relative(path.join(__dirname, '../../'), file.path);
        const normalizedPath = relativePath.replace(/\\/g, '/');
        return `${req.protocol}://${req.get('host')}/uploads/${normalizedPath.split('/uploads/')[1]}`;
      });

      // Crear objetos que incluyen información del documento
      req.uploadedFiles = req.files.map((file, index) => ({
        secure_url: fileUrls[index],
        public_id: file.filename,
        original_filename: file.originalname,
        format: path.extname(file.originalname).substring(1),
        resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
        bytes: file.size,
        mimetype: file.mimetype
      }));

      console.log('📄 Created uploadedFiles array with', req.uploadedFiles.length, 'items');
      
      next();
    } catch (error) {
      console.error('Error processing multiple document upload:', error);
      
      // Limpiar archivos temporales en caso de error
      if (req.files) {
        const fs = require('fs');
        req.files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error uploading documents'
        }
      });
    }
  };
};

// Middleware para manejar errores de multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'Upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 25MB';
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
        code: 'UPLOAD_ERROR',
        message
      }
    });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only image files are allowed'
      }
    });
  }

  if (error.message === 'File type not allowed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'File type not allowed. Only images, PDFs, and Word documents are accepted'
      }
    });
  }

  next(error);
};

module.exports = {
  uploadSingleImage,
  uploadProfilePhoto,
  uploadPetPhoto,
  uploadProductImage,
  uploadDiagnosisFiles,
  uploadMultipleImages,
  processImageUpload,
  processMultipleImageUpload,
  processMultipleDocumentUpload,
  handleUploadError
};