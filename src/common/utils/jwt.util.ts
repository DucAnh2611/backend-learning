import jwt from 'jsonwebtoken';
import type ms from 'ms';

import { env } from '@/config/env';

export type AccessPayload = {
  sub: string;
  email: string;
};

export type RefreshPayload = {
  sub: string;
};

export function generateAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as ms.StringValue,
  });
}

export function generateRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as ms.StringValue,
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token');
  }

  return decoded as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token');
  }

  return decoded as RefreshPayload;
}
