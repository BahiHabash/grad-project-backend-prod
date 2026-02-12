# AI-Driven Football Tactical Assistant: Roles, Stories, and Scenarios

## Overview of Roles and Permissions

The system uses Role-Based Access Control (RBAC) with strict isolation: Users cannot discover others except via direct email. The 1:1:1 constraint ensures one user per role per team.

| Role            | Description                                                   | Key Permissions/Actions                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Normal User** | Authenticated user not in a team (`team_role: NONE`).         | `SignUp/login/refresh token/update password`, `Claim a Club`, `Accept/Reject Invites`, `View Public Club List`, `Add/View Favorites (leagues/teams/players) with general stats`.         |
| **Manager**     | Owner who claimed a club successfully (`team_role: MANAGER`). | All Normal User actions, plus: `Invite/Kick Staff`, `Cancel Invites`, `Appoint Successor`, `View AI Analysis (team-specific)`, `View general stats for favorites`.                       |
| **Staff**       | User invited by a Manager (`team_role: STAFF`).               | All Normal User actions (**except claiming a club while in team**), plus: `View AI Analysis (team-specific)`, `Leave Team`, `View general stats for favorites`.                          |
| **Admin**       | `System-level` overseer.                                      | All system oversight actions: `Review Claims (Approve/Reject with feedback)`, `View all accounts`, `Suspend/Soft-Delete users/teams`, `Search for users/teams/claims/invites/analytics`. |

---

## Overview of User and Team Statuses

Statuses apply to _users, teams, claims, analytics_, and accounts to manage lifecycle and access.

### **Users & Teams & Accounts:-**

| Status           | Applies To             | Description                                                                            |
| ---------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| **ACTIVE**       | Users, Teams, Accounts | Fully operational; user can perform actions, team is functional.                       |
| **SUSPENDED**    | Users, Teams, Accounts | Temporarily disabled; user cannot log in or perform actions, team access blocked.      |
| **SOFT_DELETED** | Users, Teams           | Archived/logically deleted; data preserved but inaccessible, can be restored by admin. |

### **Claims (Team Application):-**

| Status       | Applies To | Description                                       |
| ------------ | ---------- | ------------------------------------------------- |
| **PENDING**  | Claims     | Awaiting review or action (e.g., claim approval). |
| **APPROVED** | Claims     | Claim successful; team created.                   |
| **REJECTED** | Claims     | Claim denied; feedback provided.                  |

### **Invitations (Team Members Invitations):-**

| Status      | Applies To | Description                                                  |
| ----------- | ---------- | ------------------------------------------------------------ |
| **EXPIRED** | Invites    | Invite auto-deleted due to expiry or user joining elsewhere. |
| **PENDING** | Invites    | (invite acceptance pending).                                 |

---

### **Analytics:-**

| Status      | Applies To | Description                                                          |
| ----------- | ---------- | -------------------------------------------------------------------- |
| **RUNNING** | Analytics  | In-progress (e.g., live in-match data sync, processing in progress). |
| **READY**   | Analytics  | Completed and available for viewing.                                 |

---
