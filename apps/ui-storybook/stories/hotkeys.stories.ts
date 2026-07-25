import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { injectHotkeys, XuiHotkeysService } from '@xui/hotkeys';

/**
 * Global keyboard shortcuts via `injectHotkeys([...])`, auto-removed when the
 * component is destroyed. Press <kbd>?</kbd> anywhere to open the generated help
 * dialog listing every registered shortcut, grouped.
 */
@Component({
  selector: 'xui-hotkeys-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-foreground max-w-md text-sm">
      <p class="mb-4">Try the shortcuts (click here first to focus the page):</p>
      <ul class="text-foreground-muted mb-4 list-disc pl-5">
        <li><kbd>?</kbd> — open the shortcut help</li>
        <li>
          <kbd>{{ mod }}+S</kbd> — save ({{ saves() }})
        </li>
        <li>
          <kbd>{{ mod }}+K</kbd> — command palette ({{ palette() }})
        </li>
        <li><kbd>G</kbd> then nothing — go home ({{ home() }})</li>
      </ul>
      <button class="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm" (click)="help.openHelp()">
        Show shortcuts
      </button>
    </div>
  `
})
class HotkeysDemo {
  protected readonly saves = signal(0);
  protected readonly palette = signal(0);
  protected readonly home = signal(0);

  protected readonly help: XuiHotkeysService = injectHotkeys([
    { combo: 'mod+s', label: 'Save', group: 'File', onKeyDown: () => this.saves.update(n => n + 1) },
    {
      combo: 'mod+k',
      label: 'Open command palette',
      group: 'Navigation',
      onKeyDown: () => this.palette.update(n => n + 1)
    },
    { combo: 'g', label: 'Go home', group: 'Navigation', onKeyDown: () => this.home.update(n => n + 1) }
  ]);

  protected readonly mod = this.help.isMac ? '⌘' : 'Ctrl';
}

const meta: Meta<HotkeysDemo> = {
  title: 'Actions/Hotkeys',
  component: HotkeysDemo,
  decorators: [moduleMetadata({ imports: [HotkeysDemo] })]
};

export default meta;
type Story = StoryObj<HotkeysDemo>;

export const Default: Story = {
  render: () => ({ template: `<xui-hotkeys-demo />` })
};
