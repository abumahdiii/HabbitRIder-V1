# Project Constitution (AGENTS.md)

## 1. Core Directives & Restrictions
- **CRITICAL RULE (Scripts Permission):** You must NEVER run any build scripts, execution commands, or generate zip files unless explicitly instructed by the user. *Exception: When running `@develop_loop` in `training_mode=off`, the agent has pre-granted permissions to run all necessary build, test, and verification scripts automatically until the phase is complete.*
- **Workflow:** Never write code immediately. Always follow the "Explore, Plan, Execute" methodology.
- **Task Sizing:** Break down tasks based on the "15-Minute Rule" (atomic tasks requiring maximum 3 tool calls).
- **Agent Files Organization:** All files, templates, prompts, specifications, checklists, documentation, logs, plans, and any other resources used exclusively by AI agents must reside inside the `.agents/` directory. The exceptions are `AGENTS.md` and `.geminiignore`, which must remain in the project root so AI coding assistants and the IDE can discover them automatically.

## 2. Tech Stack & Standards
- **Framework:** Next.js (TypeScript) with App Router. Use React Server Components and server-side operations appropriately.
- **Client/Offline:** Progressive Web App (PWA) with IndexedDB for local storage and CRDT-based synchronization.
- **Database:** Supabase/PostgreSQL or MongoDB. Ensure proper connection pooling and query optimization.
- **Styling:** Tailwind CSS. Follow Duolingo-inspired rounded, cheerful, and interactive design patterns.

## 3. Spec-Driven Development (SDD)
- Before implementing any new feature, use `@brainstorming` and `@concise-planning` to generate a `.agents/spec.md` (defining boundaries and acceptance criteria) and a plan in `.agents/plan/`.
- Halt and wait for human review after generating the implementation plan.

## 4. Quality & Debugging
- **Verification Loops:** After writing code, run local tests (e.g., `go test ./...`) to verify correctness before reporting back.
- **Debugging:** Do NOT use "Shotgun Debugging" (random guessing). Use `@systematic-debugging`, inject detailed temporary logs, and trace the exact state of variables.