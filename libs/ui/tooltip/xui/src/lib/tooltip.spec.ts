import { render, type RenderResult } from '@xui/testing';
import { XuiTooltipImports } from '../index';

const IMPORTS = [XuiTooltipImports];

const panel = () => document.querySelector('xui-tooltip-panel');
const panelText = () => panel()?.textContent?.trim() ?? null;

const fire = (el: Element, type: string) => el.dispatchEvent(new MouseEvent(type, { bubbles: true }));

/** Hover in and let the open delay and change detection settle. */
const hover = (result: RenderResult<never>) => {
  fire(result.query('button'), 'pointerenter');
  jest.runOnlyPendingTimers();
  result.detect();
};

describe('XuiTooltip', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('stays hidden until the trigger is hovered', () => {
    const result = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    expect(panel()).toBeNull();

    hover(result);

    expect(panelText()).toBe('Save');
  });

  it('hides when the pointer leaves', () => {
    const result = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    hover(result);
    fire(result.query('button'), 'pointerleave');

    expect(panel()).toBeNull();
  });

  it('describes the trigger while open, for a screen reader', () => {
    const result = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    expect(result.query('button').getAttribute('aria-describedby')).toBeNull();

    hover(result);

    // The panel's own id, so the hint is announced with the control.
    const describedBy = result.query('button').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(panel()?.id).toBe(describedBy);
    expect(panel()?.getAttribute('role')).toBe('tooltip');
  });

  it('opens on focus so keyboard users see the hint', () => {
    const { query, detect } = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    query('button').dispatchEvent(new FocusEvent('focus'));
    detect();

    expect(panelText()).toBe('Save');
  });

  it('does not open on focus when that is turned off', () => {
    const { query, detect } = render(`<button [xuiTooltip]="'Save'" [openOnTargetFocus]="false">S</button>`, {
      imports: IMPORTS
    });

    query('button').dispatchEvent(new FocusEvent('focus'));
    detect();

    expect(panel()).toBeNull();
  });

  it('hides on blur and on Escape', () => {
    const result = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    hover(result);
    result.query('button').dispatchEvent(new FocusEvent('blur'));
    expect(panel()).toBeNull();

    hover(result);
    result.query('button').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel()).toBeNull();
  });

  it('never opens for empty content', () => {
    const result = render<{ text: string }>(`<button [xuiTooltip]="props().text">S</button>`, {
      imports: IMPORTS,
      props: { text: '   ' }
    });

    hover(result as never);
    // A tooltip bound to a maybe-empty expression must not flash an empty chip.
    expect(panel()).toBeNull();

    result.setProps({ text: 'Now has text' });
    hover(result as never);
    expect(panelText()).toBe('Now has text');
  });

  it('closes when it becomes disabled while open', () => {
    const result = render<{ off: boolean }>(`<button [xuiTooltip]="'Save'" [disabled]="props().off">S</button>`, {
      imports: IMPORTS,
      props: { off: false }
    });

    hover(result as never);
    expect(panelText()).toBe('Save');

    result.setProps({ off: true });
    expect(panel()).toBeNull();
  });

  it('never opens while disabled', () => {
    const result = render(`<button [xuiTooltip]="'Save'" disabled>S</button>`, { imports: IMPORTS });

    hover(result);

    expect(panel()).toBeNull();
  });

  it('opens and closes through the two-way open binding', () => {
    const result = render<{ open: boolean }>(`<button [xuiTooltip]="'Save'" [(open)]="props().open">S</button>`, {
      imports: IMPORTS,
      props: { open: false }
    });

    expect(panel()).toBeNull();

    result.setProps({ open: true });
    expect(panelText()).toBe('Save');

    result.setProps({ open: false });
    expect(panel()).toBeNull();
  });

  it('folds hover state back out through the open binding', () => {
    const result = render<{ open: boolean }>(`<button [xuiTooltip]="'Save'" [(open)]="props().open">S</button>`, {
      imports: IMPORTS,
      props: { open: false }
    });

    hover(result as never);
    expect(result.fixture.componentInstance.props().open).toBe(true);

    fire(result.query('button'), 'pointerleave');
    result.detect();
    expect(result.fixture.componentInstance.props().open).toBe(false);
  });

  it('snaps the open binding back when a write cannot show anything', () => {
    const result = render<{ open: boolean }>(
      `<button [xuiTooltip]="'Save'" disabled [(open)]="props().open">S</button>`,
      { imports: IMPORTS, props: { open: false } }
    );

    result.setProps({ open: true });

    // A disabled tooltip refuses to open, and the binding must reflect that.
    expect(panel()).toBeNull();
    expect(result.fixture.componentInstance.props().open).toBe(false);
  });

  it('carries the color onto the chip', () => {
    const result = render(`<button [xuiTooltip]="'Danger'" color="error">S</button>`, { imports: IMPORTS });

    hover(result);

    expect(panel()?.className).toContain('bg-error');
    expect(panel()?.className).toContain('text-error-foreground');
  });

  it('tightens the padding when compact', () => {
    const result = render(`<button [xuiTooltip]="'Save'" compact>S</button>`, { imports: IMPORTS });

    hover(result);

    expect(panel()?.className).toContain('px-2');
  });

  it('renders template content with its context', () => {
    const result = render(
      `<button [xuiTooltip]="tpl" [context]="{ $implicit: 'Rene' }">S</button>
       <ng-template #tpl let-name><b>{{ name }}</b></ng-template>`,
      { imports: IMPORTS }
    );

    hover(result);

    expect(panel()?.querySelector('b')?.textContent).toBe('Rene');
  });

  it('keeps the chip out of the pointer path', () => {
    const result = render(`<button [xuiTooltip]="'Save'">S</button>`, { imports: IMPORTS });

    hover(result);

    // Otherwise the chip could become its own hover target and never close.
    expect(panel()?.className).toContain('pointer-events-none');
  });
});
