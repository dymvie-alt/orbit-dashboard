---
name: orbit
description: Orbit Dashboard — Continuous, passive (zero-touch), bird's-eye project monitoring companion. Automatically detects project workflow (Shraga, Plan.md, or Git), inherits project design system, and renders a 100dvh zero-scroll dashboard in chat or standalone browser. Triggered by /orbit, דשבורד, DASHBOARD, DASH, dash.
---

# 🛰️ Orbit Dashboard — Skill Playbook

Orbit Dashboard is your intelligent development companion for Google Antigravity. It delivers a continuous, single-glance ("מעוף הציפור") view of your project's progress in real time without altering or polluting a single file in your codebase.

## 📌 Activation Triggers
- Slash commands: `/orbit`, `/dashboard`, `/dash`
- Hebrew keywords: `דשבורד`, `מעוף הציפור`, `סטטוס פרויקט`, `רענן דשבורד`, `הפעל דשבורד`
- English keywords: `orbit`, `dashboard`, `bird's eye view`, `project companion`

---

## 🧭 Workflow & Interaction Lifecycle

### Phase 1: Onboarding Dialogue (When activated without explicit parameters)
1. **Target Project Ingestion:**
   If the target directory is not explicitly stated in the user's prompt, invoke `ask_question`:
   - **Question 1:** "איזה פרויקט תרצה ש-Orbit ילווה כעת?"
     - Options:
       - `(Recommended) תיקיית סביבת העבודה הנוכחית (<current-workspace>)`
       - `נתיב אחר במחשב`
   - **Question 2:** "באיזו תדירות להפעיל סריקה פסיבית שקטה ברקע?"
     - Options:
       - `(Recommended) כל 2 דקות (אידיאלי לעבודה שוטפת)`
       - `כל דקה (לסבבי פיתוח מהירים)`
       - `כל 5 דקות (חסכוני במשאבים)`
       - `ידני בלבד (ללא ניטור רקע)`

2. **Immediate Execution (Zero-Footprint):**
   Execute the background scanner:
   ```powershell
   node "C:\Users\dymvi\.gemini\config\plugins\orbit-dashboard\scripts\orbit-scanner.mjs" --project "<target-path>" --frequency "<chosen-frequency>"
   ```

3. **Presentation & Dual-Display:**
   - Report the detected adapter (`Shraga First-Class Harness`, `Plan.md Adapter`, or `Generic Git`).
   - Display the Active Phase, current stage, and test metrics.
   - Provide the direct clickable link to open the standalone zero-scroll dashboard in an external browser for second-monitor workflows:
     `[פתח את Orbit Dashboard בדפדפן / מסך שני](file:///<storageDir>/index.html)`
   - Also copy or save the artifact into the conversation artifact space if inline embed is preferred.

4. **Background Daemon Scheduling:**
   If automatic polling was requested (e.g. every 2 minutes), schedule a background recurring job via the `schedule` tool:
   - For 2 minutes: CronExpression: `*/2 * * * *`
   - Prompt: `"Orbit Daemon: בצע סריקת עדכון שקטה לפרויקט <target-path> ורענן את orbit-state.json"`
   - Note: The background task silently updates the JSON and HTML file in isolated storage, allowing the browser window to soft-sync without interrupting the user.

---

### Phase 2: On-Demand Refresh (`/orbit refresh` or `דשבורד רענן`)
When the user asks to refresh or calls `/orbit refresh`:
1. Immediately re-run `orbit-scanner.mjs` on the active project.
2. Provide a 2-line summary of newly detected commits, tests passed, or stage advances.
3. Link to the refreshed dashboard.
