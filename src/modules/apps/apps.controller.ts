import { type Request, type Response } from 'express';

import { CreateAppSchema, UpdateAppSchema } from './apps.dto';
import { appsService } from './apps.service';

import { AppError } from '@/common/errors/AppError';
import { type AuthRequest } from '@/middlewares/auth.middleware';

async function create(req: Request, res: Response): Promise<void> {
  const parsed = CreateAppSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;

  const app = await appsService.createApp(user.sub, parsed.data);

  res.status(201).json(app);
}

async function getAll(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;

  const apps = await appsService.getApps(user.sub);

  res.json(apps);
}

async function getOne(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;

  const app = await appsService.getAppForUser(user.sub, req.params.id);

  res.json(app);
}

async function update(req: Request, res: Response): Promise<void> {
  const parsed = UpdateAppSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;

  const app = await appsService.updateApp(user.sub, req.params.id, parsed.data);

  res.json(app);
}

async function remove(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;

  await appsService.deleteApp(user.sub, req.params.id);

  res.status(204).send();
}

export const appsController = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
