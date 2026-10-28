/**
 * Orbit Dashboard - Theme Extractor (Zero-Footprint Read-Only)
 * Discovers project design tokens from DESIGN_SYSTEM.md, css files, or tailwind configs.
 * Supports token table parsing, custom CSS variables, and light/dark luminance detection.
 */

import fs from 'fs';
import path from 'path';

function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function extractProjectTheme(projectPath) {
  try {
    const candidates = [
      path.join(projectPath, 'shraga', 'DESIGN_SYSTEM.md'),
      path.join(projectPath, 'shraga', 'DESIGN.md'),
      path.join(projectPath, 'DESIGN_SYSTEM.md'),
      path.join(projectPath, 'DESIGN.md'),
      path.join(projectPath, 'docs', 'DESIGN_SYSTEM.md'),
      path.join(projectPath, 'src', 'styles', 'tokens.css'),
      path.join(projectPath, 'src', 'index.css'),
      path.join(projectPath, 'src', 'App.css'),
      path.join(projectPath, 'tailwind.config.js')
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 1. Try to extract specific role tokens from Markdown tables or CSS definitions
        const tokenMap = {};
        
        // Match table rows like: | Primary | --color-primary | #2F6F5E | ... |
        const tableRowRegex = /\|\s*([^|]+)\s*\|\s*(--color-[a-zA-Z0-9_-]+)\s*\|\s*(#[0-9a-fA-F]{6})\s*\|/gi;
        let rowMatch;
        while ((rowMatch = tableRowRegex.exec(content)) !== null) {
          const tokenName = rowMatch[2].toLowerCase();
          const hex = rowMatch[3].toUpperCase();
          tokenMap[tokenName] = hex;
        }

        // Match CSS vars like: --color-primary: #2F6F5E;
        const cssVarRegex = /(--color-[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{6})/gi;
        let cssMatch;
        while ((cssMatch = cssVarRegex.exec(content)) !== null) {
          const tokenName = cssMatch[1].toLowerCase();
          const hex = cssMatch[2].toUpperCase();
          if (!tokenMap[tokenName]) tokenMap[tokenName] = hex;
        }

        // Resolve primary, background, surface, text
        const primary = tokenMap['--color-primary'] || null;
        const primaryHover = tokenMap['--color-primary-hover'] || primary;
        const bg = tokenMap['--color-bg'] || null;
        const surface = tokenMap['--color-surface'] || null;
        const text = tokenMap['--color-text'] || null;
        const textMuted = tokenMap['--color-text-muted'] || null;
        const border = tokenMap['--color-border'] || null;

        if (primary || bg) {
          const isLight = bg ? (getLuminance(bg) > 0.5) : true;
          return {
            detectedSource: path.basename(filePath),
            isLight,
            primary: primary || (isLight ? '#2F6F5E' : '#6366f1'),
            primaryHover: primaryHover || (isLight ? '#255A4C' : '#4f46e5'),
            bg: bg || (isLight ? '#F7F5F0' : '#0f172a'),
            surface: surface || (isLight ? '#FFFFFF' : '#1e293b'),
            text: text || (isLight ? '#1F2A28' : '#f8fafc'),
            textMuted: textMuted || (isLight ? '#5E6B68' : '#94a3b8'),
            border: border || (isLight ? '#DDE3E0' : 'rgba(148, 163, 184, 0.2)')
          };
        }

        // Fallback: extract distinct hex codes
        const hexMatches = content.match(/#[0-9a-fA-F]{6}\b/g);
        if (hexMatches && hexMatches.length > 0) {
          const uniqueHexes = [...new Set(hexMatches.map(h => h.toUpperCase()))];
          const nonMonochrome = uniqueHexes.filter(h => h !== '#000000' && h !== '#FFFFFF');
          if (nonMonochrome.length > 0) {
            return {
              detectedSource: path.basename(filePath),
              isLight: true,
              primary: nonMonochrome[0],
              primaryHover: nonMonochrome[1] || nonMonochrome[0],
              bg: '#F8FAFC',
              surface: '#FFFFFF',
              text: '#0F172A',
              textMuted: '#64748B',
              border: '#E2E8F0'
            };
          }
        }
      }
    }
  } catch {
    // Tolerant fallback
  }

  // High-contrast clean default
  return {
    detectedSource: 'default',
    isLight: false,
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.2)'
  };
}
