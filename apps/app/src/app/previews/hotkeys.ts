import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { injectHotkeys, XuiHotkeysImports, XuiHotkeysService } from '@xui/hotkeys';
import { XuiKbdImports } from '@xui/kbd';
import { XuiTextImports } from '@xui/text';

/**
 * Hotkeys are registered by a class, not by markup, so the generator cannot build this one - it
 * would have to stub the very thing the example is about. Written here instead, and re-exported by
 * the generated preview module.
 *
 * It mirrors `apps/ui-storybook/stories/hotkeys.stories.ts`; keep the two in step.
 */
@Component({
  selector: 'docs-hotkeys-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiButtonImports, XuiKbdImports, XuiTextImports, XuiHotkeysImports],
  template: `
    <div class="flex max-w-md flex-col items-start gap-4">
      <p xuiText size="sm" color="muted">Click here first so the page has focus, then try a shortcut.</p>

      <ul class="flex flex-col gap-2">
        <li class="flex items-center gap-2">
          <kbd xuiKbd>?</kbd>
          <span xuiText size="sm">open the shortcut help</span>
        </li>
        <li class="flex items-center gap-2">
          <kbd xuiKbd>{{ mod }}</kbd>
          <kbd xuiKbd>S</kbd>
          <span xuiText size="sm">save — fired {{ saves() }}×</span>
        </li>
        <li class="flex items-center gap-2">
          <kbd xuiKbd>{{ mod }}</kbd>
          <kbd xuiKbd>K</kbd>
          <span xuiText size="sm">command palette — fired {{ palette() }}×</span>
        </li>
        <li class="flex items-center gap-2">
          <kbd xuiKbd>G</kbd>
          <span xuiText size="sm">go home — fired {{ home() }}×</span>
        </li>
      </ul>

      <button xuiButton variant="outline" size="sm" (click)="help.openHelp()">Show shortcuts</button>
    </div>
  `
})
export class PreviewDefault {
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
