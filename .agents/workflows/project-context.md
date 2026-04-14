---
description:
---

We are building AI Assistant for Football Tactical – a secure, multi-tenant SaaS graduation project that delivers AI-powered tactical analysis (pre-match, in-match, post-match) to real football clubs using public data from SofaScore.
The backend is a NestJS monolith (PostgreSQL + TypeORM, logical multi-tenancy via club_id) that enforces strict RBAC (SystemRole + MemberRole) and a gated club-onboarding flow: users sign up → browse static club list → submit verified claim (documents + external_club_id) → Admin manual review → approved user becomes Manager/Owner of the club. Managers can invite Staff; Staff and Managers both access team-isolated AI reports. Public users can only browse favorites and general stats.
Core value proposition: Coaches/Analysts get instant, context-aware tactical insights (JSON reports) instead of manual video analysis. The system follows big-SaaS patterns (Stripe-like onboarding + RBAC, Salesforce-style tenant isolation, Vercel-style observability) so it can scale from MVP to production-grade product.
Tech constraints we respect:

NestJS (modular, TypeScript-first)
SofaScore as single source of truth for matches/players
AI layer (separate team) consumes our internal endpoints
Flutter + React frontends + testing team

---

Key Main Features (prioritized from user stories + system-overview.md)

Authentication & RBAC – JWT (access + refresh), global JwtAuthGuard + RolesGuard, @Public(), @SystemRoles(), @MemberRoles() decorators.
Club Claim / Onboarding Pipeline – Normal User → Claim (upload docs) → Admin review (PENDING/APPROVED/REJECTED) → Manager role + club creation.
Team Governance – Invite/Kick/Accept/Reject via email only, Succession (transfer ownership), Safe liquidation (SOFT_DELETED when no members left).
Tactical AI Analysis – Pre/In/Post-match reports (team-isolated, fetched via external_club_id + SofaScore sync).
Favorites & Public Stats – Any user can favorite leagues/teams/players and see general SofaScore stats.
Admin Dashboard – Claim queue, user/team search, suspend/soft-delete, analytics overview, full system monitoring.
Status Machine – ACTIVE / SUSPENDED / SOFT_DELETED / PENDING / RUNNING / READY / EXPIRED across all entities.

---

Module,Responsibility,Key Entities / Relations,Why this split? (SaaS best practice)
auth,"Login, register, refresh, password, guards & decorators","User (sys_role, mem_role, status)",Global security layer – never duplicated
users,"Profile, favorites, password, status management","User, Favorite (league/team/player)",User lifecycle is shared across public & team users
clubs,"Claim pipeline, ownership, invite/kick, succession, team deletion","Club (external_club_id, managerId, status), Claim, Invite",Core multi-tenant boundary – all data scoped by club_id
matches,"SofaScore sync, match CRUD, real-time in-match trigger","Match (SofaScore ID, home/away, status)",Single source of truth for all analysis triggers
pre-match,Pre-match report request & storage,PreMatchReport (JSON + metadata),Dedicated AI contract – easy to swap AI provider later
in-match,Live data polling / webhook → report generation,"InMatchReport (live JSON, RUNNING → READY)",Real-time path – needs separate queue/worker
post-match,Post-match report (final stats + AI),PostMatchReport,Historical archive – can be cached heavily
analytics (or reports),Unified facade for all three report types + caching,Report (polymorphic or separate tables),Single entry point for AI team & frontend
admin,"Dashboard APIs, claim review, search, suspend, monitoring",All entities (searchable),Isolated admin API surface (different rate limits & guards)
dashboard,Aggregated queries for frontend dashboards (owner + admin),No new entities – reuses above,Thin query layer – prevents N+1 and over-fetching
