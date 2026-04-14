/**
 * Club Claim Status
 */
export enum ClaimStatus {
  PENDING = 'PENDING', // Default on register
  UNDER_REVIEW = 'UNDER_REVIEW', // Under review by admin
  APPROVED = 'APPROVED', // Approved by admin
  REJECTED = 'REJECTED', // Rejected by admin
  REVOKED = 'REVOKED', // Revoked by user
}
