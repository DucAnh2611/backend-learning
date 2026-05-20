import { type Request, type Response } from 'express';

import { RegisterSchema, LoginSchema } from './auth.dto';

import { AppError } from '@/common/errors/AppError';

import { authService } from './auth.service';

import { type AuthRequest } from '@/middlewares/auth.middleware';

const COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function register(req: Request, res: Response): Promise<void> {
  const parsed = RegisterSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const result = await authService.register(parsed.data);

  res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    message: 'Register successful',
    user: result.user,
    accessToken: result.accessToken,
  });
}

async function login(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const result = await authService.login(parsed.data);

  res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

  res.json({
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
  });
}

async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies[COOKIE_NAME];

  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  const result = await authService.refresh(refreshToken);

  res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

  res.json({
    accessToken: result.accessToken,
  });
}

async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies[COOKIE_NAME];

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie(COOKIE_NAME);

  res.json({
    message: 'Logout successful',
  });
}

async function me(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;

  const result = await authService.me(user.sub);

  res.json(result);
}

export const authController = {
  register,
  login,
  refresh,
  logout,
  me,
};
