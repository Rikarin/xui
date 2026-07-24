import { render } from '@xui/testing';
import { XuiAlertImports } from '../index';

const IMPORTS = [XuiAlertImports];

const dialog = () => document.querySelector('[role="dialog"]');
const buttonByText = (text: string) =>
  [...document.querySelectorAll('[role="dialog"] button')].find(b => b.textContent?.trim() === text) as
    HTMLElement | undefined;

interface Props {
  open: boolean;
  confirmed: number;
  canceled: number;
}

const ALERT = `
  <xui-alert
    [(isOpen)]="props().open"
    intent="error"
    confirmText="Delete"
    cancelText="Cancel"
    (confirmed)="props().confirmed = props().confirmed + 1"
    (canceled)="props().canceled = props().canceled + 1"
  >Delete this project?</xui-alert>
`;

const setup = (template = ALERT) =>
  render<Props>(template, { imports: IMPORTS, props: { open: false, confirmed: 0, canceled: 0 } });

describe('XuiAlert', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('renders nothing while closed', () => {
    setup();

    expect(dialog()).toBeNull();
  });

  it('shows the message and both actions when opened', () => {
    const { setProps } = setup();

    setProps({ open: true });

    expect(dialog()?.textContent).toContain('Delete this project?');
    expect(buttonByText('Delete')).toBeTruthy();
    expect(buttonByText('Cancel')).toBeTruthy();
  });

  it('confirms, then closes', () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    buttonByText('Delete')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.props().confirmed).toBe(1);
    expect(fixture.componentInstance.props().canceled).toBe(0);
    expect(dialog()).toBeNull();
  });

  it('cancels from the cancel button', () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    buttonByText('Cancel')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.props().canceled).toBe(1);
    expect(dialog()).toBeNull();
  });

  it('treats an Escape dismissal as a cancel', async () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    // The dialog folds its close back through a `closed` promise, so let that
    // microtask settle before the alert's cancel effect can run.
    await Promise.resolve();
    fixture.detectChanges();

    // However the user backs out, `(canceled)` must fire exactly once.
    expect(fixture.componentInstance.props().canceled).toBe(1);
    expect(fixture.componentInstance.props().confirmed).toBe(0);
    expect(dialog()).toBeNull();
  });

  it('does not fire canceled again when confirm already settled it', () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    buttonByText('Delete')!.click();
    fixture.detectChanges();

    // confirm() closes the dialog; the close must not also read as a cancel.
    expect(fixture.componentInstance.props().canceled).toBe(0);
  });

  it('drops the cancel button for an acknowledge-only alert', () => {
    const { setProps } = setup(`<xui-alert [(isOpen)]="props().open" confirmText="OK">Saved.</xui-alert>`);
    setProps({ open: true });

    expect(buttonByText('OK')).toBeTruthy();
    expect([...document.querySelectorAll('[role="dialog"] button')].map(b => b.textContent?.trim())).toEqual(['OK']);
  });

  it('gives the error intent a red icon', () => {
    const { setProps } = setup();
    setProps({ open: true });

    expect(dialog()?.querySelector('ng-icon')?.className).toContain('text-error-emphasis');
  });
});
