import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from '@/modules/users';
import { Role, AppMember } from '@/modules/rbac';
import { ApiKey } from '@/modules/apikeys';
import { ConfigEntry } from '@/modules/configs';

@Entity('apps')
export class App {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'uuid',
  })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.ownedApps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'ownerId',
  })
  owner!: User;

  @OneToMany(() => Role, (role) => role.app)
  roles!: Role[];

  @OneToMany(() => AppMember, (member) => member.app)
  members!: AppMember[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.app)
  apiKeys!: ApiKey[];

  @OneToMany(() => ConfigEntry, (config) => config.app)
  configs!: ConfigEntry[];

  @CreateDateColumn()
  createdAt!: Date;
}
