import pino from 'pino';

const logger = pino();

const errorHandler = (err, req, res, next) => {
  logger.error(err);
  
  // Default error
  let error = {
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
    status: 500
  };
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(err.errors).map(val => ({
        field: val.path,
        message: val.message
      })),
      status: 400
    };
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      code: 'DUPLICATE_ERROR',
      message: `${field} already exists`,
      status: 409
    };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid token',
      status: 401
    };
  }
  
  if (err.name === 'TokenExpiredError') {
    error = {
      code: 'TOKEN_EXPIRED',
      message: 'Token expired',
      status: 401
    };
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      code: 'FILE_TOO_LARGE',
      message: 'File size exceeds the limit',
      status: 413
    };
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      code: 'TOO_MANY_FILES',
      message: 'Too many files uploaded',
      status: 413
    };
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      code: 'UNEXPECTED_FILE',
      message: 'Unexpected file field',
      status: 400
    };
  }
  
  // Custom errors
  if (err.isOperational) {
    error = {
      code: err.code || 'CUSTOM_ERROR',
      message: err.message,
      status: err.status || 400
    };
    
    if (err.details) {
      error.details = err.details;
    }
  }
  
  res.status(error.status).json({ error });
};

export default errorHandler;