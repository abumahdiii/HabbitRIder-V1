# @dev_test_prep

**Description:** Step 3 of the develop loop. Prepares the testing environment, generates random and edge-case data, and provides manual test scenarios for the user.

## USE FOR
- Setting up databases, mock hardware responses, or API payloads for testing the newly executed task.
- Defining clear, step-by-step manual test scenarios.

## DO NOT USE FOR
- Writing application logic or committing code.

## Workflow Instructions
Act as a QA Automation Engineer. Communicate entirely in **Persian (Farsi)**.

**Step 0: Handle Parallel Groups (Delayed & Unified Testing)**
- If the tasks just executed belong to a `[PARALLEL-GROUP-X]` block:
  - **Wait for Completion:** This test preparation phase MUST only trigger AFTER the entire parallel group has finished executing (i.e., all sub-agents have completed code generation).
  - **Unified Testing Strategy:** Focus on presenting a unified, integrated testing scenario so the user can evaluate the combined outcome of all sub-agents at once. Do not test tasks in isolation.
- If it is a standard sequential task, proceed directly to Step 1.

**Step 1: Analyze Boundaries & Edge Cases**
- Review the logic just implemented in the current task or the combined parallel group tasks.
- Identify potential edge cases. For backend (Go/Django), think about invalid tokens, null pointers, or concurrent requests. For frontend/hardware (Flutter/Serial Ports), think about unexpected raw data strings (e.g., "Raw Data: 3-Null"), sudden disconnects, or empty buffers.

**Step 2: Propose Test Data Generation**
- Formulate a plan to inject test data (e.g., writing a temporary SQL seed file, or generating a mock JSON response for the hardware stream) that satisfies both individual tasks and their integration points.
- **Halt and Ask:** "من قصد دارم این داده‌های تستی و لبه‌های مرزی را برای ارزیابی آماده کنم. آیا اجازه می‌دهید داده‌ها را در محیط توسعه قرار دهم؟" (May I setup this test data?).
- Wait for user confirmation. Remember "Rule 8 (Scripts Permission)": Do NOT run any database seeding scripts automatically; either provide the script to the user or ask for explicit permission to run it.

**Step 3: Present Test Scenarios**
- Provide the user with a structured markdown list of **Test Scenarios** (normal paths and edge cases) to execute manually. If a parallel group was executed, provide a **unified, integrated test scenario** showing how the components interact.
- Log that the task or group of tasks is currently "Awaiting User Testing" in the dedicated log file `.agents/plan/phase_X.log` (do NOT write logs in the markdown plan files).
- **Halt and Ask:** "لطفاً سناریوهای بالا را تست کنید و نتیجه را (تایید یا ثبت باگ) به من اطلاع دهید." (Please test and report back).