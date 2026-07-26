import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiProgressBarConfig } from './progress-bar.token';

export const progressBarVariants = cva('block w-full overflow-hidden rounded-full bg-surface-inset', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export const progressMeterVariants = cva('block h-full rounded-full transition-[width] duration-300 ease-standard', {
  variants: {
    color: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      error: 'bg-error',
      warning: 'bg-warning',
      info: 'bg-info'
    },
    stripes: {
      // The stripes overlay the intent-coloured meter, so they lighten it with the
      // on-emphasis foreground token instead of a hard-coded white.
      true: 'bg-[length:30px_30px] bg-[linear-gradient(-45deg,color-mix(in_oklab,var(--color-foreground-on-emphasis)_20%,transparent)_25%,transparent_25%,transparent_50%,color-mix(in_oklab,var(--color-foreground-on-emphasis)_20%,transparent)_50%,color-mix(in_oklab,var(--color-foreground-on-emphasis)_20%,transparent)_75%,transparent_75%)]',
      false: ''
    },
    animate: { true: '', false: '' },
    indeterminate: { true: 'w-full', false: '' }
  },
  compoundVariants: [
    // Only the striped bar has anything to animate — the diagonal gradient
    // slides; a flat bar would just sit there repainting.
    { stripes: true, animate: true, class: 'animate-[xui-progress-stripes_1s_linear_infinite]' },
    { indeterminate: true, animate: true, class: 'animate-pulse' }
  ],
  defaultVariants: {
    color: 'primary',
    stripes: true,
    animate: true,
    indeterminate: false
  }
});

export type XuiProgressBarVariants = VariantProps<typeof progressBarVariants> &
  VariantProps<typeof progressMeterVariants>;

/**
 * A horizontal bar showing how far along an operation is.
 *
 * ```html
 * <xui-progress-bar [value]="0.6" color="success" />
 * <xui-progress-bar />
 * ```
 *
 * `value` is a fraction between 0 and 1, not a percentage. Omitting it gives an
 * indeterminate bar that fills the track, which is the right thing to show when
 * progress cannot be measured.
 */
@Component({
  selector: 'xui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<span [class]="computedMeterClass()" [style.width]="width()"></span>`,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '[class]': 'computedClass()'
  }
})
export class XuiProgressBar {
  private readonly config = injectXuiProgressBarConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Intent colour of the filled portion. */
  readonly color = input<XuiProgressBarVariants['color']>(this.config.color);
  /** Track thickness. */
  readonly size = input<XuiProgressBarVariants['size']>(this.config.size);

  /**
   * How far along the operation is, between 0 and 1. Out-of-range values are
   * clamped. Leave it unset for an indeterminate bar.
   */
  readonly value = input<number | null | undefined>(undefined);

  /** Draw diagonal stripes across the fill. */
  readonly stripes = input<boolean, BooleanInput>(this.config.stripes, { transform: booleanAttribute });
  /** Scroll the stripes, so the bar reads as busy. Needs `stripes` to be visible. */
  readonly animate = input<boolean, BooleanInput>(this.config.animate, { transform: booleanAttribute });

  /** Accessible name for the bar — what is progressing. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Id of an element naming the bar. Use it instead of `aria-label` when that text is already on screen. */
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  readonly indeterminate = computed(() => this.value() == null);

  /** The clamped value as a whole percentage, or `null` while indeterminate. */
  readonly percent = computed(() => {
    const value = this.value();

    return value == null ? null : Math.round(100 * Math.min(Math.max(value, 0), 1));
  });

  protected readonly width = computed(() => {
    const percent = this.percent();

    return percent == null ? null : `${percent}%`;
  });

  protected readonly computedClass = computed(() => xui(progressBarVariants({ size: this.size() }), this.class()));

  protected readonly computedMeterClass = computed(() =>
    progressMeterVariants({
      color: this.color(),
      stripes: this.stripes(),
      animate: this.animate(),
      indeterminate: this.indeterminate()
    })
  );
}
