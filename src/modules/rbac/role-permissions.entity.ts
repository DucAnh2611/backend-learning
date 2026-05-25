import { Entity, Column, ManyToOne, JoinColumn, Unique, PrimaryGeneratedColumn } from 'typeorm';

import { Role, Permission } from '.';

@Entity('role_permissions')
@Unique(['roleId', 'permissionName'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  roleId!: string;

  @Column({
    type: 'varchar',
  })
  permissionName!: string;
  @ManyToOne(() => Role, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'roleId',
  })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'permissionName',
    referencedColumnName: 'name',
  })
  permission!: Permission;
}
