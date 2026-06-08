import { Router, type Request, type Response, type NextFunction } from 'express';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { requirePermission } from '@/middlewares/permission.middleware';

import { apiKeysController } from './apikeys.controller';

const router = Router({ mergeParams: true });

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.get('/', asyncRoute(apiKeysController.list));

router.post('/', requirePermission('apikey.rotate'), asyncRoute(apiKeysController.create));

router.patch('/:keyId', requirePermission('apikey.rotate'), asyncRoute(apiKeysController.update));

router.post(
  '/:keyId/rotate',
  requirePermission('apikey.rotate'),
  asyncRoute(apiKeysController.rotate),
);

router.post(
  '/:keyId/revoke',
  requirePermission('apikey.rotate'),
  asyncRoute(apiKeysController.revoke),
);

export { router as apiKeysRouter };
