import multer, { memoryStorage, MulterError } from 'multer';
import { uploadImage } from '../services/cloudinaryService';
const logger = require('pino')();

// Configure multer for memory storage
const storage = memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10 // Maximum 10 files
  }
});

// Middleware for single image upload
const uploadSingle = upload.single('image');

// Middleware for multiple images upload
const uploadMultiple = upload.array('images', 10);

// Custom error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    logger.error('Multer error:', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the 10MB limit'
        }
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded. Maximum is 10.'
        }
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field'
        }
      });
    }
  }
  
  if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }
  
  next();
};

// Middleware to upload image to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FILE',
          message: 'No image file provided'
        }
      });
    }
    
    const result = await uploadImage(req.file.buffer);
    req.cloudinaryResult = result;
    next();
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    return res.status(500).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload image to cloud storage'
      }
    });
  }
};

// Middleware to upload multiple images to Cloudinary
const uploadMultipleToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FILES',
          message: 'No image files provided'
        }
      });
    }
    
    const uploadPromises = req.files.map(file => 
      uploadImage(file.buffer)
    );
    
    const results = await Promise.all(uploadPromises);
    req.cloudinaryResults = results;
    next();
  } catch (error) {
    logger.error('Cloudinary batch upload error:', error);
    return res.status(500).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload images to cloud storage'
      }
    });
  }
};

export default {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  uploadToCloudinary,
  uploadMultipleToCloudinary
};