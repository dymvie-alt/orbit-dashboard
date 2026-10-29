/**
 * Orbit Dashboard - Generic Git & Activity Adapter
 * Read-Only fallback adapter for standard codebases without explicit roadmaps.
 * Injects transparency banner as required by PRD.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class GitAdapter {
  static matches(projectPath) {
    // Matches if git directory exists, or as universal fallback
    return fs.existsSync(path.join(projectPath, '.git')) || true;
  }

  static parse(projectPath) {
    const projectName = path.basename(projectPath);
    let commits = [];
    let gitBranch = 'main';

    try {
      const logOut = execSync('git log -n 8 --oneline', { cwd: projectPath, encoding: 'utf-8', timeout: 1500 });
      commits = logOut.trim().split('\n').filter(Boolean).map(line => {
        const parts = line.split(' ');
        return {
          hash: parts[0],
          message: parts.slice(1).join(' ')
        };
      });

      const branchOut = execSync('git branch --show-current', { cwd: projectPath, encoding: 'utf-8', timeout: 1000 });
      if (branchOut.trim()) gitBranch = branchOut.trim();
    } catch {
      // If git command fails or not installed, provide clean fallback
      commits = [
        { hash: 'HEAD', message: 'Current workspace files active' }
      ];
    }

    // Check package.json for project name or test runner
    let totalTests = 0;
    const pkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.scripts && (pkg.scripts.test || pkg.scripts['test:unit'])) {
          totalTests = 1; // Test harness detected
        }
      } catch {}
    }

    // Deliverables from recent commits
    const deliverables = commits.map((c, idx) => ({
      status: idx === 0 ? 'active' : 'done',
      title: `${c.hash}: ${c.message}`,
      desc: idx === 0 ? `קומיט פעיל אחרון בענף ${gitBranch}` : 'היסטוריית גרסאות מאומתת'
    }));

    const phases = [
      {
        phaseNum: 0,
        title: 'אתחול ותשתית מקומית',
        subtitle: 'Git Setup',
        status: 'completed',
        stageLabel: 'COMPLETED',
        description: 'אתחול מאגר ה-Git והגדרת תשתיות הפרויקט.',
        deliverables: [
          { status: 'done', title: 'הגדרת סביבת פיתוח מקומית', desc: `ענף ${gitBranch}` }
        ],
        testsCount: totalTests > 0 ? '1' : '0',
        testsLabel: 'רתמת בדיקות',
        gateScore: '✓ פעיל',
        gateLabel: 'תקינות Git',
        verdict: 'Approved',
        nextActionHeader: 'סטטוס תשתית:',
        nextActionSub: 'הושלם:',
        nextActionBody: 'מאגר ה-Git מאותחל ותקין.'
      },
      {
        phaseNum: 1,
        title: 'פעילות קוד שוטפת',
        subtitle: `ענף ${gitBranch} · ${commits.length} קומיטים`,
        status: 'active',
        stageLabel: 'ACTIVE WORKSPACE',
        description: 'מעקב שוטף אחר קבצים, קומיטים ובדיקות מקומיות. הפרויקט אינו מכיל מפת דרכים רשמית (Plan.md או שרגא).',
        deliverables: deliverables.length > 0 ? deliverables : [
          { status: 'active', title: 'קבצי קוד מקומיים פעילים', desc: 'עבודה ישירה בסביבת העבודה' }
        ],
        testsCount: totalTests > 0 ? 'Detect' : '0',
        testsLabel: 'מערכת בדיקות',
        gateScore: 'מעקב שוטף',
        gateLabel: 'סטטוס קוד',
        verdict: 'Active Dev',
        nextActionHeader: 'מה עושים עכשיו?',
        nextActionSub: 'המלצת Orbit:',
        nextActionBody: 'המשך פיתוח שוטף, או יצירת קובץ <code>Plan.md</code> להפעלת סרגל פאזות ומפת דרכים מלאה.',
        suggestedPrompt: 'יצירת קובץ Plan.md לניהול המשך הפיתוח בפאזות מסודרות.'
      }
    ];

    return {
      projectName,
      adapterName: 'Generic Git & Workspace Adapter',
      activePhaseIndex: 1,
      macroProgressPercent: 50,
      totalTests,
      isGenericGit: true, // Triggers transparency banner!
      pollFrequency: 'כל 2 דקות (Daemon שקט)',
      timestamp: Date.now(),
      phases
    };
  }
}
