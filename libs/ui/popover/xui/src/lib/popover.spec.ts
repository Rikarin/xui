import { render } from '@xui/testing';
import { XuiPopoverImports } from '../index';

const IMPORTS = [XuiPopoverImports];

/** The floating surface, wherever the overlay put it in the document. */
const panel = () => document.querySelector('xui-popover-panel');
const panelText = () => panel()?.textContent?.trim() ?? null;

const outsideClick = () => {
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};

const escape = () =>
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

const CLICK = `
  <button [xuiPopover]="tpl">Trigger</button>
  <ng-template #tpl><div>Panel body</div></ng-template>
`;

describe('XuiPopover', () => {
  afterEach(() => {
    // The overlay attaches to body, outside the fixture; make sure a leaked
    // panel from one test cannot be seen by the next.
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('does not render the content until it opens', () => {
    render(CLICK, { imports: IMPORTS });

    expect(panel()).toBeNull();
  });

  it('opens on a trigger click and floats the content', () => {
    const { click } = render(CLICK, { imports: IMPORTS });

    click('button');

    expect(panelText()).toBe('Panel body');
  });

  it('toggles shut on a second click', () => {
    const { click } = render(CLICK, { imports: IMPORTS });

    click('button');
    click('button');

    expect(panel()).toBeNull();
  });

  it('reflects the open state on the trigger for assistive tech', () => {
    const { click, query } = render(CLICK, { imports: IMPORTS });

    expect(query('button').getAttribute('aria-expanded')).toBe('false');
    expect(query('button').getAttribute('aria-haspopup')).toBe('true');

    click('button');

    expect(query('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape', () => {
    const { click } = render(CLICK, { imports: IMPORTS });

    click('button');
    escape();

    expect(panel()).toBeNull();
  });

  it('closes on an outside click', () => {
    const { click } = render(CLICK, { imports: IMPORTS });

    click('button');
    outsideClick();

    expect(panel()).toBeNull();
  });

  it('never opens while disabled', () => {
    const { click } = render(
      '<button [xuiPopover]="tpl" disabled="true">T</button><ng-template #tpl>Body</ng-template>',
      {
        imports: IMPORTS
      }
    );

    click('button');

    expect(panel()).toBeNull();
  });

  it('opens but does not toggle shut from the trigger when click-target', () => {
    const { click } = render(
      `<button [xuiPopover]="tpl" interactionKind="click-target">T</button><ng-template #tpl>Body</ng-template>`,
      { imports: IMPORTS }
    );

    click('button');
    click('button');

    // Only an outside click or Escape dismisses a click-target popover.
    expect(panelText()).toBe('Body');
    outsideClick();
    expect(panel()).toBeNull();
  });

  it('passes the template context through to the content', () => {
    const { click } = render(
      `<button [xuiPopover]="tpl" [context]="{ $implicit: 'Rene' }">T</button>
       <ng-template #tpl let-name>Hi {{ name }}</ng-template>`,
      { imports: IMPORTS }
    );

    click('button');

    expect(panelText()).toBe('Hi Rene');
  });

  it('dresses the surface as a raised card, and drops the rounding when minimal', () => {
    const { click } = render(CLICK, { imports: IMPORTS });
    click('button');
    expect(panel()?.className).toContain('rounded-lg');
    expect(panel()?.className).toContain('bg-surface-overlay');

    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());

    const two = render(`<button [xuiPopover]="tpl" minimal>T</button><ng-template #tpl>Body</ng-template>`, {
      imports: IMPORTS
    });
    two.click('button');
    expect(panel()?.className).toContain('rounded-none');
  });

  describe('controlled', () => {
    const CONTROLLED = `<button [xuiPopover]="tpl" [(open)]="props().open">T</button><ng-template #tpl>Body</ng-template>`;

    it('opens and closes from a bound open', () => {
      const { setProps } = render<{ open: boolean }>(CONTROLLED, { imports: IMPORTS, props: { open: false } });

      expect(panel()).toBeNull();

      setProps({ open: true });
      expect(panelText()).toBe('Body');

      setProps({ open: false });
      expect(panel()).toBeNull();
    });
  });

  describe('hover', () => {
    const HOVER = `<button [xuiPopover]="tpl" interactionKind="hover" [hoverOpenDelay]="100" [hoverCloseDelay]="200">T</button><ng-template #tpl>Body</ng-template>`;
    const enter = (el: Element) => el.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true }));
    const leave = (el: Element) => el.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }));

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('opens after the hover-open delay and not before', () => {
      const { query, detect } = render(HOVER, { imports: IMPORTS });

      enter(query('button'));
      jest.advanceTimersByTime(99);
      detect();
      expect(panel()).toBeNull();

      jest.advanceTimersByTime(1);
      detect();
      expect(panelText()).toBe('Body');
    });

    it('does not advertise a popup for a hover trigger', () => {
      const { query } = render(HOVER, { imports: IMPORTS });

      // A hover card is not an interactive popup a keyboard user opens, so it
      // must not claim aria-haspopup / aria-expanded.
      expect(query('button').getAttribute('aria-haspopup')).toBeNull();
      expect(query('button').getAttribute('aria-expanded')).toBeNull();
    });

    it('closes after the hover-close delay once the pointer leaves', () => {
      const { query, detect } = render(HOVER, { imports: IMPORTS });

      enter(query('button'));
      jest.advanceTimersByTime(100);
      detect();
      expect(panelText()).toBe('Body');

      leave(query('button'));
      jest.advanceTimersByTime(200);
      detect();
      expect(panel()).toBeNull();
    });

    it('stays open when the pointer crosses from trigger into the panel', () => {
      const { query, detect } = render(HOVER, { imports: IMPORTS });

      enter(query('button'));
      jest.advanceTimersByTime(100);
      detect();

      leave(query('button'));
      panel()?.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true }));
      jest.advanceTimersByTime(200);
      detect();

      // The pointer is over the panel; the pending close must not fire.
      expect(panelText()).toBe('Body');
    });
  });
});
