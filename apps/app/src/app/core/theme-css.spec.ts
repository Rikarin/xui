import type { ThemeDefaults, ThemeOverrides } from './theme-css';
import { buildThemeCss, contrastRatio, countOverrides, emptyOverrides, parseHexColour } from './theme-css';

const NO_DEFAULTS: ThemeDefaults = { light: {}, dark: {} };

function overrides(partial: Partial<ThemeOverrides>): ThemeOverrides {
  return { ...emptyOverrides(), ...partial };
}

describe('buildThemeCss', () => {
  it('emits nothing when nothing has been changed', () => {
    expect(buildThemeCss(emptyOverrides(), NO_DEFAULTS)).toBe('');
  });

  it('emits a token once when both scopes agree', () => {
    const css = buildThemeCss(overrides({ light: { primary: '#7c3aed' }, dark: { primary: '#7c3aed' } }), NO_DEFAULTS);

    expect(css).toBe(":root,\n.light,\n[data-theme='light'] {\n  --primary: #7c3aed;\n}");
    expect(css).not.toContain('.dark');
  });

  it('re-states the untouched scope so the :root selector cannot leak across', () => {
    // Only light was edited, but light and dark differ by default — leaving dark out would let the
    // light block's `:root` win on a dark document, because it is declared after `theme.css`.
    const css = buildThemeCss(overrides({ light: { background: '#fffdf7' } }), {
      light: { background: '#ffffff' },
      dark: { background: '#09090b' }
    });

    expect(css).toContain('--background: #fffdf7;');
    expect(css).toContain(".dark,\n[data-theme='dark'] {\n  --background: #09090b;\n}");
  });

  it('repeats the dark values under the OS-preference selector', () => {
    const css = buildThemeCss(overrides({ light: { primary: '#7c3aed' }, dark: { primary: '#a78bfa' } }), NO_DEFAULTS);

    expect(css).toContain("@media (prefers-color-scheme: dark) {\n  :root:not(.light):not([data-theme='light']) {");
    expect(css.match(/--primary: #a78bfa;/g)).toHaveLength(2);
  });

  it('puts density in its own scope-free block', () => {
    const css = buildThemeCss(overrides({ root: { 'control-height-md': '2rem' } }), NO_DEFAULTS);

    expect(css).toBe(':root {\n  --control-height-md: 2rem;\n}');
  });

  it('falls back to the other scope when a default is missing', () => {
    const css = buildThemeCss(overrides({ dark: { focus: '#38bdf8' } }), NO_DEFAULTS);

    expect(css).toBe(":root,\n.light,\n[data-theme='light'] {\n  --focus: #38bdf8;\n}");
  });
});

describe('countOverrides', () => {
  it('counts every scope', () => {
    expect(countOverrides(overrides({ root: { a: '1' }, light: { b: '2', c: '3' }, dark: { d: '4' } }))).toBe(4);
  });
});

describe('parseHexColour', () => {
  it('reads both lengths', () => {
    expect(parseHexColour('#fff')).toEqual([255, 255, 255]);
    expect(parseHexColour('#0A84FF')).toEqual([10, 132, 255]);
  });

  it('rejects anything that is not hex', () => {
    expect(parseHexColour('oklch(55% 0.15 253)')).toBeNull();
    expect(parseHexColour('rgb(0 0 0)')).toBeNull();
    expect(parseHexColour('#ff')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('spans the full range', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('does not care which way round the pair is given', () => {
    expect(contrastRatio('#1d4ed8', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#1d4ed8') as number, 5);
  });

  it('is null when a colour will not parse', () => {
    expect(contrastRatio('var(--primary)', '#ffffff')).toBeNull();
  });
});
