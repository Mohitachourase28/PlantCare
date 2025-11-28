import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roles.js';
import { validate } from '../middlewares/validation.js';
import { paginationSchema, idSchema } from '../validators/commonValidator.js';
import { treatmentSchema } from '../validators/treatmentValidator.js';
import { getAllReports, upsertTreatment, deleteTreatment } from '../controllers/adminController.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply admin role check to all routes
router.use(requireAdmin);

// Get all reports with filters
router.get('/reports', 
  validate(paginationSchema, 'query'), 
  getAllReports
);

// Upsert treatment
router.post('/treatments', 
  validate(treatmentSchema), 
  upsertTreatment
);

// Update treatment
router.put('/treatments/:id', 
  validate(idSchema, 'params'), 
  validate(treatmentSchema.partial()), 
  upsertTreatment
);

// Delete treatment
router.delete('/treatments/:id', 
  validate(idSchema, 'params'), 
  deleteTreatment
);

export default router;