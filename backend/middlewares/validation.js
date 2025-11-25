import { ZodError } from 'zod';
import pino from 'pino';

const logger = pino();

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error('Validation error:', error);
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  };
};

export { validate };