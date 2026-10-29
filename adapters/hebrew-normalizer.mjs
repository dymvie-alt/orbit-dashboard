/**
 * Orbit Dashboard - Hebrew Normalizer & Localization Engine (v2.1)
 * Standardizes phase titles, objectives, features, acceptance criteria, and risk gates
 * into concise, natural Hebrew (RTL-first) while preserving original English terms,
 * code identifiers, file paths, and acronyms wrapped cleanly for bidirectional rendering.
 */

import fs from 'fs';
import path from 'path';

export class HebrewNormalizer {
  /**
   * Normalizes phase titles (e.g. "Foundation", "Task Board (Core MVP)", "UI with demo data")
   * @param {string} rawTitle
   * @param {number} phaseNum
   * @returns {string} Natural Hebrew title with original technical terms (Single non-duplicated prefix)
   */
  static normalizePhaseTitle(rawTitle, phaseNum = 0) {
    if (!rawTitle) return `שלב ${phaseNum}`;

    let trimmed = rawTitle.trim();

    // Strip any existing leading "Phase X:", "פאזה X:", "שלב X:" to prevent duplication!
    trimmed = trimmed.replace(/^(?:Phase|פאזה|שלב)\s*\d+[:\s\-]*/i, '').trim();

    // If already primarily Hebrew, prefix cleanly and return
    const hebrewCharCount = (trimmed.match(/[\u0590-\u05FF]/g) || []).length;
    if (hebrewCharCount > trimmed.length * 0.4) {
      return `שלב ${phaseNum}: ${trimmed}`;
    }

    // Common phase title dictionaries (Clean Hebrew, minimal clutter)
    const titleMap = [
      { pattern: /^foundation|^setup|^scaffold|^infra/i, hebrew: 'תשתית ושלד המערכת' },
      { pattern: /income\s*&\s*expense.*core\s*mvp/i, hebrew: 'מעקב הכנסות והוצאות (ליבה)' },
      { pattern: /compound\s*interest.*goals/i, hebrew: 'מחשבון ריבית דריבית ויעדים' },
      { pattern: /backup.*reminder.*pwa/i, hebrew: 'גיבוי נתונים, תזכורות ו-PWA' },
      { pattern: /task\s*board.*core\s*mvp/i, hebrew: 'לוח משימות יומי (ליבת המערכת)' },
      { pattern: /^core\s*mvp/i, hebrew: 'ליבת המערכת (MVP)' },
      { pattern: /ui\s+with\s+demo\s+data/i, hebrew: 'ממשק משתמש ונתוני הדגמה' },
      { pattern: /supabase.*auth.*data.*files.*rls/i, hebrew: 'בסיס נתונים, הזדהות ואבטחת מידע' },
      { pattern: /admin\s+interface/i, hebrew: 'ממשק ניהול ובקרה (Admin)' },
      { pattern: /balance\s*scale/i, hebrew: 'מאזניים חיים בזמן אמת' },
      { pattern: /carry[-\s]*over/i, hebrew: 'העברת משימות מיום קודם' },
      { pattern: /live\s*deploy.*device\s*verification/i, hebrew: 'העלאה לאוויר ואימות במכשיר' },
      { pattern: /second\s*host.*vercel/i, hebrew: 'פריסה משנית וגיבוי שרת (Vercel)' },
      { pattern: /deployment.*production.*readiness/i, hebrew: 'פריסה ומוכנות לפרודקשן' },
      { pattern: /deployment|deploy|release|launch/i, hebrew: 'פריסה והשקה' },
      { pattern: /production\s*readiness/i, hebrew: 'מוכנות לפרודקשן ואבטחה' },
      { pattern: /testing|qa|audit/i, hebrew: 'בדיקות איכות ואימות' },
      { pattern: /auth|authentication|security/i, hebrew: 'אבטחה והרשאות' },
      { pattern: /pwa|offline/i, hebrew: 'עבודה במצב לא-מקוון (PWA)' }
    ];

    for (const entry of titleMap) {
      if (entry.pattern.test(trimmed)) {
        return `שלב ${phaseNum}: ${entry.hebrew}`;
      }
    }

    return `שלב ${phaseNum}: ${trimmed}`;
  }

  /**
   * Translates stage badges and lifecycle states into natural Hebrew
   */
  static normalizeStage(stageStr) {
    if (!stageStr) return 'שלב 4: סשן בנייה פעיל';

    const s = stageStr.toUpperCase();
    if (s.includes('BUILD')) return 'שלב 4: סשן בנייה פעיל';
    if (s.includes('REVIEW')) return 'שלב 5: ביקורת ארכיטקטורה';
    if (s.includes('REPORT')) return 'שלב 6: דו״ח ביצוע';
    if (s.includes('GATE') || s.includes('CLOSE')) return 'שלב 7: שער איכות וסגירה';
    if (s.includes('COMPLETED') || s.includes('DONE')) return 'הושלם ואושר ✓';
    if (s.includes('PLANNED') || s.includes('UPCOMING')) return 'מתוכנן להמשך ○';
    if (s.includes('ACTIVE')) return 'ספרינט פעיל כעת ⚡';

    return stageStr;
  }

  /**
   * Normalizes verdicts (Approved, Approved with conditions, Rejected)
   */
  static normalizeVerdict(verdictStr) {
    if (!verdictStr) return 'ממתין להשלמת בנייה';

    const v = verdictStr.toLowerCase();
    if (v.includes('approved with conditions')) return 'אושר עם תנאים';
    if (v.includes('approved')) return 'אושר מלא ✓';
    if (v.includes('reject')) return 'נדחה לתיקונים';
    if (v.includes('pending')) return 'ממתין להשלמת בנייה';

    return verdictStr;
  }

  /**
   * Translates common objectives/features descriptions into natural, scannable Hebrew (RTL-first)
   */
  static cleanDescription(desc) {
    if (!desc) return '';
    let out = desc.trim();

    out = out.replace(/^(?:Objectives|יעדי הפאזה|The core feature|Features)[:\s\-]*/i, '').trim();

    const hebrewCount = (out.match(/[\u0590-\u05FF]/g) || []).length;
    if (hebrewCount > out.length * 0.35) {
      return out;
    }

    const objPatterns = [
      {
        pattern: /runnable skeleton.*project rules.*secured schema.*test tooling.*visual shell/i,
        hebrew: 'הקמת שלד הפרויקט הרץ, הגדרת חוקי העבודה, יצירת סכמת הנתונים המאובטחת ב-Supabase, חיבור תשתית הבדיקות ובניית מעטפת הממשק בעברית כולל הודעת הפרטיות.'
      },
      {
        pattern: /runnable skeleton with design tokens.*data model.*test tooling/i,
        hebrew: 'הקמת שלד האפליקציה עם משתני העיצוב, מודל הנתונים המקומי בדפדפן ותשתית בדיקות אוטומטית מלאה.'
      },
      {
        pattern: /runnable empty app.*project rules.*test tooling.*rtl shell/i,
        hebrew: 'הקמת שלד האפליקציה הרץ, הגדרת חוקי פרויקט ואבטחה, חיבור כלי הבדיקות ובניית מעטפת הממשק בעברית.'
      },
      {
        pattern: /manages today's tasks end to end.*persisted in supabase/i,
        hebrew: 'ניהול משימות היום מקצה לקצה (הוספה, סימון ביצוע ומחיקה) בשתי עמודות – עבודה ופנאי – עם שמירה חיה ב-Supabase ועדכון אופטימי.'
      },
      {
        pattern: /record money in and out.*correct balance/i,
        hebrew: 'תיעוד הכנסות והוצאות, חישוב יתרה מדויק באגורות, סינון היסטוריה חודשית וסיכום לפי קטגוריות בעבודה ללא אינטרנט.'
      },
      {
        pattern: /full user experience on demo data.*no backend/i,
        hebrew: 'חוויית משתמש מלאה על בסיס נתוני הדגמה: ספריית פריטים, חיפוש וסינון מתקדם לפי תגיות, וטופס הוספה ועריכה מלא.'
      },
      {
        pattern: /replace demo storage with real.*secured data/i,
        hebrew: 'החלפת נתוני ההדגמה בבסיס נתונים אמיתי ומאובטח ב-Supabase: הזדהות בקוד חד-פעמי למייל, הרשאות גישה, העלאת קבצים וחיפוש בצד השרת.'
      },
      {
        pattern: /real-time scale driven by the balance rules/i,
        hebrew: 'פיצ׳ר הליבה של המערכת: רכיב מאזניים חי המחשב ומציג בזמן אמת את האיזון היומי בין עבודה לפנאי, כולל זווית הטיה והודעות שיקוף.'
      },
      {
        pattern: /compound interest.*personal goal/i,
        hebrew: 'מחשבון ריבית דריבית אינטראקטיבי עם גרף צמיחה שנתי והפיכת חישוב ליעד חיסכון אישי עם מעקב התקדמות.'
      },
      {
        pattern: /unfinished work is postponed or surfaced.*never lost/i,
        hebrew: 'מנגנון העברת משימות פתוחות מיום קודם ודחיית משימות למחר, כך שאף משימה לא הולכת לאיבוד.'
      },
      {
        pattern: /data is safe.*installs and works offline like a real app/i,
        hebrew: 'גיבוי ושחזור נתונים מלא לקובץ, תזכורת גיבוי שבועית והפיכת האפליקציה לניתנת להתקנה בטלפון (PWA) ללא אינטרנט.'
      },
      {
        pattern: /admin manages all items and users.*visibility/i,
        hebrew: 'ממשק ניהול ובקרה למנהלים: אישור וחסימת משתמשים, ניהול הרשאות צפייה בפריטים ויומן אירועים מאובטח.'
      },
      {
        pattern: /app runs on vercel.*safely/i,
        hebrew: 'פריסת האפליקציה לפרודקשן ב-Vercel, הקשחת אבטחה, בדיקות רגרסיה מקצה לקצה והשלמת חלון "אודות" ותיעוד.'
      },
      {
        pattern: /safe to share with the team/i,
        hebrew: 'הכנה מלאה לפרודקשן ולשיתוף צוותי: סביבת ייצור ב-Supabase ו-Vercel, מבדק אבטחה מלא, גיבויים ובדיקות קצה.'
      },
      {
        pattern: /verified.*committed release candidate.*ready to deploy/i,
        hebrew: 'הכנת גרסה מוכחת ומאובטחת לפריסה: כותרות אבטחה, בדיקות רגרסיה מלאות, נגישות ומסך שגיאות בעברית.'
      },
      {
        pattern: /runs on her phone from the real host/i,
        hebrew: 'פריסה חיה לשרת האמיתי ואימות מלא על מכשיר הטלפון: התקנת האפליקציה, בדיקת שיתוף וגיבוי, ואימות כותרות אבטחה באוויר.'
      },
      {
        pattern: /same build also runs on vercel.*security headers/i,
        hebrew: 'פריסה מקבילה ב-Vercel עם כותרות אבטחה זהות לצורכי יתירות וגיבוי שרת.'
      }
    ];

    for (const item of objPatterns) {
      if (item.pattern.test(out)) {
        return item.hebrew;
      }
    }

    let translated = out
      .replace(/\brunnable skeleton\b/gi, 'שלד פרויקט רץ')
      .replace(/\bproject rules\b/gi, 'חוקי פרויקט')
      .replace(/\bsecured schema\b/gi, 'סכמת נתונים מאובטחת')
      .replace(/\btest tooling\b/gi, 'תשתית בדיקות')
      .replace(/\bvisual shell\b/gi, 'מעטפת ממשק')
      .replace(/\bprivacy notice\b/gi, 'הודעת פרטיות')
      .replace(/\bdesign tokens\b/gi, 'משתני עיצוב')
      .replace(/\bdata model\b/gi, 'מודל נתונים');

    return translated;
  }

  /**
   * Translates a technical feature item from Plan.md into:
   * - title: Clean, 4-6 word Hebrew headline (NO code brackets or clutter, for single-glance view)
   * - desc: Detailed Hebrew + technical terms explanation (shown ONLY when user clicks "הרחב")
   * - fileHints: Array of file/folder paths for live workspace verification
   */
  static humanizeFeatureItem(rawFeature) {
    const clean = rawFeature.replace(/^\s*[-*]\s*(?:\[[ xX]\]\s*)?/, '').trim();

    const fileHints = [];
    const codeMatches = clean.match(/`([^`]+)`/g) || [];
    for (const m of codeMatches) {
      const inner = m.replace(/`/g, '').trim();
      if (inner.includes('/') || inner.includes('.') || inner.endsWith('.js') || inner.endsWith('.ts') || inner.endsWith('.css') || inner.endsWith('.md') || inner.endsWith('.json')) {
        fileHints.push(inner.replace(/^\//, ''));
      }
    }

    // Clean Hebrew headlines + Expandable details
    const rules = [
      // Foundation / Skeleton
      {
        match: /vite\s+vanilla\s+project|modules:.*src\/main\.js/i,
        title: 'הקמת שלד האפליקציה ומודולי הליבה',
        desc: 'פרויקט Vite Vanilla הכולל את המודולים: ניהול תאריכים (src/dates.js), חישוב מאזניים (src/balance.js), גישה לנתונים (src/tasksRepo.js), קטלוג הודעות (src/messages.js) ומשתני עיצוב (src/styles/tokens.css).'
      },
      {
        match: /vite\s*\+\s*react\s*\+\s*ts\s+project/i,
        title: 'הקמת שלד אפליקציית React ו-TypeScript',
        desc: 'פרויקט Vite + React + TS בגרסאות יציבות עם הפרדת שכבות ברורה (Domain, Repository, UI).'
      },
      {
        match: /repo\s+skeleton.*index\.html.*vercel\.json/i,
        title: 'הקמת שלד הפרויקט וכותרות אבטחה',
        desc: 'יצירת מבנה התיקיות הראשי (index.html, css/, js/, tests/) והגדרת כותרות אבטחה (CSP, nosniff) בקובץ vercel.json.'
      },
      // Rules / Claude
      {
        match: /\.claude\/rules\/project\.md/i,
        title: 'הגדרת חוקי עבודה ומוסכמות פרויקט',
        desc: 'יצירת הקובץ .claude/rules/project.md הכולל פקודות הרצה, בדיקות ו-Lint, מוסכמות תיקיות וכללי פיתוח לסוכן.'
      },
      // Supabase / Migrations / Schema
      {
        match: /supabase\/migrations\/|tasks.*per\s+prd\s+section\s+8/i,
        title: 'יצירת טבלת המשימות והרשאות אבטחה ב-Supabase',
        desc: 'מיגרציית SQL בתיקיית supabase/migrations ליצירת טבלת tasks עם אילוצי תקינות (CHECKs), הפעלת RLS והגבלת הרשאות גישה.'
      },
      {
        match: /dedicated\s+dev\s+supabase\s+project/i,
        title: 'חיבור סביבת פיתוח ומיגרציות ב-Supabase',
        desc: 'חיבור פרויקט פיתוח ייעודי (prompt-hub-dev) ב-Supabase ושמירת כל מיגרציות ה-SQL במאגר הקוד.'
      },
      {
        match: /^schema:\s*profiles.*items.*tags/i,
        title: 'יצירת טבלאות בסיס נתונים והרשאות גישה',
        desc: 'הגדרת טבלאות משתמשים (profiles), פריטים (items) ותגיות (tags) עם אילוצי שלמות והפעלת מדיניות אבטחה (RLS) מלאה.'
      },
      {
        match: /dexie\s+schema\s+v1/i,
        title: 'הקמת בסיס נתונים מקומי בדפדפן',
        desc: 'הגדרת סכמת Dexie (IndexedDB) עבור תנועות, קטגוריות, יעדים והגדרות, כולל הזרעת קטגוריות ברירת מחדל.'
      },
      // Env vars
      {
        match: /\.env\.example.*vite_supabase/i,
        title: 'הגדרת משתני סביבה ואבטחת מפתחות',
        desc: 'יצירת תבנית .env.example עם כתובת ה-Supabase והמפתח הפומבי בלבד (Publishable Key), וחסימת קובץ .env מ-Git.'
      },
      // Tests & Tooling
      {
        match: /vitest\s+with\s+one\s+passing\s+test.*playwright/i,
        title: 'חיבור תשתית בדיקות אוטומטית ובדיקת איכות',
        desc: 'הגדרת מנוע בדיקות יחידה (Vitest), בדיקת עשן מקצה לקצה (Playwright Smoke Test) ופקודת Lint.'
      },
      {
        match: /node\s+test\s+runner\s+configured.*playwright/i,
        title: 'הגדרת תשתית בדיקות יחידה ובדיקות קצה',
        desc: 'חיבור מריץ הבדיקות המובנה של Node והתקנת Playwright עם בדיקת עשן אוטומטית ראשונה.'
      },
      {
        match: /eslint\s*\+\s*prettier\s*\+\s*strict\s+ts/i,
        title: 'אכיפת איכות קוד ובדיקת טיפוסים קפדנית',
        desc: 'הגדרת ESLint, Prettier ובדיקת טיפוסים מחמירה (Strict TypeScript).'
      },
      // UI Shell / RTL / Design System
      {
        match: /static\s+rtl\s+shell\s+on\s+design_system/i,
        title: 'בניית מעטפת הממשק בעברית והודעת הפרטיות',
        desc: 'שלד מסך רספונסיבי מימין לשמאל לפי DESIGN_SYSTEM.md: כותרת ותאריך, אזור מאזניים וטופס, שתי עמודות משימות והודעת פרטיות.'
      },
      {
        match: /layout\s+shell\s+and\s+navigation\s+following\s+design_system/i,
        title: 'בניית מעטפת הממשק ורכיבי הניווט בעברית',
        desc: 'שלד האפליקציה בעברית (dir="rtl" lang="he") וניווט ראשי בהתאם למשתני העיצוב ב-DESIGN_SYSTEM.md.'
      },
      {
        match: /layout\s+shell\s+with\s+bottom\s+nav/i,
        title: 'בניית מעטפת האפליקציה וסרגל ניווט תחתון',
        desc: 'מסגרת אפליקציה מותאמת למובייל בעברית עם ניווט תחתון (בית, היסטוריה, מחשבון, יעדים) ומסך הגדרות.'
      },
      // Phase 1 ZenScale / Task Board
      {
        match: /^`?dates\.js`?.*today\(\).*tomorrow\(\)/i,
        title: 'מנוע חישוב תאריכים מקומי (היום ומחר)',
        desc: 'מימוש המודול src/dates.js להפקת תאריך היום ומחר בפורמט YYYY-MM-DD לפי שעון המשתמש.'
      },
      {
        match: /^`?tasksrepo\.js`?.*listbydate.*createtask/i,
        title: 'שכבת תקשורת מול בסיס הנתונים למשימות',
        desc: 'מימוש src/tasksRepo.js: שליפת משימות לפי תאריך, יצירה, עדכון סטטוס ומחיקה מול Supabase עם הצפת שגיאות.'
      },
      {
        match: /^`?tasksrepo\.js`?.*postpone.*listopenbefore/i,
        title: 'שכבת נתונים לדחייה והעברת משימות פתוחות',
        desc: 'הרחבת src/tasksRepo.js עם פעולות דחייה למחר (postpone), שליפת משימות פתוחות מימים קודמים והעברה מרוכזת להיום.'
      },
      {
        match: /add-task\s+form\s+per\s+design_system/i,
        title: 'טופס הוספת משימה מהיר ונוח',
        desc: 'טופס יצירת משימה לפי שפת העיצוב עם שליחה במקש Enter ושמירת הקטגוריה והמשקל האחרונים שנבחרו.'
      },
      {
        match: /^board:\s*work\s*\/\s*pleasure\s+columns/i,
        title: 'לוח משימות בשתי עמודות: עבודה ופנאי',
        desc: 'תצוגת עמודות עם מונה משימות שהושלמו, סידור משימות פתוחות בראש הרשימה, סימון ביצוע ומחיקה.'
      },
      {
        match: /optimistic\s+updates\s+with\s+revert/i,
        title: 'עדכון ממשק מיידי וטיפול חכם בשגיאות רשת',
        desc: 'עדכון אופטימי של הלוח עם שחזור אוטומטי והודעת שגיאה במקרה של תקלה, כולל שלדי טעינה ומצבים ריקים.'
      },
      {
        match: /titles\s+via\s+`?textcontent`?.*unicode-bidi/i,
        title: 'הגנה מהזרקת קוד ותמיכה בטקסט דו-כיווני',
        desc: 'הצגת כותרות משימות כטקסט נקי בלבד (textContent) ובידוד כיווניות לשילוב תקין של עברית ואנגלית.'
      },
      {
        match: /scale\s+card\s+stays\s+a\s+static\s+placeholder/i,
        title: 'שמירת אזור המאזניים הסטטי לשלב הבא',
        desc: 'השארת כרטיס המאזניים כממלא מקום קבוע עד להטמעת מנוע החישוב החי בשלב 2.'
      },
      // Phase 2 ZenScale / Balance Scale
      {
        match: /^`?balance\.js`?\s*\(pure\)|computebalance/i,
        title: 'מנוע חישוב איזון יומי בין עבודה לפנאי',
        desc: 'מימוש פונקציה טהורה ב-src/balance.js המחשבת ניקוד עבודה מול פנאי, פער, מצב איזון, זווית הטיה וצבע.'
      },
      {
        match: /^`?messages\.js`?.*five\s+fixed\s+messages/i,
        title: 'קטלוג הודעות שיקוף למצבי האיזון',
        desc: 'הטמעת חמש הודעות השיקוף הקבועות בעברית שוויונית ב-src/messages.js בהתאם למצב המאזניים.'
      },
      {
        match: /scale\s+component\s+per\s+design_system/i,
        title: 'רכיב מאזניים ויזואלי עם אנימציית הטיה',
        desc: 'בניית המאזניים החיים לפי DESIGN_SYSTEM.md: הטיית זרוע ב-CSS, כפות מאזניים מתאזנות, סכומים והכרזת נגישות.'
      },
      {
        match: /recompute\s+on\s+load\s+and\s+after\s+every\s+add/i,
        title: 'סנכרון מאזניים אוטומטי וכיבוד העדפות תנועה',
        desc: 'חישוב מחדש של המאזניים בכל טעינה, הוספה, סימון או מחיקה, והתאמה מלאה להגדרת הפחתת תנועה (Reduced Motion).'
      },
      // Phase 3 ZenScale / Carry-over
      {
        match: /postpone\s+button.*3-second\s+inline\s+confirmation/i,
        title: 'כפתור דחיית משימה למחר עם חיווי אישור',
        desc: 'הוספת פעולת דחייה במשימות פתוחות המציגה אישור מוטבע למשך 3 שניות ומעבירה את המשימה ליום הבא.'
      },
      {
        match: /carry-over\s+panel\s+per\s+prd/i,
        title: 'תיבה מתקפלת למשימות פתוחות מימים קודמים',
        desc: 'פאנל המציג כמה משימות נותרו פתוחות מאתמול, עם אפשרות להעביר משימה בודדת, להעביר הכל להיום או למחוק.'
      },
      {
        match: /scale\s+recalculates\s+after\s+moves/i,
        title: 'עדכון אוטומטי של המאזניים לאחר העברת משימות',
        desc: 'סנכרון מיידי של חישוב האיזון היומי לאחר העברה או דחייה של משימות.'
      },
      // Phase 4 ZenScale / Deployment
      {
        match: /vercel\s+project\s+with\s+build\s+command/i,
        title: 'חיבור הפרויקט ופריסה לשרת Vercel',
        desc: 'הגדרת תהליך הבנייה ומשתני הסביבה ב-Vercel תוך שימוש במפתח פומבי בלבד.'
      },
      {
        match: /^readme:\s*setup.*env\s+vars/i,
        title: 'כתיבת מדריך הפעלה ותחזוקה מלא (README)',
        desc: 'תיעוד התקנה, משתני סביבה, מיגרציות, פריסה, הפשרת בסיס הנתונים ב-Supabase והנחיות אבטחה.'
      },
      {
        match: /full\s+regression.*e2e\s+against\s+the\s+vercel/i,
        title: 'בדיקות מערכת מלאות מול השרת החי',
        desc: 'הרצת כל בדיקות הרגרסיה ובדיקות הקצה (E2E) ישירות מול כתובת הפריסה ב-Vercel.'
      },
      {
        match: /security\s+audit.*shraga-security.*npm\s+audit/i,
        title: 'מבדק אבטחה מקיף ובדיקת תלויות',
        desc: 'סקירת אבטחה מלאה (OWASP), בדיקת יועץ האבטחה של Supabase ואימות היעדר חולשות בחבילות הקוד.'
      },
      {
        match: /about\s+dialog\s+per\s+prd/i,
        title: 'חלון "אודות" עם חיווי גרסה ותאריך בנייה',
        desc: 'כפתור מידע בכותרת הפותח חלון אודות תקני עם פרטי המערכת, מספר גרסה 1.0.0 ותאריך הפצה אוטומטי.'
      },
      // Prompt Hub features
      {
        match: /^library\s+screen:\s*item\s+cards/i,
        title: 'מסך ספריית פריטים, חיפוש וסינון',
        desc: 'תצוגת כרטיסיות, חיפוש טקסט חופשי, סינון לפי מספר תגיות, מתג "הפריטים שלי" ומצבי מסך ריק.'
      },
      {
        match: /^tags:\s*prompt,\s*skill/i,
        title: 'מערכת תגיות מובנית ותגיות משתמש',
        desc: 'תגיות ליבה בעברית (פרומפט, סקיל, פלאגין, סוכן, מערכת, אחר) ואפשרות להוספת תגיות חדשות.'
      },
      {
        match: /^item\s+detail:\s*description/i,
        title: 'מסך פרטי פריט ופעולות מהירות',
        desc: 'הצגת תיאור, שם היוצר, תאריך, תגיות ותוכן מלא עם כפתורי העתקה, פתיחת קישור והורדת קובץ.'
      },
      {
        match: /add\/edit\/delete\s+item\s+form/i,
        title: 'טופס הוספה, עריכה ומחיקת פריט',
        desc: 'טופס מובנה להזנת שם, תיאור, תוכן טקסטואלי, קישור או קובץ מצורף עם אימות תקינות מלא.'
      },
      {
        match: /12-15\s+hebrew\s+demo\s+items/i,
        title: 'קטלוג פריטי הדגמה עשיר בעברית',
        desc: 'יצירת 12 עד 15 פריטי דמו המדגימים את כל סוגי התגיות והתכנים (טקסט, קישורים וקבצים).'
      },
      {
        match: /new\s+items\s+persist\s+in\s+`?localstorage`?/i,
        title: 'שמירה מקומית של פריטים חדשים במצב דמו',
        desc: 'שמירת פריטים שנוספו בזיכרון הדפדפן (localStorage) והורדת קובץ דוגמה.'
      },
      {
        match: /^auth:\s*email\s+otp/i,
        title: 'הזדהות משתמשים בקוד חד-פעמי ואישור מנהל',
        desc: 'התחברות ב-OTP למייל, בחירת שם תצוגה, מסך המתנה לאישור מנהל עבור משתמשים חדשים והתנתקות.'
      },
      {
        match: /items\s+crud\s+against\s+supabase/i,
        title: 'ניהול פריטים, תגיות וחיפוש בצד השרת',
        desc: 'יצירה, עריכה ומחיקה מול Supabase, חיפוש מאובטח בצד השרת וחלוקה לעמודים (24 פריטים לעמוד).'
      },
      {
        match: /private\s+bucket\s+`?item-files`?/i,
        title: 'אחסון קבצים פרטי ומאובטח בענן',
        desc: 'שמירת קבצים בדלי פרטי (item-files) עד 10MB, סינון סוגי קבצים מותרים וקישורי הורדה חתומים לזמן קצר.'
      },
      {
        match: /demo\s+data\s+removed\s+from\s+the\s+app/i,
        title: 'ניקוי נתוני ההדגמה ומעבר לנתוני אמת',
        desc: 'הסרת פריטי הדמו מקוד האפליקציה והשארת סקריפט הזרעת נתונים לסביבת פיתוח בלבד.'
      }
    ];

    for (const rule of rules) {
      if (rule.match.test(clean)) {
        return {
          title: rule.title,
          desc: rule.desc,
          fileHints
        };
      }
    }

    // Fallback for general lines
    let titlePart = clean;
    let descPart = '';

    if (clean.includes(':')) {
      const idx = clean.indexOf(':');
      titlePart = clean.substring(0, idx).replace(/\*\*/g, '').replace(/`/g, '').trim();
      descPart = clean.substring(idx + 1).replace(/\*\*/g, '').replace(/`/g, '').trim();
    } else if (clean.includes(';')) {
      const idx = clean.indexOf(';');
      titlePart = clean.substring(0, idx).replace(/\*\*/g, '').replace(/`/g, '').trim();
      descPart = clean.substring(idx + 1).replace(/\*\*/g, '').replace(/`/g, '').trim();
    }

    titlePart = HebrewNormalizer.translateShortPhrase(titlePart);
    descPart = HebrewNormalizer.translateShortPhrase(descPart);

    return {
      title: titlePart,
      desc: descPart,
      fileHints
    };
  }

  /**
   * Helper to translate common technical phrases into clean Hebrew
   */
  static translateShortPhrase(text) {
    if (!text) return '';
    let t = text.trim();

    t = t
      .replace(/^Admin area visible only to admins/i, 'אזור ניהול למנהלים בלבד (אכיפת הרשאות בשרת)')
      .replace(/^Users:\s*list,\s*approve\/block/i, 'ניהול משתמשים: רשימה, אישור או חסימה ושינוי תפקיד')
      .replace(/^`?audit_log`?\s+table/i, 'טבלת יומן אירועים ותצוגת ביקורת למנהל')
      .replace(/^Decision needed at planning time/i, 'החלטת אפיון לגבי שיתוף פריטים פרטני')
      .replace(/^Production Supabase project and Vercel deployment/i, 'הקמת סביבת ייצור ב-Supabase ופריסה ב-Vercel')
      .replace(/^Full security audit/i, 'מבדק אבטחה מקיף ובדיקת תלויות')
      .replace(/^Logging and alerts review/i, 'בקרת יומנים, התראות, טיפול בשגיאות ונוהל גיבוי ושחזור')
      .replace(/^Decide malware scanning/i, 'החלטה על סריקת קבצים ואימות דו-שלבי למנהל');

    return t;
  }

  /**
   * Checks if any of the hinted files/directories already exist in the project workspace
   * to provide real-time Honest State verification during an active build!
   */
  static verifyFilesExist(projectPath, fileHints = []) {
    if (!projectPath || !fileHints || fileHints.length === 0) return false;

    for (const hint of fileHints) {
      if (hint.includes(' ')) continue;
      const cleanHint = hint.replace(/^[\/\\]+/, '');
      const fullPath = path.join(projectPath, cleanHint);
      if (fs.existsSync(fullPath)) {
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            const files = fs.readdirSync(fullPath);
            if (files.length > 0) return true;
          } else if (stat.isFile()) {
            return true;
          }
        } catch {
          return false;
        }
      }
    }
    return false;
  }
}
