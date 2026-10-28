---
name: orbit
description: Orbit Dashboard — Continuous, passive (zero-touch), bird's-eye project monitoring companion. Automatically detects project workflow (Shraga, Plan.md, or Git), inherits project design system, and renders a 100dvh zero-scroll dashboard in chat or standalone browser. Triggered by /orbit, דשבורד, DASHBOARD, DASH, dash.
---

# 🛰️ Orbit Dashboard — Skill Specification

Orbit Dashboard is your intelligent development companion, providing a continuous bird's-eye view of your project's live progress. Operating in a completely passive and secure read-only mode, Orbit observes your workspace without modifying or polluting any files in your codebase.

## 📌 Triggers
- Slash commands: `/orbit`, `/dashboard`, `/dash`
- Hebrew triggers: `דשבורד`, `מעוף הציפור`, `סטטוס פרויקט`, `רענן דשבורד`, `הפעל דשבורד`
- English triggers: `dashboard`, `orbit`, `project status`, `bird's eye view`

## 🎯 Core Operating Principles
1. **Strict Zero-Footprint (Read-Only):** Under NO circumstance shall Orbit write, create, modify, or delete any file in the target project directory. All telemetry, caches, and HTML outputs are saved to the isolated user space:
   `~/.gemini/antigravity/orbit/projects/<project-hash>/`
2. **Honest State Machine:**
   - `✓` Verified Completed
   - `⚡` Active in progress
   - `○` Planned future
3. **Screen Budget:** Strict `100dvh` layout with zero vertical window scrollbar.
4. **Dual Display:** Renders both inline via `<agent-embed>` and opens in a standalone browser window with flicker-free live DOM soft-sync.
5. **Multi-Project Isolation:** Each project is hashed and managed in its own isolated state chamber.

## 🗺️ Workflow Adapters
1. **Shraga Adapter (`shraga/`):** Full 7-stage lifecycle (`PHASE.md`, `Plan.md`, reports, reviews, verdicts, quality gates).
2. **Milestone Adapter (`Plan.md` / `ROADMAP.md`):** Phase breakdown, milestone checklists, sprint tracking.
3. **Generic Git & Activity Adapter:** Git commits, test health (`npm test`, `pytest`), with a transparency notice stating no macro roadmap is defined.
