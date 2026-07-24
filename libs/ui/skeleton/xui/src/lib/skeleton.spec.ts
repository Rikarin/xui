import { expectClasses, render } from '@xui/testing';
import { XuiSkeleton } from './skeleton';

const setup = (template: string) => render(template, { imports: [XuiSkeleton] });

describe('XuiSkeleton', () => {
  it('renders an animated placeholder', () => {
    const { query } = setup('<xui-skeleton />');

    expectClasses(query('xui-skeleton'), 'block', 'animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('merges the class input, letting callers size it', () => {
    const { query } = setup('<xui-skeleton class="h-4 w-32" />');

    expectClasses(query('xui-skeleton'), 'h-4', 'w-32', 'animate-pulse');
  });

  it('lets a caller override a base class rather than duplicating it', () => {
    // tailwind-merge resolves the conflict in favour of the user's class.
    const { query } = setup('<xui-skeleton class="rounded-full" />');

    expectClasses(query('xui-skeleton'), 'rounded-full');
    expect(query('xui-skeleton').className).not.toContain('rounded-md');
  });
});
