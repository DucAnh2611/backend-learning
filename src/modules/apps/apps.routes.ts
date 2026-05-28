import { Router, type Request, type Response, type NextFunction } from 'express';

import { appsController } from './apps.controller';

import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.post('/', asyncRoute(appsController.create));

router.get('/', asyncRoute(appsController.getAll));

router.get('/:id', asyncRoute(appsController.getOne));

export { router as appsRouter };
