import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

const idSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export { paginationSchema, idSchema, dateRangeSchema };

export default {
  paginationSchema,
  idSchema,
  dateRangeSchema
};