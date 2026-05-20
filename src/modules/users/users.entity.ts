import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    default: 'ACTIVE',
    length: 20,
  })
  status!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;
}
