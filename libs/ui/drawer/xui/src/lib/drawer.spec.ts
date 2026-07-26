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

const DRAWER = `<xui-drawer [(open)]="props().open" [position]="props().position" title="Filters">Body</xui-drawer>`;

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
    expect(surface()?.className).toContain('border-s');
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

  it('slides out before it goes, whichever way it was closed', async () => {
    let land!: () => void;
    const finished = new Promise<void>(resolve => (land = () => resolve()));
    const animations: Keyframe[][] = [];
    const stub = Element.prototype.animate;

    (Element.prototype as unknown as { animate: (frames: Keyframe[]) => unknown }).animate = frames => {
      animations.push(frames);

      return { finished };
    };

    try {
      const { setProps } = setup();
      setProps({ open: true });

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

      // Still there, on its way out and no longer taking clicks.
      expect(drawer()).not.toBeNull();
      expect((document.querySelector('.cdk-overlay-pane') as HTMLElement).style.pointerEvents).toBe('none');
      expect(animations.at(-2)).toEqual([{ transform: 'none' }, { transform: 'translateX(100%)' }]);
      // The backdrop goes with it, rather than being dropped from under the slide.
      expect(animations.at(-1)).toEqual([{ opacity: 1 }, { opacity: 0 }]);

      land();
      // A turn of the macrotask queue, which is enough for the promise chain
      // between the animation settling and the overlay tearing itself down.
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(drawer()).toBeNull();
    } finally {
      Element.prototype.animate = stub;
    }
  });

  it('reopens after closing', () => {
    const { setProps } = setup();

    setProps({ open: true });
    setProps({ open: false });
    setProps({ open: true });

    expect(drawer()).not.toBeNull();
  });
});
