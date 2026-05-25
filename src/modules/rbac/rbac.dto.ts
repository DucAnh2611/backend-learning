import { z } from 'zod';

export const AddMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const UpdateMemberRoleSchema = z.object({
  roleId: z.string().uuid(),
});

export type AddMemberDto = z.infer<typeof AddMemberSchema>;

export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;
