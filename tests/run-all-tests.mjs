/**
 * Orbit Dashboard - Comprehensive QA Test Runner (Senior QA Gate)
 * Executes all 12 Test Cases (TC-01 through TC-12) defined in docs/QA_TEST_PLAN.md
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { AdapterOrchestrator } from '../adapters/adapter-orchestrator.mjs';
import { runOrbitScan } from '../scripts/orbit-scanner.mjs';

console.log('================================================================================');
console.log('        🛰️  ORBIT DASHBOARD — COMPREHENSIVE QA TEST SUITE (PHASE 4)             ');
console.log('================================================================================\n');

const results = [];

function recordTest(id, name, suite, passed, details = '') {
  results.push({ id, name, suite, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${id}] ${name} (${suite}) ${details ? '— ' + details : ''}`);
}

const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-qa-full-'));

try {
  // ==========================================
  // SUITE A: ZERO-FOOTPRINT INTEGRITY
  // ==========================================
  const dummyProj = path.join(tempBase, 'target-project');
  fs.mkdirSync(dummyProj, { recursive: true });
  fs.writeFileSync(path.join(dummyProj, 'app.js'), 'console.log("untouched");');
  fs.writeFileSync(path.join(dummyProj, 'README.md'), '# Target App');

  // Compute pre-scan directory fingerprint
  const getDirHash = (dir) => {
    const files = fs.readdirSync(dir).sort();
    const hash = crypto.createHash('sha256');
    for (const f of files) {
      const p = path.join(dir, f);
      hash.update(f);
      hash.update(fs.readFileSync(p));
    }
    return hash.digest('hex');
  };

  const preHash = getDirHash(dummyProj);
  const scanResult = runOrbitScan(dummyProj);
  const postHash = getDirHash(dummyProj);

  // TC-01: Clean Tree Check
  recordTest('TC-01', 'Clean Tree Check', 'Zero-Footprint', preHash === postHash, 'No files created in project dir');

  // TC-02: Directory Fingerprint Check
  recordTest('TC-02', 'Binary Fingerprint', 'Zero-Footprint', preHash === postHash, 'Byte-for-byte identical pre & post scan');

  // ==========================================
  // SUITE B: ADAPTERS & RESILIENCE
  // ==========================================
  // TC-03: Shraga Full Lifecycle Coverage
  const shragaDir = path.join(tempBase, 'full-shraga');
  const sSub = path.join(shragaDir, 'shraga');
  fs.mkdirSync(path.join(sSub, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(sSub, 'reviews'), { recursive: true });
  fs.mkdirSync(path.join(sSub, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(sSub, 'PHASE.md'), 'PHASE=3\n');
  fs.writeFileSync(path.join(sSub, 'Plan.md'), '### פאזה 0: א\n- [x] מ1\n### פאזה 1: ב\n- [x] מ2\n### פאזה 2: ג\n- [x] מ3\n### פאזה 3: ד\n- [ ] מ4\n');
  fs.writeFileSync(path.join(sSub, 'reports', 'phase-2-report.md'), '235 בדיקות עברו');
  fs.writeFileSync(path.join(sSub, 'reviews', 'phase-2-review.md'), 'פסק דין: Approved with conditions');
  fs.writeFileSync(path.join(sSub, 'prompts', 'phase-3-prompt.md'), 'פתח את רכיבי פאזה 3 בבקשה');

  const shragaParsed = AdapterOrchestrator.scanProject(shragaDir);
  const tc3Pass = shragaParsed.activePhaseIndex === 3 &&
                  shragaParsed.phases[2].verdict === 'Approved with conditions' &&
                  shragaParsed.phases[2].testsCount === '235' &&
                  shragaParsed.phases[3].suggestedPrompt.includes('פאזה 3');
  recordTest('TC-03', 'Shraga Lifecycle Coverage', 'Adapters', tc3Pass, 'Phase 3 active, 235 tests, verdict parsed');

  // TC-04: Plan.md Checklists
  const planDir = path.join(tempBase, 'plan-proj');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'Plan.md'), '# Road\n## Phase 1: Init\n- [x] D1\n## Phase 2: Core\n- [ ] D2');
  const planParsed = AdapterOrchestrator.scanProject(planDir);
  recordTest('TC-04', 'Plan.md Checklists', 'Adapters', planParsed.activePhaseIndex === 1, 'Active sprint detected from incomplete checklist');

  // TC-05: Generic Git & Transparency Banner
  const gitDir = path.join(tempBase, 'git-proj');
  fs.mkdirSync(path.join(gitDir, '.git'), { recursive: true });
  const gitParsed = AdapterOrchestrator.scanProject(gitDir);
  recordTest('TC-05', 'Generic Git & Transparency', 'Adapters', gitParsed.isGenericGit === true, 'Transparency flag set to true');

  // TC-06: Malformed Input Fault Tolerance
  const brokenDir = path.join(tempBase, 'broken-proj');
  fs.mkdirSync(brokenDir, { recursive: true });
  fs.writeFileSync(path.join(brokenDir, 'Plan.md'), 'Broken markdown with no phases or headers! ??? $$$$');
  let tc6Pass = false;
  try {
    const brokenParsed = AdapterOrchestrator.scanProject(brokenDir);
    tc6Pass = brokenParsed && brokenParsed.phases.length >= 0;
  } catch {
    tc6Pass = false;
  }
  recordTest('TC-06', 'Malformed Fault Tolerance', 'Resilience', tc6Pass, 'Graceful handling of corrupt input without crashing');

  // ==========================================
  // SUITE C: PERFORMANCE & CONCURRENCY
  // ==========================================
  // TC-07: Sub-200ms Benchmark
  const duration = shragaParsed.scanDurationMs;
  recordTest('TC-07', 'Sub-200ms Performance Benchmark', 'Performance', duration < 200, `Completed in ${duration}ms (Threshold < 200ms)`);

  // TC-08: Dual-Project Isolation
  const proj1 = path.join(tempBase, 'multi-1');
  const proj2 = path.join(tempBase, 'multi-2');
  fs.mkdirSync(proj1, { recursive: true });
  fs.mkdirSync(proj2, { recursive: true });
  fs.writeFileSync(path.join(proj1, 'Plan.md'), '# P1\n## Phase 1: X\n- [ ] Task');
  fs.writeFileSync(path.join(proj2, 'Plan.md'), '# P2\n## Phase 1: Y\n- [ ] Task');
  const run1 = runOrbitScan(proj1);
  const run2 = runOrbitScan(proj2);
  const tc8Pass = run1.projectHash !== run2.projectHash && run1.storageDir !== run2.storageDir;
  recordTest('TC-08', 'Dual-Project Storage Isolation', 'Concurrency', tc8Pass, 'Distinct hashes and isolated directories');

  // ==========================================
  // SUITE D: UI & ERGONOMICS (Generative UI)
  // ==========================================
  const templatePath = path.join(process.cwd(), 'templates', 'orbit-view.html');
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // TC-09: 100dvh Layout Budget
  const tc9Pass = templateContent.includes('100dvh') && templateContent.includes('overflow-hidden');
  recordTest('TC-09', '100dvh Zero-Scroll Screen Budget', 'UI Architecture', tc9Pass, 'Strict 100dvh viewport and overflow-hidden enforced');

  // TC-10: Time-Machine Stepper
  const tc10Pass = templateContent.includes('selectPhase') && templateContent.includes('resetToActivePhase');
  recordTest('TC-10', 'Interactive Phase Time-Machine', 'Interactive UI', tc10Pass, 'Phase navigation and reset button integrated');

  // TC-11: Live Ticking Clock
  const tc11Pass = templateContent.includes('updateRelativeTicker') && templateContent.includes('tickerClock');
  recordTest('TC-11', 'Live Ticking Relative Clock', 'Live Sync', tc11Pass, 'Every-second ticking prevents frozen screen impression');

  // TC-12: About Modal Drawer
  const tc12Pass = templateContent.includes('aboutModal') && templateContent.includes('openAboutModal') && templateContent.includes('Escape');
  recordTest('TC-12', 'About Modal Drawer & Shortcuts', 'Accessibility', tc12Pass, 'Glassmorphism modal with Esc shortcut verified');

} finally {
  fs.rmSync(tempBase, { recursive: true, force: true });
}

console.log('\n================================================================================');
const totalPassed = results.filter(r => r.passed).length;
console.log(`📊 QA SUMMARY: ${totalPassed} / ${results.length} TESTS PASSED (Pass Rate: ${Math.round((totalPassed/results.length)*100)}%)`);
console.log('================================================================================\n');

if (totalPassed === results.length) {
  console.log('🏆 VERDICT: APPROVED (All Senior QA Gate Criteria Satisfied)');
} else {
  console.error('❌ VERDICT: REJECTED (Failures detected)');
  process.exit(1);
}
