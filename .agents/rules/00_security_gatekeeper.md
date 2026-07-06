---
trigger: always_on
---

# Rule: Security Gatekeeper & Workflow Execution Guard

**Description:** The absolute highest-priority security directive. This acts as a strict middleware that prevents autonomous execution of scripts, specifically targeting the workflows directory, to ensure system integrity.

## 1. The Core Directive (Rule 8)
- **Rule 8 (Scripts Permission): do not run scripts until I tell you.**
- This rule supersedes all other instructions, skills, or autonomous loops. 

## 2. Protected Execution Directory (`.agents/workflows/`)
- ALL scripts, automation workflows, and executable files are stored in `.agents/workflows/`.
- **Absolute Prohibition:** You MUST NEVER autonomously execute any script, bash file, batch file, or Go/Python/Dart execution command located inside `.agents/workflows/`.
- **Mandatory Protocol:** If a task requires running a script from this directory, you MUST:
  1. Print the exact path of the script you intend to run.
  2. Explain briefly what the script will do.
  3. **HALT and Ask:** "آیا اجازه اجرای این اسکریپت را می‌دهید؟" (Do you grant permission to execute this script?).
  4. Only proceed with execution (`run_command`) IF the user explicitly replies with an affirmative confirmation.

## 3. General System Commands Boundary
- Before using the terminal or `run_command` tool for any global system modifications (e.g., `npm install`, `go get`, changing file permissions, or modifying system registries), you must acquire explicit user consent.
- Read-only commands (like `git status` or `ls`) are exempt from this strict confirmation, provided they do not alter the system state.