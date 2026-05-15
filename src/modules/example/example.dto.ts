import { z } from 'zod';

export const createExampleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).nullish(),
});

export const updateExampleSchema = createExampleSchema.partial();

export type CreateExampleDto = z.infer<typeof createExampleSchema>;
export type UpdateExampleDto = z.infer<typeof updateExampleSchema>;
