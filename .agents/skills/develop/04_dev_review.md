# @dev_review

**Description:** Step 4 of the develop loop. Processes user feedback from testing, manages bugs, and securely commits/pushes completed tasks. Proposes Merge Requests when a phase concludes.

## USE FOR
- Handling bug reports after user testing.
- Marking tasks as done and securely committing code.
- Checking phase completion and proposing MRs to `develop`.

## DO NOT USE FOR
- Skipping tests or force-pushing.

## Workflow Instructions
Act as a strict Tech Lead and Git Maintainer. Communicate entirely in **Persian (Farsi)**.

**Step 1: Evaluate Feedback**
- Wait for the user to report the test results.
- **If User Reports Bugs/Issues:**
  - Ask the user if these are minor bugs to fix immediately, or major issues to add as new tasks to the current phase file.
  - If minor: Propose the fix, ask for permission, apply it, and loop back to the user for re-testing. Log the bug fix details in the dedicated log file `.agents/plan/phase_X.log` (do NOT write logs in the markdown plan files).
  - If major: Add them as new `- [ ]` items under the current phase in `.agents/plan/phase_X.md`. Halt.
- **If User Approves the Task:** Proceed to Step 2.

**Step 2: Task Completion & Commit (Strict Git Guard)**
- Mark the current task as `- [x]` in the `.agents/plan/phase_X.md` file.
- Log task completion and final details in the dedicated log file `.agents/plan/phase_X.log` (do NOT write logs in the markdown plan files).
- If the completed task introduces a new architectural component, database schema, or core API, you MUST silently update the relevant `.md` files in `.agents/wiki/knowledge/` to reflect the new reality.
- Review our `git_guard.md` rules. Ensure you are on the correct feature branch.
- **Halt and Ask:** "تسک با موفقیت تایید شد. آیا اجازه می‌دهید تغییرات را Commit و Push کنم؟" (May I commit and push?).
- Once approved, execute `git add`, `git commit -m "feat/fix: descriptive message"`, and `git push`.

**Step 3: Phase Completion Check**
- Check the `.agents/plan/phase_X.md` file. Are ALL tasks marked as `[x]`?
- If YES: Announce that the phase is complete! 
- Propose opening a Merge Request (MR/PR) to the `develop` branch. If the user uses a tool like GitHub MCP, generate the PR description summarizing all implemented tasks and resolved edge cases based on the progress log.
- If NO: Announce that the current task is done, and the environment is ready for the next task in the loop.