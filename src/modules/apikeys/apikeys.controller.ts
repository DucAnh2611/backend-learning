import { type Request, type Response } from 'express';

import { AppError } from '@/common/errors/AppError';
import { type AuthRequest } from '@/middlewares/auth.middleware';

import { CreateApiKeySchema, UpdateApiKeySchema } from './apikeys.dto';
import { apiKeysService } from './apikeys.service';

async function create(req: Request, res: Response): Promise<void> {
  const parsed = CreateApiKeySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;
  const result = await apiKeysService.createKey(user.sub, req.params.appId, parsed.data);

  res.status(201).json(result);
}

async function list(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;
  const keys = await apiKeysService.listKeys(user.sub, req.params.appId);

  res.json(keys);
}

async function update(req: Request, res: Response): Promise<void> {
  const parsed = UpdateApiKeySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;
  const key = await apiKeysService.updateKey(
    user.sub,
    req.params.appId,
    req.params.keyId,
    parsed.data,
  );

  res.json(key);
}

async function rotate(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;
  const result = await apiKeysService.rotateKey(user.sub, req.params.appId, req.params.keyId);

  res.json(result);
}

async function revoke(req: Request, res: Response): Promise<void> {
  const user = (req as AuthRequest).user;
  const key = await apiKeysService.revokeKey(user.sub, req.params.appId, req.params.keyId);

  res.json(key);
}

export const apiKeysController = {
  create,
  list,
  update,
  rotate,
  revoke,
};
