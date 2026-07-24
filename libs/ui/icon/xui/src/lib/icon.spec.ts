import { NgIcon } from '@ng-icons/core';
import { render } from '@xui/testing';
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
});
