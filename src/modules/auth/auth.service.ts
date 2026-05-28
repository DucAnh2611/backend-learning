import jwt from 'jsonwebtoken';
import { IsNull } from 'typeorm';

import { AppDataSource } from '@/db/data-source';
import { AppError } from '@/common/errors/AppError';

import { hashValue, compareHash } from '@/common/utils/hash.util';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/common/utils/jwt.util';

import { hashToken } from '@/common/utils/crypto.util';

import { User } from '@/modules/users';
import { RefreshSession } from './auth.entity';
import { UserStatus } from '@/modules/users';

import type { RegisterDto, LoginDto } from './auth.dto';

const userRepo = () => AppDataSource.getRepository(User);

const sessionRepo = () => AppDataSource.getRepository(RefreshSession);

async function createSession(user: User) {
  const refreshToken = generateRefreshToken({
    sub: user.id,
  });

  const decoded = jwt.decode(refreshToken);

  if (!decoded || typeof decoded === 'string') {
    throw new AppError('Invalid refresh token', 500);
  }

  const tokenHash = hashToken(refreshToken);

  const session = sessionRepo().create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(decoded.exp! * 1000),
    revokedAt: null,
  });

  await sessionRepo().save(session);

  return refreshToken;
}

async function register(dto: RegisterDto) {
  const existingUser = await userRepo().findOne({
    where: {
      email: dto.email,
    },
  });

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await hashValue(dto.password);

  const user = userRepo().create({
    email: dto.email,
    passwordHash,
    status: UserStatus.ACTIVE,
  });

  await userRepo().save(user);

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
  });

  const refreshToken = await createSession(user);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

async function login(dto: LoginDto) {
  const user = await userRepo().findOne({
    where: {
      email: dto.email,
    },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError('Account blocked', 403);
  }

  const matched = await compareHash(dto.password, user.passwordHash);

  if (!matched) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
  });

  const refreshToken = await createSession(user);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);

  const session = await sessionRepo().findOne({
    where: {
      tokenHash,
      revokedAt: IsNull(),
    },
  });

  if (!session) {
    throw new AppError('Invalid refresh token', 401);
  }

  session.revokedAt = new Date();

  await sessionRepo().save(session);

  const user = await userRepo().findOne({
    where: {
      id: payload.sub,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
  });

  const newRefreshToken = await createSession(user);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);

  const session = await sessionRepo().findOne({
    where: {
      tokenHash,
      revokedAt: IsNull(),
    },
  });

  if (!session) {
    return;
  }

  session.revokedAt = new Date();

  await sessionRepo().save(session);
}

async function me(userId: string) {
  const user = await userRepo().findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    email: user.email,
    status: user.status,
  };
}

export const authService = {
  register,
  login,
  refresh,
  logout,
  me,
};
