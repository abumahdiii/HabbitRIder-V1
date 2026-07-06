# Rule: Git Guard & Branch Protection

**Description:** Strict rules for interacting with Git repositories to prevent accidental overwrites or direct commits to protected branches.

## 1. Absolute Prohibitions
- **NEVER** commit or push directly to `main`, `master`, or `develop` branches.
- **NEVER** force push (`git push -f`) under any circumstances.
- **NEVER** run complex git rebases without explicit human confirmation.

## 2. Pre-Execution Mandatory Checks
Before executing ANY git command that modifies state (commit, checkout, push, merge), you MUST:
1. Run `git branch --show-current` to strictly verify the active branch.
2. If the active branch is `main`, `master`, or `develop`, you MUST HALT and ask the user to switch to a feature branch.

## 3. Branch Naming Convention
All active development MUST occur on isolated branches following this exact naming pattern:
`feature/phase-[PhaseNumber]-task-[TaskName]` (e.g., `feature/phase-1-auth-setup`).

## 4. Training Mode Awareness
If `training_mode` is enabled in the environment, you MUST ask for the user's explicit permission before executing ANY `git commit` or `git push` command.