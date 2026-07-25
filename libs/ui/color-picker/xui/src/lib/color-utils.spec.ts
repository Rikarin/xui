import { hsvToRgb, normalizeHex, parseHex, rgbToHex, rgbToHsv } from './color-utils';

describe('color-utils', () => {
  it('converts HSV to RGB for the primaries', () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
    expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts RGB to HSV', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, v: 100 });
    expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 });
  });

  it('round-trips a color through HSV within rounding tolerance', () => {
    const rgb = { r: 22, g: 119, b: 255 };
    const back = hsvToRgb(rgbToHsv(rgb));
    // Integer HSV rounding can shift each channel by ~1.
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
  });

  it('formats RGB as hex, with alpha only when < 1', () => {
    expect(rgbToHex({ r: 22, g: 119, b: 255 })).toBe('#1677FF');
    expect(rgbToHex({ r: 255, g: 0, b: 0 }, 0.5)).toBe('#FF000080');
  });

  it('parses 3/6/8-digit hex', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseHex('1677ff')).toEqual({ r: 22, g: 119, b: 255, a: 1 });
    expect(parseHex('#FF000080')).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 });
    expect(parseHex('nope')).toBeNull();
  });

  it('normalizes and validates hex', () => {
    expect(normalizeHex('abc')).toBe('#AABBCC');
    expect(normalizeHex('#1677ff')).toBe('#1677FF');
    expect(normalizeHex('#12g')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
  });
});
