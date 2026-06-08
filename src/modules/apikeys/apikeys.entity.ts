import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { App } from '@/modules/apps';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  appId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name!: string | null;

  @Column({
    type: 'varchar',
    length: 32,
  })
  keyPrefix!: string;

  @Column({
    type: 'varchar',
  })
  keyHash!: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  rotatedFromId!: string | null;

  @ManyToOne(() => App, (app) => app.apiKeys, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'appId',
  })
  app!: App;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;
}
