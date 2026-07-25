import { render } from '@xui/testing';
import { XuiAlertDialog } from './alert-dialog';

const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-alert-dialog ${attrs} [(open)]="props().open" title="Delete?" description="Cannot be undone" />`,
    { imports: [XuiAlertDialog], props: { open: true, ...props } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-alert-dialog').componentInstance as XuiAlertDialog;
  const panel = () => document.querySelector('[role="alertdialog"]') as HTMLElement | null;
  const buttons = () => [...document.querySelectorAll('[role="alertdialog"] button')] as HTMLButtonElement[];
  return { ...result, cmp, panel, buttons };
};

describe('XuiAlertDialog', () => {
  it('renders nothing while closed', () => {
    const { detect, panel } = setup('', { open: false });
    detect();
    expect(panel()).toBeNull();
  });

  it('shows the title and description when open', () => {
    const { detect, panel } = setup();
    detect();
    expect(panel()!.textContent).toContain('Delete?');
    expect(panel()!.textContent).toContain('Cannot be undone');
  });

  it('confirms, closes and emits', () => {
    const { detect, cmp, buttons } = setup();
    detect();
    const events: string[] = [];
    cmp.confirmed.subscribe(() => events.push('confirmed'));
    // Cancel is first, Confirm is second.
    buttons()[1].click();
    detect();
    expect(events).toEqual(['confirmed']);
    expect(cmp.open()).toBe(false);
  });

  it('cancels, closes and emits', () => {
    const { detect, cmp, buttons } = setup();
    detect();
    const events: string[] = [];
    cmp.cancelled.subscribe(() => events.push('cancelled'));
    buttons()[0].click();
    detect();
    expect(events).toEqual(['cancelled']);
    expect(cmp.open()).toBe(false);
  });

  it('does not dismiss on backdrop when not dismissible', () => {
    const { detect, cmp } = setup('[dismissible]="false"');
    detect();
    const backdrop = document.querySelector('xui-alert-dialog .absolute') as HTMLElement;
    backdrop.click();
    detect();
    expect(cmp.open()).toBe(true);
  });
});
