import type { ThemeScope } from './theme-tokens';

/** What the builder has changed, keyed by token name without the leading `--`. */
export interface ThemeOverrides {
  /** Declared once for the document — density, which is not a per-theme value. */
  root: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** The stock value of a touched token, per scope, so the emitter can tell the two scopes apart. */
export type ThemeDefaults = Record<ThemeScope, Record<string, string>>;

export function emptyOverrides(): ThemeOverrides {
  return { root: {}, light: {}, dark: {} };
}

export function isEmpty(overrides: ThemeOverrides): boolean {
  return countOverrides(overrides) === 0;
}

export function countOverrides(overrides: ThemeOverrides): number {
  return Object.keys(overrides.root).length + Object.keys(overrides.light).length + Object.keys(overrides.dark).length;
}

function declarations(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n');
}

/**
 * The CSS that turns the overrides into a theme — the same text the builder injects and the one you
 * copy, so what you previewed is what you paste.
 *
 * Two rules decide where a token lands, and both exist because a bare `:root` also matches a dark
 * document:
 *
 * - A token whose two scopes agree is emitted once, under the light selector. `:root` reaches the
 *   dark document too, and this stylesheet comes after `theme.css`, so it wins there as well.
 * - A token whose scopes differ is emitted in *both* blocks, even when one side is the stock value.
 *   Skipping the unchanged side would leave the `:root` selector of the other one leaking across.
 *
 * The media block repeats the dark values because `theme.css` declares its own under
 * `:root:not(.light):not([data-theme='light'])`, which outranks a plain `.dark` — an app that
 * follows the OS preference rather than pinning a class needs the same specificity to be re-themed.
 */
export function buildThemeCss(overrides: ThemeOverrides, defaults: ThemeDefaults): string {
  const touched = [...new Set([...Object.keys(overrides.light), ...Object.keys(overrides.dark)])].sort();

  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const name of touched) {
    const inLight = overrides.light[name] ?? defaults.light[name] ?? overrides.dark[name];
    const inDark = overrides.dark[name] ?? defaults.dark[name] ?? overrides.light[name];

    if (inLight === undefined || inDark === undefined) {
      continue;
    }

    light[name] = inLight;

    if (inLight !== inDark) {
      dark[name] = inDark;
    }
  }

  const blocks: string[] = [];

  if (Object.keys(overrides.root).length > 0) {
    blocks.push(`:root {\n${declarations(overrides.root)}\n}`);
  }

  if (Object.keys(light).length > 0) {
    blocks.push(`:root,\n.light,\n[data-theme='light'] {\n${declarations(light)}\n}`);
  }

  if (Object.keys(dark).length > 0) {
    const values = declarations(dark);

    blocks.push(`.dark,\n[data-theme='dark'] {\n${values}\n}`);
    blocks.push(
      '/* Only needed if your app follows prefers-color-scheme instead of pinning\n' +
        '   .light or .dark on <html>. Safe to drop if it always pins one. */\n' +
        `@media (prefers-color-scheme: dark) {\n  :root:not(.light):not([data-theme='light']) {\n` +
        `${values.replace(/^/gm, '  ')}\n  }\n}`
    );
  }

  return blocks.join('\n\n');
}

/** `#rrggbb` or `#rgb` to its three channels, or null if it is not a hex colour. */
export function parseHexColour(value: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());

  if (!match) {
    return null;
  }

  const digits =
    match[1].length === 3
      ? [...match[1]].map(digit => digit + digit)
      : [match[1].slice(0, 2), match[1].slice(2, 4), match[1].slice(4, 6)];

  return digits.map(pair => Number.parseInt(pair, 16)) as [number, number, number];
}

/** WCAG 2.2 relative luminance. */
function luminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [r, g, b].map(channel => {
    const ratio = channel / 255;

    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * WCAG 2.2 contrast ratio between two opaque hex colours, 1 to 21, or null if either will not
 * parse.
 *
 * WCAG 2 rather than APCA because the thresholds people are held to — 4.5 for body text, 3 for
 * large text and non-text UI — are still written against this formula.
 */
export function contrastRatio(foreground: string, background: string): number | null {
  const a = parseHexColour(foreground);
  const b = parseHexColour(background);

  if (!a || !b) {
    return null;
  }

  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (lighter + 0.05) / (darker + 0.05);
}
