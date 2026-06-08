import crypto from 'crypto';

import { AppDataSource } from '@/db/data-source';
import { AppError } from '@/common/errors/AppError';
import { hashToken } from '@/common/utils/crypto.util';
import { AppMember } from '@/modules/rbac';
import { App } from '@/modules/apps';

import { ApiKey } from './apikeys.entity';

import type { CreateApiKeyDto, UpdateApiKeyDto } from './apikeys.dto';

const apiKeyRepo = () => AppDataSource.getRepository(ApiKey);
const memberRepo = () => AppDataSource.getRepository(AppMember);
const appRepo = () => AppDataSource.getRepository(App);

async function assertAppMember(userId: string, appId: string) {
  const app = await appRepo().findOne({ where: { id: appId } });

  if (!app) {
    throw new AppError('App not found', 404);
  }

  const membership = await memberRepo().findOne({
    where: { appId, userId },
  });

  if (!membership) {
    throw new AppError('Forbidden', 403);
  }

  return app;
}

function generateSecret(): { secret: string; keyPrefix: string; keyHash: string } {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const prefixPart = crypto.randomBytes(6).toString('hex');
  const keyPrefix = `sv_${prefixPart}`;
  const secret = `${keyPrefix}_${randomPart}`;
  const keyHash = hashToken(secret);

  return { secret, keyPrefix, keyHash };
}

function toPublicKey(key: ApiKey) {
  const now = new Date();
  const isExpired = key.expiresAt !== null && key.expiresAt < now;
  const isRevoked = key.revokedAt !== null;

  return {
    id: key.id,
    appId: key.appId,
    name: key.name,
    keyPrefix: key.keyPrefix,
    expiresAt: key.expiresAt,
    revokedAt: key.revokedAt,
    rotatedFromId: key.rotatedFromId,
    createdAt: key.createdAt,
    isActive: !isExpired && !isRevoked,
  };
}

async function createKey(userId: string, appId: string, dto: CreateApiKeyDto) {
  await assertAppMember(userId, appId);

  const { secret, keyPrefix, keyHash } = generateSecret();

  const apiKey = apiKeyRepo().create({
    appId,
    name: dto.name ?? null,
    keyPrefix,
    keyHash,
    expiresAt: dto.expiresAt ?? null,
    revokedAt: null,
    rotatedFromId: null,
  });

  await apiKeyRepo().save(apiKey);

  return {
    ...toPublicKey(apiKey),
    secret,
  };
}

async function listKeys(userId: string, appId: string) {
  await assertAppMember(userId, appId);

  const keys = await apiKeyRepo().find({
    where: { appId },
    order: { createdAt: 'DESC' },
  });

  return keys.map(toPublicKey);
}

async function getKeyForApp(appId: string, keyId: string) {
  const key = await apiKeyRepo().findOne({
    where: { id: keyId, appId },
  });

  if (!key) {
    throw new AppError('API key not found', 404);
  }

  return key;
}

async function updateKey(userId: string, appId: string, keyId: string, dto: UpdateApiKeyDto) {
  await assertAppMember(userId, appId);

  const key = await getKeyForApp(appId, keyId);

  if (dto.name !== undefined) {
    key.name = dto.name;
  }

  if (dto.expiresAt !== undefined) {
    key.expiresAt = dto.expiresAt;
  }

  await apiKeyRepo().save(key);

  return toPublicKey(key);
}

async function rotateKey(userId: string, appId: string, keyId: string) {
  await assertAppMember(userId, appId);

  const oldKey = await getKeyForApp(appId, keyId);

  if (oldKey.revokedAt) {
    throw new AppError('API key already revoked', 400);
  }

  oldKey.revokedAt = new Date();
  await apiKeyRepo().save(oldKey);

  const { secret, keyPrefix, keyHash } = generateSecret();

  const newKey = apiKeyRepo().create({
    appId,
    name: oldKey.name,
    keyPrefix,
    keyHash,
    expiresAt: oldKey.expiresAt,
    revokedAt: null,
    rotatedFromId: oldKey.id,
  });

  await apiKeyRepo().save(newKey);

  return {
    ...toPublicKey(newKey),
    secret,
  };
}

async function revokeKey(userId: string, appId: string, keyId: string) {
  await assertAppMember(userId, appId);

  const key = await getKeyForApp(appId, keyId);

  if (key.revokedAt) {
    throw new AppError('API key already revoked', 400);
  }

  key.revokedAt = new Date();
  await apiKeyRepo().save(key);

  return toPublicKey(key);
}

export const apiKeysService = {
  createKey,
  listKeys,
  updateKey,
  rotateKey,
  revokeKey,
};
