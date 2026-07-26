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

// The palette renders in the CDK overlay container, not inside the host.
const input = () => document.querySelector('.cdk-overlay-container input') as HTMLInputElement;
const options = () => [...document.querySelectorAll('.cdk-overlay-container [role="option"]')] as HTMLElement[];
const dialog = () => document.querySelector('.cdk-overlay-container [role="dialog"]');
const backdrop = () => document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

describe('XuiOmnibar', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove());
  });

  it('renders nothing while closed', () => {
    const { detect } = setup(false);
    detect();

    expect(dialog()).toBeNull();
  });

  it('shows a modal dialog with all commands when open', () => {
    const { detect } = setup();
    detect();

    expect(dialog()).toBeTruthy();
    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(options().map(o => o.textContent?.trim())).toEqual(COMMANDS);
    // The backdrop comes from the overlay machinery and dims with a semantic token.
    expect(backdrop()).not.toBeNull();
    expect(backdrop()!.classList.contains('bg-foreground/40')).toBe(true);
  });

  it('closes on a backdrop click and folds it into the model', async () => {
    const { cmp } = setup();

    backdrop()!.click();
    await Promise.resolve();

    expect(dialog()).toBeNull();
    expect(cmp.open()).toBe(false);
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
