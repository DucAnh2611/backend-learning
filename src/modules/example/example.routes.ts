import { type RequestHandler, Router } from 'express';
import { exampleController } from './example.controller';

const asyncRoute =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const exampleRouter = Router();

exampleRouter.get('/', asyncRoute(exampleController.list));
exampleRouter.get('/:id', asyncRoute(exampleController.getById));
exampleRouter.post('/', asyncRoute(exampleController.create));
exampleRouter.patch('/:id', asyncRoute(exampleController.update));
exampleRouter.delete('/:id', asyncRoute(exampleController.remove));
