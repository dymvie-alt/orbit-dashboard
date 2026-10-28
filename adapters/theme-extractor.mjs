/**
 * Orbit Dashboard - Theme Extractor (Zero-Footprint Read-Only)
 * Discovers project design tokens from DESIGN_SYSTEM.md, css files, or tailwind configs.
 */

import fs from 'fs';
import path from 'path';

export function extractProjectTheme(projectPath) {
  try {
    const candidates = [
      path.join(projectPath, 'DESIGN_SYSTEM.md'),
      path.join(projectPath, 'DESIGN.md'),
      path.join(projectPath, 'docs', 'DESIGN_SYSTEM.md'),
      path.join(projectPath, 'src', 'index.css'),
      path.join(projectPath, 'src', 'App.css'),
      path.join(projectPath, 'tailwind.config.js')
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract Hex colors
        const hexMatches = content.match(/#[0-9a-fA-F]{6}\b/g);
        if (hexMatches && hexMatches.length > 0) {
          // Find distinctive colors
          const uniqueHexes = [...new Set(hexMatches.map(h => h.toLowerCase()))];
          
          // Filter out pure black/white
          const nonMonochrome = uniqueHexes.filter(h => h !== '#000000' && h !== '#ffffff');
          
          if (nonMonochrome.length > 0) {
            return {
              primary: nonMonochrome[0],
              primaryHover: nonMonochrome[1] || nonMonochrome[0],
              accent: nonMonochrome[2] || '#0ea5e9',
              detectedSource: path.basename(filePath)
            };
          }
        }
      }
    }
  } catch {
    // Tolerant fallback
  }

  return null;
}
