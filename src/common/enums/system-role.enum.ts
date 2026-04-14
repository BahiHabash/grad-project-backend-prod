/**
 * The role of the user in the system
 */
export enum SystemRole {
  USER = 'USER', // A normal club user (coach, player)
  REVIEWER = 'REVIEWER', // Can see and approve clubs
  ADMIN = 'ADMIN', // admin can do everything except deleting other admins
  SUPER_ADMIN = 'SUPER_ADMIN', // super-admin can do everything including deleting other admins
}
