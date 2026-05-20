import { Router, type Request, type Response, type NextFunction } from 'express';

import { authController } from './auth.controller';

import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.post('/register', asyncRoute(authController.register));

router.post('/login', asyncRoute(authController.login));

router.post('/refresh', asyncRoute(authController.refresh));

router.post('/logout', asyncRoute(authController.logout));

router.get('/me', authMiddleware, asyncRoute(authController.me));

export { router as authRouter };
