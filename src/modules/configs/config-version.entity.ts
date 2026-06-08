import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '@/modules/users';

import { ConfigEntry } from './config-entry.entity';

@Entity('config_versions')
@Unique(['configId', 'version'])
export class ConfigVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  configId!: string;

  @Column({
    type: 'int',
  })
  version!: number;

  @Column({
    type: 'text',
  })
  value!: string;

  @Column({
    type: 'uuid',
  })
  createdByUserId!: string;

  @ManyToOne(() => ConfigEntry, (config) => config.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'configId',
  })
  config!: ConfigEntry;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'createdByUserId',
  })
  createdBy!: User;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;
}
