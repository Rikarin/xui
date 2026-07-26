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
import type { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matStarRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { arrowValueDirection, injectXDirection } from '@xui/core/a11y';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
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
  // eslint-disable-next-line local/no-hand-z-index -- half-star hit areas layer above the star glyph inside the control
  template: `
    @for (star of stars(); track star) {
      <span class="relative inline-block" [style.width.px]="starPx()" [style.height.px]="starPx()">
        <!-- empty base -->
        <ng-icon xui [size]="starPx() + 'px'" color="subtle" name="matStarRound" class="absolute inset-0" />
        <!-- filled overlay, clipped to the fill fraction -->
        <span class="absolute inset-0 overflow-hidden" [style.width.%]="fillPercent(star)">
          <ng-icon
            xui
            [size]="starPx() + 'px'"
            color="warning"
            name="matStarRound"
            class="absolute inset-y-0 start-0"
          />
        </span>
        @if (!readonly() && !isDisabled()) {
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
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.tabindex]': 'readonly() || isDisabled() ? null : 0',
    '(keydown)': 'onKeydown($event)',
    '(mouseleave)': 'hover.set(null)',
    '(blur)': 'cva.markTouched()'
  },
  imports: [NgIcon, XuiIcon],
  providers: [provideXValueAccessor(() => XuiRate)],
  viewProviders: [provideIcons({ matStarRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiRate implements ControlValueAccessor {
  protected readonly direction = injectXDirection();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** Names the control. Defaults to "Rating" so the slider is never anonymous. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /**
   * The rating, from `0` to `count`. Halves are only reachable with `allowHalf`. Two-way bindable with `[(value)]`.
   */
  readonly value = model<number>(0);
  /** How many stars there are, and so the maximum value. */
  readonly count = input<number, NumberInput>(5, { transform: numberAttribute });
  /** Let a star be half-filled, halving the step for both clicks and arrow keys. */
  readonly allowHalf = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Clicking the current value again resets it to 0. */
  readonly allowClear = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /**
   * Show the rating without letting it be changed. Unlike `disabled`, it stays at full contrast — for displaying
   * someone else's rating.
   */
  readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Block interaction and dim the stars. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Star size in pixels. */
  readonly starSize = input<number, NumberInput>(20, { transform: numberAttribute });

  protected readonly cva = createXValueAccessor<number>({
    onWrite: value => this.value.set(value ?? 0),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

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
    if (this.readonly() || this.isDisabled()) {
      return;
    }
    this.commit(this.allowClear() && next === this.value() ? 0 : next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly() || this.isDisabled()) {
      return;
    }
    const step = this.allowHalf() ? 0.5 : 1;
    const arrow = arrowValueDirection(event.key, this.direction());
    if (!arrow) {
      return;
    }

    const next = arrow === 'increase' ? Math.min(this.count(), this.value() + step) : Math.max(0, this.value() - step);

    event.preventDefault();
    this.commit(next);
  }

  /** Store and notify — the single write path for every user interaction. */
  private commit(next: number): void {
    this.value.set(next);
    this.cva.notifyChange(next);
  }

  protected readonly computedClass = computed(() =>
    xui(
      'inline-flex items-center gap-1 rounded',
      (this.readonly() || this.isDisabled()) && 'cursor-default',
      this.isDisabled() && 'opacity-50',
      this.class()
    )
  );

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
