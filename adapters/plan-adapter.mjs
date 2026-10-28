/**
 * Orbit Dashboard - Plan / Milestone Adapter
 * Read-Only parser for standalone Plan.md, ROADMAP.md, tasks.md
 */

import fs from 'fs';
import path from 'path';

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

    const planContent = fs.readFileSync(planFile, 'utf-8');
    let projectName = path.basename(projectPath);

    // Extract Title if exists
    const h1Match = planContent.match(/^#\s+(.+)$/m);
    if (h1Match) {
      projectName = h1Match[1].replace(/^[#\s🛰️🪙📋]+/, '').trim();
    }

    const phases = [];
    // Match headers like "## Phase 1: ...", "### פאזה 2: ...", "## 1. Setup"
    const sectionRegex = /(?:^|\n)#{2,3}\s*(?:(?:פאזה|Phase)\s*(\d+)[:\s\-]+|(\d+)[\.\)]\s+)([^\n]+)([\s\S]*?)(?=(?:\n#{2,3}\s*(?:(?:פאזה|Phase)\s*\d+|\d+[\.\)]))|$)/gi;
    let sectionMatch;
    let fallbackIndex = 0;

    while ((sectionMatch = sectionRegex.exec(planContent)) !== null) {
      const pNum = sectionMatch[1] ? parseInt(sectionMatch[1], 10) : (sectionMatch[2] ? parseInt(sectionMatch[2], 10) : fallbackIndex);
      const pTitle = sectionMatch[3].trim();
      const pBody = sectionMatch[4];
      fallbackIndex++;

      const deliverables = [];
      const taskRegex = /[-*]\s*(?:\[([ xX])\])?\s*([^\n]+)/g;
      let taskMatch;

      while ((taskMatch = taskRegex.exec(pBody)) !== null) {
        const isChecked = taskMatch[1] && taskMatch[1].toLowerCase() === 'x';
        const taskText = taskMatch[2].trim();

        let tTitle = taskText;
        let tDesc = '';
        if (taskText.includes(':')) {
          const parts = taskText.split(':');
          tTitle = parts[0].replace(/\*\*/g, '').trim();
          tDesc = parts.slice(1).join(':').replace(/\*\*/g, '').trim();
        }

        deliverables.push({
          status: isChecked ? 'done' : 'planned',
          title: tTitle,
          desc: tDesc
        });
      }

      phases.push({
        phaseNum: pNum,
        title: pTitle,
        subtitle: `${deliverables.length} משימות`,
        status: 'planned',
        description: pBody.split('\n').find(line => line.trim().length > 10 && !line.startsWith('-') && !line.startsWith('*')) || `תוכנית עבודה עבור שלב ${pNum}.`,
        deliverables: deliverables.length > 0 ? deliverables : [
          { status: 'planned', title: pTitle, desc: 'משימת פאזה ראשית' }
        ]
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

    // Set statuses accordingly
    phases.forEach((p, idx) => {
      if (idx < activePhaseIndex) {
        p.status = 'completed';
        p.stageLabel = 'COMPLETED';
        p.verdict = 'הושלם';
        p.gateScore = '✓ 100%';
        p.deliverables.forEach(d => d.status = 'done');
      } else if (idx === activePhaseIndex) {
        p.status = 'active';
        p.stageLabel = 'ACTIVE SPRINT';
        p.verdict = 'בביצוע פעיל';
        p.gateScore = 'בתהליך';
        p.deliverables.forEach(d => {
          if (d.status !== 'done') d.status = 'active';
        });
      } else {
        p.status = 'planned';
        p.stageLabel = 'PLANNED';
        p.verdict = 'מתוכנן';
        p.gateScore = '--';
      }

      p.nextActionHeader = p.status === 'active' ? 'משימות פעילות לביצוע:' : `סטטוס פאזה ${idx}:`;
      p.nextActionSub = p.status === 'active' ? 'משימות פתוחות ברשימה:' : 'מצב:';
      p.nextActionBody = p.status === 'active' ? 'המשך סימון משימות שבוצעו ב-Plan.md.' : (p.status === 'completed' ? 'השלב הושלם.' : 'טרם החל.');
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
