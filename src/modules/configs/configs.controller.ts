import { type Request, type Response } from 'express';

import { AppError } from '@/common/errors/AppError';
import { type AuthRequest } from '@/middlewares/auth.middleware';

import { CreateConfigSchema, RollbackConfigSchema, UpdateConfigSchema } from './configs.dto';
import { configsService } from './configs.service';

async function create(req: Request, res: Response): Promise<void> {
  const parsed = CreateConfigSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;
  const config = await configsService.createConfig(req.params.appId, user.sub, parsed.data);

  res.status(201).json(config);
}

async function list(req: Request, res: Response): Promise<void> {
  const configs = await configsService.listConfigs(req.params.appId);

  res.json(configs);
}

async function getOne(req: Request, res: Response): Promise<void> {
  const config = await configsService.getConfig(req.params.appId, req.params.configId, true);

  res.json(config);
}

async function update(req: Request, res: Response): Promise<void> {
  const parsed = UpdateConfigSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;
  const config = await configsService.updateConfig(
    req.params.appId,
    user.sub,
    req.params.configId,
    parsed.data,
  );

  res.json(config);
}

async function remove(req: Request, res: Response): Promise<void> {
  await configsService.deleteConfig(req.params.appId, req.params.configId);

  res.status(204).send();
}

async function listVersions(req: Request, res: Response): Promise<void> {
  const versions = await configsService.listVersions(req.params.appId, req.params.configId);

  res.json(versions);
}

async function rollback(req: Request, res: Response): Promise<void> {
  const parsed = RollbackConfigSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }

  const user = (req as AuthRequest).user;
  const config = await configsService.rollbackConfig(
    req.params.appId,
    user.sub,
    req.params.configId,
    parsed.data,
  );

  res.json(config);
}

export const configsController = {
  create,
  list,
  getOne,
  update,
  remove,
  listVersions,
  rollback,
};
