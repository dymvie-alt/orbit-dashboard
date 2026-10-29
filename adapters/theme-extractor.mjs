/**
 * Orbit Dashboard - Adaptive Theme Extractor & WCAG Contrast Guardrail
 * Discovers project design tokens, supports all token prefixes (--color-, --, custom),
 * and mathematically enforces WCAG AA (4.5:1) and AAA (7:1) contrast ratios
 * for both Light Mode and Dark Mode.
 */

import fs from 'fs';
import path from 'path';

// WCAG relative luminance calculator
function getLuminance(r, g, b) {
  const [lr, lg, lb] = [r, g, b].map(v => {
    const val = v / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16)
    };
  }
  return { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toH = v => clamp(v).toString(16).padStart(2, '0').toUpperCase();
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Adjusts color towards black (if light) or white (if dark) until target contrast is met
function enforceContrast(colorHex, bgHex, minRatio = 4.5, isLightMode = true) {
  let curHex = colorHex;
  let ratio = getContrastRatio(curHex, bgHex);
  if (ratio >= minRatio) return curHex;

  const rgb = hexToRgb(curHex);
  let iterations = 0;

  while (ratio < minRatio && iterations < 30) {
    iterations++;
    if (isLightMode) {
      // Darken
      rgb.r = Math.max(0, rgb.r * 0.85);
      rgb.g = Math.max(0, rgb.g * 0.85);
      rgb.b = Math.max(0, rgb.b * 0.85);
    } else {
      // Lighten
      rgb.r = Math.min(255, rgb.r * 1.15 + 20);
      rgb.g = Math.min(255, rgb.g * 1.15 + 20);
      rgb.b = Math.min(255, rgb.b * 1.15 + 20);
    }
    curHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    ratio = getContrastRatio(curHex, bgHex);
  }

  return curHex;
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
        const tokenMap = {};

        // 1. Match Markdown table lines or definition lines containing a token and a HEX
        // Handles: --primary, --color-primary, with or without backticks, in any table column order!
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('--') && line.includes('#')) {
            const varMatch = line.match(/--[a-z0-9_-]+/i);
            const hexMatch = line.match(/#[0-9a-fA-F]{3,6}\b/);
            if (varMatch && hexMatch) {
              tokenMap[varMatch[0].toLowerCase()] = hexMatch[0].toUpperCase();
            }
          }
        }

        // 2. Also match CSS property syntax: `--primary: #0F766E;`
        const cssVarRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/gi;
        let cssMatch;
        while ((cssMatch = cssVarRegex.exec(content)) !== null) {
          const varName = cssMatch[1].toLowerCase();
          const hex = cssMatch[2].toUpperCase();
          if (!tokenMap[varName]) tokenMap[varName] = hex;
        }

        // Helper to find token by multiple aliases
        const findToken = (aliases) => {
          for (const a of aliases) {
            if (tokenMap[a]) return tokenMap[a];
          }
          return null;
        };

        const rawPrimary = findToken(['--primary', '--color-primary', '--brand', '--color-brand', '--accent', '--color-accent']);
        const rawBg = findToken(['--bg', '--color-bg', '--background', '--color-background']);
        const rawSurface = findToken(['--surface', '--color-surface', '--card', '--color-card']);
        const rawText = findToken(['--ink', '--text', '--color-text', '--foreground', '--color-foreground']);
        const rawTextMuted = findToken(['--ink-muted', '--text-muted', '--color-text-muted', '--muted']);
        const rawBorder = findToken(['--border', '--color-border', '--border-strong']);

        // Determine if project is Light Mode or Dark Mode
        let isLight = true;
        if (rawBg) {
          const rgb = hexToRgb(rawBg);
          isLight = getLuminance(rgb.r, rgb.g, rgb.b) > 0.45;
        }

        const bg = rawBg || (isLight ? '#F8FAFC' : '#0B0F19');
        const surface = rawSurface || (isLight ? '#FFFFFF' : '#1E293B');

        // Apply WCAG Contrast Guardrails!
        let text = rawText || (isLight ? '#14213D' : '#F8FAFC');
        let textMuted = rawTextMuted || (isLight ? '#4A5568' : '#94A3B8');
        let primary = rawPrimary || (isLight ? '#0F766E' : '#6366F1');

        // Ensure text meets WCAG AAA (7:1) on surface
        text = enforceContrast(text, surface, 7.0, isLight);
        // Ensure muted text meets WCAG AA (4.5:1) on surface
        textMuted = enforceContrast(textMuted, surface, 4.5, isLight);
        // Ensure primary meets WCAG AA (4.5:1) on surface
        primary = enforceContrast(primary, surface, 4.5, isLight);

        const border = rawBorder || (isLight ? '#D9DFEA' : 'rgba(148, 163, 184, 0.25)');

        return {
          detectedSource: path.basename(filePath),
          isLight,
          primary,
          primaryHover: rawPrimary ? enforceContrast(primary, surface, 5.5, isLight) : (isLight ? '#0B5F58' : '#4F46E5'),
          bg,
          surface,
          text,
          textMuted,
          border
        };
      }
    }
  } catch (err) {
    // Tolerant fallback
  }

  // Universal High-Contrast Default (Light by default, togglable to dark)
  return {
    detectedSource: 'default',
    isLight: true,
    primary: '#0F766E',
    primaryHover: '#0B5F58',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#14213D',
    textMuted: '#4A5568',
    border: '#D9DFEA'
  };
}
