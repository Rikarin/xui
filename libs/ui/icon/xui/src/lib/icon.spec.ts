import { NgIcon } from '@ng-icons/core';
import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiIcon } from './icon';
import { provideXuiIconConfig } from './icon.token';

const setup = (template: string, providers: unknown[] = []) =>
  render(template, { imports: [NgIcon, XuiIcon], providers });

const sizeOf = (element: HTMLElement) => element.style.getPropertyValue('--ng-icon__size');

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

    expect(query('ng-icon').className).toBe('');
  });

  it('applies the colour variant', () => {
    const { query } = setup('<ng-icon xui color="error" />');

    expectClasses(query('ng-icon'), 'text-error');
  });

  it('takes its default colour from the injected config', () => {
    const { query } = setup('<ng-icon xui />', [provideXuiIconConfig({ color: 'muted' })]);

    expectClasses(query('ng-icon'), 'text-foreground-muted');
  });

  it('merges the class input', () => {
    const { query } = setup('<ng-icon xui class="shrink-0" />');

    expectClasses(query('ng-icon'), 'shrink-0');
  });
});
