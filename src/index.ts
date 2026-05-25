import type { Server } from 'node:http';
import { createApp } from '@/app';
import { env } from '@/config';
import { AppDataSource } from '@/db/data-source';
import { seedPermissions } from '@/db/seed-permissions';

const bootstrap = async (): Promise<Server> => {
  const dataSource = await AppDataSource.initialize();

  await seedPermissions();

  if (!dataSource.isInitialized) {
    throw new Error('DB init failed');
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.info(`SecureVault listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.info(`${signal} received — shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
};

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
