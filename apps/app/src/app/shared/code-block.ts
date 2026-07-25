import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matContentCopyRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiIconImports } from '@xui/icon';
import { Clipboard } from './clipboard';
import { highlight, type Language } from './highlight';

/**
 * A code sample with copy-to-clipboard.
 *
 * Highlighting runs through a small tokeniser rather than a syntax-highlighting library: the site
 * shows five languages in a handful of shapes, and the tokens render as `<span>` elements, so
 * nothing is ever passed through `innerHTML`.
 */
@Component({
  selector: 'docs-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, XuiIconImports, XuiButtonImports],
  providers: [provideIcons({ matContentCopyRound, matCheckRound })],
  host: { class: 'group relative block' },
  template: `
    <pre
      class="border-border bg-surface-inset overflow-x-auto rounded-lg border p-4 text-[0.8125rem] leading-relaxed"
    ><code class="font-mono">@for (token of tokens(); track $index) {<span [class]="token.class">{{ token.text }}</span>}</code></pre>

    <button
      xuiButton
      variant="ghost"
      size="sm"
      type="button"
      class="absolute end-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
      (click)="copy()"
    >
      <ng-icon xui [name]="copied() ? 'matCheckRound' : 'matContentCopyRound'" />
    </button>
  `
})
export class CodeBlock {
  private readonly clipboard = inject(Clipboard);

  readonly code = input.required<string>();
  readonly lang = input<Language>('html');

  protected readonly copied = signal(false);
  protected readonly tokens = computed(() => highlight(this.code().trim(), this.lang()));

  protected async copy(): Promise<void> {
    if (await this.clipboard.write(this.code().trim())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    }
  }
}
