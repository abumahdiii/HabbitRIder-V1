# @dev_execute

**Description:** Step 2 of the develop loop. Executes the logic for the currently identified task using Spec-Driven Development principles.

## USE FOR
- Writing application logic for the active task.
- Implementing features in the backend, mobile client, or hardware integration layers.

## DO NOT USE FOR
- Merging branches or running final user tests.

## Workflow Instructions
Act as a Senior Full-Stack & IoT Developer. Communicate entirely in **Persian (Farsi)**.

**Step 0: Handle Parallel Groups (Orchestrator Barrier & Safety Net)**
- If the current task block is tagged as `[PARALLEL-GROUP-X]`:
  - **Spawn Sub-Agents:** The main orchestrator MUST spawn individual, concurrent sub-agents, assigning exactly one task from the group to each sub-agent.
  - **Orchestrator Barrier:** Act as a synchronization barrier. The main agent MUST halt and wait until ALL sub-agents in that specific parallel group have completed their code generation and reported success.
  - **Sub-Agent Safety Net:** If any sub-agent fails, encounters an unresolvable error, or gets stuck for an extended period, the main orchestrator MUST immediately HALT, kill the parallel group, and ask the user for manual intervention.
  - **Consolidate:** Once all sub-agents complete code generation, consolidate their implementations before moving forward.
- If the task is a standard sequential task, skip this step and proceed directly to Step 1.

**Step 1: Context Gathering**
- Review the required files for the specific task (e.g., Go handlers, Flutter widgets, or serial port communication modules).
- If the task involves hardware interfaces or raw data streams, pay special attention to null-byte handling and error boundaries.

**Step 2: Training Mode - Proposed Plan**
- **CRITICAL:** Do NOT write code files immediately.
- Present a brief action plan in Persian detailing which files you intend to modify and the logic you will implement.
- **Halt and Ask:** "برنامه پیاده‌سازی من به این شکل است. آیا اجازه دارم تغییرات را در فایل‌ها اعمال کنم؟" (This is my implementation plan. May I apply the changes?).

**Step 3: Guarded Logging Integration**
- Proactively inject `DEV_MODE`-guarded logs (per `.agents/rules/01_logging_standard.md`) when implementing complex and medium-complexity business logic, hardware/serial integrations, or error boundaries to trace raw data and variable states.
- Ensure most critical path events are logged under this guard so that execution flow can be easily understood and traced during testing.

**Step 4: Execution & Verification Loop**
- After user approval, carefully apply the code changes.
- **CRITICAL RULE:** Remember "Rule 8 (Scripts Permission): do not run scripts until I tell you." If a build script is needed to verify the code, explicitly ask the user to run it or ask for permission.
- Log details of exactly what was implemented in the dedicated log file `.agents/plan/phase_X.log` (do NOT write logs in the markdown plan files).