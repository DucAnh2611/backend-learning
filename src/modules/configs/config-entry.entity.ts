import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { App } from '@/modules/apps';

import { ConfigVersion } from './config-version.entity';

@Entity('config_entries')
@Unique(['appId', 'key'])
export class ConfigEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  appId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  key!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isSecret!: boolean;

  @Column({
    type: 'int',
    default: 1,
  })
  currentVersion!: number;

  @ManyToOne(() => App, (app) => app.configs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'appId',
  })
  app!: App;

  @OneToMany(() => ConfigVersion, (version) => version.config)
  versions!: ConfigVersion[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;
}
