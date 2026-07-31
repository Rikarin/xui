import { Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiOmnibarImports, type XuiOmnibarTag } from '@xui/omnibar';

const COMMANDS = [
  'New file',
  'Open file…',
  'Save',
  'Save as…',
  'Close tab',
  'Reopen closed tab',
  'Toggle theme',
  'Open settings',
  'Go to line…',
  'Find in files…'
];

const GROUP_OF = (command: string): string => {
  if (command.startsWith('Save')) {
    return 'File';
  }

  if (command.includes('tab') || command.startsWith('Open file') || command === 'New file') {
    return 'File';
  }

  return 'View';
};

const TAGS: XuiOmnibarTag[] = [
  { id: 'file', label: 'File' },
  { id: 'view', label: 'View' }
];

/**
 * A ⌘K-style command palette: a top-centred overlay with a search field and a
 * keyboard-navigable result list. Toggle with `[(open)]`, or leave it to the
 * built-in `hotkey`; Escape or a backdrop click closes; arrow keys move, Enter
 * runs the command.
 */
@Component({
  selector: 'xui-omnibar-demo',
  imports: [XuiOmnibarImports],
  template: `
    <button class="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm" (click)="open.set(true)">
      Open command palette
    </button>
    <p class="text-foreground-muted mt-3 text-sm">Press ⌘K / Ctrl+K too. Last command: {{ last() ?? '—' }}</p>

    <xui-omnibar [items]="commands" [(open)]="open" (itemSelected)="last.set($event)" />
  `
})
class OmnibarDemo {
  protected readonly commands = COMMANDS;
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
}

/** Grouped results, filter chips, and the last thing you ran on an empty query. */
@Component({
  selector: 'xui-omnibar-faceted-demo',
  imports: [XuiOmnibarImports],
  template: `
    <button class="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm" (click)="open.set(true)">
      Open command palette
    </button>

    <xui-omnibar
      [items]="commands"
      [(open)]="open"
      [itemGroup]="group"
      [tags]="tags"
      [itemTags]="itemTags"
      [recentItems]="recent()"
      (itemSelected)="run($event)"
    />
  `
})
class OmnibarFacetedDemo {
  protected readonly commands = COMMANDS;
  protected readonly tags = TAGS;
  protected readonly open = signal(false);
  protected readonly recent = signal<string[]>(['Toggle theme']);

  protected readonly group = GROUP_OF;
  protected readonly itemTags = (command: string): string[] => [GROUP_OF(command).toLowerCase()];

  protected run(command: string): void {
    this.recent.update(recent => [command, ...recent.filter(entry => entry !== command)].slice(0, 5));
  }
}

/** A provider instead of a list: debounced, awaited, and virtualised once the answer is long. */
@Component({
  selector: 'xui-omnibar-search-demo',
  imports: [XuiOmnibarImports],
  template: `
    <button class="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm" (click)="open.set(true)">
      Search the index
    </button>
    <p class="text-foreground-muted mt-3 text-sm">{{ index.length }} entries, fetched a page at a time.</p>

    <xui-omnibar [(open)]="open" [itemsProvider]="search" placeholder="Search 5 000 symbols…" />
  `
})
class OmnibarSearchDemo {
  protected readonly open = signal(false);
  protected readonly index = Array.from({ length: 5000 }, (_, i) => `Vixen.Rendering.Symbol${i}`);

  /** Stands in for a real backend: the same shape, one frame of latency. */
  protected readonly search = (query: string): Promise<string[]> =>
    new Promise(resolve =>
      setTimeout(() => resolve(this.index.filter(entry => entry.toLowerCase().includes(query.toLowerCase()))), 120)
    );
}

const meta: Meta<OmnibarDemo> = {
  title: 'Overlays/Omnibar',
  component: OmnibarDemo,
  decorators: [moduleMetadata({ imports: [OmnibarDemo, OmnibarFacetedDemo, OmnibarSearchDemo] })]
};

export default meta;
type Story = StoryObj<OmnibarDemo>;

export const Default: Story = {
  render: () => ({ template: `<xui-omnibar-demo />` })
};

export const GroupedAndFaceted: Story = {
  render: () => ({ template: `<xui-omnibar-faceted-demo />` })
};

export const AsyncAndVirtualised: Story = {
  render: () => ({ template: `<xui-omnibar-search-demo />` })
};
