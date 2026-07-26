import { render } from '@xui/testing';
import { XuiOmnibarImports } from '../index';
import { XuiOmnibar } from './omnibar';

const COMMANDS = ['New file', 'Open file', 'Save', 'Save as…', 'Close tab', 'Toggle theme'];

const IMPORTS = [XuiOmnibarImports];

const setup = (open = true) => {
  const selected: string[] = [];
  const result = render(
    `<xui-omnibar [items]="props().items" [(open)]="props().open" (itemSelected)="props().onSelect($event)" />`,
    { imports: IMPORTS, props: { items: COMMANDS, open, onSelect: (c: string) => selected.push(c) } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-omnibar').componentInstance as XuiOmnibar<string>;
  return { ...result, cmp, selected };
};

const input = () => document.querySelector('xui-omnibar input') as HTMLInputElement;
const options = () => [...document.querySelectorAll('xui-omnibar [role="option"]')] as HTMLElement[];
const dialog = () => document.querySelector('xui-omnibar [role="dialog"]');

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiOmnibar', () => {
  it('renders nothing while closed', () => {
    const { detect } = setup(false);
    detect();

    expect(dialog()).toBeNull();
  });

  it('shows a dialog with all commands when open', () => {
    const { detect } = setup();
    detect();

    expect(dialog()).toBeTruthy();
    expect(options().map(o => o.textContent?.trim())).toEqual(COMMANDS);
  });

  it('filters the commands as you type', () => {
    const { detect } = setup();
    detect();

    type('save', detect);

    expect(options().map(o => o.textContent?.trim())).toEqual(['Save', 'Save as…']);
  });

  it('shows the empty message when nothing matches', () => {
    const { detect } = setup();
    detect();

    type('zzzz', detect);

    expect(options().length).toBe(0);
    expect(dialog()?.textContent).toContain('No results.');
  });

  it('selects the active command with Enter and closes', () => {
    const { detect, cmp, selected } = setup();
    detect();
    type('theme', detect);

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(selected).toEqual(['Toggle theme']);
    expect(cmp.open()).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('selects a command on click', () => {
    const { detect, selected } = setup();
    detect();

    options()[2].click();
    detect();

    expect(selected).toEqual(['Save']);
  });

  it('closes on Escape', () => {
    const { detect, cmp } = setup();
    detect();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    detect();

    expect(cmp.open()).toBe(false);
  });

  it('navigates with the arrow keys', () => {
    const { detect, selected } = setup();
    detect();

    // active starts at 'New file'; ArrowDown → 'Open file'
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    detect();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    detect();

    expect(selected).toEqual(['Open file']);
  });
});
