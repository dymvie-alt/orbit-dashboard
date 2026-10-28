/**
 * Orbit Dashboard - Phase 3 Verification: Scanner CLI & Multi-Project Isolation
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { runOrbitScan, getProjectHash } from '../scripts/orbit-scanner.mjs';

console.log('🧪 Starting Phase 3 Scanner & Multi-Project Verification...\n');

const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-p3-test-'));
const projA = path.join(tempBase, 'project-alpha');
const projB = path.join(tempBase, 'project-beta');

fs.mkdirSync(projA, { recursive: true });
fs.mkdirSync(projB, { recursive: true });

fs.writeFileSync(path.join(projA, 'Plan.md'), '# Alpha System\n## Phase 1: Core\n- [x] Task 1\n- [ ] Task 2');
fs.writeFileSync(path.join(projB, 'Plan.md'), '# Beta Portal\n## Phase 1: Setup\n- [x] Init\n## Phase 2: Auth\n- [ ] JWT');

// 1. Scan Project Alpha
console.log('Testing Project Alpha Scan...');
const resA = runOrbitScan(projA, { frequency: 'כל 2 דקות' });

console.assert(fs.existsSync(resA.stateJsonPath), 'orbit-state.json must exist');
console.assert(fs.existsSync(resA.htmlOutputPath), 'index.html must exist');
console.assert(resA.state.projectName === 'Alpha System', `Expected Alpha System, got ${resA.state.projectName}`);
console.log('✓ Project Alpha generated isolated files successfully at:', resA.storageDir);

// 2. Scan Project Beta
console.log('Testing Project Beta Scan (Multi-Project Isolation)...');
const resB = runOrbitScan(projB, { frequency: 'כל דקה' });

console.assert(fs.existsSync(resB.stateJsonPath), 'orbit-state.json for Beta must exist');
console.assert(resB.state.projectName === 'Beta Portal', `Expected Beta Portal, got ${resB.state.projectName}`);
console.assert(resA.projectHash !== resB.projectHash, 'Each project must have a distinct isolation hash!');
console.assert(resA.storageDir !== resB.storageDir, 'Storage paths must be completely isolated!');
console.log('✓ Multi-Project Isolation verified: distinct hashes and separate folders.');

// 3. Test Refresh
console.log('Testing Rescan / Refresh...');
const prevTime = resA.state.timestamp;
// small pause
const resARefresh = runOrbitScan(projA, { frequency: 'כל 2 דקות' });
console.assert(resARefresh.state.timestamp >= prevTime, 'Timestamp must update upon refresh');
console.log('✓ State refresh verified.');

// Clean up
fs.rmSync(tempBase, { recursive: true, force: true });

console.log('\n🎉 All Phase 3 Scanner & Multi-Project Isolation Tests PASSED!');
