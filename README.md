# 🛰️ Orbit Dashboard — Multi-Project Hub & Companion (v2.2.0)

[![GitHub](https://img.shields.io/badge/GitHub-dymvie--alt%2Forbit--dashboard-indigo)](https://github.com/dymvie-alt/orbit-dashboard)
[![QA Gate](https://img.shields.io/badge/QA%20Gate-100%25%20Passed-emerald)](https://github.com/dymvie-alt/orbit-dashboard)
[![Zero-Footprint](https://img.shields.io/badge/Security-Zero--Footprint%20Read--Only-sky)](https://github.com/dymvie-alt/orbit-dashboard)
[![Screen Budget](https://img.shields.io/badge/Layout-100dvh%20Zero--Scroll-violet)](https://github.com/dymvie-alt/orbit-dashboard)
[![WCAG Contrast](https://img.shields.io/badge/Accessibility-WCAG%20AAA%20Contrast%20Enforced-teal)](https://github.com/dymvie-alt/orbit-dashboard)
[![RTL & Hebrew](https://img.shields.io/badge/Language-Hebrew%20RTL%20%26%20Gender%20Neutral-amber)](https://github.com/dymvie-alt/orbit-dashboard)

**Orbit Dashboard** הוא מרכז בקרה רב-פרויקטלי (Multi-Project Hub) ומלווה פיתוח חכם עבור **Google Antigravity**, **Claude Code** ו-**Cursor**, המעניק מבט-על רציף ("מעוף הציפור") על התקדמות כל הפרויקטים בזמן אמת מחלון אחד קבוע וללא גלילה. המערכת פועלת ברקע באופן פסיבי ומאובטח לחלוטין (Read-Only) מבלי לשנות או לזהם אף קובץ בקוד, וכתובה בעברית תקנית וניטרלית מגדרית (פנייה שוויונית ללא הטיה לזכר או לנקבה).

---

## 📖 תוכן עניינים (Table of Contents)
1. [מדריך התקנה ופריסה במחשב חדש](#-מדריך-התקנה-ופריסה-במחשב-חדש)
2. [אודות Orbit Dashboard (עברית ואנגלית)](#-אודות-orbit-dashboard)
3. [יכולות מרכז הבקרה הרב-פרויקטלי (v2.2.0)](#-יכולות-מרכז-הבקרה-הרב-פרויקטלי-v220)
4. [ניהול והסרת פרויקטים מסרגל התצוגה](#-ניהול-והסרת-פרויקטים-מסרגל-התצוגה)
5. [עקרונות הברזל והארכיטקטורה](#-עקרונות-הברזל-והארכיטקטורה)
6. [מנוע המתאמים (Workflow Adapters)](#-מנוע-המתאמים-workflow-adapters)
7. [מדריך הפעלה שוטפת (Quick Start)](#-מדריך-הפעלה-שוטפת-quick-start)
8. [בקרת איכות ואימות (QA Gate)](#-בקרת-איכות-ואימות-qa-gate)
9. [מבנה הקבצים במאגר](#-מבנה-הקבצים-במאגר)

---

## 💻 מדריך התקנה ופריסה במחשב חדש

### דרישות קדם במחשב היעד:
* מערכת הפעלה Windows (נתמך גם ב-macOS/Linux עם Node.js).
* מותקן **Node.js** (גרסה 18 ומעלה — להורדה מ-[nodejs.org](https://nodejs.org)).

---

### דרך א': התקנה בלחיצה כפולה מתוך קובץ ה-ZIP (המהירה ביותר)
1. העברת הקובץ `orbit-dashboard-v2.2.0-installer.zip` למחשב החדש.
2. חילוץ ה-ZIP לתיקייה כלשהי (או פתיחתו הישירה) ולחיצה כפולה על הקובץ **`Install-Orbit.bat`**.
3. המתקין העצמאי יבצע אוטומטית:
   * התקנת הפלאגין בנתיב התקני של המשתמש במחשב החדש:  
     `C:\Users\<Username>\.gemini\config\plugins\orbit-dashboard`
   * זיהוי וסריקה אוטומטית של תיקיות פרויקטים קיימות במחשב (כגון `C:\CLAUDE PROJECTS`, `Documents\antigravity`, `Projects` או `Desktop`).
   * יצירה ופתיחה מיידית של **מרכז הבקרה המאוחד (Orbit Hub)** בדפדפן!

---

### דרך ב': התקנה ישירה מ-GitHub (ללא קובץ ZIP)
ניתן להריץ בטרמינל PowerShell במחשב החדש פקודה אחת שמשכפלת ומתקינה את המערכת:
```powershell
git clone https://github.com/dymvie-alt/orbit-dashboard.git "$env:USERPROFILE\.gemini\config\plugins\orbit-dashboard"; & "$env:USERPROFILE\.gemini\config\plugins\orbit-dashboard\Install-Orbit.bat"
```

---

### דרך ג': הרצה וסנכרון על פרויקט ספציפי משורת הפקודה (למשתמשי Claude Code / Cursor)
לסריקה או חיבור של תיקיית פרויקט חדשה בכל מיקום במחשב:
```powershell
node "$env:USERPROFILE\.gemini\config\plugins\orbit-dashboard\scripts\orbit-scanner.mjs" --project "C:\Path\To\YourProject"
```
מרכז הבקרה הראשי זמין תמיד לפתיחה בדפדפן בנתיב:
```text
C:\Users\<Username>\.gemini\antigravity\orbit\index.html
```

---

## 📌 אודות Orbit Dashboard

### עברית (שפה ניטרלית):
> **Orbit Dashboard** הוא מלווה פיתוח חכם המעניק מבט-על רציף ("מעוף הציפור") על התקדמות הפרויקטים בזמן אמת מחלון אחד. המערכת פועלת ברקע באופן פסיבי ומאובטח לחלוטין (Read-Only) מבלי לשנות או לזהם אף קובץ בקוד.  
> Orbit מזהה באופן אוטומטי את שיטת העבודה והניהול של כל פרויקט (מתודולוגיית "שרגא", תוכניות עבודה מבוססות פאזות, או פעילות קוד ו-Git עצמאית), שואבת את שפת העיצוב של המוצר, ומשקפת במבט חטוף בעברית תקנית וניטרלית (ללא צורך בגלילה) איפה כל פרויקט עומד, מה נבנה כעת בקוד, איזה פרויקט סיים שלב, ומה הצעד המעשי הבא.

### English:
> **Orbit Dashboard** is an intelligent Multi-Project Hub and development companion, providing a continuous bird's-eye view of all active projects in real time from a single window. Operating in a completely passive and secure read-only mode, Orbit observes workspaces without modifying or polluting any files in the codebase.  
> Orbit automatically detects each project's workflow (Shraga multi-agent harness, milestone-driven phase plans, or ad-hoc Git activity), inherits native design tokens, and highlights background projects with a visual Focus Beacon the moment a phase completes or a build report is ready.

---

## 🌟 יכולות מרכז הבקרה הרב-פרויקטלי (v2.2.0)

1. **סרגל פרויקטים אנכי בימין המסך (Right Project Dock):**
   * מציג את הפרויקטים הפעילים ברצועת צד ימנית קומפקטית ומתאים את גובה הכפתורים אוטומטית למספר הפרויקטים (אפס גלילה).
   * מעבר מיידי (0ms) בלחיצת עכבר או באמצעות מקשי הספרות `1` עד `9` במקלדת.
   * אפשרות כיווץ הסרגל לרצועת אייקונים צרה בלחיצה על `❮`.
2. **הוספת פרויקט מתיבת בחירה ("+ הוספת פרויקט לתצוגה"):**
   * כפתור קבוע בתחתית הסרגל הפותח חלונית בחירה בעברית: **"בחירת תיקיית פרויקט להצגה"**.
   * כולל גילוי אוטומטי של פרויקטים במחשב וכן פתיחת סייר תיקיות (`Folder Picker`) או הזנת נתיב.
3. **מנוע מיקוד והבלטת סיום שלב (Focus Beacon — ללא צליל):**
   * כאשר בפרויקט מקביל ברקע מתרחש **מעבר שלב/פאזה**, **הגשת דו״ח ביצוע (Report)**, **סיום סקירה (Review)** או **סיום כל תוכנית הפרויקט** — הכפתור של אותו פרויקט בסרגל הימני מואר ב**מסגרת זהובה פועמת** עם תגית `🔔 שלב הושלם! למעבר 👈`.
   * לחיצה על הפרויקט המואר מעבירה את התצוגה אליו ומאפסת את ההתראה אוטומטית.
4. **תצוגה עברית נקייה במבט חטוף + הרחבה בלחיצה ("הרחבה ▾"):**
   * כל רכיב בשלב מוצג כברירת מחדל בשורה אחת תמציתית וברורה בעברית (מיושרת לימין ב-RTL מלא), לצד תגית אמת חיה מהשטח (`✓ קיים בקוד` או `בבנייה`).
   * לחיצה על כל שורה (או על `הרחבת הכל ▾`) פותחת באקורדיון עדין את הפירוט הטכני המלא ושמות הקבצים.

---

## 🗑️ ניהול והסרת פרויקטים מסרגל התצוגה

כאשר פרויקט הסתיים, בוטל או שאינו רלוונטי עוד למעקב שוטף, ניתן להסירו מסרגל הפרויקטים הימני בקלות וללא חשש:

1. **לחיצה על כפתור ההסרה (`✕`):** במעבר עכבר על כרטיסיית הפרויקט בסרגל הימני יופיע כפתור `✕` בפינה השמאלית העליונה של הכרטיסייה.
2. **תיבת אזהרה ואישור מובנית:** לחיצה על `✕` פותחת חלונית אישור המבהירה באופן מפורש:
   > *"הפרויקט עצמו וקובצי הקוד במחשב לא ייפגעו כלל ולא יימחקו. פעולה זו מסירה את הפרויקט מתצוגת הסרגל כאן בלבד."*
3. **שחזור והחזרה לתצוגה בכל עת:** פרויקט שהוסר מהסרגל נשמר ברשימת הפרויקטים המוסתרים. ניתן להחזירו לתצוגה בכל רגע בלחיצה על **"+ הוספת פרויקט לתצוגה"** ולחיצה על **`↺ החזרה לתצוגה`** לצד שם הפרויקט.

---

## 🛡️ עקרונות הברזל והארכיטקטורה
1. **Strict Zero-Footprint (Read-Only):** סריקת הקוד אינה יוצרת, משנה או נוגעת באף קובץ בתיקיית הפרויקט הנסרק. כל הטלמטריה וקובצי ה-HTML נשמרים במרחב מבודד:  
   `~/.gemini/antigravity/orbit/`
2. **תקציב מסך קשיח 100dvh (Zero-Scroll):** רשת 12 עמודות אסימטרית (4 ימין למהות ומדדים, 5 מרכז לתכולת השלב, 3 שמאל לצעד הבא) לצד סרגל הפרויקטים הימני, המנצלת את המסך במלואו בזום 100% ללא גלילת חלון.
3. **ניסוח עברי ניטרלי מגדרית (Gender-Neutral Microcopy):** כל התפריטים, ההנחיות, ההתראות ותיבות הדו-שיח מנוסחים בשפה שוויונית וניטרלית (שימוש בשמות פעולה כגון *"בחירת תיקייה"*, *"הרחבה"*, *"סגירה"*, *"העתקה"*, *"בהמתנה"* במקום פנייה בלשון זכר).

---

## 🗺️ מנוע המתאמים (Workflow Adapters)

```mermaid
flowchart TD
    Scan["סריקת פרויקט פסיבית"] --> CheckShraga{"האם קיימת תיקיית shraga/ ?"}
    CheckShraga -- כן --> Shraga["Shraga First-Class Adapter<br/>(PHASE.md, Plan.md, reports, reviews)"]
    CheckShraga -- לא --> CheckPlan{"האם קיים Plan.md / ROADMAP.md ?"}
    CheckPlan -- כן --> Plan["Plan.md / Milestone Adapter<br/>(רשימות תיוג [x] / [ ], ספרינט פעיל)"]
    CheckPlan -- לא --> Git["Generic Git & Workspace Adapter<br/>(קומיטים, בדיקות + באנר שקיפות מובנה)"]
```

---

## 🚀 מדריך הפעלה שוטפת (Quick Start)

### הפעלה מתוך Antigravity:
```bash
/orbit
```
**כינויים וטריגרים נוספים:** `/dashboard`, `/dash`, `דשבורד`, `מעוף הציפור`, `סטטוס פרויקט`.

### מקשי קיצור בדשבורד:
* `1` עד `9` — מעבר מיידי בין פרויקטים בסרגל הימני.
* `T` — החלפת מצב תצוגה בין בהיר (Light) לכהה (Dark).
* `R` — רענון נתונים מיידי.
* `Esc` — סגירת חלוניות ("אודות" / "בחירת תיקייה" / "הסרת פרויקט").

---

## 🧪 בקרת איכות ואימות (QA Gate)
הפלאג-אין נבדק תחת מפרט QA קפדני בן 12 תרחישי בדיקה אוטומטיים (`tests/run-all-tests.mjs`):
* **אימות Zero-Footprint מתמטי:** 100% שוויון בינארי בתיקיית היעד לפני ואחרי סריקה.
* **ביצועי סריקה:** ~2.5ms לפרויקט (רף מקסימלי: < 200ms).
* **בידוד וסנכרון בריבוי פרויקטים:** ניהול מרכזי ב-`orbit-hub.json` לצד תיקיות מבודדות לכל פרויקט.
* **ציון איכות:** **12/12 בדיקות עברו בהצלחה (100% Pass Rate)**.

---

## 📁 מבנה הקבצים במאגר
```
orbit-dashboard/
├── Install-Orbit.bat           # מתקין אוטומטי בלחיצה כפולה (עובד גם ישירות מתוך ZIP)
├── install-orbit.ps1           # סקריפט התקנה ופתיחה ב-PowerShell
├── INSTALL-HEBREW.md           # מדריך התקנה קצר בעברית ניטרלית למשתמש חדש
├── plugin.json                 # מניפסט הפלאג-אין הרשמי ל-Antigravity (v2.2.0)
├── README.md                   # תיעוד מלא ומדריך התקנה והפעלה
├── docs/                       # מסמכי תכנון ואיכות מאושרים
│   ├── PRD.md                  # מסמך דרישות המוצר המלא
│   ├── Plan.md                 # תוכנית הפאזות והשלבים
│   └── QA_TEST_PLAN.md         # תוכנית הבדיקות המקיפה (Senior QA Gate)
├── skills/                     # סקילי הפלאג-אין
│   └── orbit/
│       └── SKILL.md            # פלייבוק ההפעלה, Onboarding ושאלות מנחות
├── templates/                  # מנוע התצוגה ה-100dvh (Multi-Project Hub)
│   └── orbit-view.html         # תבנית HTML עצמאית ללא גלילה + סרגל פרויקטים, הסרה ו-Focus Beacon
├── adapters/                   # מנוע המתאמים והתרגום העברי
│   ├── adapter-orchestrator.mjs # מנהל התיאום, ביצועים ומדידת זמנים
│   ├── hebrew-normalizer.mjs   # מנוע תמצות אנושי בעברית ניטרלית (RTL) ואימות קבצים חי
│   ├── shraga-adapter.mjs      # מתאם שרגא (כולל תמיכה בשלב אפיון ראשוני לפני Plan.md)
│   ├── plan-adapter.mjs        # מתאם Plan.md ומשימות
│   ├── git-adapter.mjs         # מתאם Git גנרי + באנר שקיפות
│   └── theme-extractor.mjs     # שאיבת צבעים מקבצי עיצוב ואכיפת ניגודיות WCAG AAA
├── scripts/                    # סקריפטי ריצה וסריקה
│   └── orbit-scanner.mjs       # מנוע הסריקה הרב-פרויקטלי, זיהוי תיקיות והתראות FOCUS
└── tests/                      # מערך הבדיקות האוטומטי
    ├── run-all-tests.mjs       # מריץ כל 12 בדיקות ה-QA המלאות
    ├── test-ui-template.mjs    # אימות תבנית ה-UI והמרקרים
    ├── test-adapters.mjs       # אימות המתאמים ואפס-מגע
    └── test-onboarding-daemon.mjs # אימות בידוד בריבוי פרויקטים
```
