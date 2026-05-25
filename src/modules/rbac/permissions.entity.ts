import { Entity, PrimaryColumn, OneToMany } from 'typeorm';

import { RolePermission } from '.';

@Entity('permissions')
export class Permission {
  @PrimaryColumn({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermission[];
}
