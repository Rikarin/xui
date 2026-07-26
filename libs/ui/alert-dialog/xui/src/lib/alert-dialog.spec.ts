import { render } from '@xui/testing';
import { XuiAlertDialog } from './alert-dialog';

const panel = () => document.querySelector('[role="alertdialog"]');
const surface = () => panel()?.firstElementChild as HTMLElement | null;
const backdrop = () => document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
const buttons = () => [...document.querySelectorAll('[role="alertdialog"] button')] as HTMLButtonElement[];

interface Props {
  open: boolean;
}

const setup = (attrs = '', open = true) => {
  const result = render<Props>(
    `<xui-alert-dialog ${attrs} [(open)]="props().open" title="Delete?" description="Cannot be undone" />`,
    { imports: [XuiAlertDialog], props: { open } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-alert-dialog').componentInstance as XuiAlertDialog;

  return { ...result, cmp };
};

describe('XuiAlertDialog', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('renders nothing while closed', () => {
    setup('', false);

    expect(panel()).toBeNull();
  });

  it('mounts on a modal overlay with the title and description when open', () => {
    setup();

    expect(panel()!.textContent).toContain('Delete?');
    expect(panel()!.textContent).toContain('Cannot be undone');
    // The backdrop comes from the overlay machinery and dims with a semantic token.
    expect(backdrop()).not.toBeNull();
    expect(backdrop()!.classList.contains('bg-foreground/40')).toBe(true);
  });

  it('carries the alertdialog a11y contract on the overlay pane', () => {
    setup();

    const pane = panel()!;
    expect(pane.getAttribute('aria-modal')).toBe('true');

    const labelledBy = pane.getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy!)?.textContent?.trim()).toBe('Delete?');

    const describedBy = pane.getAttribute('aria-describedby');
    expect(document.getElementById(describedBy!)?.textContent).toContain('Cannot be undone');

    // Initial focus is directed at the (safe) Cancel button via the focus trap.
    expect(buttons()[0].hasAttribute('cdkfocusinitial')).toBe(true);
  });

  it('confirms, closes and emits', () => {
    const { detect, cmp } = setup();
    const events: string[] = [];
    cmp.confirmed.subscribe(() => events.push('confirmed'));

    // Cancel is first, Confirm is second.
    buttons()[1].click();
    detect();

    expect(events).toEqual(['confirmed']);
    expect(cmp.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('cancels, closes and emits', () => {
    const { detect, cmp } = setup();
    const events: string[] = [];
    cmp.cancelled.subscribe(() => events.push('cancelled'));

    buttons()[0].click();
    detect();

    expect(events).toEqual(['cancelled']);
    expect(cmp.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('cancels on Escape while dismissible, and folds it into the model', async () => {
    const { cmp } = setup();
    const events: string[] = [];
    cmp.cancelled.subscribe(() => events.push('cancelled'));

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await Promise.resolve();

    expect(panel()).toBeNull();
    expect(events).toEqual(['cancelled']);
    expect(cmp.open()).toBe(false);
  });

  it('cancels on a backdrop click while dismissible', async () => {
    const { cmp } = setup();
    const events: string[] = [];
    cmp.cancelled.subscribe(() => events.push('cancelled'));

    backdrop()!.click();
    await Promise.resolve();

    expect(panel()).toBeNull();
    expect(events).toEqual(['cancelled']);
    expect(cmp.open()).toBe(false);
  });

  it('ignores Escape and the backdrop when not dismissible', () => {
    const { cmp } = setup('[dismissible]="false"');

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    backdrop()!.click();

    expect(panel()).not.toBeNull();
    expect(cmp.open()).toBe(true);
  });

  it('tints the confirm button by intent', () => {
    setup('destructive');
    expect(buttons()[1].classList.contains('bg-error')).toBe(true);

    setup();
    expect(buttons()[1].classList.contains('bg-primary')).toBe(true);
  });

  it('merges the class input into the panel instead of replacing', () => {
    setup('class="max-w-lg p-8"');

    const classes = surface()!.classList;
    expect(classes.contains('max-w-lg')).toBe(true);
    expect(classes.contains('p-8')).toBe(true);
    expect(classes.contains('max-w-sm')).toBe(false);
    expect(classes.contains('p-5')).toBe(false);
    // Its own classes survive the merge.
    expect(classes.contains('border-border')).toBe(true);
  });

  it('reopens after being closed', () => {
    const { setProps } = setup('', false);

    setProps({ open: true });
    expect(panel()).not.toBeNull();

    setProps({ open: false });
    expect(panel()).toBeNull();

    setProps({ open: true });
    expect(panel()).not.toBeNull();
  });
});
