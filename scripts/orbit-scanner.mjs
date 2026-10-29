/**
 * Orbit Dashboard - Observer, Multi-Project Hub & Scanner CLI / Runtime Engine (v2.2)
 * Executes passive read-only scan, maintains Multi-Project Hub registry (orbit-hub.json),
 * performs state-diffing for Focus Beacon notifications (phase advance, report, review, completion),
 * auto-discovers available projects in workspace roots, and generates self-contained index.html.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AdapterOrchestrator } from '../adapters/adapter-orchestrator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getProjectHash(projectPath) {
  const norm = path.resolve(projectPath).toLowerCase().replace(/\\/g, '/');
  return crypto.createHash('md5').update(norm).digest('hex').substring(0, 12);
}

export function getOrbitBaseDir() {
  const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\dymvi';
  const baseDir = path.join(userHome, '.gemini', 'antigravity', 'orbit');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

export function getStorageDir(projectPath) {
  const hash = getProjectHash(projectPath);
  const baseDir = path.join(getOrbitBaseDir(), 'projects', hash);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return { storageDir: baseDir, projectHash: hash };
}

/**
 * Discovers candidate projects in common workspace folders (e.g., C:\CLAUDE PROJECTS, Documents\antigravity)
 * Strictly Read-Only.
 */
export function discoverCandidateProjects() {
  const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\dymvi';
  const searchRoots = [
    'C:\\CLAUDE PROJECTS',
    path.join(userHome, 'Documents', 'antigravity')
  ];

  const candidates = [];
  const seenHashes = new Set();

  for (const rootDir of searchRoots) {
    if (!fs.existsSync(rootDir)) continue;
    try {
      const entries = fs.readdirSync(rootDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'shraga-harness-paste') continue;

        const fullPath = path.join(rootDir, entry.name);
        const hash = getProjectHash(fullPath);
        if (seenHashes.has(hash)) continue;

        // Check if it looks like a real project (has shraga/, Plan.md, package.json, or .git)
        const hasShraga = fs.existsSync(path.join(fullPath, 'shraga'));
        const hasPlan = fs.existsSync(path.join(fullPath, 'Plan.md')) || fs.existsSync(path.join(fullPath, 'ROADMAP.md'));
        const hasPkg = fs.existsSync(path.join(fullPath, 'package.json'));
        const hasGit = fs.existsSync(path.join(fullPath, '.git'));

        if (hasShraga || hasPlan || hasPkg || hasGit) {
          seenHashes.add(hash);
          candidates.push({
            projectHash: hash,
            folderName: entry.name,
            projectPath: fullPath,
            rootCategory: rootDir.includes('CLAUDE') ? 'CLAUDE PROJECTS' : 'Antigravity Workspaces',
            typeBadge: hasShraga ? 'פרויקט שרגא' : (hasPlan ? 'תוכנית שלבים' : 'פרויקט קוד')
          });
        }
      }
    } catch {
      // Ignore inaccessible directories
    }
  }

  return candidates;
}

/**
 * Computes a deterministic milestone signature for a project state to detect transitions
 */
function computeMilestoneSignature(state) {
  const activeIdx = state.activePhaseIndex ?? 0;
  const phases = state.phases || [];
  const activePhase = phases[activeIdx] || {};
  const doneDeliverables = (activePhase.deliverables || []).filter(d => d.status === 'done' || d.status === 'completed').length;
  const totalDeliverables = (activePhase.deliverables || []).length;

  return {
    activePhaseIndex: activeIdx,
    totalPhases: phases.length,
    stageLabel: activePhase.stageLabel || '',
    verdict: activePhase.verdict || '',
    gateScore: activePhase.gateScore || '',
    doneDeliverables,
    totalDeliverables,
    macroProgressPercent: state.macroProgressPercent ?? 0,
    isAllComplete: activeIdx >= phases.length || (phases.length > 0 && phases.every(p => p.status === 'completed' || p.status === 'done'))
  };
}

/**
 * Compares previous milestone signature against current signature to determine if Focus Beacon should fire!
 */
export function detectMilestoneTransition(prevSig, currSig) {
  if (!prevSig) return null;

  // 1. Project 100% Completed
  if (!prevSig.isAllComplete && currSig.isAllComplete) {
    return {
      type: 'project_completed',
      badgeText: '🏆 הפרויקט הושלם!',
      reason: 'כל שלבי הפרויקט הושלמו ואושרו בהצלחה!'
    };
  }

  // 2. Phase Advanced (e.g. Phase 0 -> Phase 1)
  if (currSig.activePhaseIndex > prevSig.activePhaseIndex) {
    return {
      type: 'phase_advanced',
      badgeText: `🎉 עבר לשלב ${currSig.activePhaseIndex}!`,
      reason: `שלב ${prevSig.activePhaseIndex} הושלם — הפרויקט התקדם לשלב ${currSig.activePhaseIndex}.`
    };
  }

  // 3. Architecture Review Completed (Approved / Approved with conditions / Rejected)
  if (prevSig.stageLabel !== currSig.stageLabel && currSig.stageLabel.includes('סקירת ארכיטקטורה הושלמה')) {
    return {
      type: 'review_ready',
      badgeText: '✨ סקירה הושלמה!',
      reason: `סקירת הארכיטקטורה לשלב ${currSig.activePhaseIndex} הסתיימה (${currSig.verdict}). ממתין לאישורך.`
    };
  }

  // 4. Build Report Submitted (Stage 5)
  if (prevSig.stageLabel !== currSig.stageLabel && currSig.stageLabel.includes('דו״ח ביצוע הוגש')) {
    return {
      type: 'report_submitted',
      badgeText: '📋 דו״ח ביצוע מוכן!',
      reason: `הסוכן סיים את הבנייה בשלב ${currSig.activePhaseIndex} והגיש דו״ח ביצוע לסקירה.`
    };
  }

  // 5. All deliverables in current phase became Done in code
  if (
    currSig.totalDeliverables > 0 &&
    currSig.doneDeliverables === currSig.totalDeliverables &&
    prevSig.doneDeliverables < currSig.totalDeliverables
  ) {
    return {
      type: 'deliverables_completed',
      badgeText: '✓ כל הרכיבים הוקמו!',
      reason: `כל ${currSig.totalDeliverables} רכיבי הליבה של שלב ${currSig.activePhaseIndex} קיימים בקוד.`
    };
  }

  return null;
}

/**
 * Loads or initializes the Multi-Project Hub Registry
 */
export function loadHubRegistry() {
  const hubPath = path.join(getOrbitBaseDir(), 'orbit-hub.json');
  if (fs.existsSync(hubPath)) {
    try {
      return JSON.parse(fs.readFileSync(hubPath, 'utf-8'));
    } catch {
      // Fallback if corrupted
    }
  }
  return {
    version: '2.2.0',
    lastSelectedHash: null,
    projects: {},
    milestones: {}
  };
}

/**
 * Scans all registered projects + newly requested project + discovered Claude projects,
 * updates the Multi-Project Hub, and writes synchronized HTML dashboards.
 */
export function runOrbitScan(projectPath, options = {}) {
  const absPath = path.resolve(projectPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Project directory does not exist: ${absPath}`);
  }

  const frequency = options.frequency || 'כל 2 דקות';
  const hub = loadHubRegistry();

  // Ensure all key active user projects in C:\CLAUDE PROJECTS are registered in the Hub
  const candidates = discoverCandidateProjects();
  const targetHash = getProjectHash(absPath);

  // Collect all project paths to scan in this Hub pass
  const pathsToScan = new Map();
  pathsToScan.set(targetHash, absPath);

  // Include already-registered projects in Hub
  for (const [h, projData] of Object.entries(hub.projects || {})) {
    if (projData && projData.projectPath && fs.existsSync(projData.projectPath)) {
      pathsToScan.set(h, projData.projectPath);
    }
  }

  // Automatically include all discovered projects in C:\CLAUDE PROJECTS so user sees them immediately
  for (const cand of candidates) {
    if (cand.rootCategory === 'CLAUDE PROJECTS' && fs.existsSync(cand.projectPath)) {
      pathsToScan.set(cand.projectHash, cand.projectPath);
    }
  }

  // Scan every registered project and detect milestone transitions
  for (const [hash, pPath] of pathsToScan.entries()) {
    try {
      const pState = AdapterOrchestrator.scanProject(pPath);
      pState.pollFrequency = frequency;
      pState.projectHash = hash;
      pState.timestamp = Date.now();

      const currSig = computeMilestoneSignature(pState);
      const prevRecord = (hub.milestones || {})[hash];

      let focusAlert = prevRecord?.focusAlert || null;

      if (prevRecord && prevRecord.signature) {
        const transition = detectMilestoneTransition(prevRecord.signature, currSig);
        if (transition) {
          focusAlert = {
            ...transition,
            detectedAt: Date.now(),
            unread: true
          };
        }
      }

      // Allow simulation override for testing Focus Beacon
      if (options.simulateAlertForHash === hash) {
        focusAlert = {
          type: 'phase_advanced',
          badgeText: options.simulateBadgeText || '🔔 שלב הושלם!',
          reason: options.simulateReason || 'הסתיים שלב בפרויקט — ממתין למעבר שלך.',
          detectedAt: Date.now(),
          unread: true
        };
      }

      pState.focusAlert = focusAlert;
      pState.milestoneSignature = currSig;

      hub.projects[hash] = pState;
      hub.milestones[hash] = {
        signature: currSig,
        focusAlert,
        updatedAt: Date.now()
      };
    } catch {
      // Skip broken project path
    }
  }

  hub.lastSelectedHash = targetHash;
  hub.candidateProjects = candidates;
  hub.updatedAt = Date.now();

  // Save orbit-hub.json
  const hubJsonPath = path.join(getOrbitBaseDir(), 'orbit-hub.json');
  fs.writeFileSync(hubJsonPath, JSON.stringify(hub, null, 2), 'utf-8');

  // Read HTML template once
  const templatePath = path.join(__dirname, '..', 'templates', 'orbit-view.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Also write master hub HTML at ~/.gemini/antigravity/orbit/index.html
  const masterHubHtml = rawTemplate
    .replace('let orbitState = window.ORBIT_DATA || null;', `let orbitState = ${JSON.stringify(hub.projects[targetHash], null, 2)};`)
    .replace('let orbitHubData = window.ORBIT_HUB || null;', `let orbitHubData = ${JSON.stringify(hub, null, 2)};`);

  const masterHubHtmlPath = path.join(getOrbitBaseDir(), 'index.html');
  fs.writeFileSync(masterHubHtmlPath, masterHubHtml, 'utf-8');

  // Write individual project storage files (each injected with full Hub data so switching tabs works in every window!)
  for (const [hash, pState] of Object.entries(hub.projects)) {
    const { storageDir } = getStorageDir(pState.projectPath);
    const stateJsonPath = path.join(storageDir, 'orbit-state.json');
    fs.writeFileSync(stateJsonPath, JSON.stringify(pState, null, 2), 'utf-8');

    const hubCopyPath = path.join(storageDir, 'orbit-hub.json');
    const hubForThisProject = { ...hub, lastSelectedHash: hash };
    fs.writeFileSync(hubCopyPath, JSON.stringify(hubForThisProject, null, 2), 'utf-8');

    const htmlContent = rawTemplate
      .replace('let orbitState = window.ORBIT_DATA || null;', `let orbitState = ${JSON.stringify(pState, null, 2)};`)
      .replace('let orbitHubData = window.ORBIT_HUB || null;', `let orbitHubData = ${JSON.stringify(hubForThisProject, null, 2)};`);

    fs.writeFileSync(path.join(storageDir, 'index.html'), htmlContent, 'utf-8');
  }

  const { storageDir } = getStorageDir(absPath);
  return {
    state: hub.projects[targetHash],
    hub,
    storageDir,
    projectHash: targetHash,
    stateJsonPath: path.join(storageDir, 'orbit-state.json'),
    htmlOutputPath: path.join(storageDir, 'index.html'),
    masterHubHtmlPath
  };
}

// CLI Execution support
if (process.argv[1] && process.argv[1].endsWith('orbit-scanner.mjs')) {
  const args = process.argv.slice(2);
  let targetPath = process.cwd();
  let freq = 'כל 2 דקות';
  let simulateAlertForHash = null;
  let simulateBadgeText = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) {
      targetPath = args[i + 1];
      i++;
    } else if (args[i] === '--frequency' && args[i + 1]) {
      freq = args[i + 1];
      i++;
    } else if (args[i] === '--simulate-alert' && args[i + 1]) {
      simulateAlertForHash = args[i + 1];
      i++;
    } else if (args[i] === '--simulate-badge' && args[i + 1]) {
      simulateBadgeText = args[i + 1];
      i++;
    }
  }

  try {
    const result = runOrbitScan(targetPath, {
      frequency: freq,
      simulateAlertForHash,
      simulateBadgeText
    });
    console.log(JSON.stringify({
      success: true,
      projectName: result.state.projectName,
      adapter: result.state.adapterName,
      activePhase: result.state.activePhaseIndex,
      totalHubProjects: Object.keys(result.hub.projects).length,
      scanDurationMs: result.state.scanDurationMs,
      htmlPath: result.htmlOutputPath,
      masterHubHtmlPath: result.masterHubHtmlPath,
      jsonPath: result.stateJsonPath
    }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}
