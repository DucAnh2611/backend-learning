import { type Request, type Response } from 'express';

import { AddMemberSchema, UpdateMemberRoleSchema } from './rbac.dto';

import { AppError } from '@/common/errors/AppError';

import { rbacService } from './rbac.service';

async function addMember(req: Request, res: Response): Promise<void> {
  const parsed = AddMemberSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const member = await rbacService.addMember(req.params.appId, parsed.data);

  res.status(201).json(member);
}

async function getMembers(req: Request, res: Response): Promise<void> {
  const members = await rbacService.getMembers(req.params.appId);

  res.json(members);
}

async function updateMemberRole(req: Request, res: Response): Promise<void> {
  const parsed = UpdateMemberRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const member = await rbacService.updateMemberRole(req.params.memberId, parsed.data);

  res.json(member);
}

async function removeMember(req: Request, res: Response): Promise<void> {
  await rbacService.removeMember(req.params.memberId);

  res.json({
    message: 'Member removed',
  });
}

async function getPermissions(_req: Request, res: Response): Promise<void> {
  const permissions = await rbacService.getPermissions();

  res.json(permissions);
}

async function getRoles(req: Request, res: Response): Promise<void> {
  const roles = await rbacService.getRoles(req.params.appId);

  res.json(roles);
}

export const rbacController = {
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,

  getPermissions,
  getRoles,
};
