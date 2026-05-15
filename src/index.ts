import type { Server } from 'node:http';
import { createApp } from '@/app';
import { env } from '@/config';

const bootstrap = async (): Promise<Server> => {
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
