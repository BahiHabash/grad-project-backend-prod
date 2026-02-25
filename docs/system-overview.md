# AI-Driven Football Tactical Assistant: Roles, Stories, and Scenarios

## Overview of Roles and Permissions

The system uses Role-Based Access Control (RBAC) with strict isolation: Users cannot discover others except via direct email. The 1:1:1 constraint ensures one user per role per team. Notifications are handled via emails only (e.g., for invites, claim approvals/rejections, kicks); no in-app notifications.

| Role          | Description                                                                 | Key Permissions/Actions                                                                 |
|---------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Normal User** | Authenticated user not in a team (team_role: `NONE`).                         | `Sign up/login/refresh token/update password`, `Claim a Club`, `Accept/Reject Invites (via email)`, `View Public Club List, Add/View Favorites (leagues/teams/players) with general stats`. |
| **Manager**   | Owner who claimed a club successfully (team_role: `MANAGER`).                 | All Normal User actions, plus: `Invite/Kick Staff (via email), Cancel Invites`, `Appoint Successor (transfer ownership to Staff)`, `View AI Analysis (team-specific)`, `View general stats for favorites`. |
| **Staff**     | User invited by a Manager (team_role: `STAFF`).                               | All Normal User actions (**except claiming a club while in team**), plus: `View AI Analysis (team-specific)`, `Leave Team`, `View general stats for favorites`. |
| **Admin**     | `System-level` overseer.                                                      | All system oversight actions: `Review Claims (Approve/Reject with feedback)`, `View/Search all accounts/teams/claims/invites/analytics`, `Suspend/Soft-Delete users/teams`, `Manage dashboards` for queues and overviews. |

## Overview of User and Team Statuses

Statuses apply to users, teams, claims, analytics, and accounts to manage lifecycle and access.

| Status          | Applies To          | Description                                                                 |
|-----------------|---------------------|-----------------------------------------------------------------------------|
| **ACTIVE**     | `Users`, `Teams`, `Accounts` | Fully operational; user can perform actions, team is functional.            |
| **SUSPENDED**  | `Users`, `Teams`, `Accounts` | Temporarily disabled; user cannot log in or perform actions, team access blocked. |
| **SOFT_DELETED**| `Users`, `Teams`       | Archived/logically deleted; data preserved but inaccessible, can be restored by admin. Teams are only soft-deleted if no members remain (e.g., lone manager leaves after no staff). |
| **PENDING**    | `Claims`, `Invites`     | Awaiting review or action (e.g., claim approval, invite acceptance).        |
| **APPROVED**   | `Claims`              | Claim successful; team created.                                             |
| **REJECTED**   | `Claims`              | Claim denied; feedback provided.                                            |
| **RUNNING**    | `Analytics`           | In-progress (e.g., live in-match data sync).                                |
| **READY**      | `Analytics`           | Completed and available for viewing.                                        |
| **EXPIRED**    | `Invites`             | Invite auto-deleted due to expiry or user joining elsewhere.                |

## User Stories

User stories are derived from the system specification, grouped by feature set. New features added: User Favorites (for leagues/teams/players with general stats) and Admin Search Functionality. Updated to emphasize email reliance, ownership transfer, admin dashboard, and team deletion conditions.

### A. Authentication & Account
- As a Normal `User`, I want to sign up with email and password so that I can create an account.
- As a Normal `User`, I want to log in with JWT authentication so that I can access my account securely.
- As a Normal `User`, I want to refresh my JWT token so that my session remains active without re-logging in.
- As a Normal `User`, I want to update my password so that I can maintain account security.
- As an `Admin`, I want to view all user accounts so that I can oversee system usage, while respecting privacy (no public profiles).

### B. Team Formation (The "Claim" Pipeline)
- As a Normal `User` with no team, I want to browse a static list of known clubs (pre-mapped to external IDs) so that I can select one to claim.
- As a Normal `User` with no team, I want to submit a claim application with verification documents (uploaded to cloud storage) so that I can request ownership of a club.
- As an `Admin`, I want to view a queue of pending claim applications in my dashboard so that I can review them.
- As an `Admin`, I want to approve a claim application (with email notification to user) so that a new team is created, the user becomes Manager, and any existing invites for that user are deleted.
- As an `Admin`, I want to reject a claim application with feedback (with email notification to user) so that the user can understand the reason and resubmit if needed.
- As a Normal `User`, I want to view the status of my claim application (PENDING, APPROVED, REJECTED) so that I know my team status.
- As an `Admin`, I want a full dashboard to manage claims, including search, filtering by status, and bulk actions.

### C. Team Governance (Staffing)
- As a `Manager`, I want to invite a user via email so that I can add staff to my team, but only if the invitee exists and is team-less (invitee receives email notification).
- As a `Manager`, I want to revoke or cancel a sent invite so that I can manage pending invitations.
- As a Normal `User`, I want to accept an invite (via email link or in-app) so that I become Staff, join the team, and all my other pending invites are deleted.
- As a Normal `User`, I want to reject an invite (via email or in-app) so that I remain team-less without joining.
- As a `Manager`, I want to kick a Staff member (with email notification to staff) so that they are removed from the team and their role resets to NONE.

### D. Succession & Liquidation (Exit Logic)
- As a Staff, I want to leave the team so that my role resets to NONE and teamId becomes NULL (email notification to manager if needed).
- As a `Manager` with Staff, I want to appoint a successor from existing Staff so that I can transfer ownership (managerId), swap roles, and then exit safely (email notifications to involved parties).
- As a `Manager` with no Staff, I want to leave the team so that the team is archived (SOFT_DELETED) since no members remain.
- As a `Manager` or Staff, I want automatic cleanup of invites upon joining or becoming Manager so that expired invites are handled.
- As an `Admin`, I want to monitor and manage team liquidations via dashboard, ensuring teams are only deleted if no members remain.

### E. Tactical AI Dashboard
- As a `Manager` or Staff, I want to fetch and view pre-match tactical analysis (JSON from external server via external_club_id) so that I can prepare for games.
- As a `Manager` or Staff, I want to fetch and view in-match tactical analysis (live JSON) so that I can monitor ongoing games.
- As a `Manager` or Staff, I want to fetch and view post-match tactical analysis (JSON) so that I can review performance.
- As any Team Member, I want access restricted to my team's analytics so that data isolation is enforced.

### F. User Favorites (New Feature)
- As `any User`, I want to add favorites (leagues, teams, or players) so that I can follow them personally.
- As `any User`, I want to remove or manage my favorites so that I can update my preferences.
- As `any User`, I want to view general stats data for my favorites (fetched from external sources, e.g., stats server) so that I can stay informed outside of team-specific analytics.

### G. Admin Search Functionality (New Feature)
- As an `Admin`, I want to search for users by email, status, or role so that I can quickly find and manage accounts via dashboard.
- As an `Admin`, I want to search for teams by name, status, or external_club_id so that I can oversee team entities via dashboard.
- As an `Admin`, I want to search for claims, invites, or analytics by status or ID so that I can efficiently handle administrative tasks via dashboard.
- As an `Admin`, I want full dashboard functionalities, including overviews of all entities, analytics summaries, user/team management tools, and reporting.

### System Roles & Access Control (RBAC)
- As a `User`, I want my role (NONE, MANAGER, STAFF) enforced so that I can only perform actions permitted by my role.
- As an `Admin`, I want to suspend or soft-delete user accounts or teams via dashboard so that I can manage violations.
- As a `User`, I want isolation so that I cannot discover other users except via direct email invites.

### Membership State Machine
- As a System, I want atomic transitions (e.g., PENDING_CLAIM to MANAGER) handled via services so that states remain consistent.

## User Scenarios (Gherkin Format)

Gherkin scenarios describe key behaviors and edge cases in BDD style (Given-When-Then), grouped by feature. New scenarios added for User Favorites and Admin Search. Updated for email notifications and clarified team deletion.

### A. Authentication & Account
**Feature: User Authentication**  
Scenario: Successful Signup and Login  
Given a new user with valid email and password  
When the user signs up and then logs in  
Then a JWT token is issued, and account_status is ACTIVE.  

Scenario: Password Update  
Given an authenticated user  
When the user updates their password  
Then the new password is hashed and saved securely.  

### B. Team Formation (The "Claim" Pipeline)
**Feature: Claiming a Club**  
Scenario: Submit Claim Application  
Given a Normal User with team_role NONE  
And a selected club from the static list  
When the user uploads docs and submits the application  
Then application status is PENDING, and applicationId is linked to the user (email sent to admin for review).  

Scenario: Admin Approves Claim  
Given a PENDING claim application  
When the Admin approves it via dashboard  
Then a Team is created with status ACTIVE, managerId set, user's team_role becomes MANAGER, teamId updated, any invites for the user are deleted, and email notification sent to user.  

Scenario: Admin Rejects Claim  
Given a PENDING claim application  
When the Admin rejects with feedback via dashboard  
Then status is REJECTED, admin_feedback is saved, user's team_role remains NONE, and email notification sent to user.  

Scenario: Constraint Violation on Claim  
Given a User with team_role not NONE  
When the user tries to submit a claim  
Then the action is rejected due to 1:1:1 constraint.  

### C. Team Governance (Staffing)
**Feature: Inviting and Managing Staff**  
Scenario: Manager Sends Invite  
Given a Manager and a team-less existing user email  
When the Manager sends an invite  
Then an invitation is created, it's pending for the invitee, and email notification sent to invitee.  

Scenario: Invitee Accepts Invite  
Given a Normal User with a pending invite  
When the user accepts  
Then team_role becomes STAFF, teamId is set, all other pending invites are deleted, and email notification sent to manager.  

Scenario: Manager Kicks Staff  
Given a Staff in a team  
When the Manager kicks them  
Then the Staff's team_role resets to NONE, teamId to NULL, and email notification sent to staff.  

Scenario: Invite to Non-Teamless User  
Given a user already in a team  
When a Manager tries to invite them  
Then the invite is rejected.  

### D. Succession & Liquidation (Exit Logic)
**Feature: Team Exit and Succession**  
Scenario: Staff Leaves Team  
Given a Staff in a team  
When they leave  
Then team_role becomes NONE, teamId NULL, and email notification sent to manager.  

Scenario: Manager Succession  
Given a Manager with at least one Staff  
When the Manager appoints a successor and leaves  
Then managerId transfers to successor, roles swap (new MANAGER, old NONE), old Manager exits, and email notifications sent to involved parties.  

Scenario: Lone Manager Leaves  
Given a Manager with no Staff  
When they leave  
Then team status becomes SOFT_DELETED (since no members remain), user's team_role NONE.  

Scenario: No Succession Without Appointment  
Given a Manager with Staff  
When they try to leave without appointing successor  
Then the action is rejected.  

### E. Tactical AI Dashboard
**Feature: Accessing Analytics**  
Scenario: Fetch Pre-Match Analysis  
Given an active Manager or Staff  
When they request pre-match analytics  
Then the backend queries external server using external_club_id, status becomes READY, and JSON content is displayed if teamId matches.  

Scenario: Unauthorized Access  
Given a User not in the team  
When they request analytics for a team  
Then access is denied due to isolation guard.  

Scenario: Live In-Match Sync  
Given an active team member during a match  
When in-match analytics are requested  
Then status is RUNNING, and live JSON is fetched and displayed.  

### F. User Favorites (New Feature)
**Feature: Managing and Viewing Favorites**  
Scenario: Add Favorite  
Given any authenticated User  
When they select a league, team, or player to favorite  
Then the favorite is added to their profile, and general stats are available for viewing.  

Scenario: View General Stats for Favorite  
Given a User with favorites  
When they request stats for a favorite  
Then general stats data (e.g., from external server) is fetched and displayed.  

Scenario: Remove Favorite  
Given a User with favorites  
When they remove one  
Then the favorite is deleted from their profile.  

### G. Admin Search Functionality (New Feature)
**Feature: Admin Searching System Entities**  
Scenario: Search for Users  
Given an Admin  
When they search by email, role, or status via dashboard  
Then a list of matching users is returned with details.  

Scenario: Search for Teams  
Given an Admin  
When they search by name, status, or external_club_id via dashboard  
Then a list of matching teams is returned.  

Scenario: Search for Claims or Invites  
Given an Admin  
When they search by status or ID via dashboard  
Then relevant claims or invites are listed for review.  

### Membership State Machine
**Feature: State Transitions**  
Scenario: Transition to PENDING_CLAIM  
Given User with team_role NONE  
When claim submitted  
Then state transitions to PENDING_CLAIM atomically.  

Scenario: Auto-Expire Invites on Join  
Given a User with pending invites  
When they accept one or become Manager  
Then all other invites are rejected or expires.
