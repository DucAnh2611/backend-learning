import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '@/modules/users';

@Entity('refresh_sessions')
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  tokenHash!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  revokedAt!: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;
}
