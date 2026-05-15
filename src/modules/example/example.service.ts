import { AppDataSource } from '@/db/data-source';
import { Example } from './example.entity';
import type { CreateExampleDto, UpdateExampleDto } from './example.dto';

const repo = () => AppDataSource.getRepository(Example);

export const exampleService = {
  async list(): Promise<Example[]> {
    return repo().find({ order: { createdAt: 'DESC' } });
  },

  async getById(id: string): Promise<Example | null> {
    return repo().findOne({ where: { id } });
  },

  async create(input: CreateExampleDto): Promise<Example> {
    const entity = repo().create({
      name: input.name,
      description: input.description ?? null,
    });
    return repo().save(entity);
  },

  async update(id: string, input: UpdateExampleDto): Promise<Example | null> {
    const existing = await exampleService.getById(id);
    if (!existing) return null;
    if (input.name !== undefined) existing.name = input.name;
    if (input.description !== undefined) existing.description = input.description ?? null;
    return repo().save(existing);
  },

  async remove(id: string): Promise<boolean> {
    const result = await repo().delete({ id });
    return Boolean(result.affected);
  },
};
