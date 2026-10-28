# 🛰️ Orbit Dashboard — Antigravity Plugin

**Orbit Dashboard** is your intelligent development companion for Google Antigravity, providing a continuous, real-time, bird's-eye view of your project's progress.

---

## עברית: אודות Orbit Dashboard
> **Orbit Dashboard** הוא מלווה הפיתוח החכם שלך, המעניק מבט-על רציף ("מעוף הציפור") על התקדמות הפרויקט בזמן אמת. המערכת פועלת ברקע באופן פסיבי ומאובטח לחלוטין (Read-Only) מבלי לשנות או לזהם אף קובץ בקוד שלך.  
> Orbit מזהה באופן אוטומטי את שיטת העבודה והניהול של הפרויקט (מתודולוגיית "שרגא", תוכניות עבודה מבוססות פאזות, או פעילות קוד ו-Git עצמאית), שואבת את שפת העיצוב של המוצר, ומשקפת לך במבט אחד מהיר (ללא צורך בגלילה) איפה הפרויקט עומד, מה מבוצע ממש עכשיו בקוד, מה שער האיכות הבא, ומה הצעד המעשי הנדרש לסיום.

---

## English: About Orbit Dashboard
> **Orbit Dashboard** is your intelligent development companion, providing a continuous bird's-eye view of your project's live progress. Operating in a completely passive and secure read-only mode, Orbit observes your workspace without modifying or polluting any files in your codebase.  
> Orbit automatically detects your project's workflow and governance framework (Shraga multi-agent harness, milestone-driven phase plans, or ad-hoc Git/codebase activity), dynamically inherits your product's native design system, and delivers a zero-scroll, single-view dashboard. At a glance, you always know where you are, what is currently being built, quality gate verdicts, and the exact next step required to ship.

---

## 🎯 Features
- **Zero-Footprint:** Read-only project inspection. No temp or metadata files created in the project folder.
- **Workflow Agnostic:** Built-in adapters for **Shraga Harness**, **Milestone / Phase Plans (`Plan.md`)**, and **Generic Git Activity**.
- **100dvh Zero-Scroll UI:** Responsive, fluid 3-column architecture designed for single-glance monitoring.
- **Dual-Display:** View inside Antigravity Chat (`<agent-embed>`) or in an external browser with flicker-free live soft-sync.
- **Multi-Project:** Monitor multiple independent projects concurrently.

---

## 🚀 Quick Start
```bash
/orbit
```
Aliases: `/dashboard`, `/dash`, `דשבורד`, `מעוף הציפור`.

---

## 📁 Repository Structure
```
orbit-dashboard/
├── plugin.json              # Antigravity plugin manifest
├── README.md                # Documentation & quick start
├── docs/                    # Approved PRD & Development Plan
│   ├── PRD.md
│   └── Plan.md
├── skills/                  # Plugin skills
│   └── orbit/
│       └── SKILL.md
├── templates/               # Generative UI templates (100dvh)
├── adapters/                # Workflow adapters (Shraga, Plan, Git)
├── scripts/                 # Observer daemon & sync scripts
└── tests/                   # Test suite & validation runners
```
