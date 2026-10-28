/**
 * Orbit Dashboard - Observer & Scanner CLI / Runtime Engine
 * Executes passive read-only scan, serializes orbit-state.json, and generates self-contained index.html
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

export function getStorageDir(projectPath) {
  const hash = getProjectHash(projectPath);
  const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\dymvi';
  const baseDir = path.join(userHome, '.gemini', 'antigravity', 'orbit', 'projects', hash);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return { storageDir: baseDir, projectHash: hash };
}

export function runOrbitScan(projectPath, options = {}) {
  const absPath = path.resolve(projectPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Project directory does not exist: ${absPath}`);
  }

  const { storageDir, projectHash } = getStorageDir(absPath);
  const frequency = options.frequency || 'כל 2 דקות';

  // 1. Scan (Strict Zero-Footprint Read-Only)
  const state = AdapterOrchestrator.scanProject(absPath);
  state.pollFrequency = frequency;
  state.projectHash = projectHash;
  state.timestamp = Date.now();

  // 2. Write state JSON into isolated storage
  const stateJsonPath = path.join(storageDir, 'orbit-state.json');
  fs.writeFileSync(stateJsonPath, JSON.stringify(state, null, 2), 'utf-8');

  // 3. Inject state into Template and write standalone HTML
  const templatePath = path.join(__dirname, '..', 'templates', 'orbit-view.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf-8');
  
  // Inject state directly so it can render offline without webserver CORS restrictions
  htmlContent = htmlContent.replace(
    'let orbitState = window.ORBIT_DATA || null;',
    `let orbitState = ${JSON.stringify(state, null, 2)};`
  );

  const htmlOutputPath = path.join(storageDir, 'index.html');
  fs.writeFileSync(htmlOutputPath, htmlContent, 'utf-8');

  return {
    state,
    storageDir,
    projectHash,
    stateJsonPath,
    htmlOutputPath
  };
}

// CLI Execution support
if (process.argv[1] && process.argv[1].endsWith('orbit-scanner.mjs')) {
  const args = process.argv.slice(2);
  let targetPath = process.cwd();
  let freq = 'כל 2 דקות';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) {
      targetPath = args[i + 1];
      i++;
    } else if (args[i] === '--frequency' && args[i + 1]) {
      freq = args[i + 1];
      i++;
    }
  }

  try {
    const result = runOrbitScan(targetPath, { frequency: freq });
    console.log(JSON.stringify({
      success: true,
      projectName: result.state.projectName,
      adapter: result.state.adapterName,
      activePhase: result.state.activePhaseIndex,
      scanDurationMs: result.state.scanDurationMs,
      htmlPath: result.htmlOutputPath,
      jsonPath: result.stateJsonPath
    }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}
