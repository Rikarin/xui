import { render } from '@xui/testing';
import { XuiMenuImports } from '../index';

const IMPORTS = [XuiMenuImports];

const menu = () => document.querySelector('xui-menu');
const items = () => [...document.querySelectorAll('[role="menuitem"]')] as HTMLElement[];
const itemByText = (text: string) => items().find(node => node.textContent?.trim().startsWith(text));

const MENU = `
  <button [xuiMenuTriggerFor]="m">Open</button>
  <ng-template #m>
    <xui-menu>
      <button xuiMenuItem>Rename</button>
      <button xuiMenuItem disabled>Locked</button>
      <xui-menu-divider />
      <button xuiMenuItem intent="error">Delete</button>
    </xui-menu>
  </ng-template>
`;

describe('XuiMenu', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('stays closed until the trigger is clicked', () => {
    render(MENU, { imports: IMPORTS });

    expect(menu()).toBeNull();
  });

  it('opens on the trigger and renders the items as a menu', () => {
    const { click } = render(MENU, { imports: IMPORTS });

    click('button');

    expect(menu()?.getAttribute('role')).toBe('menu');
    expect(items().map(node => node.textContent?.trim())).toEqual(['Rename', 'Locked', 'Delete']);
  });

  it('advertises the popup on the trigger', () => {
    const { click, query } = render(MENU, { imports: IMPORTS });

    expect(query('button').getAttribute('aria-haspopup')).toBe('menu');
    expect(query('button').getAttribute('aria-expanded')).toBe('false');

    click('button');

    expect(query('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('closes when an item is chosen', () => {
    const { click } = render(MENU, { imports: IMPORTS });

    click('button');
    itemByText('Rename')?.click();

    // cdk/menu closes the whole stack on a plain item activation.
    expect(menu()).toBeNull();
  });

  it('marks a disabled item and keeps the menu open when it is clicked', () => {
    const { click } = render(MENU, { imports: IMPORTS });

    click('button');
    const locked = itemByText('Locked');

    expect(locked?.getAttribute('aria-disabled')).toBe('true');

    locked?.click();
    expect(menu()).not.toBeNull();
  });

  it('colours an item by intent', () => {
    const { click } = render(MENU, { imports: IMPORTS });

    click('button');

    expect(itemByText('Delete')?.className).toContain('text-error-emphasis');
  });

  it('closes on Escape', () => {
    const { click } = render(MENU, { imports: IMPORTS });

    click('button');
    // cdk/menu reads `keyCode`, so `key` alone is not enough to dismiss it.
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(menu()).toBeNull();
  });

  describe('item', () => {
    it('draws a checkmark for a selected item and leaves the cell empty otherwise', () => {
      const { click } = render(
        `<button [xuiMenuTriggerFor]="m">Open</button>
         <ng-template #m>
           <xui-menu>
             <button xuiMenuItem selected>Grid</button>
             <button xuiMenuItem>List</button>
           </xui-menu>
         </ng-template>`,
        { imports: IMPORTS }
      );

      click('button');

      expect(itemByText('Grid')?.querySelector('ng-icon')).toBeTruthy();
      expect(itemByText('List')?.querySelector('ng-icon')).toBeNull();
    });

    it('shows a submenu affordance and advertises it, when it triggers a submenu', () => {
      const { click } = render(
        `<button [xuiMenuTriggerFor]="m">Open</button>
         <ng-template #m>
           <xui-menu>
             <button xuiMenuItem [xuiMenuTriggerFor]="sub">More</button>
           </xui-menu>
         </ng-template>
         <ng-template #sub><xui-menu><button xuiMenuItem>Nested</button></xui-menu></ng-template>`,
        { imports: IMPORTS }
      );

      click('button');
      const more = itemByText('More');

      // The chevron marks it visually; aria-haspopup marks it for a screen reader.
      expect(more?.querySelector('ng-icon')).toBeTruthy();
      expect(more?.getAttribute('aria-haspopup')).toBe('menu');
    });
  });

  describe('divider', () => {
    it('is a plain separator without a title', () => {
      const { click } = render(MENU, { imports: IMPORTS });

      click('button');

      expect(menu()?.querySelector('[role="separator"]')).toBeTruthy();
    });

    it('becomes a labelled header with a title', () => {
      const { click } = render(
        `<button [xuiMenuTriggerFor]="m">Open</button>
         <ng-template #m>
           <xui-menu>
             <xui-menu-divider title="Layout" />
             <button xuiMenuItem>Grid</button>
           </xui-menu>
         </ng-template>`,
        { imports: IMPORTS }
      );

      click('button');
      const divider = menu()?.querySelector('xui-menu-divider');

      expect(divider?.getAttribute('role')).toBe('presentation');
      expect(divider?.textContent?.trim()).toBe('Layout');
      expect(divider?.querySelector('[role="separator"]')).toBeNull();
    });
  });
});
