import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiProseImports } from '../index';
import { provideXuiProseConfig } from './prose.token';

describe('XuiProse', () => {
  it('styles the document with semantic tokens, never a raw palette colour', () => {
    const { query } = render('<article xuiProse></article>', { imports: [XuiProseImports] });

    expectClasses(query('article'), 'text-foreground', '[&_a]:text-link', '[&_pre]:bg-surface-inset');
  });

  it('applies the size variant to the type scale', () => {
    const { query } = render('<article xuiProse size="sm"></article>', { imports: [XuiProseImports] });

    expectClasses(query('article'), 'text-sm', '[&_h2]:text-xl');
  });

  it('applies the density variant to the vertical rhythm', () => {
    const { query } = render('<article xuiProse density="compact"></article>', { imports: [XuiProseImports] });

    expectClasses(query('article'), '[&_p]:my-2');
    expect(query('article').className).not.toContain('[&_p]:my-4');
  });

  it('merges the class input instead of replacing the variant classes', () => {
    const { query } = render('<article xuiProse class="max-w-prose"></article>', { imports: [XuiProseImports] });

    expectClasses(query('article'), 'max-w-prose', 'text-foreground');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = render('<article xuiProse></article>', {
      imports: [XuiProseImports],
      providers: [provideXuiProseConfig({ size: 'lg', density: 'compact' })]
    });

    expectClasses(query('article'), 'text-lg', '[&_p]:my-2');
  });

  it('reaches markup that arrived as a string', () => {
    // The whole point of descendant selectors: component styles would not.
    const { query } = render('<article xuiProse [innerHTML]="\'<h2>Hi</h2>\'"></article>', {
      imports: [XuiProseImports]
    });

    expect(query('article h2').textContent).toBe('Hi');
    expectClasses(query('article'), '[&_h2]:font-semibold');
  });
});

describe('XuiProseAnchor', () => {
  it('gives the heading its id and a link to itself', () => {
    const { query } = render('<h2 xuiProseAnchor="install">Install</h2>', { imports: [XuiProseImports] });

    expectAttributes(query('h2'), { id: 'install' });
    // Hung off the page's own path, not a bare `#id` — see `basePath`.
    expectAttributes(query('h2 a'), {
      href: `${location.pathname}${location.search}#install`,
      'aria-label': 'Link to this section'
    });
  });

  it("keeps the heading text as the heading's own content", () => {
    const { query } = render('<h3 xuiProseAnchor="usage">Using it</h3>', { imports: [XuiProseImports] });

    expect(query('h3').textContent).toContain('Using it');
    expect(query('h3').tagName).toBe('H3');
  });

  it('lets a projected link replace the default one', () => {
    const { query, queryAll } = render(
      '<h2 xuiProseAnchor="install"><span>Install</span><a xuiProseAnchorLink href="/docs#install">#</a></h2>',
      { imports: [XuiProseImports] }
    );

    expect(queryAll('h2 a')).toHaveLength(1);
    expectAttributes(query('h2 a'), { href: '/docs#install' });
  });

  it('carries enough scroll margin to clear a sticky header', () => {
    const { query } = render('<h2 xuiProseAnchor="x">X</h2>', { imports: [XuiProseImports] });

    expectClasses(query('h2'), 'scroll-mt-[calc(50vh-1.5rem)]');
  });
});
