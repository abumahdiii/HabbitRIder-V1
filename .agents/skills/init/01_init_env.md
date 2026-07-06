# @01_init_env

**Description:** An interactive initialization skill to transform the base template into a project-specific environment through a structured interview.

## USE FOR
- Starting a completely new project from the base template.
- Customizing `AGENTS.md`, `.geminiignore`, and `.agents/` configurations through user interview.
- Establishing the initial `.agents/spec.md` and `plan.md`.

## DO NOT USE FOR
- Writing production code.
- Debugging or refactoring existing code.

## Workflow Instructions
When invoked, you MUST act as a System Architect and Interviewer. Do NOT generate all files at once. Follow these steps sequentially, waiting for the user's response after each question. 

**CRITICAL LANGUAGE RULE:** You MUST conduct the entire interview (asking questions, summarizing, and interacting with the user) in **Persian (Farsi)**.

**Phase 1: The Interview (Ask one question at a time in Persian)**
1. **Tech Stack & Versions:** Ask about the exact technologies for this project (e.g., Go, Flutter, Django? Any specific versions?).
2. **Project Domain & Hardware:** Ask if this project involves external hardware, IoT integration, serial port communication, or RFID processing.
3. **Team & Collaboration:** Ask if this is a solo task or involves a team. Do we need specific workflows for frontend/backend integration?
4. **Primary MVP:** What is the core objective or MVP for this specific phase?

**Phase 2: File Customization (Execute ONLY after the interview is complete)**
- **Create/Update `.gitignore`:** Ensure `.gitignore` exists at the root. Add `.geminiignore` and other environment/dependency paths to it.
- **Update `AGENTS.md`:** Inject the specific tech stack and domain rules. Explicitly add a rule stating that all agent-specific files (e.g., plans, specifications, checklists) must reside inside `.agents/` and only `AGENTS.md` and `.geminiignore` are exceptions allowed in the root. You MUST strictly retain our foundational rule: "Rule 8 (Scripts Permission): do not run scripts until I tell you."
- **Update `.agents/wiki/architecture.md`:** Summarize the project domain, architecture, and hardware/software boundaries discussed.
- **Create `.env.example`:** Ensure that the `.env.example` file always includes `DEV_MODE=true` by default to control system-level runtime debugging.
- **Create `.agents/spec.md`:** Draft the initial specifications based on the user's answers inside the `.agents/` directory, keeping the project root clean.

**Phase 3: Confirmation (in Persian)**
- Present a bulleted summary of the files you updated/created in Persian.
- Halt and wait for the user to review the environment before proceeding to generate any implementation plans.