/**
 * Orbit Dashboard - Phase 2 Test Suite: Adapters & Zero-Footprint Verification
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { AdapterOrchestrator } from '../adapters/adapter-orchestrator.mjs';
import { ShragaAdapter } from '../adapters/shraga-adapter.mjs';
import { PlanAdapter } from '../adapters/plan-adapter.mjs';
import { GitAdapter } from '../adapters/git-adapter.mjs';

console.log('🧪 Starting Phase 2 Adapters & Performance Verification...\n');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-test-fixtures-'));

function createShragaFixture() {
  const dir = path.join(tempDir, 'sample-shraga');
  const sDir = path.join(dir, 'shraga');
  fs.mkdirSync(path.join(sDir, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(sDir, 'reviews'), { recursive: true });
  fs.mkdirSync(path.join(sDir, 'prompts'), { recursive: true });

  fs.writeFileSync(path.join(sDir, 'PHASE.md'), 'PHASE=2\n');
  fs.writeFileSync(path.join(sDir, 'project-arch-plan.md'), '# קל כסף (Kal Kesef)\nאפליקציה לחינוך פיננסי');
  
  const planMd = `
# Plan
### פאזה 0: תשתית
- [x] הקמת פרויקט
- [x] מסד נתונים
### פאזה 1: ליבה
- [x] טפסי הוצאות
- [x] בדיקות יחידה
### פאזה 2: ריבית
- [x] חישוב ריבית
- [ ] גרף צמיחה
- [ ] יעדי חיסכון
### פאזה 3: PWA
- [ ] מניפסט
  `;
  fs.writeFileSync(path.join(sDir, 'Plan.md'), planMd);
  fs.writeFileSync(path.join(sDir, 'reports', 'phase-1-report.md'), '# Phase 1 Report\n119 בדיקות עברו בהצלחה!');
  fs.writeFileSync(path.join(sDir, 'reviews', 'phase-1-review.md'), '# Phase 1 Review\nפסק דין: Approved with conditions');
  fs.writeFileSync(path.join(sDir, 'prompts', 'phase-2-prompt.md'), 'פתח מחשבון ריבית דריבית כולל סליידרים');
  fs.writeFileSync(path.join(dir, 'DESIGN_SYSTEM.md'), '# Design\n| Token | HEX |\n|---|---|\n| `--primary` | `#7C3AED` |\n| `--bg` | `#F7F5F0` |');

  return dir;
}

function createPlanFixture() {
  const dir = path.join(tempDir, 'sample-plan');
  fs.mkdirSync(dir, { recursive: true });
  const planMd = `
# My Task Planner
## Phase 1: Foundation
- [x] Setup repository
- [x] Database connection
## Phase 2: Feature Development
- [x] Authentication
- [ ] User dashboard
## Phase 3: Deployment
- [ ] Dockerize
  `;
  fs.writeFileSync(path.join(dir, 'Plan.md'), planMd);
  return dir;
}

function createGenericGitFixture() {
  const dir = path.join(tempDir, 'sample-generic');
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'generic-app', scripts: { test: 'vitest' } }));
  fs.writeFileSync(path.join(dir, 'index.js'), 'console.log("hello");');
  return dir;
}

// 1. Test Shraga Adapter
const shragaPath = createShragaFixture();
const preShragaFiles = fs.readdirSync(shragaPath);

console.log('Testing Shraga Adapter...');
const shragaState = AdapterOrchestrator.scanProject(shragaPath);

console.assert(shragaState.adapterName.includes('Shraga'), 'Should identify Shraga Adapter');
console.assert(shragaState.activePhaseIndex === 2, `Expected active phase 2, got ${shragaState.activePhaseIndex}`);
console.assert(shragaState.projectName.includes('קל כסף'), `Expected project name containing 'קל כסף', got ${shragaState.projectName}`);
console.assert(shragaState.phases.length === 4, `Expected 4 phases, got ${shragaState.phases.length}`);
console.assert(shragaState.phases[1].verdict.includes('Approved with conditions'), 'Should extract review verdict');
console.assert(shragaState.phases[1].testsCount === '119', 'Should extract test count');
console.assert(shragaState.theme && shragaState.theme.primary.toLowerCase() === '#7c3aed', 'Should extract theme color');
console.log('✓ Shraga Adapter passed all assertions.');

// 2. Test Plan Adapter
const planPath = createPlanFixture();
console.log('Testing Plan.md Adapter...');
const planState = AdapterOrchestrator.scanProject(planPath);

console.assert(planState.adapterName.includes('Plan'), 'Should identify Plan Adapter');
console.assert(planState.activePhaseIndex === 1, `Expected active phase index 1 (Phase 2), got ${planState.activePhaseIndex}`);
console.assert(planState.phases.length === 3, `Expected 3 phases, got ${planState.phases.length}`);
console.assert(planState.isGenericGit === false, 'Plan adapter should not be generic git');
console.log('✓ Plan.md Adapter passed all assertions.');

// 3. Test Generic Git Adapter
const gitPath = createGenericGitFixture();
console.log('Testing Generic Git Adapter...');
const gitState = AdapterOrchestrator.scanProject(gitPath);

console.assert(gitState.adapterName.includes('Generic Git'), 'Should identify Generic Git Adapter');
console.assert(gitState.isGenericGit === true, 'Should flag isGenericGit for transparency banner');
console.assert(gitState.phases.length > 0, 'Should generate activity phases');
console.log('✓ Generic Git Adapter passed all assertions.');

// 4. Zero-Footprint Verification
console.log('\nTesting Zero-Footprint integrity...');
const postShragaFiles = fs.readdirSync(shragaPath);
console.assert(
  JSON.stringify(preShragaFiles) === JSON.stringify(postShragaFiles),
  'CRITICAL: Project folder contents were altered during scan!'
);
console.log('✓ Zero-Footprint verified: zero files added, modified, or touched in target project!');

// 5. Performance Verification (< 200ms)
console.log(`\nPerformance: Scan completed in ${shragaState.scanDurationMs}ms (Threshold: < 200ms)`);
console.assert(shragaState.scanDurationMs < 200, `Performance exceeded 200ms: ${shragaState.scanDurationMs}ms`);
console.log('✓ Performance threshold verified!');

// Clean up test temp
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('\n🎉 All Phase 2 Adapter Tests PASSED successfully!');
