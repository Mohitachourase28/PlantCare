import { z } from 'zod';

const feedbackSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  is_correct: z.boolean(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export default {
  feedbackSchema
};