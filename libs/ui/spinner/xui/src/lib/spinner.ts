import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiSpinnerConfig } from './spinner.token';

export const spinnerVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info',
      /** Follows the surrounding text — for a spinner inside a button. */
      inherit: 'text-inherit'
    }
  },
  defaultVariants: {
    size: 'md',
    color: 'primary'
  }
});

export type XuiSpinnerVariants = VariantProps<typeof spinnerVariants>;

/** Geometry of the SVG below. The stroke is centred on the radius. */
const VIEWBOX = 100;
const STROKE_WIDTH = 12;
const RADIUS = (VIEWBOX - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = VIEWBOX / 2;

/**
 * A circular progress indicator.
 *
 * ```html
 * <xui-spinner>Loading users</xui-spinner>
 * <xui-spinner [value]="0.7" color="success" />
 * ```
 *
 * Without `value` it spins indefinitely; with one it draws the matching arc.
 * Content is projected into a visually hidden label, which is what a screen
 * reader announces — a spinner with no label is just an unexplained "busy".
 */
@Component({
  selector: 'xui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <svg aria-hidden="true" class="size-full" [class.animate-spin]="indeterminate()" viewBox="0 0 100 100" fill="none">
      <circle
        class="opacity-20"
        [attr.cx]="center"
        [attr.cy]="center"
        [attr.r]="radius"
        stroke="currentColor"
        [attr.stroke-width]="strokeWidth"
      />
      <circle
        class="ease-standard transition-[stroke-dashoffset] duration-300"
        [attr.cx]="center"
        [attr.cy]="center"
        [attr.r]="radius"
        stroke="currentColor"
        [attr.stroke-width]="strokeWidth"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset()"
        [attr.transform]="'rotate(-90 ' + center + ' ' + center + ')'"
      />
    </svg>
    <span class="sr-only"><ng-content /></span>
  `,
  host: {
    role: 'status',
    '[attr.aria-valuemin]': 'indeterminate() ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
    '[attr.aria-valuenow]': 'percent()',
    '[class]': 'computedClass()'
  }
})
export class XuiSpinner {
  private readonly config = injectXuiSpinnerConfig();

  protected readonly center = CENTER;
  protected readonly radius = RADIUS;
  protected readonly strokeWidth = STROKE_WIDTH;
  protected readonly circumference = CIRCUMFERENCE;

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Intent colour of the arc. */
  readonly color = input<XuiSpinnerVariants['color']>(this.config.color);
  /** Diameter, from the shared control scale, so a spinner matches the control it replaces. */
  readonly size = input<XuiSpinnerVariants['size']>(this.config.size);

  /**
   * How far along the operation is, between 0 and 1. Out-of-range values are
   * clamped. Leave it unset to spin indefinitely.
   */
  readonly value = input<number | null | undefined>(undefined);

  readonly indeterminate = computed(() => this.value() == null);

  /** The clamped value as a whole percentage, or `null` while indeterminate. */
  readonly percent = computed(() => {
    const value = this.value();

    return value == null ? null : Math.round(100 * Math.min(Math.max(value, 0), 1));
  });

  protected readonly dashOffset = computed(() => {
    const percent = this.percent();

    // An indeterminate spinner shows a fixed quarter-circle head, which the
    // rotation animation carries around the track.
    return percent == null ? CIRCUMFERENCE * 0.75 : CIRCUMFERENCE * (1 - percent / 100);
  });

  protected readonly computedClass = computed(() =>
    xui(spinnerVariants({ color: this.color(), size: this.size() }), this.class())
  );
}
