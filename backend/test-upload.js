const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Configuración de multer similar a la del proyecto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, 'uploads/products/');
    console.log('📁 Destination folder:', folder);
    
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log('✅ Folder created');
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter - mimetype:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('image');

app.use(express.json());

app.post('/test-upload', (req, res) => {
  console.log('🚀 Test upload endpoint called');
  console.log('Content-Type:', req.headers['content-type']);
  
  upload(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    
    console.log('📦 Upload completed');
    console.log('req.file:', req.file);
    
    if (req.file) {
      console.log('✅ File saved at:', req.file.path);
      console.log('📊 File exists?', fs.existsSync(req.file.path));
    }
    
    res.json({ 
      success: true, 
      file: req.file,
      message: 'Upload test completed'
    });
  });
});

app.listen(3333, () => {
  console.log('🧪 Test server running on port 3333');
  console.log('Test with: curl -F "image=@path/to/image.jpg" http://localhost:3333/test-upload');
});