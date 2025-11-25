import { z } from 'zod';

const treatmentSchema = z.object({
  diseaseId: z.string().min(1, 'Disease ID is required').optional(),
  disease: z.string().min(1, 'Disease name is required').optional(),
  method: z.enum(['organic', 'chemical', 'cultural', 'integrated'], {
    errorMap: () => ({ message: 'Method must be one of: organic, chemical, cultural, integrated' })
  }),
  steps: z.array(z.string().min(1, 'Step cannot be empty')).min(1, 'At least one step is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  approved: z.boolean().optional()
});

const updateTreatmentSchema = z.object({
  method: z.enum(['organic', 'chemical', 'cultural', 'integrated'], {
    errorMap: () => ({ message: 'Method must be one of: organic, chemical, cultural, integrated' })
  }).optional(),
  steps: z.array(z.string().min(1, 'Step cannot be empty')).min(1, 'At least one step is required').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  approved: z.boolean().optional()
});

export { treatmentSchema, updateTreatmentSchema };

export default {
  treatmentSchema,
  updateTreatmentSchema
};