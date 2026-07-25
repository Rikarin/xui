import { render } from '@xui/testing';
import { XuiMenubar, XuiMenubarTrigger } from './menubar';

const setup = () => {
  const result = render(
    `<div xuiMenubar>
       <button xuiMenubarTrigger [xuiMenubarTriggerFor]="file">File</button>
       <button xuiMenubarTrigger [xuiMenubarTriggerFor]="edit">Edit</button>
     </div>
     <ng-template #file><div>file menu</div></ng-template>
     <ng-template #edit><div>edit menu</div></ng-template>`,
    { imports: [XuiMenubar, XuiMenubarTrigger] }
  );
  const bar = () => document.querySelector('[xuiMenubar]') as HTMLElement;
  const triggers = () => [...document.querySelectorAll('[xuiMenubarTrigger]')] as HTMLButtonElement[];
  return { ...result, bar, triggers };
};

describe('XuiMenubar', () => {
  it('exposes the menubar role from CdkMenuBar', () => {
    const { detect, bar } = setup();
    detect();
    expect(bar().getAttribute('role')).toBe('menubar');
  });

  it('renders each trigger as a menuitem with its label', () => {
    const { detect, triggers } = setup();
    detect();
    expect(triggers()).toHaveLength(2);
    expect(triggers()[0].getAttribute('role')).toBe('menuitem');
    expect(triggers()[0].textContent?.trim()).toBe('File');
    expect(triggers()[0].getAttribute('type')).toBe('button');
  });

  it('marks triggers with a menu popup', () => {
    const { detect, triggers } = setup();
    detect();
    expect(triggers()[0].getAttribute('aria-haspopup')).toBe('menu');
  });
});
