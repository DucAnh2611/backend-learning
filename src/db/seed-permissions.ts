import { AppDataSource } from './data-source';

import { Permission } from '@/modules/rbac';

import { ALL_PERMISSIONS } from '@/modules/rbac/permissions.constants';

export async function seedPermissions() {
  const repo = AppDataSource.getRepository(Permission);

  const existing = await repo.find();

  const existingNames = new Set(existing.map((p) => p.name));

  const missing = ALL_PERMISSIONS.filter((name) => !existingNames.has(name)).map((name) =>
    repo.create({
      name,
    }),
  );

  if (missing.length === 0) {
    return;
  }

  await repo.save(missing);
}
