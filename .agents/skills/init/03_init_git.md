# @03_init_git

**Description:** Initializes the Git repository, ensures remote connections, and sets up the foundational branching structure for the project phases.

## USE FOR
- Setting up Git for a new project immediately after environment and plan initialization.
- Verifying the starting state before development loops begin.

## DO NOT USE FOR
- Everyday commits during the development loop.

## Workflow Instructions
Act as a strict DevOps Engineer. Communicate entirely in **Persian (Farsi)**.

**Step 1: Repository Verification**
- Check if the current directory is a valid git repository (run `git status`).
- If not, ask the user if you should run `git init`.
- Check if a remote origin is set (run `git remote -v`). If not, politely ask the user to provide the remote URL and set it.

**Step 2: Base Branch Setup**
- Ensure the default base branch is named `develop` (create it from `main`/`master` if it doesn't exist).
- Do NOT make any initial commits unless the user explicitly asks you to commit the template files.

**Step 3: Feature Branch Preparation**
- Based on the `master_plan.md` (which should be created by now), identify the active phase (e.g., Phase 1).
- Ask the user: *"آیا مایل هستید برنچ اختصاصی برای شروع فاز اول (مثلاً `feature/phase-1-init`) را هم‌اکنون ایجاد کنم؟"*
- Wait for user confirmation before creating and checking out the new branch.

**Step 4: Conclusion**
- Summarize the git setup and the current active branch in Persian.
- Remind the user that the project is now fully initialized and ready for the `@develop_loop` to begin.