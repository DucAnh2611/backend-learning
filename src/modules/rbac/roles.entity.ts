import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

import { App } from '@/modules/apps';

import { AppMember, RolePermission } from '.';

@Entity('roles')
@Unique(['appId', 'name'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  appId!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @ManyToOne(() => App, (app) => app.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'appId',
  })
  app!: App;

  @OneToMany(() => AppMember, (member) => member.role)
  members!: AppMember[];

  @OneToMany(() => RolePermission, (permission) => permission.role)
  permissions!: RolePermission[];
}
