import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const UpdateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export type CreateApiKeyDto = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKeyDto = z.infer<typeof UpdateApiKeySchema>;
