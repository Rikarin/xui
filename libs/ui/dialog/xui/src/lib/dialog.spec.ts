import { render } from '@xui/testing';
import { XuiDialogImports } from '../index';

const IMPORTS = [XuiDialogImports];

const dialog = () => document.querySelector('[role="dialog"]');
const backdrop = () => document.querySelector('.cdk-overlay-backdrop');

const DIALOG = `
  <xui-dialog [(open)]="props().open" title="Edit profile">
    <xui-dialog-body>Body content</xui-dialog-body>
    <xui-dialog-footer><button>Save</button></xui-dialog-footer>
  </xui-dialog>
`;

interface Props {
  open: boolean;
}

const setup = (template = DIALOG, open = false) => render<Props>(template, { imports: IMPORTS, props: { open } });

describe('XuiDialog', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('renders nothing while closed', () => {
    setup();

    expect(dialog()).toBeNull();
  });

  it('mounts the surface on a modal overlay when opened', () => {
    const { setProps } = setup();

    setProps({ open: true });

    expect(dialog()).not.toBeNull();
    expect(dialog()?.textContent).toContain('Body content');
    expect(backdrop()).not.toBeNull();
  });

  it('labels the dialog with its title', () => {
    const { setProps } = setup();

    setProps({ open: true });

    const labelledBy = dialog()?.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.textContent?.trim()).toBe('Edit profile');
  });

  it('closes from the header close button and folds it back into the model', () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    (dialog()?.querySelector('button[aria-label="Close"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(dialog()).toBeNull();
    // The two-way binding must reflect the dismissal, or a reopen would no-op.
    expect(fixture.componentInstance.props().open).toBe(false);
  });

  it('closes on Escape by default', () => {
    const { setProps } = setup();
    setProps({ open: true });

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(dialog()).toBeNull();
  });

  it('stays open on Escape when that is turned off', () => {
    const { setProps } = setup(
      `<xui-dialog [(open)]="props().open" [canEscapeKeyClose]="false">
         <xui-dialog-body>Body</xui-dialog-body>
       </xui-dialog>`
    );
    setProps({ open: true });

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(dialog()).not.toBeNull();
  });

  it('closes on a backdrop click, unless that is turned off', () => {
    const { setProps } = setup();
    setProps({ open: true });

    (backdrop() as HTMLElement).click();
    expect(dialog()).toBeNull();

    const two = setup(
      `<xui-dialog [(open)]="props().open" [canOutsideClickClose]="false">
         <xui-dialog-body>Body</xui-dialog-body>
       </xui-dialog>`
    );
    two.setProps({ open: true });

    (backdrop() as HTMLElement).click();
    expect(dialog()).not.toBeNull();
  });

  it('omits the close button on request', () => {
    const { setProps } = setup(
      `<xui-dialog [(open)]="props().open" title="T" [showCloseButton]="false">
         <xui-dialog-body>Body</xui-dialog-body>
       </xui-dialog>`
    );
    setProps({ open: true });

    expect(dialog()?.querySelector('button[aria-label="Close"]')).toBeNull();
  });

  it('reopens after being closed', () => {
    const { setProps } = setup();

    setProps({ open: true });
    setProps({ open: false });
    expect(dialog()).toBeNull();

    setProps({ open: true });
    expect(dialog()).not.toBeNull();
  });
});
