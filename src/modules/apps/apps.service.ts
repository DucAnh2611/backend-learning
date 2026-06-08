import { AppDataSource } from '@/db/data-source';

import { AppError } from '@/common/errors/AppError';

import { App } from './apps.entity';

import { Role, RolePermission, AppMember } from '@/modules/rbac';

import { DEFAULT_ROLE_PERMISSIONS } from '@/modules/rbac/permissions.constants';

import type { CreateAppDto, UpdateAppDto } from './apps.dto';

const appRepo = () => AppDataSource.getRepository(App);

export async function createApp(userId: string, dto: CreateAppDto) {
  return AppDataSource.transaction(async (manager) => {
    const app = manager.create(App, {
      name: dto.name,
      ownerId: userId,
    });

    await manager.save(app);

    const roles = await manager.save(
      Role,
      ['OWNER', 'ADMIN', 'MEMBER'].map((name) =>
        manager.create(Role, {
          appId: app.id,
          name,
        }),
      ),
    );

    for (const role of roles) {
      const mapped = DEFAULT_ROLE_PERMISSIONS[role.name as keyof typeof DEFAULT_ROLE_PERMISSIONS];

      if (mapped.includes('*')) {
        continue;
      }

      await manager.save(
        RolePermission,
        mapped.map((permissionName) =>
          manager.create(RolePermission, {
            roleId: role.id,
            permissionName,
          }),
        ),
      );
    }

    const ownerRole = roles.find((role) => role.name === 'OWNER');

    if (!ownerRole) {
      throw new AppError('Owner role missing');
    }

    await manager.save(
      AppMember,
      manager.create(AppMember, {
        appId: app.id,
        userId,
        roleId: ownerRole.id,
      }),
    );

    return app;
  });
}

async function getApps(userId: string) {
  return appRepo()
    .createQueryBuilder('app')
    .innerJoin(AppMember, 'member', 'member.appId=app.id')
    .where('member.userId=:userId', {
      userId,
    })
    .getMany();
}

async function getAppForUser(userId: string, id: string) {
  const app = await appRepo()
    .createQueryBuilder('app')
    .innerJoin(AppMember, 'member', 'member.appId = app.id')
    .where('app.id = :id', { id })
    .andWhere('member.userId = :userId', { userId })
    .getOne();

  if (!app) {
    throw new AppError('App not found', 404);
  }

  return app;
}

async function assertOwner(app: App, userId: string) {
  if (app.ownerId !== userId) {
    throw new AppError('Forbidden', 403);
  }
}

async function updateApp(userId: string, id: string, dto: UpdateAppDto) {
  const app = await getAppForUser(userId, id);

  await assertOwner(app, userId);

  if (dto.name !== undefined) {
    app.name = dto.name;
  }

  return appRepo().save(app);
}

async function deleteApp(userId: string, id: string) {
  const app = await getAppForUser(userId, id);

  await assertOwner(app, userId);

  await appRepo().delete({ id });
}

export const appsService = {
  createApp,
  getApps,
  getAppForUser,
  updateApp,
  deleteApp,
};
