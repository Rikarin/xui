import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiLink } from './link';
import { provideXuiLinkConfig } from './link.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiLink], providers });

describe('XuiLink', () => {
  it('underlines and colours the link by default', () => {
    const { query } = setup('<a xuiLink href="/docs">Docs</a>');

    expect(query('a').textContent).toBe('Docs');
    expectClasses(query('a'), 'underline', 'text-link', 'hover:text-link-hover');
  });

  it('leaves the anchor attributes alone', () => {
    const { query } = setup('<a xuiLink href="/docs" target="_blank" rel="noreferrer">Docs</a>');
    const anchor = query<HTMLAnchorElement>('a');

    expect(anchor.getAttribute('href')).toBe('/docs');
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noreferrer');
  });

  it('reveals the underline only on hover when asked', () => {
    const { query } = setup('<a xuiLink underline="hover">Docs</a>');

    expectClasses(query('a'), 'no-underline', 'hover:underline');
  });

  it('drops the underline entirely', () => {
    const { query } = setup('<a xuiLink underline="none">Docs</a>');

    expectClasses(query('a'), 'no-underline');
    expectNoClasses(query('a'), 'hover:underline');
  });

  it('inherits the surrounding text colour', () => {
    const { query } = setup('<a xuiLink color="inherit">Docs</a>');

    expectClasses(query('a'), 'text-inherit');
    expectNoClasses(query('a'), 'text-link');
  });

  it('applies an intent colour', () => {
    const { query } = setup('<a xuiLink color="error">Delete</a>');

    expectClasses(query('a'), 'text-error', 'hover:text-error-darker');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<a xuiLink>Docs</a>', [provideXuiLinkConfig({ underline: 'hover', color: 'inherit' })]);

    expectClasses(query('a'), 'no-underline', 'text-inherit');
  });

  it('lets an explicit input win over the configured default', () => {
    const { query } = setup('<a xuiLink underline="none">Docs</a>', [provideXuiLinkConfig({ underline: 'hover' })]);

    expectClasses(query('a'), 'no-underline');
    expectNoClasses(query('a'), 'hover:underline');
  });

  it('merges the class input', () => {
    const { query } = setup('<a xuiLink class="font-semibold">Docs</a>');

    expectClasses(query('a'), 'font-semibold', 'text-link');
  });
});
