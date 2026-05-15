import type { Request, Response } from 'express';
import { createExampleSchema, updateExampleSchema } from './example.dto';
import { exampleService } from './example.service';

export const exampleController = {
  async list(_req: Request, res: Response) {
    const data = await exampleService.list();
    res.json({ data });
  },

  async getById(req: Request, res: Response) {
    const data = await exampleService.getById(req.params.id);
    if (!data) {
      res.status(404).json({ error: { message: 'Example not found' } });
      return;
    }
    res.json({ data });
  },

  async create(req: Request, res: Response) {
    const parsed = createExampleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }
    const data = await exampleService.create(parsed.data);
    res.status(201).json({ data });
  },

  async update(req: Request, res: Response) {
    const parsed = updateExampleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }
    const data = await exampleService.update(req.params.id, parsed.data);
    if (!data) {
      res.status(404).json({ error: { message: 'Example not found' } });
      return;
    }
    res.json({ data });
  },

  async remove(req: Request, res: Response) {
    const ok = await exampleService.remove(req.params.id);
    if (!ok) {
      res.status(404).json({ error: { message: 'Example not found' } });
      return;
    }
    res.status(204).send();
  },
};
