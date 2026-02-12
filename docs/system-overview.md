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

## **User Stories**

### A. Authentication & Account

- skip - for now

### B. Team Formation (The "Claim" Pipeline)

- As a `Normal User` with no team, I want to browse a static list of known clubs (pre-mapped to external IDs) so that I can select one to claim.
- As a `Normal User` with no team, I want to submit a claim application with verification documents (uploaded to cloud storage) so that I can request ownership of a club.
- As an `Admin`, I want to view a queue of pending claim applications so that I can review them.
- As an `Admin`, I want to approve a claim application so that a new team is created, the user becomes Manager, and any existing invites for that user are deleted.
- As an `Admin`, I want to reject a claim application with feedback so that the user can understand the reason and resubmit if needed.
- As a `Normal User`, I want to view the status of my claim application (PENDING, APPROVED, REJECTED) so that I know my team status.

### C. Team Governance (Staffing)

- As a `Manager`, I want to invite a user via email so that I can add staff to my team, but only if the invitee exists and is team-less.
- As a `Manager`, I want to revoke or cancel a sent invite so that I can manage pending invitations.
- As a `Normal User`, I want to accept an invite so that I become Staff, join the team, and all my other pending invites are deleted.
- As a `Normal User`, I want to reject an invite so that I remain team-less without joining.
- As a `Manager`, I want to kick a Staff member so that they are removed from the team and their role resets to NONE.

### D. Succession & Liquidation (Exit Logic)

- As a `Staff`, I want to leave the team so that my role resets to NONE and teamId becomes NULL.
- As a `Manager` with Staff, I want to appoint a successor from existing Staff so that I can transfer managerId, swap roles, and then exit safely.
- As a `Manager` with no Staff, I want to leave the team so that the team is archived (SOFT_DELETED) if I'm the only member.
- As a `Manager` or Staff, I want automatic cleanup of invites upon joining or becoming Manager so that expired invites are handled.

### E. Tactical AI Dashboard

- As a `Manager` or `Staff`, I want to fetch and view pre-match tactical analysis (JSON from external server via external_club_id) so that I can prepare for games.
- As a `Manager` or `Staff`, I want to fetch and view in-match tactical analysis (live JSON) so that I can monitor ongoing games.
- As a `Manager` or `Staff`, I want to fetch and view post-match tactical analysis (JSON) so that I can review performance.
- As `any Team Member`, I want access restricted to my team's analytics so that data isolation is enforced.

### F. User Favorites (Optional)

- As `any User`, I want to add favorites (leagues, teams, or players) so that I can follow them personally.
- As `any User`, I want to remove or manage my favorites so that I can update my preferences.
- As `any User`, I want to view general stats data for my favorites (fetched from external sources, e.g., stats server) so that I can stay informed outside of team-specific analytics.

### G. Admin Search Functionality

- As an `Admin`, I want to search for users by email, status, or role so that I can quickly find and manage accounts.
- As an `Admin`, I want to search for teams by name, status, or external_club_id so that I can oversee team entities.
- As an `Admin`, I want to search for claims, invites, or analytics by status or ID so that I can efficiently handle administrative tasks.

### System Roles & Access Control (RBAC)

- As a `User`, I want my role (NONE, MANAGER, STAFF) enforced so that I can only perform actions permitted by my role.
- As an `Admin`, I want to suspend or soft-delete user accounts or teams so that I can manage violations.
- As a `User`, I want isolation so that I cannot discover other users except via direct email invites.

### Membership State Machine

- As a `System`, I want atomic transitions (e.g., PENDING_CLAIM to MANAGER) handled via services so that states remain consistent.

---

## **User Scenarios** (key behaviors - Gherkin Format)

scenarios describe key behaviors and edge cases in BDD style (Given-When-Then).

### A. Authentication & Account

**Feature: User Authentication**  
Scenario: Successful Signup and Login  
**Given** a new user with valid email and password  
**When** the user signs up and then logs in  
**Then** a JWT token is issued, and account_status is ACTIVE.

Scenario: Password Update  
**Given** an authenticated user  
**When** the user updates their password  
**Then** the new password is hashed and saved securely.

### B. Team Formation (The "Claim" Pipeline)

**Feature: Claiming a Club**  
Scenario: Submit Claim Application  
**Given** a Normal User with team_role NONE  
**And** a selected club from the static list  
**When** the user uploads docs and submits the application  
Then application status is PENDING, and applicationId is linked to the user.

Scenario: Admin Approves Claim  
**Given** a PENDING claim application  
**When** the Admin approves it  
**Then** a Team is created with status ACTIVE, managerId set, user's team_role becomes MANAGER, teamId updated, and any invites for the user are deleted.

Scenario: Admin Rejects Claim  
**Given** a PENDING claim application  
**When** the Admin rejects with feedback  
**Then** status is REJECTED, admin_feedback is saved, and user's team_role remains NONE.

Scenario: Constraint Violation on Claim  
**Given** a User with team_role not NONE  
**When** the user tries to submit a claim  
**Then** the action is rejected due to 1:1:1 constraint.

### C. Team Governance (Staffing)

**Feature: Inviting and Managing Staff**  
Scenario: Manager Sends Invite  
**Given** a Manager and a team-less existing user email  
**When** the Manager sends an invite  
**Then** an invitation is created, and it's pending for the invitee.

Scenario: Invitee Accepts Invite  
**Given** a Normal User with a pending invite  
**When** the user accepts  
**Then** team_role becomes STAFF, teamId is set, and all other pending invites are deleted.

Scenario: Manager Kicks Staff  
**Given** a Staff in a team  
**When** the Manager kicks them  
**Then** the Staff's team_role resets to NONE, teamId to NULL.

Scenario: Invite to Non-Teamless User  
**Given** a user already in a team  
**When** a Manager tries to invite them  
**Then** the invite is rejected.

### D. Succession & Liquidation (Exit Logic)

**Feature: Team Exit and Succession**  
Scenario: Staff Leaves Team  
**Given** a Staff in a team  
**When** they leave  
**Then** team_role becomes NONE, teamId NULL.

Scenario: Manager Succession  
**Given** a Manager with at least one Staff  
**When** the Manager appoints a successor and leaves  
**Then** managerId transfers to successor, roles swap (new MANAGER, old NONE), and old Manager exits.

Scenario: Lone Manager Leaves  
**Given** a Manager with no Staff  
**When** they leave  
**Then** team status becomes SOFT_DELETED, user's team_role NONE.

Scenario: No Succession Without Appointment  
**Given** a Manager with Staff  
**When** they try to leave without appointing successor  
**Then** the action is rejected.

### E. Tactical AI Dashboard

**Feature: Accessing Analytics**  
Scenario: Fetch Pre-Match Analysis  
**Given** an active Manager or Staff  
**When** they request pre-match analytics  
**Then** the backend queries external server using external_club_id, status becomes READY, and JSON content is displayed if teamId matches.

Scenario: Unauthorized Access  
**Given** a User not in the team  
**When** they request analytics for a team  
**Then** access is denied due to isolation guard.

Scenario: Live In-Match Sync  
**Given** an active team member during a match  
**When** in-match analytics are requested  
**Then** status is RUNNING, and live JSON is fetched and displayed.

### F. User Favorites (New Feature)

**Feature: Managing and Viewing Favorites**  
Scenario: Add Favorite  
**Given** any authenticated User  
**When** they select a league, team, or player to favorite  
**Then** the favorite is added to their profile, and general stats are available for viewing.

Scenario: View General Stats for Favorite  
**Given** a User with favorites  
**When** they request stats for a favorite  
**Then** general stats data (e.g., from external server) is fetched and displayed.

Scenario: Remove Favorite  
**Given** a User with favorites  
**When** they remove one  
**Then** the favorite is deleted from their profile.

### G. Admin Search Functionality (New Feature)

**Feature: Admin Searching System Entities**  
Scenario: Search for Users  
**Given** an Admin  
**When** they search by email, role, or status  
**Then** a list of matching users is returned with details.

Scenario: Search for Teams  
**Given** an Admin  
**When** they search by name, status, or external_club_id  
**Then** a list of matching teams is returned.

Scenario: Search for Claims or Invites  
**Given** an Admin  
**When** they search by status or ID  
**Then** relevant claims or invites are listed for review.

### Membership State Machine

**Feature: State Transitions**  
Scenario: Transition to PENDING_CLAIM  
**Given** User with team_role NONE  
**When** claim submitted  
**Then** state transitions to PENDING_CLAIM atomically.

Scenario: Auto-Expire Invites on Join  
**Given** a User with pending invites  
**When** they accept one or become Manager  
**Then** all other invites are deleted via clean-up job.
