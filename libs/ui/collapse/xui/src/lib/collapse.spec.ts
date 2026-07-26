import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiCollapse } from './collapse';

const setup = (template: string, props?: Record<string, unknown>) =>
  render(template, { imports: [XuiCollapse], props });

/** jsdom does not implement the Web Animations API. */
function stubAnimate() {
  const finished = Promise.resolve();
  const animate = jest.fn(() => ({ finished }) as unknown as Animation);
  Element.prototype.animate = animate as unknown as Element['animate'];

  return { animate, finished };
}

beforeEach(() => stubAnimate());

describe('XuiCollapse', () => {
  it('clips its content so the height animation has something to hide', () => {
    const { query } = setup('<xui-collapse><p>Details</p></xui-collapse>');

    expectClasses(query('xui-collapse'), 'block', 'overflow-hidden');
  });

  it('starts closed at zero height', () => {
    const { query } = setup('<xui-collapse><p>Details</p></xui-collapse>');

    expect(query('xui-collapse').style.height).toBe('0px');
  });

  it('leaves the content out of the DOM while closed', () => {
    const { host } = setup('<xui-collapse><p>Details</p></xui-collapse>');

    // Content that is not rendered cannot be focused or announced, which is the
    // whole reason not to just clip it.
    expect(host.querySelector('p')).toBeNull();
  });

  it('renders the content when open', () => {
    const { host } = setup('<xui-collapse [open]="true"><p>Details</p></xui-collapse>');

    expect(host.querySelector('p')?.textContent).toBe('Details');
  });

  it('keeps the content mounted when asked', () => {
    const { host } = setup('<xui-collapse [keepChildrenMounted]="true"><p>Details</p></xui-collapse>');

    expect(host.querySelector('p')?.textContent).toBe('Details');
  });

  it('hides closed content from assistive technology and the tab order', () => {
    const { query } = setup('<xui-collapse [keepChildrenMounted]="true"><button>Go</button></xui-collapse>');

    expectAttributes(query('xui-collapse'), { 'aria-hidden': 'true', inert: '' });
  });

  it('exposes open content normally', () => {
    const { query } = setup('<xui-collapse [open]="true"><p>Details</p></xui-collapse>');

    expectAttributes(query('xui-collapse'), { 'aria-hidden': null, inert: null });
  });

  it('does not animate the initial render', () => {
    const { animate } = stubAnimate();
    setup('<xui-collapse [open]="true"><p>Details</p></xui-collapse>');

    expect(animate).not.toHaveBeenCalled();
  });

  it('animates from zero to the measured height when opened', () => {
    const { animate } = stubAnimate();
    const { query, setProps } = setup<{ open: boolean }>(
      '<xui-collapse [open]="props().open"><p>Details</p></xui-collapse>',
      { open: false }
    );
    Object.defineProperty(query('xui-collapse > div'), 'scrollHeight', { value: 120, configurable: true });

    setProps({ open: true });

    expect(animate).toHaveBeenCalledWith([{ height: '0px' }, { height: '120px' }], expect.anything());
  });

  it('animates back down to zero when closed', () => {
    const { setProps, query } = setup<{ open: boolean }>(
      '<xui-collapse [open]="props().open"><p>Details</p></xui-collapse>',
      { open: true }
    );
    const { animate } = stubAnimate();
    Object.defineProperty(query('xui-collapse > div'), 'scrollHeight', { value: 120, configurable: true });

    setProps({ open: false });

    expect(animate).toHaveBeenCalledWith([{ height: '120px' }, { height: '0px' }], expect.anything());
  });

  it('honours the configured duration', () => {
    const { animate } = stubAnimate();
    const { setProps } = setup<{ open: boolean }>(
      '<xui-collapse duration="500" [open]="props().open"><p>Details</p></xui-collapse>',
      { open: false }
    );

    setProps({ open: true });

    expect(animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 500 }));
  });

  it('releases the fixed height once open so content can reflow', async () => {
    const { setProps, query, fixture } = setup<{ open: boolean }>(
      '<xui-collapse [open]="props().open"><p>Details</p></xui-collapse>',
      { open: false }
    );

    setProps({ open: true });
    await fixture.whenStable();
    fixture.detectChanges();

    // Left at a pixel height, later content growth would be clipped.
    expect(query('xui-collapse').style.height).toBe('');
  });

  it('emits once the transition finishes', async () => {
    const finished: boolean[] = [];
    const { fixture, setProps } = render<{ open: boolean }>(
      '<xui-collapse [open]="props().open" (transitionEnd)="0"><p>Details</p></xui-collapse>',
      { imports: [XuiCollapse], props: { open: false } }
    );
    fixture.debugElement.children[0].componentInstance.transitionEnd.subscribe((open: boolean) => finished.push(open));

    setProps({ open: true });
    await fixture.whenStable();

    expect(finished).toEqual([true]);
  });
});
