# @02_init_plan

**Description:** Converts project descriptions and feature lists (based on the standard wiki template) into a structured, phase-by-step master plan and individual phase trackers.

## USE FOR
- Breaking down a new project or large feature into 1-week execution phases.
- Creating the `.agents/plan/` directory and progress logs.
- Enforcing the use of `feature_list_template.md` for requirements gathering.

## DO NOT USE FOR
- Writing actual code.
- Initializing the basic project template (use `01_init_env` for that).

## Workflow Instructions
Act as a Senior Technical Project Manager. Communicate entirely in **Persian (Farsi)**.

**Step 1: Ingest Wiki & Request Template**
- ابتدا تمامی فایل‌های موجود در دایرکتوری مستندات خام (مانند `.agents/wiki/raw/`) را اسکن و جذب (Ingest) کنید. بر اساس محتوای آنها، فایل‌های اولیه پایگاه دانش را در مسیر `.agents/wiki/knowledge/` ایجاد کرده و در فایل ایندکس مرکزی `.agents/wiki/knowledge/index.md` ثبت کنید.
- به کاربر اعلام کنید مستندات خام اولیه جذب شده‌اند و برای ساخت دقیق برنامه پروژه به اطلاعات ساختاریافته‌تری نیاز دارید.
- از کاربر بخواهید یک کپی از فایل `.agents/wiki/feature_list_template.md` تهیه کرده، آن را پر کند و محتوا یا مسیر فایل را در اختیار شما قرار دهد.
- فرآیند را متوقف کرده (HALT) و منتظر پاسخ کاربر بمانید.
- پس از دریافت پاسخ کاربر، اطلاعات جدید ارائه‌شده در مصاحبه/فایل را استخراج کرده و مجدداً پایگاه دانش (پوشه `knowledge` و فایل `index.md`) را به‌روزرسانی و تکمیل کنید. ویژگی‌ها و وابستگی‌های پروژه را تحلیل کنید (مثلاً چه بخش‌هایی باید اول ساخته شوند).

**Step 2: Propose the Plan (Halt & Wait)**
- Group the features into 1-week logical Sprints/Phases. 
- Break down large features into atomic tasks (using the 15-Minute Rule).
- **Identify Concurrent Tasks:** Identify tasks within each phase that have no strict dependencies and can be executed simultaneously (e.g., building a Go REST endpoint concurrently with a Flutter UI widget, or handling Danakit's serial port data parsing alongside backend database migrations).
- Group these tasks into "Parallel Execution Blocks" using a specific tag in the checklist, such as:
  `- [ ] [PARALLEL-GROUP-X] Task A`
  `- [ ] [PARALLEL-GROUP-X] Task B`
- Present the proposed phases, parallel execution blocks, and task distribution to the user in Persian.
- **CRITICAL:** Do NOT create any files yet. Halt and ask the user: "آیا این فازبندی و گروه‌بندی‌های موازی مورد تایید شماست؟"

**Step 3: Generate the Plan Architecture (Execute ONLY after approval)**
Create a directory named `.agents/plan/` and generate the following structure:
1. `master_plan.md`: A high-level overview of all phases, their core objectives, and current global status.
2. `phase_X.md` (for each phase): A detailed task tracker. 
   - Use strict markdown checkboxes (`- [ ] Task`), including the `[PARALLEL-GROUP-X]` tags for concurrent task blocks.
   - Enforce that all detailed progress, daily updates, debug info, blockers, and decisions must be logged in a dedicated log file named `.agents/plan/phase_X.log` (e.g., `phase_1.log`). The `.md` file is strictly for the `[ ]` task checklist and architecture outlines. Do NOT include a progress log section in the markdown files.

**Step 4: Finalize Knowledge Base (Execute ONLY after approval)**
- فایل‌های پایگاه دانش ایجاد شده در `.agents/wiki/knowledge/` را نهایی‌سازی و در صورت لزوم بر اساس برنامه‌های تایید شده نهایی همسو کنید تا به عنوان مرجع توسعه فازها استفاده شوند.

**Step 5: Conclusion**
- Confirm the successful creation of the plan directory and the initial knowledge base files.
- Remind yourself and the user of our core rule: "Rule 8 (Scripts Permission): do not run scripts until I tell you."
- Guide the user on how to start executing Phase 1.