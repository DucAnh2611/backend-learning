import { AppDataSource } from '@/db/data-source';

import { AppError } from '@/common/errors/AppError';

import { User } from '@/modules/users';

import { AppMember, Permission, Role } from '.';

import type { AddMemberDto, UpdateMemberRoleDto } from './rbac.dto';

const userRepo = () => AppDataSource.getRepository(User);

const memberRepo = () => AppDataSource.getRepository(AppMember);

const roleRepo = () => AppDataSource.getRepository(Role);

const permissionRepo = () => AppDataSource.getRepository(Permission);

async function addMember(appId: string, dto: AddMemberDto) {
  const user = await userRepo().findOne({
    where: {
      email: dto.email,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const existing = await memberRepo().findOne({
    where: {
      appId,
      userId: user.id,
    },
  });

  if (existing) {
    throw new AppError('User already in app', 409);
  }

  const memberRole = await roleRepo().findOne({
    where: {
      appId,
      name: 'MEMBER',
    },
  });

  if (!memberRole) {
    throw new AppError('Member role missing', 500);
  }

  const member = memberRepo().create({
    appId,
    userId: user.id,
    roleId: memberRole.id,
  });

  await memberRepo().save(member);

  return member;
}

async function getMembers(appId: string) {
  return memberRepo().find({
    where: {
      appId,
    },
    relations: {
      user: true,
      role: true,
    },
  });
}

async function updateMemberRole(memberId: string, dto: UpdateMemberRoleDto) {
  const member = await memberRepo().findOne({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const role = await roleRepo().findOne({
    where: {
      id: dto.roleId,
    },
  });

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  member.roleId = role.id;

  await memberRepo().save(member);

  return member;
}

async function removeMember(memberId: string) {
  const member = await memberRepo().findOne({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  await memberRepo().remove(member);
}

async function getPermissions() {
  return permissionRepo().find();
}

async function getRoles(appId: string) {
  return roleRepo().find({
    where: {
      appId,
    },
  });
}

export const rbacService = {
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,

  getPermissions,
  getRoles,
};
