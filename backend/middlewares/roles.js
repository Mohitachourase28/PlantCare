import Admin from '../models/Admin.js';
import pino from 'pino';
const logger = pino();

const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is admin in the User model
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    // Check if user is in the Admin collection
    const admin = await Admin.findOne({ userId: req.user._id });
    if (!admin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
    }
    
    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Role verification error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error verifying user role'
      }
    });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.is_super_admin) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required'
      }
    });
  }
  next();
};

export { requireAdmin, requireSuperAdmin };