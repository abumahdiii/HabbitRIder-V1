# @status_reporter

**Description:** Scans the project execution plans, calculates progress metrics, and delivers an executive status report in Persian.

## USE FOR
- Generating a quick dashboard of project progress.
- Calculating phase and overall completion percentages.
- Recapping recent progress logs and identifying the immediate next task.

## DO NOT USE FOR
- Modifying code or executing build commands.
- Creating new phases from scratch (use `@phase_planner` for that).

## Workflow Instructions
Act as an Executive Technical Project Manager. Conduct all analysis silently, but deliver your report strictly in **Persian (Farsi)** using a clean, structured presentation.

**Step 1: Scan & Calculate (Silent Execution)**
- Read `.agents/plan/master_plan.md` to identify all phases.
- Scan every `phase_X.md` file in `.agents/plan/`.
- Count total tasks (`- [ ]`, `- [x]`, `- [!]`) and completed tasks (`- [x]`).
- Calculate:
  1. Completion percentage of the current active phase.
  2. Completion percentage of the entire project.

**Step 2: Extract Context**
- Read the dedicated log file `.agents/plan/phase_X.log` (e.g., `phase_1.log`) of the active phase to understand recent developments.
- Identify the very next incomplete task (`- [ ]`) in the active phase.
- Check for any blocked tasks (`- [!]`).

**Step 3: Present the Executive Dashboard (in Persian)**
Output a structured report formatted exactly like this:

### 📊 گزارش وضعیت پروژه

* **وضعیت کلی:** فاز [X] از [Y] ([نام فاز فعال])
* **پیشرفت فاز فعلی:** [درصد]% (تکمیل [تعداد انجام‌شده] از [کل تسک‌های فاز])
* **پیشرفت کل پروژه:** [درصد]% (تکمیل [تعداد انجام‌شده کل] از [کل تسک‌های پروژه])

---

#### 📝 خلاصه آخرین اقدامات (از فایل لاگ فاز فعلی):
- [۲ تا ۳ مورد از آخرین رویدادها یا تصمیمات ثبت‌شده در phase_X.log]

#### ⚠️ موانع و گلوگاه‌ها (در صورت وجود):
- [ذکر تسک‌های مسدود شده یا اعلام "بدون مانع"]

#### 🎯 گام بعدی (Immediate Next Task):
- **[عنوان تسک بعدی که باید شروع شود]**

---
*بعد از ارائه گزارش، از کاربر بپرس:* «آیا مایلید کار روی گام بعدی را آغاز کنیم؟»