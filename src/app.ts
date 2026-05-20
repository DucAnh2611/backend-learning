import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '@/middlewares/error.middleware';
import { router } from '@/routes';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1', router);

  app.use(errorHandler);

  return app;
};
