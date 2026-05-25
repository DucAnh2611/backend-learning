import { z } from 'zod';

export const CreateAppSchema = z.object({
  name: z.string().trim().min(3).max(100),
});

export type CreateAppDto = z.infer<typeof CreateAppSchema>;
