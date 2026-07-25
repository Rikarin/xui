import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiBadge } from './badge';

const setup = (template: string) => render(template, { imports: [XuiBadge] });

describe('XuiBadge', () => {
  it('applies the base classes to the host', () => {
    const { query } = setup('<span xuiBadge>New</span>');

    expect(query('span').textContent).toBe('New');
    expectClasses(query('span'), 'inline-flex', 'rounded-full', 'border');
  });

  it('defaults to the primary colour at the md size', () => {
    const { query } = setup('<span xuiBadge></span>');

    expectClasses(query('span'), 'bg-primary', 'text-primary-foreground', 'text-xs');
  });

  it('applies the colour variant', () => {
    const { query } = setup('<span xuiBadge color="error"></span>');

    expectClasses(query('span'), 'bg-error', 'text-error-foreground');
    expectNoClasses(query('span'), 'bg-primary');
  });

  it('applies the size variant', () => {
    const { query } = setup('<span xuiBadge size="lg"></span>');

    expectClasses(query('span'), 'text-sm');
    expectNoClasses(query('span'), 'text-xs');
  });

  it('drops the hover state when static', () => {
    const { query: interactive } = setup('<span xuiBadge></span>');
    expectClasses(interactive('span'), 'hover:bg-primary-darker');

    const { query: isStatic } = setup('<span xuiBadge static></span>');
    expectNoClasses(isStatic('span'), 'hover:bg-primary-darker');
  });

  it('merges the class input with the variant classes', () => {
    const { query } = setup('<span xuiBadge class="ms-2"></span>');

    expectClasses(query('span'), 'ms-2', 'bg-primary');
  });
});
