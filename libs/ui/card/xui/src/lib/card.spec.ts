import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiCard } from './card';
import { provideXuiCardConfig } from './card.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiCard], providers });

describe('XuiCard', () => {
  it('renders a flat surface by default', () => {
    const { query } = setup('<div xuiCard>Content</div>');

    expect(query('div').textContent).toBe('Content');
    expectClasses(query('div'), 'bg-surface-raised', 'rounded-lg', 'shadow-elevation-0', 'p-5');
  });

  it.each([0, 1, 2, 3, 4])('applies elevation %s', elevation => {
    const { query } = setup(`<div xuiCard [elevation]="${elevation}">Content</div>`);

    expectClasses(query('div'), `shadow-elevation-${elevation}`);
  });

  it('is not interactive by default', () => {
    const { query } = setup('<div xuiCard>Content</div>');

    expectNoClasses(query('div'), 'cursor-pointer');
  });

  it('lifts one elevation step on hover when interactive', () => {
    const { query } = setup('<button xuiCard interactive [elevation]="1">Content</button>');

    expectClasses(query('button'), 'cursor-pointer', 'hover:shadow-elevation-2');
  });

  it('works on a real button so keyboard activation comes for free', () => {
    const { query } = setup('<button xuiCard interactive>Content</button>');

    // A `<div>` with a click handler would need role/tabindex/keydown wiring;
    // the directive deliberately leaves the element choice to the caller.
    expect(query('button').tagName).toBe('BUTTON');
  });

  it('draws the selected ring and reports it only when interactive', () => {
    const { query: selectable } = setup('<button xuiCard interactive selected>Content</button>');
    expectClasses(selectable('button'), 'ring-2', 'ring-primary');
    // `aria-selected` is invalid on a button; a toggle button is `aria-pressed`.
    expectAttributes(selectable('button'), { 'aria-pressed': 'true', 'aria-selected': null });

    // A static card cannot be selected by the user, so announcing a selection
    // state would be a lie.
    const { query: plain } = setup('<div xuiCard selected>Content</div>');
    expectAttributes(plain('div'), { 'aria-pressed': null, 'aria-selected': null });
  });

  it('reduces the padding when compact', () => {
    const { query } = setup('<div xuiCard compact>Content</div>');

    expectClasses(query('div'), 'p-3');
    expectNoClasses(query('div'), 'p-5');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<div xuiCard>Content</div>', [provideXuiCardConfig({ elevation: 2, compact: true })]);

    expectClasses(query('div'), 'shadow-elevation-2', 'p-3');
  });

  it('merges the class input', () => {
    const { query } = setup('<div xuiCard class="w-64">Content</div>');

    expectClasses(query('div'), 'w-64', 'rounded-lg');
  });
});
