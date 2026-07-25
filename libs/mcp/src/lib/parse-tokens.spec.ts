import { describe, expect, it } from 'vitest';
import { parseTokens } from './parse-tokens.js';

const CSS = `
/* comment with a { brace } in it */
@theme inline {
  --color-surface: var(--surface);
  --color-primary-subtle: var(--primary-subtle);
}

:root,
.light,
[data-theme='light'] {
  --surface: var(--color-white);
  --foreground: var(--color-zinc-950);
}

.dark,
[data-theme='dark'] {
  --surface: var(--color-zinc-900);
  --foreground: var(--color-zinc-100);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --border: var(--color-zinc-700);
  }
}

:root,
.dark {
  --primary-subtle: color-mix(in oklab, var(--primary) 12%, var(--background));
}
`;

describe('parseTokens', () => {
  const tokens = parseTokens(CSS);
  const byName = (name: string) => tokens.find(token => token.name === name);

  it('pairs the light and dark value of a token', () => {
    expect(byName('surface')).toMatchObject({
      group: 'surfaces',
      light: 'var(--color-white)',
      dark: 'var(--color-zinc-900)'
    });
  });

  it('groups tokens by their semantic prefix', () => {
    expect(byName('foreground')?.group).toBe('text');
    expect(byName('border')?.group).toBe('borders');
    expect(byName('primary-subtle')?.group).toBe('intents');
  });

  it('reads declarations nested in a media query', () => {
    expect(byName('border')?.dark).toBe('var(--color-zinc-700)');
  });

  it('reports a value declared for every theme scope as derived', () => {
    expect(byName('primary-subtle')?.derived).toBe('color-mix(in oklab, var(--primary) 12%, var(--background))');
    expect(byName('primary-subtle')?.light).toBeUndefined();
  });

  it('maps tokens onto their Tailwind utility namespace', () => {
    expect(byName('surface')?.utility).toBe('color');
    expect(byName('primary-subtle')?.utility).toBe('color');
  });
});
