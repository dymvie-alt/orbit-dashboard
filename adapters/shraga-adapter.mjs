/**
 * Orbit Dashboard - Shraga Harness Adapter (First-Class)
 * Strictly Read-Only parser for Shraga multi-agent architecture.
 * Integrated with HebrewNormalizer for natural Hebrew (RTL) presentation with original LTR terms.
 */

import fs from 'fs';
import path from 'path';
import { HebrewNormalizer } from './hebrew-normalizer.mjs';

export class ShragaAdapter {
  static matches(projectPath) {
    const shragaDir = path.join(projectPath, 'shraga');
    return fs.existsSync(shragaDir) && fs.statSync(shragaDir).isDirectory();
  }

  static parse(projectPath) {
    const shragaDir = path.join(projectPath, 'shraga');

    // 1. Determine Active Phase
    let activePhaseIndex = 0;
    const phaseFile = path.join(shragaDir, 'PHASE.md');
    if (fs.existsSync(phaseFile)) {
      const phaseContent = fs.readFileSync(phaseFile, 'utf-8');
      const match = phaseContent.match(/PHASE\s*=\s*(\d+)/i) || phaseContent.match(/(\d+)/);
      if (match) {
        activePhaseIndex = parseInt(match[1], 10);
      }
    }

    // 2. Extract Project Title & Hebrew About / Tagline
    let projectName = path.basename(projectPath);
    let projectDescription = 'פרויקט מנוהל במתודולוגיית שרגא (LetsAI AI Architect)';
    
    const prdCandidates = [
      path.join(shragaDir, 'project-arch-plan.md'),
      path.join(shragaDir, 'PRD.md'),
      path.join(projectPath, 'README.md')
    ];

    for (const prdPath of prdCandidates) {
      if (fs.existsSync(prdPath)) {
        const prdContent = fs.readFileSync(prdPath, 'utf-8');
        
        // Extract Title
        const h1Match = prdContent.match(/^#\s+(.+)$/m);
        if (h1Match) {
          projectName = h1Match[1].replace(/^[#\s🛰️🪙📋]+/, '').trim();
          if (projectName.includes(' - ')) {
            projectName = projectName.split(' - ')[0].trim();
          }
        }

        // Extract Hebrew Tagline / About if present
        const taglineMatch = prdContent.match(/(?:Tagline|תיאור קצר)[:\s]*\n>\s*([^\n]+)/i);
        if (taglineMatch) {
          projectDescription = taglineMatch[1].trim();
        } else {
          // Look for Hebrew blockquote in About section
          const aboutMatch = prdContent.match(/###\s*(?:About|אודות)[^]*?>\s*([^\n]+)/i);
          if (aboutMatch) {
            projectDescription = aboutMatch[1].replace(/\*\*/g, '').trim();
          }
        }
        break;
      }
    }

    // 3. Parse Plan.md for Phases & Deliverables
    const planFile = path.join(shragaDir, 'Plan.md');
    const phases = [];
    let macroProgressPercent = 0;
    let totalTests = 0;

    if (fs.existsSync(planFile)) {
      const planContent = fs.readFileSync(planFile, 'utf-8');
      
      // Match phase headers: e.g. "### פאזה 0: תשתית ושלד" or "## Phase 0 - Foundation" or "### Phase 1: ..."
      const phaseRegex = /(?:^|\n)#{2,4}\s*(?:(?:פאזה|Phase)\s*(\d+)[:\s\-]+|(\d+)[\.\)]\s+)([^\n]+)([\s\S]*?)(?=(?:\n#{2,4}\s*(?:(?:פאזה|Phase)\s*\d+|\d+[\.\)]))|$)/gi;
      let phaseMatch;

      while ((phaseMatch = phaseRegex.exec(planContent)) !== null) {
        const pNum = phaseMatch[1] ? parseInt(phaseMatch[1], 10) : parseInt(phaseMatch[2], 10);
        const rawTitle = phaseMatch[3].trim();
        const pBody = phaseMatch[4];

        // Normalize Title into Natural Hebrew with English Terms Preserved
        const pTitle = HebrewNormalizer.normalizePhaseTitle(rawTitle, pNum);

        // Extract Deliverables / Checklists
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

          let itemStatus = 'planned';
          if (pNum < activePhaseIndex || isChecked) {
            itemStatus = 'done';
          } else if (pNum === activePhaseIndex) {
            itemStatus = isChecked ? 'done' : 'active';
          }

          deliverables.push({
            status: itemStatus,
            title: tTitle,
            desc: tDesc
          });
        }

        // Determine Phase Status
        let pStatus = 'planned';
        if (pNum < activePhaseIndex) {
          pStatus = 'completed';
        } else if (pNum === activePhaseIndex) {
          pStatus = 'active';
        }

        // Raw description extraction
        let rawDesc = pBody.split('\n').find(line => {
          const l = line.trim();
          return l.length > 10 && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('#') && !l.startsWith('|');
        }) || `פאזת פיתוח ${pNum} במסגרת תוכנית האב של שרגא.`;

        const cleanDesc = HebrewNormalizer.cleanDescription(rawDesc);

        phases.push({
          phaseNum: pNum,
          title: pTitle,
          rawTitle,
          subtitle: `שלב ${pNum} · ${deliverables.length} משימות`,
          status: pStatus,
          stageLabel: pNum === activePhaseIndex ? 'שלב 4: סשן בנייה פעיל (Build)' : (pStatus === 'completed' ? 'הושלם ואושר ✓' : 'מתוכנן להמשך ○'),
          description: cleanDesc,
          deliverables: deliverables.length > 0 ? deliverables : [
            { status: pStatus === 'completed' ? 'done' : (pStatus === 'active' ? 'active' : 'planned'), title: pTitle, desc: 'משימת ליבה של הפאזה' }
          ],
          testsCount: '0',
          testsLabel: 'בדיקות יחידה',
          gateScore: pStatus === 'completed' ? '✓ אושר' : '--',
          gateLabel: 'שער איכות ובקרת שרגא',
          verdict: pStatus === 'completed' ? 'אושר מלא (Approved)' : (pStatus === 'active' ? 'בסשן בנייה פעיל' : 'טרם החל'),
          nextActionHeader: pStatus === 'active' ? 'מה נדרש כעת מול Claude Code / הסוכן?' : `סטטוס פאזה ${pNum}:`,
          nextActionSub: pStatus === 'active' ? 'השלב המיידי לביצוע:' : 'מצב הפאזה:',
          nextActionBody: pStatus === 'active' ? 'השלמת משימות הבנייה, הרצת בדיקות מקומיות והפקת דו״ח ביצוע (report).' : (pStatus === 'completed' ? 'הפאזה הושלמה ואושרה במלואה ע״י שרגא.' : 'ממתין לסיום הפאזות הקודמות.')
        });
      }
    }

    phases.sort((a, b) => a.phaseNum - b.phaseNum);

    // Fallback if Plan.md was empty
    if (phases.length === 0) {
      for (let i = 0; i <= Math.max(activePhaseIndex + 1, 3); i++) {
        phases.push({
          phaseNum: i,
          title: `פאזה ${i}`,
          subtitle: i < activePhaseIndex ? '✓ הושלם' : (i === activePhaseIndex ? '⚡ פעיל' : '○ מתוכנן'),
          status: i < activePhaseIndex ? 'completed' : (i === activePhaseIndex ? 'active' : 'planned'),
          description: `שלב ${i} בפרויקט.`,
          deliverables: [{ status: i < activePhaseIndex ? 'done' : (i === activePhaseIndex ? 'active' : 'planned'), title: `משימות פאזה ${i}`, desc: '' }]
        });
      }
    }

    // 4. Scan Reviews Directory (verdicts, conditions)
    const reviewsDir = path.join(shragaDir, 'reviews');
    if (fs.existsSync(reviewsDir)) {
      const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.md'));
      for (const revFile of reviewFiles) {
        const numMatch = revFile.match(/phase-(\d+)/i);
        if (numMatch) {
          const revNum = parseInt(numMatch[1], 10);
          const revContent = fs.readFileSync(path.join(reviewsDir, revFile), 'utf-8');
          const targetPhase = phases.find(p => p.phaseNum === revNum);
          if (targetPhase) {
            if (/Approved with conditions/i.test(revContent)) {
              targetPhase.verdict = 'Approved with conditions (אושר עם תנאים)';
              targetPhase.gateScore = 'אושר עם תנאים';
            } else if (/Approved/i.test(revContent)) {
              targetPhase.verdict = 'Approved (אושר מלא ✓)';
              targetPhase.gateScore = '✓ 100%';
            } else if (/Reject/i.test(revContent)) {
              targetPhase.verdict = 'Rejected (נדחה לתיקונים)';
              targetPhase.gateScore = 'נדחה לבדיקה חוזרת';
            }
          }
        }
      }
    }

    // 5. Scan Reports Directory (test results)
    const reportsDir = path.join(shragaDir, 'reports');
    if (fs.existsSync(reportsDir)) {
      const reportFiles = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));
      for (const repFile of reportFiles) {
        const numMatch = repFile.match(/phase-(\d+)/i);
        if (numMatch) {
          const repNum = parseInt(numMatch[1], 10);
          const repContent = fs.readFileSync(path.join(reportsDir, repFile), 'utf-8');
          const targetPhase = phases.find(p => p.phaseNum === repNum);
          if (targetPhase) {
            const testMatch = repContent.match(/(\d+)\s*(?:בדיקות|טסטים|tests|passed)/i);
            if (testMatch) {
              targetPhase.testsCount = testMatch[1];
              totalTests = Math.max(totalTests, parseInt(testMatch[1], 10));
            }
          }
        }
      }
    }

    // 6. Scan Prompts Directory for Suggested Prompt
    const promptsDir = path.join(shragaDir, 'prompts');
    if (fs.existsSync(promptsDir)) {
      const activePromptPath = path.join(promptsDir, `phase-${activePhaseIndex}-prompt.md`);
      if (fs.existsSync(activePromptPath)) {
        const promptContent = fs.readFileSync(activePromptPath, 'utf-8');
        const activePhase = phases.find(p => p.phaseNum === activePhaseIndex);
        if (activePhase) {
          activePhase.suggestedPrompt = promptContent.substring(0, 450).trim() + (promptContent.length > 450 ? '...' : '');
        }
      }
    }

    macroProgressPercent = Math.min(100, Math.round((activePhaseIndex / Math.max(1, phases.length)) * 100));

    return {
      projectName,
      projectDescription,
      adapterName: 'Shraga First-Class Harness',
      activePhaseIndex,
      macroProgressPercent,
      totalTests,
      isGenericGit: false,
      pollFrequency: 'כל 2 דקות (Daemon שקט)',
      timestamp: Date.now(),
      phases
    };
  }
}
