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

/** Hue 0–360, saturation/lightness 0–100. */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/** CIE LCH(ab): lightness 0–100, chroma 0–~132, hue 0–360. */
export interface LCH {
  l: number;
  c: number;
  h: number;
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

export function rgbToHsl({ r, g, b }: RGB): HSL {
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
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = (((h % 360) + 360) % 360) / 60;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = ll - c / 2;
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

// --- CIE LCH(ab), via linear sRGB → XYZ → Lab → LCH (D65 white point) ---
const D65: [number, number, number] = [0.95047, 1, 1.08883];
const srgbToLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (channel: number): number => {
  const c = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  return clamp(Math.round(c * 255), 0, 255);
};
const labF = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const labFInv = (t: number): number => {
  const t3 = t * t * t;
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
};

export function rgbToLch({ r, g, b }: RGB): LCH {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = labF((0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl) / D65[0]);
  const y = labF((0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl) / D65[1]);
  const z = labF((0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl) / D65[2]);
  const lStar = 116 * y - 16;
  const aStar = 500 * (x - y);
  const bStar = 200 * (y - z);
  const c = Math.sqrt(aStar * aStar + bStar * bStar);
  let h = (Math.atan2(bStar, aStar) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: Math.round(lStar), c: Math.round(c), h: Math.round(h) };
}

export function lchToRgb({ l, c, h }: LCH): RGB {
  const hr = (h * Math.PI) / 180;
  const aStar = c * Math.cos(hr);
  const bStar = c * Math.sin(hr);
  const fy = (l + 16) / 116;
  const fx = fy + aStar / 500;
  const fz = fy - bStar / 200;
  const x = labFInv(fx) * D65[0];
  const y = labFInv(fy) * D65[1];
  const z = labFInv(fz) * D65[2];
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gl = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  return { r: linearToSrgb(rl), g: linearToSrgb(gl), b: linearToSrgb(bl) };
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
