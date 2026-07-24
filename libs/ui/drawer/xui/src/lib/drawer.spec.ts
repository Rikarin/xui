import { render } from '@xui/testing';
import { XuiDrawerImports } from '../index';

const IMPORTS = [XuiDrawerImports];

const drawer = () => document.querySelector('[role="dialog"]');
const surface = () => document.querySelector('[role="dialog"] > div') as HTMLElement | null;
const backdrop = () => document.querySelector('.cdk-overlay-backdrop');

interface Props {
  open: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
}

const DRAWER = `<xui-drawer [(isOpen)]="props().open" [position]="props().position" title="Filters">Body</xui-drawer>`;

const setup = (position: Props['position'] = 'right') =>
  render<Props>(DRAWER, { imports: IMPORTS, props: { open: false, position } });

describe('XuiDrawer', () => {
  beforeAll(() => {
    // jsdom has no Web Animations API; the slide-in is decorative, so a no-op
    // stub lets the modal behaviour be tested without it.
    if (!('animate' in Element.prototype)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (Element.prototype as unknown as { animate: () => void }).animate = () => {};
    }
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('renders nothing while closed', () => {
    setup();

    expect(drawer()).toBeNull();
  });

  it('opens onto a modal overlay pinned to its edge', () => {
    const { setProps } = setup('right');

    setProps({ open: true });

    expect(drawer()?.textContent).toContain('Body');
    expect(backdrop()).not.toBeNull();
    // A right drawer runs full-height and draws its divider on the left.
    expect(surface()?.className).toContain('h-screen');
    expect(surface()?.className).toContain('border-l');
  });

  it('takes the cross-axis full size for a top drawer', () => {
    const { setProps } = setup('top');

    setProps({ open: true });

    expect(surface()?.className).toContain('w-screen');
    expect(surface()?.className).toContain('border-b');
  });

  it('labels itself with its title', () => {
    const { setProps } = setup();

    setProps({ open: true });

    const labelledBy = drawer()?.getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy as string)?.textContent?.trim()).toBe('Filters');
  });

  it('closes from the close button', () => {
    const { fixture, setProps } = setup();
    setProps({ open: true });

    (drawer()?.querySelector('button[aria-label="Close"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(drawer()).toBeNull();
    expect(fixture.componentInstance.props().open).toBe(false);
  });

  it('closes on Escape', () => {
    const { setProps } = setup();

    setProps({ open: true });
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(drawer()).toBeNull();
  });

  it('closes on a backdrop click', () => {
    const { setProps } = setup();

    setProps({ open: true });
    (backdrop() as HTMLElement).click();

    expect(drawer()).toBeNull();
  });

  it('reopens after closing', () => {
    const { setProps } = setup();

    setProps({ open: true });
    setProps({ open: false });
    setProps({ open: true });

    expect(drawer()).not.toBeNull();
  });
});
