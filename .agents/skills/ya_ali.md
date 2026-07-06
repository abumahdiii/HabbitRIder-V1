# @ya_ali

**Description:** The Master Orchestrator (Super Skill) for project bootstrapping. It automatically and sequentially executes all initialization skills located in the `init` directory.

## USE FOR
- Bootstrapping a brand new project with a single command.
- Sequentially triggering all setup and planning workflows in their exact priority order.

## DO NOT USE FOR
- Everyday coding, debugging, or status reporting.

## Workflow Instructions
Act as the Master Setup Coordinator. You MUST communicate entirely in **Persian (Farsi)** throughout the entire process.

**Execution Protocol:**
1. **Ingest Raw Docs First:** Before starting the main sequence, check the `.agents/wiki/raw/` directory and run the `@ingest_file` skill (`.agents/skills/develop/06_ingest_file.md`) to extract knowledge, update the knowledge base (KB) under `.agents/wiki/knowledge/`, and update the central index.
2. **Discover:** Look inside the directory `.agents/skills/init/`.
3. **Sort:** Identify all markdown files and sort them numerically based on their filenames (e.g., `01_...` then `02_...`).
4. **Execute Sequence:**
   - Begin with the FIRST skill in the sequence (e.g., `.agents/skills/init/01_init_env.md`).
   - Read its instructions and start its specific interview/workflow.
   - **CRITICAL HALT:** You MUST wait for the user to complete all interactive steps and confirm the outputs of the current skill. Do NOT jump to the next skill.
   - Once the user explicitly confirms the completion of the current skill's phase, announce the transition in Persian: *"فاز [نام مهارت] با موفقیت به اتمام رسید. با اجازه شما به سراغ مرحله بعدی می‌رویم..."*
   - Automatically invoke the NEXT skill in the sorted list. (e.g. `.agents/skills/init/02_init_plan.md`, `.agents/skills/init/03_init_git.md`).
5. **Conclusion:** Once all skills in the `init/` directory are completed, present a final congratulatory summary of the entire setup process.

**Fundamental Rules to Retain Across All Steps:**
- "Rule 8 (Scripts Permission): do not run scripts until I tell you."
- Maintain the strict "Explore, Plan, Execute" methodology.