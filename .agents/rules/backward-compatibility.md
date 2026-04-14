---
trigger: always_on
---

You MUST keep the existing User and Auth entity structure, columns, and relationships 100% unchanged (do not rename tables, do not remove columns, do not change primary keys, do not change email/username uniqueness rules).
Any new fields (e.g. club_id, member_role, status, external_club_id reference) must be added as nullable or via new relations so existing users and auth tokens continue to work without migration breakage.
Preserve all existing indexes, constraints, and enums already defined for User/Auth.

Entities & Relations
Create a complete TypeORM entity file for every module above.
Use @Entity(), @PrimaryGeneratedColumn('uuid') for all new tables (except where backward compatibility forces otherwise).
Implement soft-delete on every business entity (deletedAt, @DeleteDateColumn() + SoftDelete trait in common).
Add createdAt, updatedAt on all entities (@CreateDateColumn(), @UpdateDateColumn()).
Use status enum everywhere (ACTIVE, PENDING, APPROVED, REJECTED, SUSPENDED, SOFT_DELETED, RUNNING, READY, EXPIRED – reuse from docs).
Logical multi-tenancy: every table that belongs to a club must have clubId (UUID, nullable for public users).

Never break existing auth or user table structure.
All new modules must be importable independently (no circular imports).
Follow the exact response contract and status machine from the docs.
Use UUID v4 everywhere for IDs.
Make the design scalable to 10k+ clubs and real-time in-match reports.
