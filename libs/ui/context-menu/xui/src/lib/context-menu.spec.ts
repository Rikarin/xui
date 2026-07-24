import { XuiMenuImports } from '@xui/menu';
import { render } from '@xui/testing';
import { XuiContextMenuImports } from '../index';

const IMPORTS = [XuiContextMenuImports, XuiMenuImports];

const menu = () => document.querySelector('xui-menu');
const items = () => [...document.querySelectorAll('[role="menuitem"]')].map(node => node.textContent?.trim());

const CTX = `
  <div [xuiContextMenuTriggerFor]="m" style="width:100px;height:100px">zone</div>
  <ng-template #m>
    <xui-menu>
      <button xuiMenuItem>Cut</button>
      <button xuiMenuItem>Copy</button>
    </xui-menu>
  </ng-template>
`;

/** cdk opens a context menu from the `contextmenu` event, at the pointer. */
const rightClick = (el: Element) =>
  el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 10, clientY: 10 }));

describe('XuiContextMenuTrigger', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('stays closed until the host is right-clicked', () => {
    render(CTX, { imports: IMPORTS });

    expect(menu()).toBeNull();
  });

  it('opens the shared menu panel on right-click', () => {
    const { query } = render(CTX, { imports: IMPORTS });

    rightClick(query('div'));

    expect(menu()?.getAttribute('role')).toBe('menu');
    expect(items()).toEqual(['Cut', 'Copy']);
  });

  it('closes on Escape', () => {
    const { query } = render(CTX, { imports: IMPORTS });

    rightClick(query('div'));
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(menu()).toBeNull();
  });

  it('does not open when disabled', () => {
    const { query } = render(
      `<div [xuiContextMenuTriggerFor]="m" xuiContextMenuDisabled style="width:100px;height:100px">zone</div>
       <ng-template #m><xui-menu><button xuiMenuItem>Cut</button></xui-menu></ng-template>`,
      { imports: IMPORTS }
    );

    rightClick(query('div'));

    expect(menu()).toBeNull();
  });
});
