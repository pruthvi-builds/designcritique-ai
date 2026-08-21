/**
 * WCAG 2.x contrast ratio calculations. Pure functions, no I/O — see
 * https://www.w3.org/TR/WCAG21/#contrast-minimum for the underlying formulas.
 */

export type WcagLevel = "AAA" | "AA" | "Fail";

const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(hex: string): boolean {
  return HEX_PATTERN.test(hex.trim());
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return trimmed;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!isValidHexColor(hex)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  const normalized = normalizeHex(hex);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Relative luminance per WCAG, from an sRGB channel value (0-255). */
function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** Contrast ratio between two colors, from 1 (no contrast) to 21 (black on white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG conformance level for a given contrast ratio.
 * Large text is >=18pt (or >=14pt bold) and has lower thresholds.
 */
export function wcagLevel(ratio: number, isLargeText: boolean): WcagLevel {
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  if (ratio >= aaaThreshold) return "AAA";
  if (ratio >= aaThreshold) return "AA";
  return "Fail";
}

export type ContrastCheckResult = {
  ratio: number;
  normalText: WcagLevel;
  largeText: WcagLevel;
};

export function checkContrast(foreground: string, background: string): ContrastCheckResult {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    normalText: wcagLevel(ratio, false),
    largeText: wcagLevel(ratio, true),
  };
}
