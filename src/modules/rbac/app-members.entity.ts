import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';

import { User } from '@/modules/users';
import { App } from '@/modules/apps';

import { Role } from '.';

@Entity('app_members')
@Unique(['userId', 'appId'])
export class AppMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  userId!: string;

  @Column({
    type: 'uuid',
  })
  appId!: string;

  @Column({
    type: 'uuid',
  })
  roleId!: string;

  @ManyToOne(() => User, (user) => user.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  @ManyToOne(() => App, (app) => app.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'appId',
  })
  app!: App;

  @ManyToOne(() => Role, (role) => role.members, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'roleId',
  })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;
}
