import { render, type RenderResult } from '@xui/testing';
import { XuiOmnibarImports } from '../index';
import { XuiOmnibar } from './omnibar';
import type { XuiOmnibarProvider } from './omnibar.types';

const COMMANDS = ['New file', 'Open file', 'Save', 'Save as…', 'Close tab', 'Toggle theme'];

const IMPORTS = [XuiOmnibarImports];

/** The rendered `xui-omnibar`, whichever template put it there. */
const instanceOf = <P extends object>(result: RenderResult<P>): XuiOmnibar<string> =>
  result.fixture.debugElement.query(node => node.name === 'xui-omnibar').componentInstance;

const setup = (open = true) => {
  const selected: string[] = [];
  const result = render(
    `<xui-omnibar [items]="props().items" [(open)]="props().open" (itemSelected)="props().onSelect($event)" />`,
    { imports: IMPORTS, props: { items: COMMANDS, open, onSelect: (c: string) => selected.push(c) } }
  );

  return { ...result, cmp: instanceOf(result), selected };
};

// The palette renders in the CDK overlay container, not inside the host.
const overlay = '.cdk-overlay-container';
const input = () => document.querySelector(`${overlay} input`) as HTMLInputElement;
const options = () => [...document.querySelectorAll(`${overlay} [role="option"]`)] as HTMLElement[];
const headings = () => [...document.querySelectorAll(`${overlay} [role="presentation"]`)] as HTMLElement[];
const chips = () => [...document.querySelectorAll(`${overlay} [role="checkbox"]`)] as HTMLElement[];
const marks = () => [...document.querySelectorAll(`${overlay} mark`)] as HTMLElement[];
const dialog = () => document.querySelector(`${overlay} [role="dialog"]`);
const backdrop = () => document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;

const type = (value: string, detect: () => void) => {
  input().value = value;
  input().dispatchEvent(new Event('input', { bubbles: true }));
  detect();
};

const press = (key: string, detect: () => void, init: KeyboardEventInit = {}) => {
  input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
  detect();
};

/** Let the promise chain inside the provider path settle. */
const flushPromises = () => Promise.resolve().then(() => Promise.resolve());

describe('XuiOmnibar', () => {
  afterEach(() => {
    document.querySelectorAll(overlay).forEach(n => n.remove());
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

    press('Enter', detect);

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

    press('Escape', detect);

    expect(cmp.open()).toBe(false);
  });

  it('navigates with the arrow keys', () => {
    const { detect, selected } = setup();
    detect();

    // active starts at 'New file'; ArrowDown → 'Open file'
    press('ArrowDown', detect);
    press('Enter', detect);

    expect(selected).toEqual(['Open file']);
  });

  it('points the combobox at the active row rather than moving focus to it', () => {
    const { detect } = setup();
    detect();

    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id);

    press('ArrowDown', detect);

    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id);
  });

  describe('match highlighting', () => {
    it('marks every run of the query in a label', () => {
      const { detect } = setup();
      detect();

      type('sa', detect);

      expect(marks().map(m => m.textContent)).toEqual(['Sa', 'Sa']);
    });

    it('leaves the label alone when highlighting is off', () => {
      const { detect } = render(`<xui-omnibar [items]="props().items" [open]="true" [highlightMatches]="false" />`, {
        imports: IMPORTS,
        props: { items: COMMANDS }
      });
      detect();

      type('sa', detect);

      expect(marks()).toHaveLength(0);
      expect(options().map(o => o.textContent?.trim())).toEqual(['Save', 'Save as…']);
    });
  });

  describe('groups', () => {
    const grouped = () =>
      render(`<xui-omnibar [items]="props().items" [open]="true" [itemGroup]="props().group" />`, {
        imports: IMPORTS,
        props: {
          items: COMMANDS,
          group: (command: string) => (command.startsWith('Save') ? 'Saving' : 'Files')
        }
      });

    it('heads each run of results with its group', () => {
      const { detect } = grouped();
      detect();

      expect(headings().map(h => h.textContent?.trim())).toEqual(['Files', 'Saving']);
    });

    it('walks the results in the order they are shown in', () => {
      const { detect } = grouped();
      detect();

      // Grouping moves the two Save commands to the end, and the arrow keys have
      // to agree with that: three presses from the first row lands on the fourth.
      press('ArrowDown', detect);
      press('ArrowDown', detect);
      press('ArrowDown', detect);

      const shown = options().map(o => o.textContent?.trim());
      const active = options().findIndex(o => o.getAttribute('aria-selected') === 'true');

      expect(shown).toEqual(['New file', 'Open file', 'Close tab', 'Toggle theme', 'Save', 'Save as…']);
      expect(shown[active]).toBe('Toggle theme');
    });
  });

  describe('recent items', () => {
    const withRecents = () =>
      render(`<xui-omnibar [items]="props().items" [open]="true" [recentItems]="props().recent" />`, {
        imports: IMPORTS,
        props: { items: COMMANDS, recent: ['Save', 'Toggle theme'] }
      });

    it('stands in for the results while nothing is typed', () => {
      const { detect } = withRecents();
      detect();

      expect(headings().map(h => h.textContent?.trim())).toEqual(['Recent']);
      expect(options().map(o => o.textContent?.trim())).toEqual(['Save', 'Toggle theme']);
    });

    it('gives way as soon as there is a query', () => {
      const { detect } = withRecents();
      detect();

      type('file', detect);

      expect(headings()).toHaveLength(0);
      expect(options().map(o => o.textContent?.trim())).toEqual(['New file', 'Open file']);
    });
  });

  describe('filter chips', () => {
    const faceted = () =>
      render(
        `<xui-omnibar [items]="props().items" [open]="true" [tags]="props().tags" [itemTags]="props().itemTags" />`,
        {
          imports: IMPORTS,
          props: {
            items: COMMANDS,
            tags: [
              { id: 'files', label: 'Files' },
              { id: 'view', label: 'View' }
            ],
            itemTags: (command: string) => (command === 'Toggle theme' ? ['view'] : ['files'])
          }
        }
      );

    it('renders a checkbox per chip', () => {
      const { detect } = faceted();
      detect();

      expect(chips().map(c => c.textContent?.trim())).toEqual(['Files', 'View']);
      expect(chips().map(c => c.getAttribute('aria-checked'))).toEqual(['false', 'false']);
    });

    it('narrows the results to the chips that are on', () => {
      const { detect } = faceted();
      detect();

      chips()[1].click();
      detect();

      expect(chips()[1].getAttribute('aria-checked')).toBe('true');
      expect(options().map(o => o.textContent?.trim())).toEqual(['Toggle theme']);
    });
  });

  describe('an async provider', () => {
    const withProvider = (provider: XuiOmnibarProvider<string>) => {
      const result = render(`<xui-omnibar [open]="true" [itemsProvider]="props().provider" />`, {
        imports: IMPORTS,
        props: { provider }
      });

      return { ...result, cmp: instanceOf(result) };
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('debounces the query, shows a spinner, and takes only the newest answer', async () => {
      const asked: string[] = [];
      const { detect, cmp } = withProvider(query => {
        asked.push(query);

        return Promise.resolve(COMMANDS.filter(command => command.toLowerCase().includes(query.toLowerCase())));
      });
      detect();

      type('sa', detect);
      type('save', detect);

      // Still inside the debounce window: nothing has been asked for yet.
      expect(asked).toEqual([]);

      jest.advanceTimersByTime(200);
      detect();
      expect(cmp.loading()).toBe(true);

      await flushPromises();
      detect();

      expect(asked).toEqual(['save']);
      expect(cmp.loading()).toBe(false);
      expect(options().map(o => o.textContent?.trim())).toEqual(['Save', 'Save as…']);
    });

    it('shows what came back without filtering it a second time', async () => {
      const { detect } = withProvider(() => Promise.resolve(['Something else entirely']));
      detect();

      type('save', detect);
      jest.advanceTimersByTime(200);
      await flushPromises();
      detect();

      expect(options().map(o => o.textContent?.trim())).toEqual(['Something else entirely']);
    });
  });

  describe('the empty template', () => {
    it('replaces the no-results row and receives the query', () => {
      const { detect } = render(
        `<xui-omnibar [items]="props().items" [open]="true">
           <ng-template xuiOmnibarEmpty let-query>Nothing for {{ query }}</ng-template>
         </xui-omnibar>`,
        { imports: IMPORTS, props: { items: COMMANDS } }
      );
      detect();

      type('zzzz', detect);

      expect(dialog()?.textContent).toContain('Nothing for zzzz');
      expect(dialog()?.textContent).not.toContain('No results.');
    });
  });

  describe('the hotkey', () => {
    it('opens the palette from anywhere', () => {
      const { detect, cmp } = setup(false);
      detect();

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
      );
      detect();

      expect(cmp.open()).toBe(true);
    });

    it('leaves an unmodified combo alone while a text field has focus', () => {
      const result = render(`<xui-omnibar [items]="props().items" hotkey="/" />`, {
        imports: IMPORTS,
        props: { items: COMMANDS }
      });
      const cmp = instanceOf(result);
      result.detect();

      const field = document.createElement('input');
      document.body.appendChild(field);

      field.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true }));
      result.detect();
      expect(cmp.open()).toBe(false);

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true }));
      result.detect();
      expect(cmp.open()).toBe(true);

      field.remove();
    });
  });
});
