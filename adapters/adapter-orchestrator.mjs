/**
 * Orbit Dashboard - Adapter Orchestrator
 * Coordinates discovery, adapter selection, theme extraction, and state normalization.
 * Guarantees zero-footprint read-only operation and sub-200ms performance.
 */

import path from 'path';
import { ShragaAdapter } from './shraga-adapter.mjs';
import { PlanAdapter } from './plan-adapter.mjs';
import { GitAdapter } from './git-adapter.mjs';
import { extractProjectTheme } from './theme-extractor.mjs';

export class AdapterOrchestrator {
  /**
   * Scans a target workspace and produces normalized orbit-state.json
   * @param {string} projectPath - Path to target project (strictly read-only)
   * @returns {Object} normalized orbit state
   */
  static scanProject(projectPath) {
    const startTime = performance.now();

    if (!projectPath) {
      throw new Error('projectPath must be provided');
    }

    let adapter = null;
    let adapterType = 'unknown';

    // 1. Adapter Selection
    if (ShragaAdapter.matches(projectPath)) {
      adapter = ShragaAdapter;
      adapterType = 'shraga';
    } else if (PlanAdapter.matches(projectPath)) {
      adapter = PlanAdapter;
      adapterType = 'plan';
    } else {
      adapter = GitAdapter;
      adapterType = 'git';
    }

    // 2. Parse Project Telemetry (Read-Only)
    const state = adapter.parse(projectPath);

    // 3. Extract Theme Tokens if available
    const theme = extractProjectTheme(projectPath);
    if (theme) {
      state.theme = theme;
    }

    // 4. Attach Performance Metrics & Telemetry
    const endTime = performance.now();
    state.scanDurationMs = Math.round((endTime - startTime) * 100) / 100;
    state.projectPath = path.resolve(projectPath);

    return state;
  }
}
