import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { env } from '@/config';

const isTs = __filename.endsWith('.ts');
const ext = isTs ? 'ts' : 'js';
const toPosix = (p: string) => p.split(path.sep).join('/');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.NODE_ENV === 'development',
  logging: env.DB_LOGGING,
  entities: [`${toPosix(path.join(__dirname, '..', 'modules'))}/**/*.entity.${ext}`],
  migrations: [`${toPosix(path.join(__dirname, 'migrations'))}/*.${ext}`],
});
