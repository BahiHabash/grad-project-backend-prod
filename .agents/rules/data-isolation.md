---
trigger: always_on
---

Data Isolation Strategy

Logical multi-tenancy: every table has club_id (nullable for public users).
TypeORM QueryRunner + custom repository base class that auto-filters by request.user.clubId unless @SystemRoles(ADMIN).
Never allow cross-club queries except for Admin.
