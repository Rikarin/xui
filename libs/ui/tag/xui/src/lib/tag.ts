import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiTagConfig } from './tag.token';

export const tagVariants = cva(
  'inline-flex items-center gap-1 border font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      color: {
        none: '',
        primary: '',
        success: '',
        warning: '',
        error: ''
      },
      minimal: { true: '', false: 'border-transparent' },
      large: { true: 'px-3 py-1 text-sm', false: 'px-2 py-0.5 text-xs' },
      round: { true: 'rounded-full', false: 'rounded' },
      fill: { true: 'w-full justify-center', false: '' },
      interactive: { true: 'cursor-pointer', false: '' }
    },
    compoundVariants: [
      // Solid (default) fills.
      { minimal: false, color: 'none', class: 'bg-surface-inset text-foreground' },
      { minimal: false, color: 'primary', class: 'bg-primary text-primary-foreground' },
      { minimal: false, color: 'success', class: 'bg-success text-success-foreground' },
      { minimal: false, color: 'warning', class: 'bg-warning text-warning-foreground' },
      { minimal: false, color: 'error', class: 'bg-error text-error-foreground' },
      // Minimal (subtle) fills.
      { minimal: true, color: 'none', class: 'bg-surface-inset/60 border-border text-foreground-muted' },
      { minimal: true, color: 'primary', class: 'bg-primary/15 border-primary/30 text-primary' },
      { minimal: true, color: 'success', class: 'bg-success/15 border-success/30 text-success' },
      { minimal: true, color: 'warning', class: 'bg-warning/15 border-warning/30 text-warning' },
      { minimal: true, color: 'error', class: 'bg-error/15 border-error/30 text-error' },
      // Hover feedback only when the whole tag is clickable.
      { interactive: true, minimal: false, class: 'hover:brightness-95' },
      { interactive: true, minimal: true, class: 'hover:bg-surface-inset' }
    ],
    defaultVariants: {
      color: 'none',
      minimal: false,
      large: false,
      round: false,
      fill: false,
      interactive: false
    }
  }
);

export type XuiTagVariants = VariantProps<typeof tagVariants>;
export type XuiTagColor = NonNullable<XuiTagVariants['color']>;

/**
 * A compact label chip — richer than the static `xui-badge`. Optionally shows a
 * leading icon, reads as interactive, and can carry a remove ✕ that emits
 * `removed`.
 */
@Component({
  selector: 'xui-tag',
  imports: [NgIcon, XuiIcon],
  template: `
    @if (icon()) {
      <ng-icon xui [name]="icon()!" size="sm" />
    }
    <span [class]="fill() ? '' : 'truncate'"><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="-me-0.5 flex items-center rounded-full opacity-70 transition-opacity hover:opacity-100"
        [attr.aria-label]="removeLabel()"
        (click)="onRemove($event)"
      >
        <ng-icon xui name="matCloseRound" size="sm" />
      </button>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCloseRound })]
})
export class XuiTag {
  private readonly config = injectXuiTagConfig();

  readonly class = input<ClassValue>('');
  readonly color = input<XuiTagColor>(this.config.color);
  readonly minimal = input<boolean, BooleanInput>(this.config.minimal, { transform: booleanAttribute });
  readonly large = input<boolean, BooleanInput>(this.config.large, { transform: booleanAttribute });
  readonly round = input<boolean, BooleanInput>(this.config.round, { transform: booleanAttribute });
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Read as clickable (pointer cursor + hover feedback). */
  readonly interactive = input<boolean, BooleanInput>(this.config.interactive, { transform: booleanAttribute });

  /** Show a trailing remove button. */
  readonly removable = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * The remove button's accessible name.
   *
   * A bare "Remove" is ambiguous once several tags sit together, so name the tag it belongs to —
   * `removeLabel="Remove design"` — when they do.
   */
  readonly removeLabel = input<string>('Remove');

  /** Optional leading icon name (from the app's icon registry). */
  readonly icon = input<string | null>(null);

  /** Emits when the remove button is pressed. */
  readonly removed = output<void>();

  protected readonly computedClass = computed(() =>
    xui(
      tagVariants({
        color: this.color(),
        minimal: this.minimal(),
        large: this.large(),
        round: this.round(),
        fill: this.fill(),
        interactive: this.interactive()
      }),
      this.class()
    )
  );

  protected onRemove(event: MouseEvent): void {
    // Don't let the remove click also trigger an interactive tag's own click.
    event.stopPropagation();
    this.removed.emit();
  }
}
