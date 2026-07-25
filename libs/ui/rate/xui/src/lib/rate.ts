import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { arrowValueDirection, injectXDirection } from '@xui/core/a11y';
import type { ClassValue } from 'clsx';

/**
 * A star-rating input. Two-way bindable `value`; supports `allowHalf`,
 * `allowClear` (click the current value to reset), `readonly`/`disabled`, hover
 * preview and arrow-key adjustment.
 *
 * ```html
 * <xui-rate [(value)]="score" allowHalf />
 * ```
 */
@Component({
  selector: 'xui-rate',
  template: `
    @for (star of stars(); track star) {
      <span class="relative inline-block" [style.width.px]="starPx()" [style.height.px]="starPx()">
        <!-- empty base -->
        <svg viewBox="0 0 24 24" class="text-foreground-subtle absolute inset-0 h-full w-full" fill="currentColor">
          <path [attr.d]="STAR" />
        </svg>
        <!-- filled overlay, clipped to the fill fraction -->
        <span class="absolute inset-0 overflow-hidden" [style.width.%]="fillPercent(star)">
          <svg viewBox="0 0 24 24" class="text-warning h-full" [style.width.px]="starPx()" fill="currentColor">
            <path [attr.d]="STAR" />
          </svg>
        </span>
        @if (!readonly() && !disabled()) {
          @if (allowHalf()) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <span
              class="absolute inset-y-0 start-0 z-10 w-1/2 cursor-pointer"
              (click)="pick(star - 0.5)"
              (mouseenter)="hover.set(star - 0.5)"
            ></span>
          }
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <span
            class="absolute inset-y-0 end-0 z-10 cursor-pointer"
            [class]="allowHalf() ? 'w-1/2' : 'w-full'"
            (click)="pick(star)"
            (mouseenter)="hover.set(star)"
          ></span>
        }
      </span>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    role: 'slider',
    '[attr.aria-label]': 'effectiveAriaLabel()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'count()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-readonly]': 'readonly() || null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'readonly() || disabled() ? null : 0',
    '(keydown)': 'onKeydown($event)',
    '(mouseleave)': 'hover.set(null)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiRate {
  protected readonly STAR = 'M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01z';

  protected readonly direction = injectXDirection();

  readonly class = input<ClassValue>('');

  /** Names the control. Defaults to "Rating" so the slider is never anonymous. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly value = model<number>(0);
  readonly count = input<number, NumberInput>(5, { transform: numberAttribute });
  readonly allowHalf = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Clicking the current value again resets it to 0. */
  readonly allowClear = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Star size in pixels. */
  readonly starSize = input<number, NumberInput>(20, { transform: numberAttribute });

  protected readonly hover = signal<number | null>(null);

  protected readonly effectiveAriaLabel = computed(() => this.ariaLabel() ?? 'Rating');

  /** A bare number tells a screen-reader user nothing about the scale. */
  protected readonly valueText = computed(() => `${this.value()} of ${this.count()}`);

  protected readonly stars = computed(() => Array.from({ length: this.count() }, (_, i) => i + 1));
  protected readonly starPx = computed(() => this.starSize());
  private readonly display = computed(() => this.hover() ?? this.value());

  protected fillPercent(star: number): number {
    const display = this.display();
    if (display >= star) {
      return 100;
    }
    if (display >= star - 0.5) {
      return 50;
    }
    return 0;
  }

  protected pick(next: number): void {
    if (this.readonly() || this.disabled()) {
      return;
    }
    if (this.allowClear() && next === this.value()) {
      this.value.set(0);
    } else {
      this.value.set(next);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly() || this.disabled()) {
      return;
    }
    const step = this.allowHalf() ? 0.5 : 1;
    const arrow = arrowValueDirection(event.key, this.direction());
    if (!arrow) {
      return;
    }

    const next = arrow === 'increase' ? Math.min(this.count(), this.value() + step) : Math.max(0, this.value() - step);

    event.preventDefault();
    this.value.set(next);
  }

  protected readonly computedClass = computed(() =>
    xui(
      'inline-flex items-center gap-1 outline-none focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2 rounded',
      (this.readonly() || this.disabled()) && 'cursor-default',
      this.disabled() && 'opacity-50',
      this.class()
    )
  );
}
