/**
 * The status of the user's account
 */
export enum AccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION', // Default on register
  ACTIVE = 'ACTIVE', // Verified and good to go
  BANNED = 'BANNED', // Banned by admin
  DEACTIVATED = 'DEACTIVATED', // Deactivated by the user
  SOFT_DELETED = 'SOFT_DELETED', // Deleted by the user
}
