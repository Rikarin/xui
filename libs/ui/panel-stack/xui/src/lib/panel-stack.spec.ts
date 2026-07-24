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
