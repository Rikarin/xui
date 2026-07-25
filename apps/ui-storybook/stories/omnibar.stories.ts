import { Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiOmnibarImports } from '@xui/omnibar';

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

/**
 * A ⌘K-style command palette: a top-centred overlay with a search field and a
 * keyboard-navigable result list. Toggle with `[(isOpen)]`; Escape or a backdrop
 * click closes; Arrow keys move, Enter runs the command.
 */
@Component({
  selector: 'xui-omnibar-demo',
  imports: [XuiOmnibarImports],
  template: `
    <button class="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm" (click)="open.set(true)">
      Open command palette
    </button>
    <p class="text-foreground-muted mt-3 text-sm">Last command: {{ last() ?? '—' }}</p>

    <xui-omnibar [items]="commands" [(isOpen)]="open" (itemSelect)="last.set($event)" />
  `
})
class OmnibarDemo {
  protected readonly commands = COMMANDS;
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
}

const meta: Meta<OmnibarDemo> = {
  title: 'Overlays/Omnibar',
  component: OmnibarDemo,
  decorators: [moduleMetadata({ imports: [OmnibarDemo] })]
};

export default meta;
type Story = StoryObj<OmnibarDemo>;

export const Default: Story = {
  render: () => ({ template: `<xui-omnibar-demo />` })
};
