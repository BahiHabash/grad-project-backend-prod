# AI-Driven Football Tactical Assistant: Roles, Stories, and Scenarios

## Overview of Roles and Permissions

The system uses Role-Based Access Control (RBAC) with strict isolation: Users cannot discover others except via direct email. The 1:1:1 constraint ensures one user per role per team.

| Role            | Description                                                   | Key Permissions/Actions                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Normal User** | Authenticated user not in a team (`team_role: NONE`).         | `SignUp/login/refresh token/update password`, `Claim a Club`, `Accept/Reject Invites`, `View Public Club List`, `Add/View Favorites (leagues/teams/players) with general stats`.         |
| **Manager**     | Owner who claimed a club successfully (`team_role: MANAGER`). | All Normal User actions, plus: `Invite/Kick Staff`, `Cancel Invites`, `Appoint Successor`, `View AI Analysis (team-specific)`, `View general stats for favorites`.                       |
| **Staff**       | User invited by a Manager (`team_role: STAFF`).               | All Normal User actions (**except claiming a club while in team**), plus: `View AI Analysis (team-specific)`, `Leave Team`, `View general stats for favorites`.                          |
| **Admin**       | `System-level` overseer.                                      | All system oversight actions: `Review Claims (Approve/Reject with feedback)`, `View all accounts`, `Suspend/Soft-Delete users/teams`, `Search for users/teams/claims/invites/analytics`. |
