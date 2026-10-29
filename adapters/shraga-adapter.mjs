/**
 * Orbit Dashboard - Shraga Harness Adapter (First-Class v2.0)
 * Strictly Read-Only parser for Shraga multi-agent architecture.
 * Integrated with HebrewNormalizer v2.0 for RTL-first Hebrew presentation,
 * separating Core Features from Acceptance Criteria (AC) and Risk Gates,
 * and performing live file-existence Honest State verification.
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

    // 3. Parse Plan.md for Phases, Core Features, AC & Risk Gates
    const planFile = path.join(shragaDir, 'Plan.md');
    const phases = [];
    let macroProgressPercent = 0;
    let totalTests = 0;

    if (fs.existsSync(planFile)) {
      let planContent = fs.readFileSync(planFile, 'utf-8');

      // Strip "## Change Log" or "## Changelog" section at the bottom so it never leaks into the last phase!
      planContent = planContent.replace(/\n##+\s*Change\s*Log[\s\S]*$/i, '');

      // Match phase headers ONLY at line start: e.g. "## Phase 0 - Foundation" or "### פאזה 0: תשתית"
      const phaseRegex = /(?:^|\n)#{2,4}\s*(?:(?:פאזה|Phase)\s*(\d+)[:\s\-]+|(\d+)[\.\)]\s+)([^\n]+)([\s\S]*?)(?=(?:\n#{2,4}\s*(?:(?:פאזה|Phase)\s*\d+|\d+[\.\)]))|$)/gi;
      let phaseMatch;

      while ((phaseMatch = phaseRegex.exec(planContent)) !== null) {
        const pNum = phaseMatch[1] ? parseInt(phaseMatch[1], 10) : parseInt(phaseMatch[2], 10);
        const rawTitle = phaseMatch[3].trim();
        const pBody = phaseMatch[4];

        // Normalize Title into Natural Hebrew with English Terms Preserved
        const pTitle = HebrewNormalizer.normalizePhaseTitle(rawTitle, pNum);

        // Determine Phase Status
        let pStatus = 'planned';
        if (pNum < activePhaseIndex) {
          pStatus = 'completed';
        } else if (pNum === activePhaseIndex) {
          pStatus = 'active';
        }

        // Parse pBody line-by-line by section (Objectives, Features, Acceptance criteria, Risk gate)
        const lines = pBody.split('\n');
        let currentSection = 'general';
        let rawObjectives = '';
        const rawFeatures = [];
        let acCount = 0;
        let riskGateCount = 0;

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;
          // Ignore markdown table rows
          if (line.startsWith('|') || line.startsWith('--|')) continue;

          // Check section headers
          if (/^(?:Objectives|יעדי הפאזה|מטרה)\s*:/i.test(line)) {
            currentSection = 'objectives';
            const afterColon = line.replace(/^(?:Objectives|יעדי הפאזה|מטרה)\s*:\s*/i, '').trim();
            if (afterColon) rawObjectives = afterColon;
            continue;
          }

          if (/^(?:Features|תכולה|פיצ׳רים|משימות)\s*:/i.test(line)) {
            currentSection = 'features';
            const afterColon = line.replace(/^(?:Features|תכולה|פיצ׳רים|משימות)\s*:\s*/i, '').trim();
            if (afterColon) {
              // Inline features separated by semicolons (e.g. Kal Kesef style: "Features: A; B; C.")
              const inlineItems = ShragaAdapter.splitInlineFeatures(afterColon);
              rawFeatures.push(...inlineItems);
            }
            continue;
          }

          if (/^(?:Acceptance\s*criteria|תנאי\s*קבלה)\s*:/i.test(line)) {
            currentSection = 'ac';
            continue;
          }

          if (/^(?:Risk\s*gate|שער\s*סיכונים|סיכונים)\s*:/i.test(line)) {
            currentSection = 'risk';
            const afterColon = line.replace(/^(?:Risk\s*gate|שער\s*סיכונים|סיכונים)\s*:\s*/i, '').trim();
            if (afterColon) {
              const inlineRisks = afterColon.split(';').map(s => s.trim()).filter(Boolean);
              riskGateCount += inlineRisks.length;
            }
            continue;
          }

          if (/^(?:Inputs|Outputs|Validation|Tests|Detailed\s+plan|Carried|Search\s+semantics)\s*:/i.test(line)) {
            currentSection = 'meta';
            continue;
          }

          // Process bullet lines (ONLY at the start of a line!)
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
          } else if (currentSection === 'objectives' && !rawObjectives) {
            rawObjectives = line;
          }
        }

        // Convert rawFeatures into concise, RTL-first Hebrew Deliverables
        const deliverables = rawFeatures.map(feat => {
          const rawStr = typeof feat === 'string' ? feat : feat.text;
          const isChecked = typeof feat === 'object' && feat.isChecked;
          const humanized = HebrewNormalizer.humanizeFeatureItem(rawStr);

          let itemStatus = 'planned';
          if (pStatus === 'completed' || isChecked) {
            itemStatus = 'done';
          } else if (pStatus === 'active') {
            // Live Honest State check: if referenced files already exist on disk, mark as done!
            const existsOnDisk = HebrewNormalizer.verifyFilesExist(projectPath, humanized.fileHints);
            itemStatus = existsOnDisk ? 'done' : 'active';
          }

          return {
            status: itemStatus,
            title: humanized.title,
            desc: humanized.desc
          };
        });

        // Clean description
        if (!rawObjectives) {
          rawObjectives = pBody.split('\n').find(line => {
            const l = line.trim();
            return l.length > 10 && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('#') && !l.startsWith('|');
          }) || `פאזת פיתוח ${pNum} במסגרת תוכנית האב של שרגא.`;
        }
        const cleanDesc = HebrewNormalizer.cleanDescription(rawObjectives);

        const doneDeliverablesCount = deliverables.filter(d => d.status === 'done').length;

        phases.push({
          phaseNum: pNum,
          title: pTitle,
          rawTitle,
          subtitle: `שלב ${pNum} · ${deliverables.length} רכיבי ליבה`,
          status: pStatus,
          stageLabel: pNum === activePhaseIndex ? 'שלב 4: סשן בנייה פעיל (Build)' : (pStatus === 'completed' ? 'הושלם ואושר ✓' : 'מתוכנן להמשך ○'),
          description: cleanDesc,
          deliverables: deliverables.length > 0 ? deliverables : [
            { status: pStatus === 'completed' ? 'done' : (pStatus === 'active' ? 'active' : 'planned'), title: pTitle, desc: 'משימת ליבה של הפאזה' }
          ],
          acCount,
          riskGateCount,
          doneDeliverablesCount,
          testsCount: '0',
          testsLabel: 'בדיקות יחידה',
          gateScore: pStatus === 'completed' ? '✓ אושר' : (acCount > 0 ? `${acCount} תנאי קבלה` : '--'),
          gateLabel: 'שער איכות ובקרת שרגא',
          verdict: pStatus === 'completed' ? 'אושר מלא (Approved)' : (pStatus === 'active' ? 'בסשן בנייה פעיל' : 'טרם החל'),
          nextActionHeader: pStatus === 'active' ? 'מה נדרש כעת מול Claude Code / הסוכן?' : `סטטוס פאזה ${pNum}:`,
          nextActionSub: pStatus === 'active' ? 'השלב המיידי לביצוע:' : 'מצב הפאזה:',
          nextActionBody: pStatus === 'active' ? 'השלמת בניית רכיבי הליבה של הפאזה, אימות תנאי הקבלה (AC) והפקת דו״ח ביצוע (Report).' : (pStatus === 'completed' ? 'הפאזה הושלמה ואושרה במלואה ע״י שרגא.' : 'ממתין לסיום הפאזות הקודמות.')
        });
      }
    }

    phases.sort((a, b) => a.phaseNum - b.phaseNum);

    // Fallback if Plan.md was empty (Initial Shraga onboarding / Pre-Plan stage)
    if (phases.length === 0) {
      const hasArchPlan = fs.existsSync(path.join(shragaDir, 'project-arch-plan.md')) || fs.existsSync(path.join(shragaDir, 'PRD.md'));
      const hasDesignSys = fs.existsSync(path.join(shragaDir, 'DESIGN_SYSTEM.md'));

      phases.push({
        phaseNum: 0,
        title: 'שלב 0: אפיון ראשוני והקמת תשתית שרגא',
        rawTitle: 'Onboarding & Architecture Setup',
        subtitle: 'שלב הקמה ואפיון',
        status: 'active',
        stageLabel: 'שלב 1-2: אפיון מוצר ותוכנית פאזות',
        description: 'הפרויקט אותחל במתודולוגיית שרגא ונמצא כעת בשלב גיבוש מסמך האפיון (PRD), שפת העיצוב ותוכנית השלבים (Plan.md).',
        deliverables: [
          {
            status: 'done',
            title: 'אתחול תיקיית שרגא ומעקב שלבים',
            desc: 'הוקמה תיקיית shraga/ וקובץ PHASE.md מוגדר לשלב 0.'
          },
          {
            status: hasArchPlan ? 'done' : 'active',
            title: 'גיבוש מסמך אפיון וארכיטקטורה (PRD)',
            desc: 'הגדרת מטרות המוצר, קהל היעד, מודל הנתונים וגבולות הגזרה בקובץ project-arch-plan.md.'
          },
          {
            status: hasDesignSys ? 'done' : 'planned',
            title: 'הגדרת שפת עיצוב וצבעים (Design System)',
            desc: 'יצירת קובץ DESIGN_SYSTEM.md עם פלטת הצבעים, הטיפוגרפיה ורכיבי הממשק.'
          },
          {
            status: 'planned',
            title: 'בניית תוכנית העבודה בשלבים (Plan.md)',
            desc: 'חלוקת הפרויקט לפאזות מבוקרות והפקת פרומפט הבנייה הראשון.'
          }
        ],
        acCount: 3,
        riskGateCount: 1,
        doneDeliverablesCount: 1 + (hasArchPlan ? 1 : 0) + (hasDesignSys ? 1 : 0),
        testsCount: '0',
        testsLabel: 'בדיקות יחידה',
        gateScore: 'בשלב אפיון',
        gateLabel: 'שער איכות ובקרת שרגא',
        verdict: 'באפיון ראשוני',
        nextActionHeader: 'מה נדרש כעת מול שרגא?',
        nextActionSub: 'השלמת אפיון ותוכנית עבודה:',
        nextActionBody: 'יש להשלים את שיחת האפיון מול שרגא כדי לייצר את קובצי הארכיטקטורה (project-arch-plan.md) ותוכנית השלבים (Plan.md).'
      });

      for (let i = 1; i <= 3; i++) {
        phases.push({
          phaseNum: i,
          title: `שלב ${i}: יוגדר בתוכנית העבודה`,
          subtitle: '○ יוגדר ב-Plan.md',
          status: 'planned',
          stageLabel: 'ממתין לאישור תוכנית העבודה ○',
          description: `שלב ${i} יפורט אוטומטית ברגע שקובץ Plan.md יופק ויאושר ע״י שרגא.`,
          deliverables: [
            { status: 'planned', title: `תכולת שלב ${i} תופיע לאחר אישור תוכנית העבודה`, desc: 'טרם הוגדר ב-Plan.md.' }
          ],
          acCount: 0,
          riskGateCount: 0
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
              targetPhase.verdict = 'אושר עם תנאים (Approved with conditions)';
              targetPhase.gateScore = '✓ אושר עם תנאים';
            } else if (/Approved/i.test(revContent)) {
              targetPhase.verdict = 'אושר מלא (Approved ✓)';
              targetPhase.gateScore = '✓ 100%';
            } else if (/Reject/i.test(revContent)) {
              targetPhase.verdict = 'נדחה לתיקונים (Rejected)';
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
        const activePhaseObj = phases.find(p => p.phaseNum === activePhaseIndex);
        if (activePhaseObj) {
          activePhaseObj.suggestedPrompt = promptContent.substring(0, 450).trim() + (promptContent.length > 450 ? '...' : '');
        }
      }
    }

    // 7. Accurately set Stage and Next Action based on artifacts lifecycle
    const hasPlanFile = fs.existsSync(planFile);
    const activePhaseObj = phases.find(p => p.phaseNum === activePhaseIndex);
    if (activePhaseObj && hasPlanFile) {
      const hasReview = fs.existsSync(path.join(shragaDir, 'reviews', `phase-${activePhaseIndex}-review.md`));
      const hasReport = fs.existsSync(path.join(shragaDir, 'reports', `phase-${activePhaseIndex}-report.md`));
      const hasPrompt = fs.existsSync(path.join(shragaDir, 'prompts', `phase-${activePhaseIndex}-prompt.md`));

      if (hasReview) {
        activePhaseObj.stageLabel = `שלב 6-7: סקירת ארכיטקטורה הושלמה (${activePhaseObj.gateScore})`;
        activePhaseObj.nextActionHeader = `מה הצעד הבא מול שרגא?`;
        activePhaseObj.nextActionSub = `סיום פאזה ${activePhaseIndex}:`;
        activePhaseObj.nextActionBody = `הסקירה הושלמה בהצלחה (${activePhaseObj.verdict}). לחזרה לסשן שרגא יש לכתוב "סיימתי" כדי לאשר את התנאים ולקדם את הפרויקט לפאזה ${activePhaseIndex + 1}.`;
      } else if (hasReport) {
        activePhaseObj.stageLabel = `שלב 5: דו״ח ביצוע הוגש — ממתין לסקירה`;
        activePhaseObj.nextActionHeader = `מה הצעד הבא?`;
        activePhaseObj.nextActionSub = `סקירת ארכיטקטורה:`;
        activePhaseObj.nextActionBody = `דו״ח הביצוע מוכן. יש להריץ סקירת ארכיטקטורה (/shraga-review) כדי לאמת עמידה בדרישות ובדיקות.`;
      } else if (hasPrompt) {
        activePhaseObj.stageLabel = `שלב 4: סשן בנייה פעיל (Build)`;
        activePhaseObj.nextActionHeader = `מה נדרש כעת מול Claude Code / הסוכן?`;
        activePhaseObj.nextActionSub = `השלב המיידי לביצוע:`;
        activePhaseObj.nextActionBody = `השלמת משימות הבנייה של שלב ${activePhaseIndex}, עמידה ב-${activePhaseObj.acCount || ''} תנאי הקבלה (AC) והפקת דו״ח ביצוע (Report).`;
      } else {
        activePhaseObj.stageLabel = `שלב 3: אפיון פאזה והפקת פרומפט`;
        activePhaseObj.nextActionHeader = `מה נדרש מול שרגא?`;
        activePhaseObj.nextActionSub = `הפקת פרומפט פאזה:`;
        activePhaseObj.nextActionBody = `יש לבצע דיפ-דייב לפאזה ${activePhaseIndex} ולהפיק את פרומפט הבנייה בשרגא.`;
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

  /**
   * Splits inline semicolon-separated features while respecting parentheses
   */
  static splitInlineFeatures(str) {
    const results = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

      if (ch === ';' && parenDepth === 0) {
        if (current.trim()) results.push({ text: current.trim(), isChecked: false });
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) {
      results.push({ text: current.trim().replace(/\.$/, ''), isChecked: false });
    }
    return results;
  }
}
