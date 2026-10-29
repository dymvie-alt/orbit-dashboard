/**
 * Orbit Dashboard - Plan / Milestone Adapter (v2.0)
 * Read-Only parser for standalone Plan.md, ROADMAP.md, tasks.md
 * Integrated with HebrewNormalizer v2.0 for RTL-first Hebrew presentation with original LTR terms.
 */

import fs from 'fs';
import path from 'path';
import { HebrewNormalizer } from './hebrew-normalizer.mjs';

export class PlanAdapter {
  static getPlanFile(projectPath) {
    const candidates = [
      path.join(projectPath, 'Plan.md'),
      path.join(projectPath, 'plan.md'),
      path.join(projectPath, 'ROADMAP.md'),
      path.join(projectPath, 'roadmap.md'),
      path.join(projectPath, 'tasks.md'),
      path.join(projectPath, 'TODO.md')
    ];
    return candidates.find(f => fs.existsSync(f)) || null;
  }

  static matches(projectPath) {
    return PlanAdapter.getPlanFile(projectPath) !== null;
  }

  static parse(projectPath) {
    const planFile = PlanAdapter.getPlanFile(projectPath);
    if (!planFile) {
      throw new Error('No plan file found');
    }

    let planContent = fs.readFileSync(planFile, 'utf-8');
    let projectName = path.basename(projectPath);

    // Strip "## Change Log" at the bottom so it never leaks
    planContent = planContent.replace(/\n##+\s*Change\s*Log[\s\S]*$/i, '');

    // Extract Title if exists
    const h1Match = planContent.match(/^#\s+(.+)$/m);
    if (h1Match) {
      projectName = h1Match[1].replace(/^[#\s🛰️🪙📋]+/, '').trim();
      if (projectName.includes(' - ')) {
        projectName = projectName.split(' - ')[0].trim();
      }
    }

    const phases = [];
    const sectionRegex = /(?:^|\n)#{2,3}\s*(?:(?:פאזה|Phase)\s*(\d+)[:\s\-]+|(\d+)[\.\)]\s+)([^\n]+)([\s\S]*?)(?=(?:\n#{2,3}\s*(?:(?:פאזה|Phase)\s*\d+|\d+[\.\)]))|$)/gi;
    let sectionMatch;
    let fallbackIndex = 0;

    while ((sectionMatch = sectionRegex.exec(planContent)) !== null) {
      const pNum = sectionMatch[1] ? parseInt(sectionMatch[1], 10) : (sectionMatch[2] ? parseInt(sectionMatch[2], 10) : fallbackIndex);
      const rawTitle = sectionMatch[3].trim();
      const pBody = sectionMatch[4];
      fallbackIndex++;

      const pTitle = HebrewNormalizer.normalizePhaseTitle(rawTitle, pNum);

      const lines = pBody.split('\n');
      let currentSection = 'general';
      let rawObjectives = '';
      const rawFeatures = [];
      let acCount = 0;
      let riskGateCount = 0;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('|') || line.startsWith('--|')) continue;

        if (/^(?:Objectives|יעדי הפאזה|מטרה)\s*:/i.test(line)) {
          currentSection = 'objectives';
          const after = line.replace(/^(?:Objectives|יעדי הפאזה|מטרה)\s*:\s*/i, '').trim();
          if (after) rawObjectives = after;
          continue;
        }
        if (/^(?:Features|תכולה|פיצ׳רים|משימות)\s*:/i.test(line)) {
          currentSection = 'features';
          continue;
        }
        if (/^(?:Acceptance\s*criteria|תנאי\s*קבלה)\s*:/i.test(line)) {
          currentSection = 'ac';
          continue;
        }
        if (/^(?:Risk\s*gate|שער\s*סיכונים|סיכונים)\s*:/i.test(line)) {
          currentSection = 'risk';
          continue;
        }
        if (/^(?:Inputs|Outputs|Validation|Tests)\s*:/i.test(line)) {
          currentSection = 'meta';
          continue;
        }

        const bulletMatch = line.match(/^[-*]\s*(?:\[([ xX])\])?\s*(.+)$/);
        if (bulletMatch) {
          const isChecked = bulletMatch[1] && bulletMatch[1].toLowerCase() === 'x';
          const bulletText = bulletMatch[2].trim();

          if (currentSection === 'ac' || /^AC-\d+/i.test(bulletText)) {
            acCount++;
          } else if (currentSection === 'risk' || /^R-\d+/i.test(bulletText)) {
            riskGateCount++;
          } else if (currentSection === 'features' || currentSection === 'general') {
            rawFeatures.push({ text: bulletText, isChecked });
          }
        }
      }

      const deliverables = rawFeatures.map(feat => {
        const humanized = HebrewNormalizer.humanizeFeatureItem(feat.text);
        return {
          status: feat.isChecked ? 'done' : 'planned',
          title: humanized.title,
          desc: humanized.desc,
          fileHints: humanized.fileHints
        };
      });

      if (!rawObjectives) {
        rawObjectives = pBody.split('\n').find(line => {
          const l = line.trim();
          return l.length > 10 && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('#') && !l.startsWith('|');
        }) || `תוכנית עבודה עבור שלב ${pNum}.`;
      }

      phases.push({
        phaseNum: pNum,
        title: pTitle,
        rawTitle,
        subtitle: `שלב ${pNum} · ${deliverables.length} רכיבי ליבה`,
        status: 'planned',
        description: HebrewNormalizer.cleanDescription(rawObjectives),
        deliverables: deliverables.length > 0 ? deliverables : [
          { status: 'planned', title: pTitle, desc: 'משימת פאזה ראשית' }
        ],
        acCount,
        riskGateCount
      });
    }

    // Determine Active Phase (first phase with incomplete items)
    let activePhaseIndex = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      const hasUnchecked = p.deliverables.some(d => d.status === 'planned');
      if (hasUnchecked) {
        activePhaseIndex = i;
        break;
      }
    }

    phases.forEach((p, idx) => {
      if (idx < activePhaseIndex) {
        p.status = 'completed';
        p.stageLabel = 'הושלם ואושר ✓';
        p.verdict = 'אושר (Approved)';
        p.gateScore = '✓ 100%';
        p.deliverables.forEach(d => d.status = 'done');
      } else if (idx === activePhaseIndex) {
        p.status = 'active';
        p.stageLabel = 'ספרינט פעיל כעת ⚡';
        p.verdict = 'בביצוע פעיל';
        p.gateScore = p.acCount > 0 ? `${p.acCount} תנאי קבלה` : 'בתהליך';
        p.deliverables.forEach(d => {
          if (d.status !== 'done') {
            const exists = HebrewNormalizer.verifyFilesExist(projectPath, d.fileHints);
            d.status = exists ? 'done' : 'active';
          }
        });
      } else {
        p.status = 'planned';
        p.stageLabel = 'מתוכנן להמשך ○';
        p.verdict = 'טרם החל';
        p.gateScore = '--';
      }

      p.nextActionHeader = p.status === 'active' ? 'משימות פעילות לביצוע:' : `סטטוס פאזה ${idx}:`;
      p.nextActionSub = p.status === 'active' ? 'משימות פתוחות ברשימה:' : 'מצב:';
      p.nextActionBody = p.status === 'active' ? 'המשך סימון משימות שבוצעו ב-Plan.md.' : (p.status === 'completed' ? 'השלב הושלם בהצלחה.' : 'טרם החל.');
    });

    const macroProgressPercent = Math.min(100, Math.round((activePhaseIndex / Math.max(1, phases.length)) * 100));

    return {
      projectName,
      adapterName: 'Milestone / Plan.md Adapter',
      activePhaseIndex,
      macroProgressPercent,
      totalTests: 0,
      isGenericGit: false,
      pollFrequency: 'כל 2 דקות (Daemon שקט)',
      timestamp: Date.now(),
      phases
    };
  }
}
