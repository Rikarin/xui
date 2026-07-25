import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matRefreshRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiColorPickerImports } from '@xui/color-picker';
import { XuiIconImports } from '@xui/icon';
import { ThemeBuilder } from '../core/theme-builder';
import type { ColourToken, ThemeScope } from '../core/theme-tokens';

/** A short palette to click through before reaching for the wheel. */
const QUICK_PICKS = [
  '#ffffff',
  '#e4e4e7',
  '#71717a',
  '#27272a',
  '#09090b',
  '#2f6fd0',
  '#6366f1',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0ea5e9'
];

/**
 * One editable colour token: a picker, and a way back to the stock value.
 *
 * The picker needs a concrete colour to open on, which only the browser can supply — a token's
 * value is an `oklch()` or a `color-mix()` away from anything a picker understands. Until it has
 * been read, the row shows a plain swatch painted with `var(--token)`, which is correct on the
 * server and needs no resolution at all.
 *
 * The stock value is read once per scope rather than on every edit: a token's rendered colour only
 * moves when this row overrides it, and then the override *is* the answer.
 */
@Component({
  selector: 'docs-token-swatch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, XuiButtonImports, XuiColorPickerImports, XuiIconImports],
  providers: [provideIcons({ matRefreshRound })],
  // The picker names itself after the colour it holds, which in a list of thirty-eight of them says
  // nothing. Naming the row groups each one under the token it edits.
  host: { class: 'flex items-center gap-2.5', role: 'group', '[attr.aria-label]': 'token().label' },
  template: `
    @if (resolved()) {
      <xui-color-picker
        class="w-32 shrink-0"
        [value]="value()"
        [presets]="quickPicks"
        (valueChange)="pick($event)"
      />
    } @else {
      <span class="border-border bg-surface flex w-32 shrink-0 items-center gap-2 rounded-md border px-2 py-1.5">
        <span
          class="border-border/60 h-5 w-5 rounded border"
          [style.background]="'var(--' + token().name + ')'"
        ></span>
      </span>
    }

    <span class="min-w-0 flex-1">
      <span class="text-foreground block truncate text-sm">{{ token().label }}</span>
      <code class="text-foreground-subtle block truncate font-mono text-xs">--{{ token().name }}</code>
    </span>

    @if (override()) {
      <button
        xuiButton
        variant="ghost"
        size="sm"
        type="button"
        [attr.aria-label]="'Reset ' + token().label"
        (click)="reset()"
      >
        <ng-icon xui name="matRefreshRound" />
      </button>
    }
  `
})
export class TokenSwatch {
  readonly token = input.required<ColourToken>();
  readonly scope = input.required<ThemeScope>();

  protected readonly quickPicks = QUICK_PICKS;

  private readonly builder = inject(ThemeBuilder);
  private readonly stock = signal('');

  /** Reading means measuring the document, which has no business happening mid-hydration. */
  private readonly ready = signal(false);

  protected readonly override = computed(() => this.builder.colourOf(this.scope(), this.token().name));
  protected readonly resolved = computed(() => this.override() ?? this.stock());
  protected readonly value = computed(() => this.resolved() || '#000000');

  constructor() {
    afterNextRender(() => this.ready.set(true));

    effect(() => {
      const scope = this.scope();

      if (this.ready()) {
        this.stock.set(this.builder.resolve(scope, this.token().name));
      }
    });
  }

  protected pick(value: string): void {
    this.builder.setColour(this.scope(), this.token().name, value);
  }

  protected reset(): void {
    this.builder.clearColour(this.scope(), this.token().name);
  }
}
