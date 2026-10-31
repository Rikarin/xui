import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { XuiOmnibarImports, type XuiOmnibarTag } from '@xui/omnibar';
import { XuiTextImports } from '@xui/text';

/**
 * The omnibar is opened from a class and reports back to one, so none of these can be generated -
 * `[(open)]` and `(itemSelected)` need somewhere to live.
 *
 * Mirrors `apps/ui-storybook/stories/omnibar.stories.ts`; keep the two in step.
 */
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

const groupOf = (command: string): string =>
  command.startsWith('Save') || command.includes('tab') || command.startsWith('Open file') || command === 'New file'
    ? 'File'
    : 'View';

const TAGS: XuiOmnibarTag[] = [
  { id: 'file', label: 'File' },
  { id: 'view', label: 'View' }
];

@Component({
  selector: 'docs-omnibar-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOmnibarImports, XuiButtonImports, XuiTextImports],
  template: `
    <button xuiButton (click)="open.set(true)">Open command palette</button>
    <p xuiText size="sm" color="muted" class="mt-3">Press ⌘K / Ctrl+K too. Last command: {{ last() ?? '—' }}</p>

    <xui-omnibar [items]="commands" [(open)]="open" (itemSelected)="last.set($event)" />
  `
})
export class PreviewDefault {
  protected readonly commands = COMMANDS;
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
}

@Component({
  selector: 'docs-omnibar-faceted-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOmnibarImports, XuiButtonImports],
  template: `
    <button xuiButton (click)="open.set(true)">Open command palette</button>

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
export class PreviewGroupedAndFaceted {
  protected readonly commands = COMMANDS;
  protected readonly tags = TAGS;
  protected readonly open = signal(false);
  protected readonly recent = signal<string[]>(['Toggle theme']);

  protected readonly group = groupOf;
  protected readonly itemTags = (command: string): string[] => [groupOf(command).toLowerCase()];

  protected run(command: string): void {
    this.recent.update(recent => [command, ...recent.filter(entry => entry !== command)].slice(0, 5));
  }
}

@Component({
  selector: 'docs-omnibar-search-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOmnibarImports, XuiButtonImports, XuiTextImports],
  template: `
    <button xuiButton (click)="open.set(true)">Search the index</button>
    <p xuiText size="sm" color="muted" class="mt-3">{{ index.length }} entries, fetched a page at a time.</p>

    <xui-omnibar [(open)]="open" [itemsProvider]="search" placeholder="Search 5 000 symbols…" />
  `
})
export class PreviewAsyncAndVirtualised {
  protected readonly open = signal(false);
  protected readonly index = Array.from({ length: 5000 }, (_, i) => `Vixen.Rendering.Symbol${i}`);

  /** Stands in for a real backend: the same shape, one frame of latency. */
  protected readonly search = (query: string): Promise<string[]> =>
    new Promise(resolve =>
      setTimeout(() => resolve(this.index.filter(entry => entry.toLowerCase().includes(query.toLowerCase()))), 120)
    );
}
