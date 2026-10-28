/**
 * Orbit Dashboard - UI Template Validation & Demo Generator
 * Verifies Phase 1 deliverables: 100dvh layout, Time-Machine, Ticker, About modal, Theming.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, '..', 'templates', 'orbit-view.html');
const testOutputDir = path.join(process.env.USERPROFILE || 'C:\\Users\\dymvi', '.gemini', 'antigravity', 'orbit', 'projects', 'test-preview');

console.log('🧪 Starting Phase 1 UI Template Verification...');

// 1. Verify Template exists
if (!fs.existsSync(templatePath)) {
  console.error('❌ Template not found at:', templatePath);
  process.exit(1);
}
const templateHtml = fs.readFileSync(templatePath, 'utf-8');
console.log('✓ Found template file:', templatePath, `(${templateHtml.length} bytes)`);

// 2. Validate Essential Elements
const requiredMarkers = [
  'id="headerProjectTitle"',
  'id="headerAdapterBadge"',
  'id="tickerClock"',
  'id="tickerRelative"',
  'id="roadmapContainer"',
  'id="historyNoticeBanner"',
  'id="transparencyBanner"',
  'id="col1PhaseTitle"',
  'id="col2DeliverablesList"',
  'id="aboutModal"',
  '100dvh',
  'Honest State Machine'
];

let allMarkersFound = true;
for (const marker of requiredMarkers) {
  if (!templateHtml.includes(marker)) {
    console.error(`❌ Missing required marker: ${marker}`);
    allMarkersFound = false;
  }
}

if (!allMarkersFound) {
  process.exit(1);
}
console.log('✓ All 12 architectural markers and 100dvh layout elements verified!');

// 3. Create Sample Project State (Kal Kesef realistic simulation)
const mockState = {
  projectName: 'קל כסף (Kal Kesef)',
  adapterName: 'Shraga First-Class Harness',
  activePhaseIndex: 1,
  macroProgressPercent: 40,
  totalTests: 119,
  isGenericGit: false,
  pollFrequency: 'כל 2 דקות (Daemon שקט)',
  timestamp: Date.now(),
  theme: {
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    bg: '#0f172a'
  },
  phases: [
    {
      title: 'תשתית ושלד',
      subtitle: 'Setup, טוקנים ו-Dexie',
      status: 'completed',
      stageLabel: 'FOUNDATION',
      description: 'הקמת שלד הפרויקט (React 19 + TypeScript + Vite + Tailwind + Dexie.js), הגדרת שפת העיצוב HDS, ותשתיות אבטחה מקומיות.',
      testsCount: '48',
      testsLabel: 'בדיקות תשתית עברו',
      gateScore: '✓ Approved',
      gateLabel: 'אישור שרגא',
      verdict: 'Approved with conditions',
      nextActionHeader: 'סטטוס פאזה 0:',
      nextActionSub: 'פאזה סגורה ומאושרת:',
      nextActionBody: 'התשתית הושלמה ואושרה במלואה ע״י שרגא. בוצע מעבר תקין לפאזה 1.',
      deliverables: [
        { status: 'done', title: 'אתחול פרויקט React 19 ו-Vite', desc: 'קונפיגורציה מלאה עם Tailwind ו-TypeScript קפדני.' },
        { status: 'done', title: 'הקמת מסד נתונים מקומי Dexie.js', desc: 'שכבת IndexedDB אופליין-פירסט ללא שרת חיצוני.' },
        { status: 'done', title: 'טוקנים של שפת העיצוב HDS', desc: 'פלטת כחול/שזיף, טיפוגרפיית Assistant ו-RTL מלא.' }
      ]
    },
    {
      title: 'הכנסות והוצאות (Core MVP)',
      subtitle: 'Core MVP · 119 בדיקות',
      status: 'active',
      stageLabel: 'STAGE 4: ACTIVE BUILD',
      description: 'מתן אפשרות לילדה בת 12 לתעד כל שקל שנכנס (דמי כיס, מתנות, עבודות) וכל הוצאה, לראות יתרה מדויקת וסיכום חודשי — הכל באגורות שלמות ללא שגיאות Float.',
      testsCount: '119',
      testsLabel: 'בדיקות יחידה עברו',
      gateScore: '4 / 4 E2E',
      gateLabel: 'בדיקות E2E עברו',
      verdict: 'Approved with conditions',
      nextActionHeader: 'מה נדרש כעת מול Claude Code?',
      nextActionSub: 'השלב המיידי לפעולה:',
      nextActionBody: 'הקוד והבדיקות הושלמו בהצלחה (119/119). נדרש לבצע commit לקוד, לסגור את פאזה 1 ולקדם את מצביע הפאזה ב-<code>shraga/PHASE.md</code> ל-2.',
      suggestedPrompt: 'בצע commit מסודר לכל קבצי פאזה 1, עדכן את shraga/PHASE.md לערך 2, והכן את הפרומפט לתחילת פאזה 2.',
      deliverables: [
        { status: 'done', title: 'טופס הוספה/עריכה (EntrySheet)', desc: 'בורר סוג הכנסה/הוצאה, ספרות בלבד, קטגוריות דינמיות.' },
        { status: 'done', title: 'מסך בית והיסטוריה (Home & History)', desc: 'יתרה נוכחית, סינון תנועות ו-Undo למחיקה.' },
        { status: 'active', title: 'סגירת 5 תנאי הביקורת של שרגא', desc: 'תיעוד בדיקות יציבות, אזהרת איפוס וניקוי שאריות קוד.' },
        { status: 'planned', title: 'קידום פאזה ל-2 (ריבית דריבית)', desc: 'מעבר לפיתוח מחשבון הריבית והיעדים.' }
      ]
    },
    {
      title: 'ריבית דריבית ויעדים',
      subtitle: 'מחשבון, גרף צמיחה',
      status: 'planned',
      stageLabel: 'UPCOMING',
      description: 'המחשת כוחה של ריבית דריבית: סליידרים להפקדה חודשית וריבית, גרף צמיחה שנתי (SVG מקומי), הסבר פשוט לילדה ושמירת חישוב כיעד חיסכון.',
      testsCount: '0',
      testsLabel: 'בדיקות צפויות',
      gateScore: '--',
      gateLabel: 'שער איכות עתידי',
      verdict: 'Pending Phase 1 Close',
      nextActionHeader: 'פאזה עתידית',
      nextActionSub: 'טרם החלה:',
      nextActionBody: 'תחל מיד לאחר סגירה רשמית של פאזה 1.',
      deliverables: [
        { status: 'planned', title: 'מחשבון ריבית דריבית אינטראקטיבי', desc: 'סליידרים להפקדה חודשית, ריבית (0-20%) וטווח שנים.' },
        { status: 'planned', title: 'גרף צמיחה שנתי (SVG מקומי)', desc: 'תרשים המפריד ויזואלית בין הקרן שנחסכה לרווח מריבית.' },
        { status: 'planned', title: 'שמירת יעד חיסכון במסך הבית', desc: 'הפיכת תוצאת החישוב למדד התקדמות ויזואלי.' }
      ]
    }
  ]
};

// 4. Inject Mock State into HTML for verification
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

const injectedHtml = templateHtml.replace(
  'let orbitState = window.ORBIT_DATA || null;',
  `let orbitState = ${JSON.stringify(mockState, null, 2)};`
);

const testHtmlFile = path.join(testOutputDir, 'index.html');
const testJsonFile = path.join(testOutputDir, 'orbit-state.json');

fs.writeFileSync(testHtmlFile, injectedHtml, 'utf-8');
fs.writeFileSync(testJsonFile, JSON.stringify(mockState, null, 2), 'utf-8');

console.log('✓ Successfully rendered live preview to:', testHtmlFile);
console.log('✓ Successfully serialized state to:', testJsonFile);
console.log('🎉 Phase 1 UI Verification PASSED!');
