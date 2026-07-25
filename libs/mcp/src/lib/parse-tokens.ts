import type { XuiToken, XuiTokenGroup } from './types.js';

const INTENTS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];

/**
 * Parse `libs/core/styles/theme.css` into the semantic tokens components are required to style
 * with. A regex scanner is enough here: the file is a flat list of custom-property declarations
 * inside a handful of theme-scope blocks, and pulling in a CSS parser to read it would be a
 * dependency for one file.
 */
export function parseTokens(css: string): XuiToken[] {
  const tokens = new Map<string, XuiToken>();
  const utilities = new Map<string, string>();

  for (const block of blocks(css)) {
    const scope = classifyScope(block.selector);

    for (const [name, value] of declarations(block.body)) {
      // `@theme inline` maps a token onto a Tailwind namespace: `--color-surface: var(--surface)`
      // is what makes `bg-surface` exist.
      if (block.selector.includes('@theme')) {
        const [namespace, ...rest] = name.split('-');
        const target = value.match(/var\(--([\w-]+)\)/)?.[1] ?? rest.join('-');
        utilities.set(target, namespace);
        continue;
      }

      if (!scope) {
        continue;
      }

      const token = tokens.get(name) ?? { name, group: groupOf(name) };
      token[scope] = value;
      tokens.set(name, token);
    }
  }

  for (const token of tokens.values()) {
    token.utility = utilities.get(token.name);
  }

  return [...tokens.values()].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

interface Block {
  selector: string;
  body: string;
}

/** Top-level `selector { … }` blocks, plus the inner block of `@media` wrappers. */
function blocks(css: string): Block[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found: Block[] = [];
  let selectorStart = 0;
  let depth = 0;
  let bodyStart = 0;
  let selector = '';

  for (let index = 0; index < stripped.length; index++) {
    const character = stripped[index];

    if (character === '{') {
      if (depth === 0) {
        selector = stripped.slice(selectorStart, index).trim();
        bodyStart = index + 1;
      }

      depth++;
    } else if (character === '}') {
      depth--;

      if (depth === 0) {
        const body = stripped.slice(bodyStart, index);

        if (selector.startsWith('@media')) {
          // A media query wraps further selector blocks; recurse so the declarations inside are
          // attributed to their own selector (`:root:not(.light)` for the dark preference block).
          found.push(...blocks(body).map(inner => ({ ...inner, selector: `${selector} ${inner.selector}` })));
        } else {
          found.push({ selector, body });
        }

        selectorStart = index + 1;
      }
    }
  }

  return found;
}

function declarations(body: string): [string, string][] {
  const found: [string, string][] = [];
  const pattern = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body))) {
    found.push([match[1], match[2].replace(/\s+/g, ' ').trim()]);
  }

  return found;
}

/**
 * Which theme a block declares values for. The derived intent ramps are declared for every scope
 * at once (they resolve against `--background` on the element they are declared on), so a selector
 * naming both themes is reported as `derived` rather than being split in two.
 */
function classifyScope(selector: string): 'light' | 'dark' | 'derived' | undefined {
  if (selector.includes('@theme')) {
    return undefined;
  }

  // The OS-preference block is `@media (prefers-color-scheme: dark) { :root:not(.light) … }`, so it
  // names `:root` while declaring dark values - the media query decides.
  if (/prefers-color-scheme:\s*dark/.test(selector)) {
    return 'dark';
  }

  const light = /:root|\.light|\[data-theme='light'\]/.test(selector);
  const dark = /\.dark|\[data-theme='dark'\]/.test(selector);

  if (light && dark) {
    return 'derived';
  }

  if (dark) {
    return 'dark';
  }

  return light ? 'light' : undefined;
}

function groupOf(name: string): XuiTokenGroup {
  if (INTENTS.some(intent => name === intent || name.startsWith(`${intent}-`))) {
    return 'intents';
  }

  if (/^(background|surface|muted)/.test(name)) {
    return 'surfaces';
  }

  if (/^foreground/.test(name)) {
    return 'text';
  }

  if (/^border/.test(name)) {
    return 'borders';
  }

  if (/^(focus|link|selection|hover-overlay|active-overlay|disabled)/.test(name)) {
    return 'state';
  }

  if (/^(shadow|elevation)/.test(name)) {
    return 'elevation';
  }

  if (/^(duration|ease|animate)/.test(name)) {
    return 'motion';
  }

  if (/^(text|font|leading|tracking|radius)/.test(name)) {
    return 'typography';
  }

  return 'other';
}
