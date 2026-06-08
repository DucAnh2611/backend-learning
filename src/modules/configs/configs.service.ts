import { AppDataSource } from '@/db/data-source';
import { AppError } from '@/common/errors/AppError';
import { encryptionService } from '@/modules/encryption';
import { App } from '@/modules/apps';

import { ConfigEntry } from './config-entry.entity';
import { ConfigVersion } from './config-version.entity';

import type { CreateConfigDto, RollbackConfigDto, UpdateConfigDto } from './configs.dto';

const configRepo = () => AppDataSource.getRepository(ConfigEntry);
const versionRepo = () => AppDataSource.getRepository(ConfigVersion);
const appRepo = () => AppDataSource.getRepository(App);

const SECRET_MASK = '********';

async function assertAppExists(appId: string) {
  const app = await appRepo().findOne({ where: { id: appId } });

  if (!app) {
    throw new AppError('App not found', 404);
  }
}

function storeValue(value: string, isSecret: boolean): string {
  return isSecret ? encryptionService.encrypt(value) : value;
}

function readValue(stored: string, isSecret: boolean, reveal: boolean): string {
  if (isSecret && !reveal) {
    return SECRET_MASK;
  }

  return isSecret ? encryptionService.decrypt(stored) : stored;
}

async function getCurrentVersion(configId: string, version: number) {
  const row = await versionRepo().findOne({
    where: { configId, version },
  });

  if (!row) {
    throw new AppError('Config version not found', 404);
  }

  return row;
}

function toConfigResponse(entry: ConfigEntry, storedValue: string, revealSecret: boolean) {
  return {
    id: entry.id,
    appId: entry.appId,
    key: entry.key,
    isSecret: entry.isSecret,
    currentVersion: entry.currentVersion,
    value: readValue(storedValue, entry.isSecret, revealSecret),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

async function createConfig(appId: string, userId: string, dto: CreateConfigDto) {
  await assertAppExists(appId);

  return AppDataSource.transaction(async (manager) => {
    const existing = await manager.findOne(ConfigEntry, {
      where: { appId, key: dto.key },
    });

    if (existing) {
      throw new AppError('Config key already exists', 409);
    }

    const entry = manager.create(ConfigEntry, {
      appId,
      key: dto.key,
      isSecret: dto.isSecret ?? false,
      currentVersion: 1,
    });

    await manager.save(entry);

    const storedValue = storeValue(dto.value, entry.isSecret);

    await manager.save(
      ConfigVersion,
      manager.create(ConfigVersion, {
        configId: entry.id,
        version: 1,
        value: storedValue,
        createdByUserId: userId,
      }),
    );

    return toConfigResponse(entry, storedValue, true);
  });
}

async function listConfigs(appId: string) {
  await assertAppExists(appId);

  const entries = await configRepo().find({
    where: { appId },
    order: { key: 'ASC' },
  });

  const results = [];

  for (const entry of entries) {
    const current = await getCurrentVersion(entry.id, entry.currentVersion);
    results.push(toConfigResponse(entry, current.value, false));
  }

  return results;
}

async function getConfig(appId: string, configId: string, revealSecret: boolean) {
  await assertAppExists(appId);

  const entry = await configRepo().findOne({
    where: { id: configId, appId },
  });

  if (!entry) {
    throw new AppError('Config not found', 404);
  }

  const current = await getCurrentVersion(entry.id, entry.currentVersion);

  return toConfigResponse(entry, current.value, revealSecret);
}

async function updateConfig(appId: string, userId: string, configId: string, dto: UpdateConfigDto) {
  await assertAppExists(appId);

  return AppDataSource.transaction(async (manager) => {
    const entry = await manager.findOne(ConfigEntry, {
      where: { id: configId, appId },
    });

    if (!entry) {
      throw new AppError('Config not found', 404);
    }

    const nextVersion = entry.currentVersion + 1;
    const storedValue = storeValue(dto.value, entry.isSecret);

    entry.currentVersion = nextVersion;
    await manager.save(entry);

    await manager.save(
      ConfigVersion,
      manager.create(ConfigVersion, {
        configId: entry.id,
        version: nextVersion,
        value: storedValue,
        createdByUserId: userId,
      }),
    );

    return toConfigResponse(entry, storedValue, true);
  });
}

async function deleteConfig(appId: string, configId: string) {
  await assertAppExists(appId);

  const result = await configRepo().delete({ id: configId, appId });

  if (!result.affected) {
    throw new AppError('Config not found', 404);
  }
}

async function listVersions(appId: string, configId: string) {
  await assertAppExists(appId);

  const entry = await configRepo().findOne({
    where: { id: configId, appId },
  });

  if (!entry) {
    throw new AppError('Config not found', 404);
  }

  const versions = await versionRepo().find({
    where: { configId },
    order: { version: 'DESC' },
    select: ['id', 'version', 'createdByUserId', 'createdAt'],
  });

  return versions;
}

async function rollbackConfig(
  appId: string,
  userId: string,
  configId: string,
  dto: RollbackConfigDto,
) {
  await assertAppExists(appId);

  return AppDataSource.transaction(async (manager) => {
    const entry = await manager.findOne(ConfigEntry, {
      where: { id: configId, appId },
    });

    if (!entry) {
      throw new AppError('Config not found', 404);
    }

    const source = await manager.findOne(ConfigVersion, {
      where: { configId, version: dto.version },
    });

    if (!source) {
      throw new AppError('Config version not found', 404);
    }

    const nextVersion = entry.currentVersion + 1;

    entry.currentVersion = nextVersion;
    await manager.save(entry);

    await manager.save(
      ConfigVersion,
      manager.create(ConfigVersion, {
        configId: entry.id,
        version: nextVersion,
        value: source.value,
        createdByUserId: userId,
      }),
    );

    return toConfigResponse(entry, source.value, true);
  });
}

export const configsService = {
  createConfig,
  listConfigs,
  getConfig,
  updateConfig,
  deleteConfig,
  listVersions,
  rollbackConfig,
};
