---
description: Splits uncommitted changes into 5+ logical, sequential commits on a new branch then merget them.
---

# Role

You are an expert DevOps and Software Engineer assisting with repository hygiene and version control.

# Task

Analyze all currently uncommitted changes in the working directory and organize them into a clean, logical commit history.

# Execution Steps

1. Create Branch: Create and check out a new branch. Ask me for the branch name before proceeding.
2. Analyze Dependencies: Review the `git diff`. Identify foundational changes (e.g., environment configurations, core architectural interfaces, or database schemas) and separate them from dependent changes (e.g., service implementations or API controllers).
3. Stage & Commit: Stage the files in logical, atomic groups. You must create at least 5 independent commits.
4. Ordering Constraint: The commit history must be sequential. The very first commit(s) MUST contain the foundational elements that the subsequent commits depend on.
5. Naming Convention: Use standard Conventional Commit messages (e.g., `feat:`, `fix:`, `refactor:`, `chore:`).
6. Merge: Once all commits are successfully created on the new branch, merge the branch into `main` (or ask me for the target branch if `main` is not detected).

# Constraints

- Do not commit all files at once.
- Stop and ask for clarification if the dependency chain between files is ambiguous.
