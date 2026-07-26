import { NgIcon } from '@ng-icons/core';
import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiIcon } from './icon';
import { provideXuiIconConfig } from './icon.token';

const setup = (template: string, providers: unknown[] = []) =>
  render(template, { imports: [NgIcon, XuiIcon], providers });

const sizeOf = (element: HTMLElement) => element.style.getPropertyValue('--ng-icon__size');

// `@ng-icons` colours its host from this variable inside a cascade layer that outranks Tailwind's
// utilities, so the variable — not a `text-*` class — is what decides an icon's colour.
const colorOf = (element: HTMLElement) => element.style.getPropertyValue('--ng-icon__color');

describe('XuiIcon', () => {
  it.each([
    ['xs', '12px'],
    ['sm', '16px'],
    ['md', '24px'],
    ['lg', '32px'],
    ['xl', '48px']
  ])('maps the %s size to %s', (size, expected) => {
    const { query } = setup(`<ng-icon xui size="${size}" />`);

    expect(sizeOf(query('ng-icon'))).toBe(expected);
  });

  it('passes an arbitrary CSS length straight through', () => {
    const { query } = setup('<ng-icon xui size="1.5rem" />');

    expect(sizeOf(query('ng-icon'))).toBe('1.5rem');
  });

  it('takes its default size from the injected config', () => {
    const { query } = setup('<ng-icon xui />', [provideXuiIconConfig({ size: 'lg' })]);

    expect(sizeOf(query('ng-icon'))).toBe('32px');
  });

  it('lets an explicit size win over the configured default', () => {
    const { query } = setup('<ng-icon xui size="xs" />', [provideXuiIconConfig({ size: 'lg' })]);

    expect(sizeOf(query('ng-icon'))).toBe('12px');
  });

  it('is hidden from assistive technology when decorative', () => {
    const { query } = setup('<ng-icon xui />');

    // An icon with no accessible name is decoration; announcing it would just
    // add noise next to the label it sits beside.
    expectAttributes(query('ng-icon'), { 'aria-hidden': 'true', role: null, 'aria-label': null });
  });

  it('becomes a labelled image once given a label', () => {
    const { query } = setup('<ng-icon xui label="Remove" />');

    expectAttributes(query('ng-icon'), { role: 'img', 'aria-label': 'Remove', 'aria-hidden': null });
  });

  it('inherits the surrounding text colour by default', () => {
    const { query } = setup('<ng-icon xui />');

    // Left unset so the package's own `currentColor` fallback applies.
    expect(colorOf(query('ng-icon'))).toBe('');
    expect(query('ng-icon').className).toBe('');
  });

  it.each([
    ['muted', 'var(--color-foreground-muted)'],
    ['subtle', 'var(--color-foreground-subtle)'],
    ['primary', 'var(--color-primary)'],
    ['secondary', 'var(--color-secondary)'],
    ['success', 'var(--color-success)'],
    ['error', 'var(--color-error)'],
    ['warning', 'var(--color-warning)'],
    ['info', 'var(--color-info)']
  ])('paints the %s variant with %s', (color, expected) => {
    const { query } = setup(`<ng-icon xui color="${color}" />`);

    expect(colorOf(query('ng-icon'))).toBe(expected);
  });

  it('wins over the colour the shared input name hands to ng-icon', () => {
    // `ng-icon` has a `color` input of its own, so it is bound to the variant name as well and
    // would otherwise set `--ng-icon__color: error` — not a colour any browser understands.
    const { query } = setup('<ng-icon xui color="error" />');

    expect(colorOf(query('ng-icon'))).toBe('var(--color-error)');
  });

  it('takes its default colour from the injected config', () => {
    const { query } = setup('<ng-icon xui />', [provideXuiIconConfig({ color: 'muted' })]);

    expect(colorOf(query('ng-icon'))).toBe('var(--color-foreground-muted)');
  });

  it('merges the class input', () => {
    const { query } = setup('<ng-icon xui class="shrink-0" />');

    expectClasses(query('ng-icon'), 'shrink-0');
  });
});
