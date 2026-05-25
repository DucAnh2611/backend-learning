import { type Request, type Response, type NextFunction } from 'express';

import { AppError } from '@/common/errors/AppError';

import { verifyAccessToken } from '@/common/utils/jwt.util';

export interface AuthRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Unauthorized', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Unauthorized', 401);
  }

  const payload = verifyAccessToken(token);

  (req as AuthRequest).user = payload;

  next();
}
