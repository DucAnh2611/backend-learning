import { Router, type Request, type Response, type NextFunction } from 'express';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { requirePermission } from '@/middlewares/permission.middleware';

import { configsController } from './configs.controller';

const router = Router({ mergeParams: true });

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.get('/', requirePermission('config.read'), asyncRoute(configsController.list));

router.post('/', requirePermission('config.write'), asyncRoute(configsController.create));

router.get(
  '/:configId/versions',
  requirePermission('config.read'),
  asyncRoute(configsController.listVersions),
);

router.post(
  '/:configId/rollback',
  requirePermission('config.write'),
  asyncRoute(configsController.rollback),
);

router.get('/:configId', requirePermission('config.read'), asyncRoute(configsController.getOne));

router.patch('/:configId', requirePermission('config.write'), asyncRoute(configsController.update));

router.delete(
  '/:configId',
  requirePermission('config.write'),
  asyncRoute(configsController.remove),
);

export { router as configsRouter };
