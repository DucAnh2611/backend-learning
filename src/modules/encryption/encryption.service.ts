import crypto from 'crypto';

import { env } from '@/config/env';
import { AppError } from '@/common/errors/AppError';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const BLOB_VERSION = 'v1';

function getKey(): Buffer {
  const keyHex = env.MASTER_ENCRYPTION_KEY;

  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new AppError(
      'MASTER_ENCRYPTION_KEY must be 64 hex characters (32-byte AES-256 key)',
      500,
    );
  }

  return Buffer.from(keyHex, 'hex');
}

function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    BLOB_VERSION,
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

function decrypt(blob: string): string {
  const key = getKey();
  const parts = blob.split(':');

  if (parts.length !== 4 || parts[0] !== BLOB_VERSION) {
    throw new AppError('Invalid encrypted value format', 500);
  }

  const [, ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex!, 'hex');
  const authTag = Buffer.from(authTagHex!, 'hex');
  const ciphertext = Buffer.from(ciphertextHex!, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export const encryptionService = {
  encrypt,
  decrypt,
};
