import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiSkeleton } from './skeleton';
import { XuiSkeletonDirective } from './skeleton.directive';

const setup = (template: string) => render(template, { imports: [XuiSkeleton, XuiSkeletonDirective] });

describe('XuiSkeleton', () => {
  it('renders an animated placeholder hidden from assistive technology', () => {
    const { query } = setup('<xui-skeleton />');

    expectClasses(query('xui-skeleton'), 'block', 'animate-pulse', 'rounded-md', 'bg-muted');
    expectAttributes(query('xui-skeleton'), { 'aria-hidden': 'true' });
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

describe('XuiSkeletonDirective', () => {
  it('masks the host while active', () => {
    const { query } = setup('<h2 xuiSkeleton>Title</h2>');

    expectClasses(query('h2'), 'animate-pulse', 'bg-muted!', 'text-transparent!');
  });

  it('forces the mask over a host that paints its own background', () => {
    // Both directives write to the same `class` attribute, so without `!` the
    // winner would be decided by Tailwind's stylesheet order — a masked button
    // would keep its own fill.
    const { query } = setup('<button xuiSkeleton class="bg-primary">Save</button>');

    expectClasses(query('button'), 'bg-muted!', 'rounded-md!');
  });

  it('removes masked content from the accessibility tree and the tab order', () => {
    const { query } = setup('<button xuiSkeleton>Save</button>');

    // Placeholder text must not be announced or focusable — `inert` covers
    // pointer events and focus, `aria-hidden` covers the screen reader.
    expectAttributes(query('button'), { 'aria-hidden': 'true', inert: '', tabindex: '-1' });
  });

  it('does nothing while inactive', () => {
    const { query } = setup('<h2 [xuiSkeleton]="false">Title</h2>');

    expect(query('h2').className).toBe('');
    expectAttributes(query('h2'), { 'aria-hidden': null, inert: null, tabindex: null });
  });

  it('toggles with its binding', () => {
    const { query, setProps } = render<{ loading: boolean }>('<h2 [xuiSkeleton]="props().loading">Title</h2>', {
      imports: [XuiSkeletonDirective],
      props: { loading: true }
    });

    expectClasses(query('h2'), 'animate-pulse');

    setProps({ loading: false });

    expect(query('h2').className).toBe('');
  });

  it('keeps the host in the layout so nothing shifts when content arrives', () => {
    const { query } = setup('<h2 xuiSkeleton>Title</h2>');

    // The text is still there, just painted transparent — that is what holds
    // the element at its natural size.
    expect(query('h2').textContent).toBe('Title');
  });
});
