# @dev_sync

**Description:** Step 1 of the develop loop. Synchronizes project status, identifies the next pending task, and strictly verifies the Git branch environment.

## USE FOR
- Starting a new development iteration.
- Finding the next actionable task from the phase plan.
- Ensuring Git branch safety before coding.

## DO NOT USE FOR
- Writing code or testing.

## Workflow Instructions
Act as a strict Tech Lead. Communicate entirely in **Persian (Farsi)**.

**Step 1: Status Sync**
- Read the markdown files in `.agents/wiki/knowledge/` briefly to regain global project context.
- Read `.agents/plan/master_plan.md` to find the current active phase.
- Read the corresponding `phase_X.md` file.
- Identify the first pending task marked with `[ ]`.

**Step 2: Git Verification (Strict)**
- Run `git branch --show-current`.
- Verify the branch name. It MUST be a feature branch (e.g., `feature/phase-X-...`).
- If the branch is `main`, `master`, or `develop`, you MUST HALT and refuse to proceed until the user creates or switches to a proper feature branch.

**Step 3: Training Mode Check & Confirmation**
- Assume `training_mode` is ON by default for now.
- Present a short summary in Persian:
  - Current Phase & Task Name.
  - Current Git Branch.
- **Halt and Ask:** "آیا تایید می‌کنید که این تسک را روی این برنچ شروع کنیم؟" (Do you confirm starting this task on this branch?).
- Only proceed to the next conceptual step in the loop once the user says yes.
- Log the start of this task in the dedicated log file `.agents/plan/phase_X.log` (do NOT write logs in the markdown plan files).