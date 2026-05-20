import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
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
