export const PERMISSIONS = {
  CONFIG_READ: 'config.read',
  CONFIG_WRITE: 'config.write',

  MEMBER_INVITE: 'member.invite',
  MEMBER_REMOVE: 'member.remove',
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const DEFAULT_ROLE_PERMISSIONS: Record<'OWNER' | 'ADMIN' | 'MEMBER', string[]> = {
  OWNER: ['*'],

  ADMIN: [PERMISSIONS.MEMBER_INVITE, PERMISSIONS.MEMBER_REMOVE, PERMISSIONS.CONFIG_WRITE],

  MEMBER: [PERMISSIONS.CONFIG_READ],
};
