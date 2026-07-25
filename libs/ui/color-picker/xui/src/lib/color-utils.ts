export interface RGB {
  r: number;
  g: number;
  b: number;
}
/** Hue 0–360, saturation/value 0–100. */
export interface HSV {
  h: number;
  s: number;
  v: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const hex2 = (value: number): string => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const hh = (h % 360) / 60;
  const ss = clamp(s, 0, 100) / 100;
  const vv = clamp(v, 0, 100) / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = vv - c;
  const seg = Math.floor(hh) % 6;
  const [r, g, b] =
    seg === 0
      ? [c, x, 0]
      : seg === 1
        ? [x, c, 0]
        : seg === 2
          ? [0, c, x]
          : seg === 3
            ? [0, x, c]
            : seg === 4
              ? [x, 0, c]
              : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) };
}

/** `#RRGGBB`, or `#RRGGBBAA` when `alpha` (0–1) is below 1. */
export function rgbToHex({ r, g, b }: RGB, alpha = 1): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
  return alpha >= 1 ? base : `${base}${hex2(alpha * 255).toUpperCase()}`;
}

export interface RGBA extends RGB {
  a: number;
}

/** Parse a 3/6/8-digit hex (with or without `#`); returns null when invalid. */
export function parseHex(input: string): RGBA | null {
  const normalized = normalizeHex(input);
  if (!normalized) {
    return null;
  }
  const hex = normalized.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/** Canonicalize hex to uppercase `#RRGGBB`/`#RRGGBBAA`; expands shorthand; null when invalid. */
export function normalizeHex(input: string): string | null {
  let hex = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split('')
      .map(ch => ch + ch)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
    return null;
  }
  return `#${hex.toUpperCase()}`;
}
