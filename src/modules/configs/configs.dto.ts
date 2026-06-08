import { z } from 'zod';

const configValueSchema = z.string().trim().min(1);

export const CreateConfigSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[A-Za-z0-9_.-]+$/, 'Key must be alphanumeric with . _ -'),
    value: configValueSchema,
    isSecret: z.boolean().optional().default(false),
    asJson: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.asJson) {
      return;
    }

    try {
      JSON.parse(data.value);
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'value must be valid JSON when asJson is true',
        path: ['value'],
      });
    }
  });

export const UpdateConfigSchema = z
  .object({
    value: configValueSchema,
    asJson: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.asJson) {
      return;
    }

    try {
      JSON.parse(data.value);
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'value must be valid JSON when asJson is true',
        path: ['value'],
      });
    }
  });

export const RollbackConfigSchema = z.object({
  version: z.coerce.number().int().positive(),
});

export type CreateConfigDto = z.infer<typeof CreateConfigSchema>;
export type UpdateConfigDto = z.infer<typeof UpdateConfigSchema>;
export type RollbackConfigDto = z.infer<typeof RollbackConfigSchema>;
