# @develop_loop

**Description:** The Master Orchestrator (Super Skill) for the continuous development cycle. It dynamically handles the execution flow based on the `training_mode`, prevents token exhaustion via context checkpointing, and logs detailed execution data into dedicated `.log` files.
*Note: If new raw documentation files have been added to `.agents/wiki/raw/`, run `@ingest_file` to update the KB index before starting or resuming this loop.*

## USE FOR
- Orchestrating the end-to-end implementation of a project phase.
- Managing autonomous or guided transitions.
- Enforcing token efficiency and long-term memory management for heavy tasks.

## DO NOT USE FOR
- Project initialization (use `@ya_ali` for that).

## Workflow Instructions
Act as the Master Agile Facilitator. You MUST communicate entirely in **Persian (Farsi)** throughout the entire process.

**Step 0: Determine Mode**
- Before starting the loop, ask the user: "آیا حالت آموزش (Training Mode) روشن است یا خاموش؟" 
- Remember this state for the duration of the entire loop.
- **Training Mode = OFF Limits:** Training Mode = OFF automates file modifications and Git commits ONLY. It NEVER grants autonomous permission to execute terminal commands, build scripts, or bypass Rule 8. Rule 8 and the Security Gatekeeper remain ABSOLUTE in all modes.
- **Plan Refactor Request:** If the user explicitly requests a plan refactor, temporarily suspend this loop, invoke the `@refactor_plan` skill (via `.agents/skills/develop/05_refactor_plan.md`), and then resume Phase 1 with the updated plans.

**Execution Protocol & The Loop:**
Iteratively execute the following phases. Treat any `[PARALLEL-GROUP-X]` block of concurrent tasks as a single conceptual iteration of the execution, testing, and review phases. Once Phase 5 is complete, return to Phase 1 UNLESS the phase is completely done.

1. **Phase 1: Sync & Verify (via `.agents/skills/develop/01_dev_sync.md`)**
   - Identify the next task or parallel task group `[PARALLEL-GROUP-X]` and verify the Git branch strictly.
   - *If Training Mode is ON:* **HALT** and wait for user confirmation.
   - *If Training Mode is OFF:* Announce the task(s) and automatically proceed.

2. **Phase 2: Execute Logic (via `.agents/skills/develop/02_dev_execute.md`)**
   - Present the implementation plan and modify the required files.
   - *If the tasks are a `[PARALLEL-GROUP-X]`:*
     - Spawn sub-agents to implement each task in the group concurrently.
     - The orchestrator acts as a barrier: **HALT** and wait until ALL sub-agents in that group complete code generation and report success.
   - *If Training Mode is ON:* **HALT** and wait for approval before coding (main orchestrator or individual sub-agents).
   - *If Training Mode is OFF:* Apply the code changes autonomously (via orchestrator or concurrent sub-agents).

3. **Phase 3: Test Preparation (via `.agents/skills/develop/03_dev_test_prep.md`)**
   - Set up test data and present manual test scenarios.
   - *If executing a `[PARALLEL-GROUP-X]`:* Provide a unified, integrated testing scenario for the entire group rather than separate task-specific ones. This only triggers after all sub-agents have completed Phase 2.
   - **MANDATORY HALT (Always):** Regardless of the mode, you MUST **HALT** here. Wait for the user to perform manual tests and report back.

4. **Phase 4: Review & Commit (via `.agents/skills/develop/04_dev_review.md`)**
   - If bugs are reported in any part of the task(s), fix them (concurrently for parallel groups) and loop back to Phase 3.
   - Once approved:
     - Mark the task(s) as `[x]` in the `.agents/plan/phase_X.md` tracker.
     - *If Training Mode is ON:* **HALT** and ask for permission to commit and push.
     - *If Training Mode is OFF:* Automatically commit and push all changes for the task/group.

5. **Phase 5: Checkpoint, Logging & Context Clear (Token Optimization)**
   - **Knowledge Base Update:** If the completed task/group introduces a new architectural component, database schema, or core API, silently update the relevant `.md` files in `.agents/wiki/knowledge/` to reflect the new reality.
   - **Detailed Logging:** Append a detailed summary of the completed task/group, architectural decisions made, and bugs resolved into a dedicated log file named `.agents/plan/phase_X.log` (e.g., `phase_1.log`). Do NOT bloat the markdown plan file with these details.
   - **Context Compaction:** Instruct yourself to clear unnecessary historical context from your active memory. Keep ONLY the overarching rules, the current state of the phase, and the exact next task/group. 
   - Check if the entire phase is complete.
     - *If Phase is Complete:* Propose a Merge Request and **STOP THE LOOP**.
     - *If Phase has pending tasks:* Announce the context compaction is done, state the next task/group, and automatically loop back to **Phase 1**.

**Rule Updates & Guard Integration:**
- **"Rule 8 (Scripts Permission): do not run scripts until I tell you."**
- **Security Gatekeeper:** Respect the rules defined in `.agents/rules/00_security_gatekeeper.md` unconditionally.