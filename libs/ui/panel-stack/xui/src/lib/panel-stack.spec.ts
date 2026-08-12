import { render } from '@xui/testing';
import { XuiPanelStackImports } from '../index';

const IMPORTS = [XuiPanelStackImports];

const header = () => document.querySelector('xui-panel-stack header');
const title = () => header()?.querySelector('span')?.textContent?.trim();
const backButton = () => header()?.querySelector('button') as HTMLElement | null;
const body = () => document.querySelector('xui-panel-stack > div')?.textContent?.trim();

/**
 * A three-level template stack. Each level's `let-stack` opens the next or pops
 * back, exercising the controller handed to template panels.
 */
const STACK = `
  <xui-panel-stack [initialPanel]="{ title: 'Root', content: root, data: 'r' }" />

  <ng-template #root let-data let-stack="stack">
    <span>root:{{ data }}</span>
    <button (click)="stack.openPanel({ title: 'Second', content: second, data: 'two' })">go</button>
  </ng-template>
  <ng-template #second let-data let-stack="stack">
    <span>second:{{ data }}</span>
    <button class="deeper" (click)="stack.openPanel({ title: 'Third', content: third })">deeper</button>
  </ng-template>
  <ng-template #third><span>third</span></ng-template>
`;

const setup = (template = STACK) => render(template, { imports: IMPORTS });

describe('XuiPanelStack', () => {
  beforeAll(() => {
    if (!('animate' in Element.prototype)) {
      // jsdom has no Web Animations API; the slide is decorative.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (Element.prototype as unknown as { animate: () => void }).animate = () => {};
    }
  });

  it('renders the initial panel and its data, with no back button at the root', () => {
    const { detect } = setup();
    detect();

    expect(title()).toBe('Root');
    expect(body()).toContain('root:r');
    expect(backButton()).toBeNull();
  });

  it('pushes a panel, showing its title and a back button to the previous one', () => {
    const { detect } = setup();
    detect();

    (document.querySelector('xui-panel-stack button') as HTMLElement).click();
    detect();

    expect(title()).toBe('Second');
    expect(body()).toContain('second:two');
    // The back button is labelled with the panel beneath.
    expect(backButton()?.textContent?.trim()).toBe('Root');
  });

  it('renders only the active panel', () => {
    const { detect } = setup();
    detect();

    (document.querySelector('xui-panel-stack button') as HTMLElement).click();
    detect();

    // The root panel's content is gone, not merely hidden.
    expect(body()).not.toContain('root:r');
    expect(body()).toContain('second:two');
  });

  it('pops back to the previous panel', () => {
    const { detect } = setup();
    detect();

    (document.querySelector('xui-panel-stack button') as HTMLElement).click();
    detect();
    (document.querySelector('.deeper') as HTMLElement).click();
    detect();
    expect(title()).toBe('Third');

    backButton()!.click();
    detect();
    expect(title()).toBe('Second');

    backButton()!.click();
    detect();
    expect(title()).toBe('Root');
    expect(backButton()).toBeNull();
  });

  it('emits opened and closed as the stack changes', () => {
    const opened: string[] = [];
    const closed: string[] = [];
    const { fixture, detect } = render(
      `<xui-panel-stack
         [initialPanel]="{ title: 'Root', content: root }"
         (opened)="props().onOpen($event)"
         (closed)="props().onClose($event)" />
       <ng-template #root let-stack="stack">
         <button (click)="stack.openPanel({ title: 'Next', content: root })">go</button>
       </ng-template>`,
      {
        imports: IMPORTS,
        props: {
          onOpen: (p: { title: string }) => opened.push(p.title),
          onClose: (p: { title: string }) => closed.push(p.title)
        }
      }
    );
    detect();

    (document.querySelector('xui-panel-stack button') as HTMLElement).click();
    fixture.detectChanges();
    (document.querySelector('xui-panel-stack header button') as HTMLElement).click();
    fixture.detectChanges();

    expect(opened).toEqual(['Next']);
    expect(closed).toEqual(['Next']);
  });

  /**
   * The slide is decorative, but skipping it is not: `prefers-reduced-motion` is
   * an accessibility setting, and a guard that skips the animation whenever it
   * cannot read that setting is as wrong as one that never skips it.
   *
   * jsdom has no `matchMedia` at all, which makes it the awkward case rather
   * than the easy one — "the API is missing" must keep meaning "animate", or a
   * fix aimed at the server has quietly changed the browser. Each case installs
   * the environment it is about; the `afterEach` puts jsdom back.
   */
  describe('reduced motion', () => {
    let animate: jest.SpyInstance;
    let queries: string[];

    const matchMedia = (answer: (query: string) => boolean) => {
      (globalThis as unknown as { matchMedia: unknown }).matchMedia = (query: string) => {
        queries.push(query);

        return { matches: answer(query), media: query };
      };
    };

    /** Push a panel — the only thing that moves the depth, and so the only thing that slides. */
    const push = (detect: () => void) => {
      (document.querySelector('xui-panel-stack button') as HTMLElement).click();
      detect();
    };

    beforeEach(() => {
      queries = [];
      animate = jest.spyOn(Element.prototype, 'animate');
    });

    afterEach(() => {
      animate.mockRestore();
      delete (globalThis as unknown as { matchMedia?: unknown }).matchMedia;
    });

    it('skips the slide when the user has asked for less motion', () => {
      matchMedia(query => query.includes('prefers-reduced-motion'));
      const { detect } = setup();
      detect();

      push(detect);

      // The panel still changes; only the motion is dropped.
      expect(title()).toBe('Second');
      expect(animate).not.toHaveBeenCalled();
    });

    it('slides when the query is answered, but answered no', () => {
      // The environment that hands back a `MediaQueryList` whose `matches` is
      // always false — a real answer, and a different thing from no answer.
      matchMedia(() => false);
      const { detect } = setup();
      detect();

      push(detect);

      expect(animate).toHaveBeenCalledTimes(1);
    });

    it('slides when the browser cannot answer at all', () => {
      // jsdom as it comes: no `matchMedia`. Absent is not "yes, less motion" — a
      // fix that early-returns on a missing `matchMedia` would turn the
      // animation off for every browser that lacks it, and this case says so.
      expect(globalThis.matchMedia).toBeUndefined();
      const { detect } = setup();
      detect();

      push(detect);

      expect(animate).toHaveBeenCalledTimes(1);
    });

    it('asks about motion, not about something else', () => {
      matchMedia(() => false);
      const { detect } = setup();
      detect();

      push(detect);

      expect(queries).toEqual(['(prefers-reduced-motion: reduce)']);
    });
  });

  it('hides the header when asked', () => {
    const { detect } = setup(
      `<xui-panel-stack [showPanelHeader]="false" [initialPanel]="{ title: 'Root', content: root }" />
       <ng-template #root><span>body</span></ng-template>`
    );
    detect();

    expect(header()).toBeNull();
    expect(body()).toContain('body');
  });
});
