import { Router, type Request, type Response, type NextFunction } from 'express';

import { rbacController } from './rbac.controller';

import { authMiddleware } from '@/middlewares/auth.middleware';

import { requirePermission } from '@/middlewares/permission.middleware';

const router = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.get('/permissions', asyncRoute(rbacController.getPermissions));

router.get('/apps/:appId/roles', asyncRoute(rbacController.getRoles));

router.post(
  '/apps/:appId/members',
  requirePermission('member.invite'),
  asyncRoute(rbacController.addMember),
);

router.get('/apps/:appId/members', asyncRoute(rbacController.getMembers));

router.patch(
  '/apps/:appId/members/:memberId',
  requirePermission('member.invite'),
  asyncRoute(rbacController.updateMemberRole),
);

router.delete(
  '/apps/:appId/members/:memberId',
  requirePermission('member.remove'),
  asyncRoute(rbacController.removeMember),
);

export { router as rbacRouter };
