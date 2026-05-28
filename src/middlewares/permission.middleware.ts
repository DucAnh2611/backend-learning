import { type Request, type Response, type NextFunction } from 'express';

import { AppDataSource } from '@/db/data-source';

import { AppError } from '@/common/errors/AppError';

import { AppMember, RolePermission } from '@/modules/rbac';

import { type AuthRequest } from './auth.middleware';

const memberRepo = () => AppDataSource.getRepository(AppMember);

const rolePermissionRepo = () => AppDataSource.getRepository(RolePermission);

export function requirePermission(permissionName: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    const appId = req.params.appId;

    if (!appId) {
      throw new AppError('App id missing', 400);
    }

    const membership = await memberRepo().findOne({
      where: {
        appId,
        userId: user.sub,
      },
      relations: {
        role: true,
      },
    });

    if (!membership) {
      throw new AppError('Forbidden', 403);
    }

    if (membership.role.name === 'OWNER') {
      return next();
    }

    const rolePermission = await rolePermissionRepo().findOne({
      where: {
        roleId: membership.roleId,
        permissionName,
      },
    });

    if (!rolePermission) {
      throw new AppError('Forbidden', 403);
    }

    next();
  };
}
