import { Router, type Request, type Response, type NextFunction } from 'express';

import { appsController } from './apps.controller';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { apiKeysRouter } from '@/modules/apikeys';
import { configsRouter } from '@/modules/configs';

const router = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.use('/:appId/api-keys', apiKeysRouter);

router.use('/:appId/configs', configsRouter);

router.post('/', asyncRoute(appsController.create));

router.get('/', asyncRoute(appsController.getAll));

router.get('/:id', asyncRoute(appsController.getOne));

router.patch('/:id', asyncRoute(appsController.update));

router.delete('/:id', asyncRoute(appsController.remove));

export { router as appsRouter };
