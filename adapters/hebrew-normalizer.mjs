/**
 * Orbit Dashboard - Hebrew Normalizer & Localization Engine
 * Standardizes phase titles, stage labels, and technical descriptions into clean, natural Hebrew (RTL),
 * while strictly preserving original English terms, code identifiers, file paths, and acronyms.
 */

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

    // Common phase title dictionaries
    const titleMap = [
      { pattern: /^foundation|^setup|^scaffold|^infra/i, hebrew: 'תשתית ושלד (Foundation)' },
      { pattern: /task\s*board.*core\s*mvp/i, hebrew: 'לוח משימות - ליבת המערכת (Core MVP)' },
      { pattern: /^core\s*mvp/i, hebrew: 'ליבת המערכת (Core MVP)' },
      { pattern: /ui\s+with\s+demo\s+data/i, hebrew: 'ממשק משתמש עם נתוני הדגמה (UI with demo data)' },
      { pattern: /admin\s+interface/i, hebrew: 'ממשק ניהול (Admin Interface)' },
      { pattern: /balance\s*scale/i, hebrew: 'מאזניים חיים (Balance Scale)' },
      { pattern: /carry[-\s]*over/i, hebrew: 'העברת משימות פתוחות (Carry-over)' },
      { pattern: /deployment.*production.*readiness/i, hebrew: 'פריסה ומוכנות לפרודקשן (Deployment)' },
      { pattern: /deployment|deploy|release|launch/i, hebrew: 'פריסה והשקה (Deployment)' },
      { pattern: /production\s*readiness/i, hebrew: 'מוכנות לפרודקשן (Production Readiness)' },
      { pattern: /testing|qa|audit/i, hebrew: 'בדיקות איכות ואימות (QA & Testing)' },
      { pattern: /auth|authentication|security/i, hebrew: 'אבטחה והרשאות (Auth & Security)' },
      { pattern: /pwa|offline/i, hebrew: 'שרידות ועבודה במצב לא-מקוון (PWA)' }
    ];

    for (const entry of titleMap) {
      if (entry.pattern.test(trimmed)) {
        return `שלב ${phaseNum}: ${entry.hebrew}`;
      }
    }

    // Default fallback: keep original in parentheses with Hebrew prefix
    return `שלב ${phaseNum}: ${trimmed}`;
  }

  /**
   * Translates stage badges and lifecycle states into natural Hebrew
   */
  static normalizeStage(stageStr) {
    if (!stageStr) return 'שלב 4: סשן בנייה פעיל (Build)';

    const s = stageStr.toUpperCase();
    if (s.includes('BUILD')) return 'שלב 4: סשן בנייה פעיל (Build)';
    if (s.includes('REVIEW')) return 'שלב 5: ביקורת ארכיטקטורה (Review)';
    if (s.includes('REPORT')) return 'שלב 6: דו״ח ביצוע (Report)';
    if (s.includes('GATE') || s.includes('CLOSE')) return 'שלב 7: שער איכות וסגירת פאזה';
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
    if (v.includes('approved with conditions')) return 'אושר עם תנאים (Approved with conditions)';
    if (v.includes('approved')) return 'אושר מלא (Approved ✓)';
    if (v.includes('reject')) return 'נדחה לתיקונים (Rejected)';
    if (v.includes('pending')) return 'ממתין להשלמת בנייה';

    return verdictStr;
  }

  /**
   * Translates common objectives/features bullet starters into natural Hebrew
   */
  static cleanDescription(desc) {
    if (!desc) return '';
    let out = desc.trim();

    out = out.replace(/^Objectives:\s*/i, 'יעדי הפאזה: ');
    out = out.replace(/^Features:\s*/i, 'תכולה ורכיבים: ');
    out = out.replace(/^The core feature:\s*/i, 'פיצ׳ר הליבה: ');
    out = out.replace(/^Inputs:\s*/i, 'קלט: ');
    out = out.replace(/^Outputs:\s*/i, 'תוצרים: ');

    return out;
  }
}
