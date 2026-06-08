import { z } from 'zod';

export const CreateAppSchema = z.object({
  name: z.string().trim().min(3).max(100),
});

export const UpdateAppSchema = CreateAppSchema.partial();

export type CreateAppDto = z.infer<typeof CreateAppSchema>;
export type UpdateAppDto = z.infer<typeof UpdateAppSchema>;
